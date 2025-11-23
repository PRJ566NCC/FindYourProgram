"use client";
import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import styles from "@/app/globals.module.css";

export default function Register() {
  const [formData, setFormData] = useState({
    username: "",
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(3);
  const router = useRouter();

  // REDIRECT COUNTDOWN
  useEffect(() => {
    if (isRedirecting && timeLeft > 0) {
      const timer = setTimeout(
        () => setTimeLeft((prev) => prev - 1),
        1000
      );
      return () => clearTimeout(timer);
    }

    if (isRedirecting && timeLeft === 0) {
      router.push("/login");
    }
  }, [isRedirecting, timeLeft, router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.username.trim())
      return setError("Username is required."), false;
    if (formData.username.length < 3)
      return setError("Username must be at least 3 characters long."), false;

    if (!formData.name.trim())
      return setError("Full name is required."), false;
    if (!/^[a-zA-Z\s]+$/.test(formData.name))
      return setError("Name can only contain letters and spaces."), false;

    if (!formData.email.trim())
      return setError("Email is required."), false;
    if (!/\S+@\S+\.\S+/.test(formData.email))
      return setError("Please enter a valid email address."), false;

    if (!formData.password)
      return setError("Password is required."), false;
    if (formData.password.length < 6)
      return setError("Password must be at least 6 characters long."), false;

    if (formData.password !== formData.confirmPassword)
      return setError("Passwords do not match."), false;

    setError("");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validateForm()) return;

    try {
      const { confirmPassword, ...dataToSend } = formData;

      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend),
      });

      const data = await response.json();

      if (response.status === 202) {
        // Admin approval required
        setSuccess(data.message);
        setIsRedirecting(true);
        return;
      }

      if (!response.ok) {
        throw new Error(data.message || "Registration failed.");
      }

      // Normal success
      setSuccess(data.message || "Registration successful!");
      setIsRedirecting(true);

      // Reset form
      setFormData({
        username: "",
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
      });

    } catch (err) {
      setError(err.message);
    }
  };

  // Redirect screen
  if (isRedirecting) {
    return (
      <div className={styles.background}>
        <div className={styles.registerContainer}>
          <h1 className={styles.label}>
            {success || "🎉 Registration Successful!"}
          </h1>
          <p>You will be redirected to the login page in {timeLeft} seconds...</p>
        </div>
      </div>
    );
  }

  // Normal form
  return (
    <div className={styles.background}>
      <div>
        <img
          src="/FindYourProgramLogo.png"
          alt="Logo"
          className={styles.logoImage}
        />
      </div>

      <div className={styles.registerContainer}>
        <form onSubmit={handleSubmit}>
          {/* Username */}
          <div>
            <label className={styles.label}>Username:</label><br />
            <input
              className={styles.inputGroup}
              name="username"
              type="text"
              value={formData.username}
              onChange={handleChange}
            />
          </div>

          {/* Full Name */}
          <div>
            <label className={styles.label}>Full Name:</label><br />
            <input
              className={styles.inputGroup}
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
            />
          </div>

          {/* Email */}
          <div>
            <label className={styles.label}>Email:</label><br />
            <input
              className={styles.inputGroup}
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          {/* Password */}
          <div>
            <label className={styles.label}>Password:</label><br />
            <input
              className={styles.inputGroup}
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label className={styles.label}>Confirm Password:</label><br />
            <input
              className={styles.inputGroup}
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
          </div>

          {/* Messages */}
          <div className={styles.messageContainer}>
            {error && <p>{error}</p>}
            {success && <p className={styles.success}>{success}</p>}
          </div>

          {/* Submit */}
          <div className={styles.buttonContainer}>
            <button className={styles.registerButton} type="submit">
              Register
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
