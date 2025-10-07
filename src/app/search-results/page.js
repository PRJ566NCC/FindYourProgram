// src/app/search-results/page.js

"use client";
import { useSearch } from "@/context/SearchContext";
import styles from "@/app/globals.module.css";
import Link from "next/link";

export default function SearchResultsPage() {
  const { results, loading, error } = useSearch();

  if (loading) {
    return (
      <div className={styles.background}>
        <div className={styles.registerContainer}>
          <h2> AI is analyzing... Please wait.</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.background}>
        <div className={styles.registerContainer}>
          <h2>Error</h2>
          <p style={{ color: 'red' }}>{error}</p>
          <Link href="/search">Try again</Link>
        </div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className={styles.background}>
        <div className={styles.registerContainer}>
          <h2>No results found.</h2>
          <p>Please go to the search page to get AI recommendations.</p>
          <Link href="/search">Go to Search</Link>
        </div>
      </div>
    );
  }

return (
    <div className={styles.background}>
      <div className={styles.resultsContainer}>
        <h2 className={styles.resultsTitle}>Search Results</h2>
        <div>
          {Array.isArray(results) && results.map((rec, index) => (
            <div key={index} className={styles.resultCard}>
              <div className={styles.percentage}>{rec.matchPercentage || Math.floor(99 - index * 7)}%</div>
              
              {/* 1. Text content now comes first */}
              <div className={styles.cardContent}>
                  <h3 className={styles.cardTitle}>{rec.programName}</h3>
                  <p className={styles.cardMeta}>{rec.universityName}</p>
              </div>

              {/* 2. Map container now comes second, on the right */}
              <div className={styles.mapContainer}>
                  <img src="/map_placeholder.png" alt="Map Preview" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                  <button className={styles.mapButton}>Show On Map</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}