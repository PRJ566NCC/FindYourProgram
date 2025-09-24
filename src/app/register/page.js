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
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(3);

  useEffect(() => {
  if (isRedirecting && timeLeft > 0) {
    const timerId = setTimeout(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000); // Decrement every second
    return () => clearTimeout(timerId); // Clean up the timer
  } else if (isRedirecting && timeLeft === 0) {
    router.push('/login'); // Redirect when the timer hits zero
  }
  }, [isRedirecting, timeLeft, router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const validateForm = () => {
    // Username
    if (!formData.username.trim()) {
      setError("Username is required.");
      return false;
    }
    if (formData.username.length < 3) {
      setError("Username must be at least 3 characters long.");
      return false;
    }

    // Name
    if (!formData.name.trim()) {
      setError("Full name is required.");
      return false;
    }
    if (!/^[a-zA-Z\s]+$/.test(formData.name)) {
      setError("Name can only contain letters and spaces.");
      return false;
    }

    // Email
    if (!formData.email.trim()) {
      setError("Email is required.");
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError("Please enter a valid email address.");
      return false;
    }

    // Password
    if (!formData.password) {
      setError("Password is required.");
      return false;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return false;
    }

    // Confirm Password
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return false;
    }

    setError(""); // clear if valid
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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to register.");
      }

      const result = await response.json();
      setSuccess(result.message || "Registration successful!");

      setIsRedirecting(true);

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

  if (isRedirecting) {
    return (
      <>
        <div className={styles.background}>
          <div className={styles.registerContainer}>
            <h1 className={styles.label}>🎉 Registration Successful!</h1>
            <p>You will be redirected to the login page in {timeLeft} seconds...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className={styles.background}>
        <div>
          <img
            src="/FindYourProgramLogo.png"
            alt="Logo for website"
            className={styles.logoImage}
          ></img>
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

            {/* Name Input */}
            <div>
              <label className={styles.label} htmlFor="name">
                Full Name:
              </label>
              <br />
              <input
                className={styles.inputGroup}
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            {/* Email Input */}
            <div>
              <label className={styles.label} htmlFor="email">
                Email:
              </label>
              <br />
              <input
                className={styles.inputGroup}
                id="email"
                name="email"
                type="email"
                value={formData.email}
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

            {/* Confirm Password Input */}
            <div>
              <label className={styles.label} htmlFor="confirmPassword">
                Confirm Password:
              </label>
              <br />
              <input
                className={styles.inputGroup}
                id="confirmPassword"
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

            {/* Submit Button */}
            <div className={styles.buttonContainer}>
              <button className={styles.registerButton} type="submit">
                Register
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
