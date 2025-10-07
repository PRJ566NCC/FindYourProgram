// src/app/search/page.js

"use client";
import { useSearch } from "@/context/SearchContext";
import styles from "@/app/globals.module.css";

export default function TestSearchPage() {
  // 1. bring in the fetchRecommendations function and loading state from context
  const { fetchRecommendations, loading, error } = useSearch();

  // 2. function to run when button is clicked
  const handleTestSearch = () => {
    // 3. for test, send this hardcoded preferences
    //    for this condition we expect to get some recommendations
    //    in a real app, these preferences would come from user inputs
    const testPreferences = {
      field: 'Business',
      location: 'Toronto',
      tuition: '<20000'
    };
    
    fetchRecommendations(testPreferences);
  };

  return (
    <div className={styles.background} style={{ justifyContent: 'center', alignItems: 'center' }}>
      <div className={styles.registerContainer}>
        <h2>Search Page (Test)</h2>
        <p>Click the button below to test the AI recommendation flow.</p>
        
        <div className={styles.buttonContainer} style={{ marginTop: '2rem' }}>
          {/* 4. when loading, disable the button */}
          <button 
            className={styles.registerButton} 
            onClick={handleTestSearch}
            disabled={loading}
          >
            {loading ? 'AI is analyzing...' : 'Get AI Recommendations'}
          </button>
        </div>

        {/* If there's an error during the API call, display it here */}
        {error && <p style={{ color: 'red', marginTop: '1rem' }}>Error: {error}</p>}
      </div>
    </div>
  );
}