import { NextResponse } from "next/server";
import Stripe from "stripe";
import { connectToDatabase } from "@/lib/mongodb";

/**
 * Creates a sponsorship and payment record, and a CAD PaymentIntent for a fixed amount.
 * Returns client secret to confirm on the client.
 */
export async function POST(req) {
  try {
    const body = await req.json();
    const amt = Number(body.amountCents || 0);

    const str = (v) => String(v ?? "").trim();
    const uniName = str(body.uniName);
    const programName = str(body.programName);
    const departmentName = str(body.departmentName);
    const email = str(body.email);
    const phone = str(body.phone);
    const message = str(body.message);

    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i.test(email);
    const phoneOk = phone.replace(/\D/g, "").length >= 7;

    if (!uniName || !programName || !departmentName || !email || !phone || !message) {
      return new NextResponse("All fields are required.", { status: 400 });
    }
    if (!emailOk) return new NextResponse("Invalid email.", { status: 400 });
    if (!phoneOk) return new NextResponse("Invalid phone number.", { status: 400 });

    // Fixed amount guard ($200 CAD)
    if (!Number.isInteger(amt) || amt !== 20000) {
      return new NextResponse("Invalid amount.", { status: 400 });
    }

    const { db } = await connectToDatabase();

    // Sponsorship record (3-month expiry)
    const startsAt = new Date();
    const expiresAt = new Date(startsAt.getTime() + 120 * 24 * 60 * 60 * 1000);

    const sponsorshipDoc = {
      createdAt: new Date(),
      uniName,
      programName,
      departmentName,
      email,
      phone,
      message,
      amountCents: amt,
      currency: "cad",
      status: "initiated",
      startsAt,
      expiresAt,
      paymentId: null,
    };
    const { insertedId: sponsorshipId } = await db.collection("sponsorships").insertOne(sponsorshipDoc);

    // Payment record in shared payments collection
    const paymentDoc = {
      createdAt: new Date(),
      source: "sponsorship",
      sourceId: sponsorshipId,
      amountCents: amt,
      currency: "cad",
      status: "initiated",
      paymentIntentId: null,
      clientSecret: null,
      chargeId: null,
      brand: null,
      last4: null,
      failureCode: null,
      failureMessage: null,
      raw: null,
    };
    const { insertedId: paymentId } = await db.collection("payments").insertOne(paymentDoc);

    // Stripe PaymentIntent
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2024-06-20" });
    const pi = await stripe.paymentIntents.create({
      amount: amt,
      currency: "cad",
      automatic_payment_methods: { enabled: true },
      metadata: { source: "sponsorship", sponsorshipId: String(sponsorshipId), paymentId: String(paymentId) },
    });

    await db.collection("payments").updateOne(
      { _id: paymentId },
      { $set: { paymentIntentId: pi.id, clientSecret: pi.client_secret, status: pi.status || "requires_action" } }
    );
    await db.collection("sponsorships").updateOne(
      { _id: sponsorshipId },
      { $set: { paymentId, status: pi.status || "requires_action" } }
    );

    return NextResponse.json(
      {
        sponsorshipId: String(sponsorshipId),
        paymentId: String(paymentId),
        clientSecret: pi.client_secret,
        amountCents: amt,
      },
      { status: 201 }
    );
  } catch (e) {
    console.error(e);
    return new NextResponse("Unable to initiate sponsorship.", { status: 500 });
  }
}
