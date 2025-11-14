"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const initialState = {
  name: "",
  email: "",
  page: "",
  severity: "Medium - Impacts usage",
  summary: "",
  expected: "",
  actual: "",
  steps: "",
};

export default function ReportBugPage() {
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
          type: "bug",
          details: form,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to submit bug report.");
      }

      // Popup confirmation
      window.alert(
        "Thank you for your report. A team member will be in contact with you shortly."
      );

      setForm(initialState);
      router.push("/contact");
    } catch (err) {
      console.error(err);
      window.alert("Error: Failed to submit bug report.");
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
          Report a Bug
        </h1>
        <p style={{ marginTop: 0, marginBottom: "22px", color: "#555" }}>
          Tell us what went wrong so we can investigate and fix it quickly.
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

          {/* Page + Severity */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.4fr 1fr",
              columnGap: "24px",
              rowGap: "8px",
              marginBottom: "18px",
            }}
          >
            <div>
              <label
                style={{ display: "block", fontWeight: 600, marginBottom: 4 }}
              >
                Page / feature
              </label>
              <input
                type="text"
                required
                value={form.page}
                onChange={updateField("page")}
                placeholder="/search-results, favorites, program details…"
                style={inputStyle}
              />
            </div>
            <div>
              <label
                style={{ display: "block", fontWeight: 600, marginBottom: 4 }}
              >
                Severity
              </label>
              <select
                value={form.severity}
                onChange={updateField("severity")}
                style={inputStyle}
                required
              >
                <option>Low - Cosmetic</option>
                <option>Medium - Impacts usage</option>
                <option>High - Breaking feature</option>
                <option>Critical - Site unavailable</option>
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
              placeholder="One sentence describing the issue"
              style={inputStyle}
            />
          </div>

          {/* Expected vs Actual */}
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
                What did you expect to happen?
              </label>
              <textarea
                rows={5}
                required
                value={form.expected}
                onChange={updateField("expected")}
                style={textareaStyle}
              />
            </div>
            <div>
              <label
                style={{ display: "block", fontWeight: 600, marginBottom: 4 }}
              >
                What actually happened?
              </label>
              <textarea
                rows={5}
                required
                value={form.actual}
                onChange={updateField("actual")}
                style={textareaStyle}
              />
            </div>
          </div>

          {/* Steps */}
          <div style={{ marginBottom: "22px" }}>
            <label
              style={{ display: "block", fontWeight: 600, marginBottom: 4 }}
            >
              Steps to reproduce (optional)
            </label>
            <textarea
              rows={4}
              value={form.steps}
              onChange={updateField("steps")}
              placeholder="Step 1, Step 2, Step 3…"
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
            {submitting ? "Submitting…" : "Submit bug report"}
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
