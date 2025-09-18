"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar.js";
import styles from "@/app/globals.module.css";

export default function Login() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const [error, setError] = useState("");
  const router = useRouter();

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

    // Validate inputs separately
    if (!formData.username.trim()) {
      setError("Username is required.");
      return;
    }
    if (!formData.password.trim()) {
      setError("Password is required.");
      return;
    }

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to log in.");
      }

      // On success, redirect to homepage
      router.push("/");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <>
      <Navbar />
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
            {/* Username Input */}
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
              />
            </div>

            {/* Password Input */}
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
              />
            </div>

            {/* Error Message */}
            <div className={styles.messageContainer}>
              {error && <p>{error}</p>}
            </div>

            {/* Buttons */}
            <div className={styles.buttonContainer}>
              <button className={styles.registerButton} type="submit">
                Login
              </button>
              <button
                className={styles.registerButton}
                type="button"
                onClick={() => router.push("/forgot")}
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
