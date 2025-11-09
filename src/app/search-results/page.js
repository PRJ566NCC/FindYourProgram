// src/app/search-results/page.js

"use client";
import { useSearch } from "@/context/SearchContext";
import MapPin from "@/components/MapPin";
import styles from "@/app/globals.module.css";
import Link from "next/link";

const getPercentageStyle = (percentage) => {
  if (percentage > 89) {
    return styles.percentageHigh; // Green (for > 90%)
  } else if (percentage >= 80) {
    return styles.percentageMedium; // Light Green (for 80% - 90%)
  } else {
    return styles.percentageLow; // Yellow (for < 80%)
  }
};

export default function SearchResultsPage() {
  const { results, loading, error } = useSearch();

  if (loading) {
    return (
      <div className={styles.background}>
        <div className={styles.registerContainer}>
          <h2>AI is analyzing... Please wait.</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.background}>
        <div className={styles.registerContainer}>
          <h2>Error</h2>
          <p style={{ color: "red" }}>{error}</p>
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

  // --- END ERROR/LOADING BLOCKS ---
  return (
    <div className={styles.background}>
      <div className={styles.searchResultsContainer}>
        {/* 1. TITLE BLOCK */}
        <h2 className={styles.searchResultsTitle}>Search Results</h2>

        {/* 2. RESULTS LIST BLOCK */}
        <div className={styles.searchResultsListWrapper}>
          {Array.isArray(results) &&
            results.map((rec, index) => {
              const matchPercentage =
                rec.matchPercentage || Math.floor(99 - index * 7);
              const percentageClass = getPercentageStyle(matchPercentage);

              return (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: "16px",
                    gap: "16px",
                  }}
                >
                  {/* Program Card wrapped in Link */}
                  <Link
                    href={`/programs/${encodeURIComponent(
                      rec.courseCode || rec.programName
                    )}`}
                    className={styles.searchResultsCard}
                    style={{ textDecoration: "none", flex: 1 }}
                  >
                    <div className={styles.searchResultsCardContent}>
                      {/* 3. PERCENTAGE */}
                      <div
                        className={`${styles.searchResultsPercentage} ${percentageClass}`}
                      >
                        {matchPercentage}%
                      </div>

                      {/* 4. PROGRAM NAME */}
                      <h3 className={styles.searchResultsCardTitle}>
                        {rec.programName}
                      </h3>

                      {/* 5. METADATA */}
                      <p className={styles.searchResultsCardMeta}>
                        {rec.universityName} · {rec.facultyName} · Ontario
                      </p>
                    </div>
                  </Link>

                  {/* 6. MAP PIN */}
                  <MapPin
                    lat={rec.latitude}
                    lng={rec.longitude}
                    name={rec.universityName}
                  />
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
