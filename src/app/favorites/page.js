"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "@/app/globals.module.css";

export default function FavoritesPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    (async () => {
      const r = await fetch("/api/favorites", { cache: "no-store" });
      const j = await r.json();
      setItems(j.items || []);
      setLoading(false);
    })();
  }, []);

  // Function to delete a program from favorites and update the local state.
  const removeOne = async (programId) => {
    // Send DELETE request to the API.
    const r = await fetch(`/api/favorites/${encodeURIComponent(programId)}`, { method: "DELETE" });
    
    if (r.ok) {
        setItems((prev) => prev.filter((x) => x.programId !== programId));
    } else {
        console.error("Failed to remove favorite on the server.");
    }
  };

  // Show loading indicator while data is being fetched.
  if (loading) return <div className={styles.pageSkeleton}>Loading…</div>;

  return (
    <div className={styles.background}>
      {/* Container for results: Controls the maximum width and centers the cards. */}
      <div 
        className={styles.resultsCol} 
        style={{ 
          maxWidth: '1100px', 
          width: '100%', 
          margin: '0 auto', 
          padding: '0 20px', 
        }}
      >
        
        {/* Main "Favorites" Page Title */}
        <h1 className={styles.pageTitle} style={{ textAlign: 'left', marginBottom: '30px' }}>
            Favorites
        </h1>

        {/* Display this message if the favorites list is empty. */}
        {!items.length && (
          <div className={styles.resultCard}>
            <h3 className={styles.cardTitle}>No favorites yet</h3>
            <p className={styles.cardMeta}>Tap “Favorite” on any program to save it here.</p>
          </div>
        )}

        {/* Map over the list of favorite programs to display each card. */}
        {items.map(({ programId, snapshot }) => (
          // Individual Program Card Container
          <div 
            key={programId} 
            className={styles.resultCard} 
            style={{ 
              background: "#e8ffe8", // Green background for the card.
              padding: "10px 15px", 
              marginBottom: "15px", 
            }}
          >
            
            <div style={{ display: "flex", flexDirection: "column" }}>
                
                {/* Remove link: Positioned top-right */}
                <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "2px" }}>
                    <button 
                        onClick={() => removeOne(programId)} 
                        style={{ 
                            background: "none", 
                            border: "none", 
                            color: "#007bff", // Blue text color.
                            cursor: "pointer", 
                            fontSize: "0.75rem",
                            padding: "0", 
                            textDecoration: "underline",
                            fontFamily: 'inherit'
                        }}
                    >
                        Remove from Favorites
                    </button>
                </div>
                
                {/* Program name and meta details */}
                <div>
                    {/* Program title and link (Color locked to black to prevent style glitches) */}
                    <h3 className={styles.cardTitle} style={{ marginBottom: 4, fontSize: "1.4rem" }}>
                      <Link 
                        href={`/programs/${encodeURIComponent(programId)}`}
                        style={{ color: "black", textDecoration: "none" }}
                      >
                        {snapshot?.programName || programId}
                      </Link>
                    </h3>
                    {/* University, Faculty, and Location details */}
                    <p className={styles.cardMeta} style={{ fontSize: "0.9rem" }}>
                      {snapshot?.universityName}
                      {snapshot?.facultyName ? ` · ${snapshot.facultyName}` : ""} · {snapshot?.location || "Ontario"}
                    </p>
                </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}