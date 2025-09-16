"use client";
import { useState } from 'react';
import Navbar from '@/components/Navbar.js';
import styles from '../globals.module.css';

export default function Register() {

    const [formData, setFormData] = useState({
        username: '',
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
    });

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        try {
            const { confirmPassword, ...dataToSend } = formData;

            const response = await fetch('/api/register', {
                method: 'POST',
                headers: {
                'Content-Type': 'application/json',
                },
                body: JSON.stringify(dataToSend),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to register.');
            }

            const result = await response.json();
            setSuccess(result.message || 'Registration successful!');

            // Reset form on success - replace with redirection to main page later
            setFormData({
                username: '',
                name: '',
                email: '',
                password: '',
                confirmPassword: '',
            });

        } catch (error) {
            setError(error.message);
        }
    };


    return (
        <>
            <Navbar/>
            <div className={styles.background}>
                <div>
                    <img src='/FindYourProgramLogo.png' alt='Logo for website' className={styles.logoImage}></img>
                </div>
                <div className={styles.registerContainer}>
                    <form onSubmit={handleSubmit}>
                        {/* Username Input */}
                        <div>
                            <label className={styles.label} htmlFor="username">Username:</label>
                            <br/>
                            <input
                                className={styles.inputGroup}
                                id="username"
                                name="username"
                                type="text"
                                required
                                value={formData.username}
                                onChange={handleChange}
                            />
                        </div>

                        {/* Name Input */}
                        <div>
                            <label className={styles.label} htmlFor="name">Full Name:</label>
                            <br/>
                            <input
                                className={styles.inputGroup}
                                id="name"
                                name="name"
                                type="text"
                                required
                                value={formData.name}
                                onChange={handleChange}
                            />
                        </div>

                        {/* Email Input */}
                        <div>
                            <label className={styles.label} htmlFor="email">Email:</label>
                            <br/>
                            <input
                                className={styles.inputGroup}
                                id="email"
                                name="email"
                                type="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>

                        {/* Password Input */}
                        <div>
                            <label className={styles.label} htmlFor="password">Password:</label>
                            <br/>
                            <input
                                className={styles.inputGroup}
                                id="password"
                                name="password"
                                type="password"
                                required
                                value={formData.password}
                                onChange={handleChange}
                            />
                        </div>

                        {/* Confirm Password Input */}
                        <div>
                            <label className={styles.label} htmlFor="confirmPassword">Confirm Password:</label>
                            <br/>
                            <input
                                className={styles.inputGroup}
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                required
                                value={formData.confirmPassword}
                                onChange={handleChange}
                            />
                        </div>
            
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
    )
}