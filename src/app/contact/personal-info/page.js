"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// Initial state for Personal Info requests
const initialState = {
  name: "",
  email: "",
  requestType: "Request Data Removal", // Default option
  details: "",
};

export default function PersonalInfoPage() {
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
      // Sending type: 'personal-info'
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "personal-info",
          details: form,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to submit request.");
      }

      window.alert(
        "Your request has been received. We will process it and contact you via email."
      );

      setForm(initialState);
      router.push("/contact");
    } catch (err) {
      console.error(err);
      window.alert("Error: Failed to submit request.");
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
          Personal Information Request
        </h1>
        <p style={{ marginTop: 0, marginBottom: "22px", color: "#555" }}>
          Request to view, update, or delete your personal data.
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
                Email associated with account
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

          {/* Request Type */}
          <div style={{ marginBottom: "18px" }}>
            <label
              style={{ display: "block", fontWeight: 600, marginBottom: 4 }}
            >
              Request Type
            </label>
            <select
              value={form.requestType}
              onChange={updateField("requestType")}
              style={inputStyle}
              required
            >
              <option>Request Data Removal</option>
              <option>Request Data Copy (Export)</option>
              <option>Update Personal Information</option>
              <option>Other Privacy Concern</option>
            </select>
          </div>

          {/* Details */}
          <div style={{ marginBottom: "22px" }}>
            <label
              style={{ display: "block", fontWeight: 600, marginBottom: 4 }}
            >
              Please provide details
            </label>
            <textarea
              rows={6}
              required
              value={form.details}
              onChange={updateField("details")}
              placeholder="Tell us specifically what you need us to do..."
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
            {submitting ? "Submitting…" : "Submit Request"}
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