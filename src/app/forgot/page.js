"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "@/app/globals.module.css";

export default function ForgotPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");

    const v = email.trim().toLowerCase();
    if (!v) return setError("Email is required.");
    if (!/\S+@\S+\.\S+/.test(v)) return setError("Please enter a valid email.");

    try {
      setSubmitting(true);
      const res = await fetch("/api/forgot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: v }),
      });

      if (!res.ok) {
        let msg = "Failed to send reset email.";
        try {
          const data = await res.json();
          if (data?.message) msg = data.message;
        } catch {}
        throw new Error(msg);
      }

      setInfo("If that email exists, we sent a reset link.");
      setEmail("");
    } catch (err) {
      setError(err.message || "Failed to send reset email.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.background}>
      <div>
        <img
          src="/FindYourProgramLogo.png"
          alt="Logo for website"
          className={styles.logoImage}
        />
      </div>

      <div className={styles.registerContainer}>
        <form onSubmit={onSubmit}>
          <div>
            <label className={styles.label} htmlFor="email">Email:</label><br />
            <input
              className={styles.inputGroup}
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(""); setInfo(""); }}
              disabled={submitting}
            />
          </div>

          <div className={styles.messageContainer}>
            {error && <p>{error}</p>}
            {info && <p className={styles.success}>{info}</p>}
          </div>

          <div className={styles.buttonContainer}>
            <button className={styles.registerButton} type="submit" disabled={submitting}>
              {submitting ? "Sending..." : "Send Reset Link"}
            </button>
            <button
              className={styles.registerButton}
              type="button"
              onClick={() => router.push("/login")}
              disabled={submitting}
            >
              Back to Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
