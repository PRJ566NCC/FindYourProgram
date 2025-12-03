"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSearch } from "@/context/SearchContext";
import styles from "@/app/globals.module.css";

export default function Search() {
  const { fetchRecommendations, loading, error: apiError } = useSearch();

  const [formData, setFormData] = useState({
    international: "", 
    education: "",    
    degree: "",
    field: "",
    program: "",
    
    hasSecondary: "No",
    secondaryProgram: "",
    
    hasBudget: "No",
    maxTuition: "",

    hasLocation: "No",
    location: "",
    
    hasLiving: "No",
    livingBudget: "",
    
    priorities: [], 
    subjects: [],
  });

  const [formError, setFormError] = useState(""); 

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("FYP_EDIT_PREFS");
      if (raw) {
        const prefs = JSON.parse(raw);
        setFormData((prev) => ({ ...prev, ...prefs }));
        sessionStorage.removeItem("FYP_EDIT_PREFS");
      }
    } catch {}
  }, []);

  const handleCheckbox = (group, value) => {
    setFormData((prev) => {
      const updated = prev[group].includes(value)
        ? prev[group].filter((v) => v !== value)
        : [...prev[group], value];
      return { ...prev, [group]: updated };
    });
  };

  const validateForm = () => {
    if (!formData.program.trim()) {
      setFormError("Preferred program is required.");
      return false;
    }
    if (formData.hasSecondary === "Yes" && !formData.secondaryProgram.trim()) {
      setFormError("Secondary program cannot be empty.");
      return false;
    }
    if (formData.hasBudget === "Yes" && (!formData.maxTuition || formData.maxTuition <= 0)) {
      setFormError("Please enter a valid tuition budget.");
      return false;
    }
    if (formData.hasLiving === "Yes" && (!formData.livingBudget || formData.livingBudget <= 0)) {
      setFormError("Please enter a valid living expense budget.");
      return false;
    }
    if (formData.priorities.length === 0) {
      setFormError("Select at least one priority.");
      return false;
    }
    if (formData.subjects.length === 0) {
      setFormError("Select at least one subject.");
      return false;
    }

    setFormError("");
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      fetchRecommendations(formData);
    }
  };

  return (
    <div className={styles.background}>
      <div className={styles.searchContainer}>
        <form onSubmit={handleSubmit}>

          {/* International Student */}
          <div className={styles.searchRow}>
            <label className={styles.searchLabel}>Are you an international student?</label>
            <select
              value={formData.international}
              onChange={(e) => setFormData({ ...formData, international: e.target.value })}
            >
              <option>Yes</option>
              <option>No</option>
            </select>
          </div>

          {/* Education */}
          <div className={styles.searchRow}>
            <label className={styles.searchLabel}>What is your highest education level?</label>
            <select
              value={formData.education}
              onChange={(e) => setFormData({ ...formData, education: e.target.value })}
            >
              <option>Secondary</option>
              <option>Post-Secondary</option>
              <option>Bachelor</option>
              <option>Master</option>
            </select>
          </div>

          {/* Degree */}
          <div className={styles.searchRow}>
            <label className={styles.searchLabel}>What type of degree do you want to pursue?</label>
            <select
              value={formData.degree}
              onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
            >
              <option>Undergraduate</option>
              <option>Graduate</option>
            </select>
          </div>

          {/* Field */}
          <div className={styles.searchRow}>
            <label className={styles.searchLabel}>What is your preferred field of study?</label>
            <select
              value={formData.field}
              onChange={(e) => setFormData({ ...formData, field: e.target.value })}
            >
              <option>Business</option>
              <option>Science</option>
              <option>Engineering</option>
              <option>Arts</option>
            </select>
          </div>

          {/* Preferred Program */}
          <div className={styles.searchRow}>
            <label className={styles.searchLabel}>What is your preferred program?</label>
            <input
              type="text"
              value={formData.program}
              onChange={(e) => setFormData({ ...formData, program: e.target.value })}
            />
          </div>

          {/* Secondary Program */}
          <div className={styles.searchRow}>
            <label className={styles.searchLabel}>Do you have a secondary program?</label>
            <select
              value={formData.hasSecondary}
              onChange={(e) => setFormData({ ...formData, hasSecondary: e.target.value })}
            >
              <option>Yes</option>
              <option>No</option>
            </select>

            {/* Space-preserving wrapper */}
            <div style={{ flex: 1.2 }}>
              <input
                type="text"
                placeholder="Program"
                value={formData.secondaryProgram}
                onChange={(e) => setFormData({ ...formData, secondaryProgram: e.target.value })}
                style={{
                  visibility: formData.hasSecondary === "Yes" ? "visible" : "hidden",
                  pointerEvents: formData.hasSecondary === "Yes" ? "auto" : "none",
                  width: "100%",
                }}
              />
            </div>
          </div>

          {/* Tuition Budget */}
          <div className={styles.searchRow}>
            <label className={styles.searchLabel}>Do you have a tuition budget?</label>
            <select
              value={formData.hasBudget}
              onChange={(e) => setFormData({ ...formData, hasBudget: e.target.value })}
            >
              <option>Yes</option>
              <option>No</option>
            </select>

            <div style={{ flex: 1.2 }}>
              <input
                type="number"
                value={formData.maxTuition}
                onChange={(e) => setFormData({ ...formData, maxTuition: e.target.value })}
                style={{
                  visibility: formData.hasBudget === "Yes" ? "visible" : "hidden",
                  pointerEvents: formData.hasBudget === "Yes" ? "auto" : "none",
                  width: "100%",
                }}
              />
            </div>
          </div>

          {/* Location */}
          <div className={styles.searchRow}>
            <label className={styles.searchLabel}>Do you have a preferred location?</label>
            <select
              value={formData.hasLocation}
              onChange={(e) => setFormData({ ...formData, hasLocation: e.target.value })}
            >
              <option>Yes</option>
              <option>No</option>
            </select>

            <div style={{ flex: 1.2 }}>
              <select
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                style={{
                  visibility: formData.hasLocation === "Yes" ? "visible" : "hidden",
                  pointerEvents: formData.hasLocation === "Yes" ? "auto" : "none",
                  width: "100%",
                }}
              >
                <option>Toronto</option>
                <option>GTA</option>
                <option>Outside Toronto</option>
                <option>Outside GTA</option>
                <option>Ottawa</option>
                <option>Hamilton</option>
                <option>Waterloo</option>
              </select>
            </div>
          </div>

          {/* Living Budget */}
          <div className={styles.searchRow}>
            <label className={styles.searchLabel}>Do you have a living expense budget?</label>
            <select
              value={formData.hasLiving}
              onChange={(e) => setFormData({ ...formData, hasLiving: e.target.value })}
            >
              <option>Yes</option>
              <option>No</option>
            </select>

            <div style={{ flex: 1.2 }}>
              <input
                type="number"
                value={formData.livingBudget}
                onChange={(e) => setFormData({ ...formData, livingBudget: e.target.value })}
                style={{
                  visibility: formData.hasLiving === "Yes" ? "visible" : "hidden",
                  pointerEvents: formData.hasLiving === "Yes" ? "auto" : "none",
                  width: "100%",
                }}
              />
            </div>
          </div>

          {/* Priorities */}
          <div className={styles.searchRow}>
            <label className={styles.searchLabel}>Select your Priorities:</label>
            <div className={styles.searchCheckboxGroup}>
              {["Accreditation", "World Rank", "Co-op"].map((priority) => (
                <label key={priority}>
                  <input
                    type="checkbox"
                    checked={formData.priorities.includes(priority)}
                    onChange={() => handleCheckbox("priorities", priority)}
                  />
                  {priority}
                </label>
              ))}
            </div>
          </div>

          {/* Subjects */}
          <div className={styles.searchRow}>
            <label className={styles.searchLabel}>Select Subjects you excel:</label>
            <div className={styles.searchCheckboxGroup}>
              {["Math", "Science", "Language", "History", "Arts"].map((subject) => (
                <label key={subject}>
                  <input
                    type="checkbox"
                    checked={formData.subjects.includes(subject)}
                    onChange={() => handleCheckbox("subjects", subject)}
                  />
                  {subject}
                </label>
              ))}
            </div>
          </div>

          <div className={styles.messageContainer}>
            {(formError || apiError) && (
              <p style={{ color: "red" }}>{formError || apiError}</p>
            )}
          </div>

          <div className={styles.searchButtonRow}>
            <button className={styles.searchButton} disabled={loading}>
              {loading ? "AI is analyzing..." : "Search"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
