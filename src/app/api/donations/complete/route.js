import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { connectToDatabase } from "@/lib/mongodb";
import Stripe from "stripe";

/**
 * Finalizes payment (payments + donations) and enriches with Stripe refs.
 * Accepts "processing" status and stores it; UI informs the donor accordingly.
 */
export async function POST(req) {
  try {
    const { donationId, paymentId, outcome, errorMessage, paymentIntentId } = await req.json();
    if (!donationId || !paymentId || !outcome) {
      return new NextResponse("Invalid payload.", { status: 400 });
    }

    const { db } = await connectToDatabase();

    const payPatch = {
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
        payPatch.paymentIntentId = pi.id;
        const ch = typeof pi.latest_charge === "object" ? pi.latest_charge : null;
        payPatch.chargeId = ch?.id || null;
        payPatch.brand = ch?.payment_method_details?.card?.brand || null;
        payPatch.last4 = ch?.payment_method_details?.card?.last4 || null;
        payPatch.failureCode = pi.last_payment_error?.code || null;
        payPatch.failureMessage = errorMessage || pi.last_payment_error?.message || payPatch.failureMessage || null;
      } catch (_) {}
    }

    await db.collection("payments").updateOne(
      { _id: new ObjectId(paymentId) },
      { $set: payPatch }
    );

    await db.collection("donations").updateOne(
      { _id: new ObjectId(donationId) },
      { $set: { status: String(outcome) } }
    );

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return new NextResponse("Unable to finalize donation.", { status: 500 });
  }
}
