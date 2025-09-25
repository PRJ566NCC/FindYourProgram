import { NextResponse } from "next/server";
import Stripe from "stripe";
import { connectToDatabase } from "@/lib/mongodb";

/**
 * Creates donation and payment records and a CAD PaymentIntent.
 * Returns donationId, paymentId, clientSecret, amountCents.
 */
export async function POST(req) {
  try {
    const body = await req.json();

    const str = (v) => String(v ?? "").trim();
    const amountCents = Number(body.amountCents || 0);
    const name = str(body.name);
    const phone = str(body.phone);
    const email = str(body.email);
    const reason = str(body.reason);
    const suggestions = str(body.suggestions);

    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i.test(email);
    const phoneOk = phone.replace(/\D/g, "").length >= 7;

    if (!name || !phone || !email || !reason || !suggestions) {
      return new NextResponse("All fields are required.", { status: 400 });
    }
    if (!emailOk) return new NextResponse("Invalid email.", { status: 400 });
    if (!phoneOk) return new NextResponse("Invalid phone number.", { status: 400 });
    if (!Number.isInteger(amountCents) || amountCents <= 0) {
      return new NextResponse("Invalid amount.", { status: 400 });
    }

    const { db } = await connectToDatabase();

    const donationDoc = {
      createdAt: new Date(),
      name, phone, email, reason, suggestions,
      amountCents,
      currency: "cad",
      status: "initiated",
      paymentId: null,
    };
    const { insertedId: donationId } = await db.collection("donations").insertOne(donationDoc);

    const paymentDoc = {
      createdAt: new Date(),
      source: "donation",
      sourceId: donationId,
      amountCents,
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

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2024-06-20" });
    const pi = await stripe.paymentIntents.create({
      amount: amountCents,
      currency: "cad",
      automatic_payment_methods: { enabled: true },
      metadata: {
        source: "donation",
        donationId: String(donationId),
        paymentId: String(paymentId),
      },
    });

    await db.collection("payments").updateOne(
      { _id: paymentId },
      { $set: { paymentIntentId: pi.id, clientSecret: pi.client_secret, status: pi.status || "requires_action" } }
    );
    await db.collection("donations").updateOne(
      { _id: donationId },
      { $set: { paymentId, status: pi.status || "requires_action" } }
    );

    return NextResponse.json(
      {
        donationId: String(donationId),
        paymentId: String(paymentId),
        clientSecret: pi.client_secret,
        amountCents,
      },
      { status: 201 }
    );
  } catch (e) {
    console.error(e);
    return new NextResponse("Unable to initiate donation.", { status: 500 });
  }
}
