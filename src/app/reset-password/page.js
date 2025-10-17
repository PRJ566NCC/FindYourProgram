"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import styles from "@/app/globals.module.css";

function ResetPasswordInner() {
  const sp = useSearchParams();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [pwd, setPwd] = useState("");
  const [confirm, setConfirm] = useState("");
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const e = sp.get("email");
    if (e) setEmail(e);
  }, [sp]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setMsg("");

    if (!email.trim() || !code.trim() || !pwd || !confirm) {
      setErr("All fields are required.");
      return;
    }
    if (pwd !== confirm) {
      setErr("Passwords do not match.");
      return;
    }
    if (pwd.length < 6) {
      setErr("Password must be at least 6 characters.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, newPassword: pwd }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Failed to reset.");
      setMsg("Password updated. You can now log in with the new password.");
      setTimeout(() => router.push("/login"), 1200);
    } catch (e2) {
      setErr(e2.message);
    } finally {
      setLoading(false);
    }
  };

  const btnStyle = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    whiteSpace: "nowrap",
    height: 44,
    width: "100%",
    fontSize: 16,
    fontWeight: 700,
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

      <div
        className={styles.registerContainer}
        style={{ width: 560, padding: 28, borderRadius: 12 }}
      >
        <form onSubmit={onSubmit}>
          <h2 style={{ margin: "0 0 14px", fontWeight: 800 }}>Reset Password</h2>

          <div style={{ marginBottom: 10 }}>
            <label className={styles.label} htmlFor="email" style={{ fontSize: 18, fontWeight: 700 }}>
              Email:
            </label>
            <br />
            <input
              id="email"
              name="email"
              className={styles.inputGroup}
              style={{ height: 40, fontSize: 16 }}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>

          <div style={{ marginBottom: 10 }}>
            <label className={styles.label} htmlFor="code" style={{ fontSize: 18, fontWeight: 700 }}>
              Verification Code:
            </label>
            <br />
            <input
              id="code"
              name="code"
              className={styles.inputGroup}
              style={{ height: 40, fontSize: 18, letterSpacing: 2 }}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              disabled={loading}
            />
          </div>

          <div style={{ marginBottom: 10 }}>
            <label className={styles.label} htmlFor="password" style={{ fontSize: 18, fontWeight: 700 }}>
              New Password:
            </label>
            <br />
            <input
              id="password"
              name="password"
              type="password"
              className={styles.inputGroup}
              style={{ height: 40, fontSize: 16 }}
              value={pwd}
              onChange={(e) => setPwd(e.target.value)}
              disabled={loading}
            />
          </div>

          <div style={{ marginBottom: 12 }}>
            <label className={styles.label} htmlFor="confirm" style={{ fontSize: 18, fontWeight: 700 }}>
              Confirm Password:
            </label>
            <br />
            <input
              id="confirm"
              name="confirm"
              type="password"
              className={styles.inputGroup}
              style={{ height: 40, fontSize: 16 }}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className={styles.messageContainer}>
            {err && <p style={{ color: "crimson", fontWeight: 600 }}>{err}</p>}
            {msg && <p style={{ color: "green", fontWeight: 600 }}>{msg}</p>}
          </div>

          <div className={styles.buttonContainer} style={{ gap: 12 }}>
            <button
              className={styles.registerButton}
              type="submit"
              disabled={loading}
              style={btnStyle}
            >
              {loading ? "Updating..." : "Update Password"}
            </button>

            <button
              className={styles.registerButton}
              type="button"
              onClick={() => router.push("/login")}
              disabled={loading}
              style={btnStyle}
            >
              Back to Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordInner />
    </Suspense>
  );
}
