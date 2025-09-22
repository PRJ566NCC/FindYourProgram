"use client";
import React, { useState } from 'react';
import { useAuth } from '@/components/AuthProvider'
import styles from '@/app/globals.module.css';

function UserProfile() {
  const { isAuthed } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState(null);

  // fetch user profile information once when page is loaded
  useEffect(() => {
    // No need to fetch data if user is not logged in
    if (!isAuthed) {
      setLoading(false);
      setError("Please log in to view your profile.");
      return;
    }

    const fetchUserData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/me'); // TODO: call the API

        if (!response.ok) {
          throw new Error('Failed to fetch user data.');
        }

        const data = await response.json();
        setUserData(data); // save the fetched user data
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [isAuthed]); // if there is status change in isAuthed, run this logic again

  const handleEditClick = () => {
    if (userData) {
      setFormData({ ...userData, password: '', confirmPassword: '' });
    }
    setIsEditing(true); 
  };
  
  const handleCancelClick = () => {
    setIsEditing(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Confirm button handler
  const handleConfirmClick = (e) => {
    e.preventDefault();
    // TODO: Add password verification logic
    // ex: if (formData.password !== formData.confirmPassword) { alert("Passwords do not match!"); return; }

    // TODO: Call API to send the changed data to the server
    console.log("Updated data:", formData);

    setUserData({ // TEMP
        username: formData.username,
        name: formData.name,
        email: formData.email,
    });
    
    setIsEditing(false);
  };

  // show this while loading
  if (loading) {
    return (
      <div className={styles.background}>
        <div className={styles.registerContainer}>
          <h2>Loading Profile...</h2>
        </div>
      </div>
    );
  }

  // show this if Error
  if (error) {
    return (
      <div className={styles.background}>
        <div className={styles.registerContainer}>
          <h2>Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }
  
  // =======FOR TEST PURPOSE: if there are no data=========
  if (!userData) {
      return null;
  }
  // ======================================================

  return (
    <div className={styles.background}>
      <div className={styles.registerContainer}>

        {/* ------------------- Editting mode (isEditing is true) ------------------- */}
        {isEditing ? (
          <>
            <h2>Edit Profile</h2>
            <form onSubmit={handleConfirmClick}>
              <div>
                <label className={styles.label} htmlFor="username">Username:</label>
                <input className={styles.inputGroup} type="text" id="username" name="username" value={formData.username} onChange={handleChange} />
              </div>
              <div>
                <label className={styles.label} htmlFor="name">Name:</label>
                <input className={styles.inputGroup} type="text" id="name" name="name" value={formData.name} onChange={handleChange} />
              </div>
              <div>
                <label className={styles.label} htmlFor="email">Email:</label>
                <input className={styles.inputGroup} type="email" id="email" name="email" value={formData.email} onChange={handleChange} />
              </div>
              <div>
                <label className={styles.label} htmlFor="password">New Password:</label>
                <input className={styles.inputGroup} type="password" id="password" name="password" value={formData.password} onChange={handleChange} />
              </div>
              <div>
                <label className={styles.label} htmlFor="confirmPassword">Confirm Password:</label>
                <input className={styles.inputGroup} type="password" id="confirmPassword" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} />
              </div>
              <div className={styles.buttonContainer}>
                <button type="submit" className={styles.registerButton}>Confirm</button>
                <button type="button" className={styles.registerButton} onClick={handleCancelClick}>Cancel</button>
              </div>
            </form>
          </>
        ) : (
        /* ------------------- Read Only mode (isEditing is false) ------------------- */
          <>
            <h2>User Profile</h2>
            <form>
              <div>
                <label className={styles.label} htmlFor="username">Username:</label>
                <input className={styles.inputGroup} type="text" id="username" value={userData.username} readOnly />
              </div>
              <div>
                <label className={styles.label} htmlFor="name">Name:</label>
                <input className={styles.inputGroup} type="text" id="name" value={userData.name} readOnly />
              </div>
              <div>
                <label className={styles.label} htmlFor="email">Email:</label>
                <input className={styles.inputGroup} type="email" id="email" value={userData.email} readOnly />
              </div>
            </form>
            <div className={styles.buttonContainer}>
                <button className={styles.registerButton} onClick={handleEditClick}>Edit</button>
                {/* Removed for now */}
                {/* <button className={styles.registerButton}>Export</button>
                <button className={styles.registerButton}>Delete</button> */}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default UserProfile;