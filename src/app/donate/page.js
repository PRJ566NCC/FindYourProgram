"use client";

import { useMemo, useState } from "react";
import styles from "./donation.module.css";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

export default function DonatePage() {
  const stripePromise = useMemo(
    () => loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY),
    []
  );

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    reason: "",
    suggestions: "",
    amount: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState({});
  const [modal, setModal] = useState({
    open: false,
    donationId: null,
    paymentId: null,
    clientSecret: null,
    amountCents: 0,
  });
  const [confirmation, setConfirmation] = useState(null);

  const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  const phoneOk = (v) => v.replace(/\D/g, "").length >= 7;

  const validateForm = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required.";
    if (!form.phone.trim()) e.phone = "Phone number is required.";
    else if (!phoneOk(form.phone)) e.phone = "Enter a valid phone number.";
    if (!form.email.trim()) e.email = "Email is required.";
    else if (!emailOk(form.email)) e.email = "Enter a valid email address.";
    if (!form.reason.trim()) e.reason = "Reason for donation is required.";
    if (!form.suggestions.trim()) e.suggestions = "Suggestions are required.";
    if (!form.amount || Number(form.amount) <= 0)
      e.amount = "Enter a valid donation amount.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    if (name === "amount") {
      const cleaned = value.replace(/[^\d]/g, "");
      setForm((s) => ({ ...s, [name]: cleaned }));
    } else {
      setForm((s) => ({ ...s, [name]: value }));
    }
  };

  const startPayment = async (e) => {
    e.preventDefault();
    setError("");
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/donations/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          phone: form.phone.trim(),
          email: form.email.trim(),
          reason: form.reason.trim(),
          suggestions: form.suggestions.trim(),
          amountCents: Number(form.amount) * 100,
        }),
      });

      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();

      setModal({
        open: true,
        donationId: data.donationId,
        paymentId: data.paymentId,
        clientSecret: data.clientSecret,
        amountCents: data.amountCents,
      });
    } catch (err) {
      setError(err.message || "Unable to start payment.");
    } finally {
      setSubmitting(false);
    }
  };

  const elementStyle = {
    style: {
      base: {
        fontSize: "14px",
        color: "#2b2b2b",
        "::placeholder": { color: "#6b6b6b" },
      },
      invalid: { color: "#b00020" },
    },
  };

  return (
    <div className={styles.page}>
      <form className={styles.grid} onSubmit={startPayment}>
        <section className={styles.cardLeft}>
          <header className={styles.cardHeader}>Donation form</header>

          <div className={styles.formRow}>
            <label className={styles.label}>Name:</label>
            <div>
              <input
                className={styles.input}
                name="name"
                value={form.name}
                onChange={onChange}
                required
                aria-invalid={!!errors.name}
              />
              {errors.name && <div className={styles.error}>{errors.name}</div>}
            </div>
          </div>

          <div className={styles.formRow}>
            <label className={styles.label}>Phone Number:</label>
            <div>
              <input
                className={styles.input}
                name="phone"
                value={form.phone}
                onChange={onChange}
                type="tel"
                required
                aria-invalid={!!errors.phone}
              />
              {errors.phone && (
                <div className={styles.error}>{errors.phone}</div>
              )}
            </div>
          </div>

          <div className={styles.formRow}>
            <label className={styles.label}>Email:</label>
            <div>
              <input
                className={styles.input}
                name="email"
                value={form.email}
                onChange={onChange}
                type="email"
                required
                aria-invalid={!!errors.email}
              />
              {errors.email && (
                <div className={styles.error}>{errors.email}</div>
              )}
            </div>
          </div>

          <div className={styles.formRowCol}>
            <label className={styles.label}>Reason for Donation:</label>
            <div>
              <textarea
                className={styles.textarea}
                name="reason"
                value={form.reason}
                onChange={onChange}
                rows={3}
                required
                aria-invalid={!!errors.reason}
              />
              {errors.reason && (
                <div className={styles.error}>{errors.reason}</div>
              )}
            </div>
          </div>

          <div className={styles.formRowCol}>
            <label className={styles.label}>Suggestions:</label>
            <div>
              <textarea
                className={styles.textarea}
                name="suggestions"
                value={form.suggestions}
                onChange={onChange}
                rows={3}
                required
                aria-invalid={!!errors.suggestions}
              />
              {errors.suggestions && (
                <div className={styles.error}>{errors.suggestions}</div>
              )}
            </div>
          </div>
        </section>

        <div className={styles.rightCol}>
          <section className={styles.cardRight}>
            <header className={styles.cardHeader} />
            <div className={styles.amountBlock}>
              <label className={styles.amountLabel}>Donation Amount:</label>
              <div className={styles.amountInputWrap}>
                <span className={styles.dollar}>$</span>
                <input
                  name="amount"
                  value={form.amount}
                  onChange={onChange}
                  className={styles.amountInput}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  required
                  aria-invalid={!!errors.amount}
                />
              </div>
              {errors.amount && (
                <div className={styles.error}>{errors.amount}</div>
              )}

              <button
                type="submit"
                className={styles.payButton}
                disabled={submitting}
              >
                {submitting ? "Preparing..." : "Proceed to pay"}
              </button>
              {error ? <div className={styles.error}>{error}</div> : null}
            </div>
          </section>

          <section className={styles.cardBottom}>
            <header className={styles.bottomHeader}>
              Where does your money go?
            </header>
            <p className={styles.bottomText}>
              To keep this website running and help many many students, this
              website is maintained with the money donated!
            </p>
          </section>
        </div>
      </form>

      {modal.open && (
        <Elements
          options={{ clientSecret: modal.clientSecret }}
          stripe={stripePromise}
        >
          <PayModal
            onClose={() =>
              setModal({
                open: false,
                donationId: null,
                paymentId: null,
                clientSecret: null,
                amountCents: 0,
              })
            }
            donationId={modal.donationId}
            paymentId={modal.paymentId}
            clientSecret={modal.clientSecret}
            amountText={`$${(modal.amountCents / 100).toFixed(2)} CAD`}
            elementStyle={elementStyle}
            onConfirmed={(ok, message) => setConfirmation({ ok, message })}
          />
        </Elements>
      )}

      {confirmation && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modalCard}>
            <h3 style={{ marginTop: 0 }}>
              {confirmation.ok ? "Payment successful" : "Payment status"}
            </h3>
            <p>{confirmation.message}</p>
            <button
              className={styles.payButton}
              onClick={() => {
                setConfirmation(null);
                if (confirmation.ok) {
                  setForm({
                    name: "",
                    phone: "",
                    email: "",
                    reason: "",
                    suggestions: "",
                    amount: "",
                  });
                }
              }}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function PayModal({
  onClose,
  donationId,
  paymentId,
  clientSecret,
  amountText,
  elementStyle,
  onConfirmed,
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [paying, setPaying] = useState(false);
  const [err, setErr] = useState("");

  const pay = async () => {
    if (!stripe || !elements) return;
    setErr("");
    setPaying(true);

    const { error, paymentIntent } = await stripe.confirmCardPayment(
      clientSecret,
      { payment_method: { card: elements.getElement(CardNumberElement) } }
    );

    const status = paymentIntent?.status;
    const succeeded = !error && status === "succeeded";

    try {
      await fetch("/api/donations/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          donationId,
          paymentId,
          outcome: succeeded ? "succeeded" : status || "failed",
          paymentIntentId: paymentIntent?.id,
          errorMessage: error?.message,
        }),
      });
    } catch (_) {}

    if (status === "processing") {
      onConfirmed(
        false,
        "Payment is processing with the bank. Please check again in a moment."
      );
    } else if (succeeded) {
      onConfirmed(
        true,
        "Thank you for the generous donation. A payment record has been saved."
      );
    } else {
      onConfirmed(false, error?.message || "Payment did not complete.");
    }

    setPaying(false);
    onClose();
  };

  return (
    <div className={styles.modalBackdrop}>
      <div className={styles.modalCard}>
        <h3 style={{ marginTop: 0 }}>Pay {amountText}</h3>

        <div className={styles.formRow}>
          <label className={styles.label}>Card Number:</label>
          <div className={styles.elementShell}>
            <CardNumberElement options={elementStyle} />
          </div>
        </div>

        <div className={styles.formRow}>
          <label className={styles.label}>Expiry:</label>
          <div className={styles.elementShell}>
            <CardExpiryElement options={elementStyle} />
          </div>
        </div>

        <div className={styles.formRow}>
          <label className={styles.label}>CVC:</label>
          <div className={styles.elementShell}>
            <CardCvcElement options={elementStyle} />
          </div>
        </div>

        <button
          className={styles.payButton}
          onClick={pay}
          disabled={paying || !stripe || !elements}
        >
          {paying ? "Processing…" : "Pay now"}
        </button>
        {err ? (
          <div className={styles.error} style={{ marginTop: 8 }}>
            {err}
          </div>
        ) : null}

        <button className={styles.modalClose} onClick={onClose}>
          ✕
        </button>
      </div>
    </div>
  );
}
