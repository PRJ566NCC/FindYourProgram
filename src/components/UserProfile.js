"use client";
import React, { useState } from 'react';
import styles from '@/app/globals.module.css';

function UserProfile() {
  const [isEditing, setIsEditing] = useState(false);

  const [userData, setUserData] = useState({
    username: 'Xuesong1234',
    name: 'Tommy Xuesong',
    email: 'Xuesong1234@gmail.com',
  });

  const [formData, setFormData] = useState({ ...userData, password: '', confirmPassword: '' });

  const handleEditClick = () => {
    console.log("edit clicked!")
    setFormData({ ...userData, password: '', confirmPassword: '' });
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

    setUserData({
        username: formData.username,
        name: formData.name,
        email: formData.email,
    });
    
    setIsEditing(false);
  };

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