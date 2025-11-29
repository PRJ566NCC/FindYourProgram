"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const initialState = {
  name: "",
  email: "",
  organization: "",
  partnershipType: "Sponsorship",
  summary: "",
  details: "",
};

export default function PartnershipPage() {
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
          type: "partnership",   
          details: form,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to submit partnership inquiry.");
      }

      window.alert(
        "Thank you for reaching out about a partnership. We’ll get back to you soon."
      );

      setForm(initialState);
      router.push("/contact");
    } catch (err) {
      console.error(err);
      window.alert("Error: Failed to submit partnership inquiry.");
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
          Partnership Inquiry
        </h1>
        <p style={{ marginTop: 0, marginBottom: "22px", color: "#555" }}>
          Interested in collaborating or sponsoring Find Your Program? Tell us a
          bit about your organization and idea.
        </p>

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

          {/* Organization + Type */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.2fr 0.8fr",
              columnGap: "24px",
              rowGap: "8px",
              marginBottom: "18px",
            }}
          >
            <div>
              <label
                style={{ display: "block", fontWeight: 600, marginBottom: 4 }}
              >
                Organization (optional)
              </label>
              <input
                type="text"
                value={form.organization}
                onChange={updateField("organization")}
                placeholder="School, company, or group name"
                style={inputStyle}
              />
            </div>
            <div>
              <label
                style={{ display: "block", fontWeight: 600, marginBottom: 4 }}
              >
                Partnership type
              </label>
              <select
                value={form.partnershipType}
                onChange={updateField("partnershipType")}
                style={inputStyle}
              >
                <option>Sponsorship</option>
                <option>Event collaboration</option>
                <option>Content partnership</option>
                <option>Other</option>
              </select>
            </div>
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
              placeholder="One sentence describing your partnership idea"
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
              placeholder="Share more about your organization and what you have in mind."
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
            {submitting ? "Submitting…" : "Submit partnership inquiry"}
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
