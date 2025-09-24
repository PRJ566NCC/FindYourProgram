"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "@/app/globals.module.css";
import { useAuth } from "@/components/AuthProvider";

export default function Login() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const { refresh } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.username.trim()) {
      setError("Username is required.");
      return;
    }
    if (!formData.password.trim()) {
      setError("Password is required.");
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        let message = "Failed to log in.";
        try {
          const errorData = await response.json();
          if (errorData?.message) message = errorData.message;
        } catch {}
        throw new Error(message);
      }

      await refresh();
      router.replace("/");
    } catch (err) {
      setError(err.message || "Failed to log in.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className={styles.background}>
        <div>
          <img
            src="/FindYourProgramLogo.png"
            alt="Logo for website"
            className={styles.logoImage}
          />
        </div>
        <div className={styles.registerContainer}>
          <form onSubmit={handleSubmit}>
            <div>
              <label className={styles.label} htmlFor="username">
                Username:
              </label>
              <br />
              <input
                className={styles.inputGroup}
                id="username"
                name="username"
                type="text"
                value={formData.username}
                onChange={handleChange}
                disabled={submitting}
              />
            </div>

            <div>
              <label className={styles.label} htmlFor="password">
                Password:
              </label>
              <br />
              <input
                className={styles.inputGroup}
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                disabled={submitting}
              />
            </div>

            <div className={styles.messageContainer}>
              {error && <p>{error}</p>}
            </div>

            <div className={styles.buttonContainer}>
              <button className={styles.registerButton} type="submit" disabled={submitting}>
                {submitting ? "Logging in..." : "Login"}
              </button>
              <button
                className={styles.registerButton}
                type="button"
                onClick={() => router.push("/forgot")}
                disabled={submitting}
              >
                Forgot
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
