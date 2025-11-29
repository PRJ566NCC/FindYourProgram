"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const initialState = {
  name: "",
  email: "",
  amount: "",
  summary: "",
  details: "",
};

export default function RefundPage() {
  const [form, setForm] = useState(initialState);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  const updateField = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "refund",  
          details: form,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to submit refund request.");
      }

      window.alert(
        "Thank you. We’ve received your refund request and will follow up shortly."
      );

      setForm(initialState);
      router.push("/contact");
    } catch (err) {
      console.error(err);
      window.alert("Error: Failed to submit refund request.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#F4EBE2",
        padding: "40px 0 60px",
      }}
    >
      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "0 24px",
        }}
      >
        <button
          type="button"
          onClick={() => router.push("/contact")}
          style={{
            background: "none",
            border: "none",
            padding: 0,
            marginBottom: "18px",
            cursor: "pointer",
            color: "#4d4d4d",
            fontSize: "0.95rem",
          }}
        >
          ← Back to Contact Us
        </button>

        <h1
          style={{
            fontSize: "2.1rem",
            marginBottom: "6px",
            fontWeight: 700,
          }}
        >
          Refund Request
        </h1>
        <p style={{ marginTop: 0, marginBottom: "22px", color: "#555" }}>
          Need a refund or have a question about a charge? Share a few details
          and we&apos;ll review your request.
        </p>
				
				{/* FAQ / Quick Answers */}
				<div
					style={{
						backgroundColor: "#FFF7E6",
						border: "1px solid #e6d7be",
						borderRadius: "12px",
						padding: "20px 24px",
						marginBottom: "28px",
						lineHeight: "1.55",
					}}
				>
					<h3 style={{ marginTop: 0, fontSize: "1.2rem" }}>Before you submit a refund request</h3>

					<p style={{ marginBottom: "12px" }}>
						Here are some quick answers that might help resolve your issue faster:
					</p>

					<div style={{ marginBottom: "14px" }}>
						<strong>📌 Q: I see a charge, but I don’t remember making a payment.</strong>
						<br />
						A: Sometimes this happens if someone in your household made the payment 
						or if the charge is still pending. You can check your email for a receipt first.
					</div>

					<div style={{ marginBottom: "14px" }}>
						<strong>📌 Q: How long does a refund take?</strong>
						<br />
						A: Refunds typically take <strong>3–5 business days</strong> after approval. 
						Some banks may take longer to reflect the change.
					</div>

					<div style={{ marginBottom: "14px" }}>
						<strong>📌 Q: Can I request a refund without a transaction ID?</strong>
						<br />
						A: Yes. Providing the amount and approximate date helps us locate your payment.
					</div>

					<div>
						<strong>📌 Q: What information should I include?</strong>
						<br />
						A: Please describe:
						<ul style={{ marginTop: "6px" }}>
							<li>When you were charged</li>
							<li>The amount</li>
							<li>Why you’re requesting a refund</li>
						</ul>
					</div>
				</div>

        <form
          onSubmit={handleSubmit}
          style={{
            backgroundColor: "#FDF1D9",
            borderRadius: "12px",
            padding: "26px 30px 28px",
            border: "1px solid #e0cfb5",
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          }}
        >
          {/* Name + Email */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              columnGap: "24px",
              rowGap: "8px",
              marginBottom: "18px",
            }}
          >
            <div>
              <label
                style={{ display: "block", fontWeight: 600, marginBottom: 4 }}
              >
                Name
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={updateField("name")}
                placeholder="Your name"
                style={inputStyle}
              />
            </div>
            <div>
              <label
                style={{ display: "block", fontWeight: 600, marginBottom: 4 }}
              >
                Email
              </label>
              <input
                type="email"
                required
                value={form.email}
                onChange={updateField("email")}
                placeholder="you@example.com"
                style={inputStyle}
              />
            </div>
          </div>

          {/* Amount */}
          <div style={{ marginBottom: "18px" }}>
            <label
              style={{ display: "block", fontWeight: 600, marginBottom: 4 }}
            >
              Amount (optional)
            </label>
            <input
              type="text"
              value={form.amount}
              onChange={updateField("amount")}
              placeholder="$25.00"
              style={inputStyle}
            />
          </div>

          {/* Summary */}
          <div style={{ marginBottom: "18px" }}>
            <label
              style={{ display: "block", fontWeight: 600, marginBottom: 4 }}
            >
              Short summary
            </label>
            <input
              type="text"
              required
              value={form.summary}
              onChange={updateField("summary")}
              placeholder="One sentence describing your refund request"
              style={inputStyle}
            />
          </div>

          {/* Details */}
          <div style={{ marginBottom: "22px" }}>
            <label
              style={{ display: "block", fontWeight: 600, marginBottom: 4 }}
            >
              Details
            </label>
            <textarea
              rows={5}
              required
              value={form.details}
              onChange={updateField("details")}
              placeholder="Include when you were charged, how much, and why you’re requesting a refund."
              style={textareaStyle}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            style={{
              padding: "10px 26px",
              backgroundColor: "#000",
              color: "#fff",
              borderRadius: "999px",
              border: "none",
              fontSize: "0.98rem",
              cursor: submitting ? "not-allowed" : "pointer",
            }}
          >
            {submitting ? "Submitting…" : "Submit refund request"}
          </button>
        </form>
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: "8px",
  border: "1px solid #d4c7b3",
  fontSize: "0.96rem",
  boxSizing: "border-box",
};

const textareaStyle = {
  ...inputStyle,
  resize: "vertical",
};
