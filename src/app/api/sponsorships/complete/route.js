import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { connectToDatabase } from "@/lib/mongodb";
import Stripe from "stripe";

/**
 * Finalizes the payment record and mirrors status on the sponsorship record.
 * Adds Stripe references when available.
 */
export async function POST(req) {
  try {
    const { sponsorshipId, paymentId, outcome, errorMessage, paymentIntentId } = await req.json();
    if (!sponsorshipId || !paymentId || !outcome) {
      return new NextResponse("Invalid payload.", { status: 400 });
    }

    const { db } = await connectToDatabase();

    const patch = {
      status: String(outcome),
      failureMessage: errorMessage || null,
    };

    if (paymentIntentId) {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2024-06-20" });
      try {
        const pi = await stripe.paymentIntents.retrieve(
          paymentIntentId,
          { expand: ["latest_charge.payment_method_details.card"] }
        );
        patch.paymentIntentId = pi.id;
        const ch = typeof pi.latest_charge === "object" ? pi.latest_charge : null;
        patch.chargeId = ch?.id || null;
        patch.brand = ch?.payment_method_details?.card?.brand || null;
        patch.last4 = ch?.payment_method_details?.card?.last4 || null;
        patch.failureCode = pi.last_payment_error?.code || null;
        patch.failureMessage = errorMessage || pi.last_payment_error?.message || patch.failureMessage || null;
      } catch (_) {}
    }

    await db.collection("payments").updateOne(
      { _id: new ObjectId(paymentId) },
      { $set: patch }
    );

    await db.collection("sponsorships").updateOne(
      { _id: new ObjectId(sponsorshipId) },
      { $set: { status: String(outcome) } }
    );

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return new NextResponse("Unable to finalize sponsorship.", { status: 500 });
  }
}
