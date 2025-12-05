"use client";

import { useMemo, useState } from "react";
import styles from "./sponsorship.module.css";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

export default function SponsorPage() {
  const stripePromise = useMemo(
    () => loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY),
    []
  );

  const FIXED_AMOUNT_CENTS = 20000;

  const [form, setForm] = useState({
    uniName: "",
    programName: "",
    departmentName: "",
    email: "",
    phone: "",
    message: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState({});
  const [modal, setModal] = useState({
    open: false,
    sponsorshipId: null,
    paymentId: null,
    clientSecret: null,
    amountCents: FIXED_AMOUNT_CENTS,
  });
  const [confirmation, setConfirmation] = useState(null);

  const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  const phoneOk = (v) => v.replace(/\D/g, "").length >= 7;

  const validate = () => {
    const e = {};
    if (!form.uniName.trim()) e.uniName = "University name is required.";
    if (!form.programName.trim()) e.programName = "Program name is required.";
    if (!form.departmentName.trim())
      e.departmentName = "Department name is required.";
    if (!form.email.trim()) e.email = "Email is required.";
    else if (!emailOk(form.email)) e.email = "Enter a valid email address.";
    if (!form.phone.trim()) e.phone = "Phone number is required.";
    else if (!phoneOk(form.phone)) e.phone = "Enter a valid phone number.";
    if (!form.message.trim()) e.message = "Message is required.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const startPayment = async (e) => {
    e.preventDefault();
    setError("");
    if (!validate()) return;

    if (submitting) return;
    setSubmitting(true);

    try {
      const res = await fetch("/api/sponsorships/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...Object.fromEntries(
            Object.entries(form).map(([k, v]) => [k, v.trim()])
          ),
          amountCents: FIXED_AMOUNT_CENTS,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();

      setModal({
        open: true,
        sponsorshipId: data.sponsorshipId,
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
        fontSize: "16px",
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
          <header className={styles.cardHeader}>Sponsorship form</header>

          <div className={styles.formRow}>
            <label className={styles.label}>Uni Name:</label>
            <div>
              <input
                className={styles.input}
                name="uniName"
                value={form.uniName}
                onChange={onChange}
                required
                aria-invalid={!!errors.uniName}
              />
              {errors.uniName && (
                <div className={styles.error}>{errors.uniName}</div>
              )}
            </div>
          </div>

          <div className={styles.formRow}>
            <label className={styles.label}>Full Program Name:</label>
            <div>
              <input
                className={styles.input}
                name="programName"
                value={form.programName}
                onChange={onChange}
                required
                aria-invalid={!!errors.programName}
              />
              {errors.programName && (
                <div className={styles.error}>{errors.programName}</div>
              )}
            </div>
          </div>

          <div className={styles.formRow}>
            <label className={styles.label}>Department Name:</label>
            <div>
              <input
                className={styles.input}
                name="departmentName"
                value={form.departmentName}
                onChange={onChange}
                required
                aria-invalid={!!errors.departmentName}
              />
              {errors.departmentName && (
                <div className={styles.error}>{errors.departmentName}</div>
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

          <div className={styles.formRowCol}>
            <label className={styles.label}>Message:</label>
            <div>
              <textarea
                className={styles.textarea}
                name="message"
                value={form.message}
                onChange={onChange}
                rows={4}
                required
                aria-invalid={!!errors.message}
              />
              {errors.message && (
                <div className={styles.error}>{errors.message}</div>
              )}
            </div>
          </div>
        </section>

        <div className={styles.rightCol}>
          <section className={styles.cardRight}>
            <header className={styles.cardHeader} />
            <div className={styles.amountBlock}>
              <label className={styles.amountLabel}>Amount:</label>
              <div className={styles.amountRow}>
                <div className={styles.amountInputWrap} aria-readonly="true">
                  <span className={styles.dollar}>$</span>
                  <input
                    readOnly
                    value={(FIXED_AMOUNT_CENTS / 100).toFixed(0)}
                    className={styles.amountInput}
                    aria-label="Amount"
                  />
                </div>
              </div>

              <button
                type="submit"
                className={styles.payButton}
                disabled={submitting}
              >
                {submitting ? "Preparing…" : "Proceed to pay"}
              </button>

              {error ? <div className={styles.error}>{error}</div> : null}
            </div>
          </section>

          <section className={styles.cardBottom}>
            <header className={styles.bottomHeader}>Sponsorship policy</header>
            <p className={styles.bottomText}>
              Sponsorship runs for <strong>4 months</strong> from the payment
              date. You can renew your sponsorship after the 4 months period if
              desired
            </p>
          </section>
        </div>
      </form>

      {modal.open && (
        <Elements options={{ clientSecret: modal.clientSecret }} stripe={stripePromise}>
          <PayModal
            onClose={() =>
              setModal({
                open: false,
                sponsorshipId: null,
                paymentId: null,
                clientSecret: null,
                amountCents: FIXED_AMOUNT_CENTS,
              })
            }
            sponsorshipId={modal.sponsorshipId}
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
                    uniName: "",
                    programName: "",
                    departmentName: "",
                    email: "",
                    phone: "",
                    message: "",
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
  sponsorshipId,
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
      {
        payment_method: { card: elements.getElement(CardNumberElement) },
      }
    );

    const status = paymentIntent?.status;
    const succeeded = !error && status === "succeeded";

    try {
      await fetch("/api/sponsorships/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sponsorshipId,
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
        "Payment is processing with the bank. Please check again shortly."
      );
    } else if (succeeded) {
      onConfirmed(
        true,
        "Sponsorship payment recorded successfully. Thank you."
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
            {err}</div>
        ) : null}

        <button className={styles.modalClose} onClick={onClose}>
          ✕
        </button>
      </div>
    </div>
  );
}
