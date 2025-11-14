"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import styles from "@/app/globals.module.css";
import FavoriteButton from "@/components/FavoriteButton";

export default function ProgramDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [program, setProgram] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [logoError, setLogoError] = useState(false);

  const [isRatingOpen, setIsRatingOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [ratingCount, setRatingCount] = useState(0);
  const [userRating, setUserRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [hasRated, setHasRated] = useState(false);

  useEffect(() => {
    if (!id) return;

    (async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/programs/${encodeURIComponent(id)}`, {
          cache: "no-store",
        });

        if (!res.ok) {
          throw new Error("Program not found");
        }

        const data = await res.json();
        setProgram(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  async function fetchRating() {
    if (!program) return;
    try {
      const params = new URLSearchParams({
        programName: program.programName,
        universityName: program.universityName,
        location: program.location || "Unknown",
      });

      const res = await fetch(`/api/ratings?${params.toString()}`, {
        cache: "no-store",
      });

      if (res.ok) {
        const data = await res.json();
        setRating(data.rating || 0);
        setRatingCount(data.count || 0);
        if (typeof data.userHasRated === "boolean") {
          setHasRated(data.userHasRated);
        } else {
          setHasRated(false);
        }
        if (data.userRating) {
          setUserRating(data.userRating);
        }
      }
    } catch (err) {
      console.error("Error loading rating:", err);
    }
  }

  useEffect(() => {
    fetchRating();
  }, [program]);

  if (loading) {
    return (
      <div className={styles.background}>
        <div className={styles.registerContainer}>
          <h2>Loading program details...</h2>
        </div>
      </div>
    );
  }

  if (error || !program) {
    return (
      <div className={styles.background}>
        <div className={styles.registerContainer}>
          <h2>Program Not Found</h2>
          <p style={{ color: "red" }}>
            {error || "Could not find the requested program."}
          </p>
          <button
            onClick={() => router.push("/search")}
            className={styles.registerBtn}
          >
            Back to Search
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #FFA07A 0%, #FFB6C1 50%, #DDA0DD 100%)",
      }}
    >
      <div
        style={{
          background: "#FFB6C1",
          padding: "20px 40px",
          display: "flex",
          alignItems: "center",
          gap: "16px",
        }}
      >
        <button
          onClick={() => router.back()}
          style={{
            background: "none",
            border: "none",
            fontSize: "1.2rem",
            cursor: "pointer",
            color: "#333",
          }}
        >
          ← Back to search results
        </button>
      </div>

      <div
        style={{
          background: "#FFB6C1",
          padding: "20px 40px 30px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "2rem",
              fontWeight: "bold",
              margin: 0,
              marginBottom: "8px",
            }}
          >
            {program.programName}
          </h1>
          <p
            style={{
              fontSize: "1.2rem",
              margin: 0,
              color: "#333",
            }}
          >
            {program.universityName}
          </p>
        </div>

        <div
          style={{
            display: "flex",
            gap: "12px",
            alignItems: "center",
          }}
        >
          <FavoriteButton
            programId={program.programId || decodeURIComponent(id)}
          />
          <button
            style={{
              padding: "10px 24px",
              background: hasRated ? "#ddd" : "white",
              border: "2px solid #333",
              borderRadius: "8px",
              fontSize: "1rem",
              cursor: hasRated ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              opacity: hasRated ? 0.7 : 1,
            }}
            disabled={hasRated}
            onClick={!hasRated ? () => setIsRatingOpen(true) : undefined}
          >
            {hasRated ? "Rated ⭐" : "Rate ⭐"}
          </button>
          {ratingCount > 0 && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                justifyContent: "center",
                fontSize: "0.9rem",
                color: "#333",
              }}
            >
              <span>
                <strong>{rating.toFixed(1)}</strong> / 5 ⭐
              </span>
              <span>
                {ratingCount} {ratingCount === 1 ? "rating" : "ratings"}
              </span>
            </div>
          )}
          <button
            style={{
              padding: "10px 24px",
              background: "white",
              border: "2px solid #333",
              borderRadius: "8px",
              fontSize: "1rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
             onClick={() => {
    const theId =
      (typeof program !== "undefined" && (program._id || program.programId)) ||
      idFromUrl;

    if (!theId) {
      alert("Missing program id");
      return;
    }
    window.location.href = `/api/programs/${encodeURIComponent(theId)}/download`;
  }}
          >
            PDF ⬇
          </button>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          padding: "40px",
          gap: "40px",
          maxWidth: "1400px",
          margin: "0 auto",
        }}
      >
        <div
          style={{
            flex: "0 0 400px",
          }}
        >
          <div
            style={{
              background: program.universityColor || "#0055A4",
              color: "white",
              padding: "60px 40px",
              borderRadius: "8px",
              position: "relative",
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "300px",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                right: 0,
                width: "150px",
                height: "150px",
                background: program.universityAccentColor || "#FFD700",
                borderBottomLeftRadius: "100%",
              }}
            ></div>

            {program.universityLogoUrl && !logoError ? (
              <img
                src={program.universityLogoUrl}
                alt={program.universityName}
                style={{
                  maxWidth: "90%",
                  maxHeight: "250px",
                  width: "auto",
                  height: "auto",
                  objectFit: "contain",
                  position: "relative",
                  zIndex: 1,
                }}
                onError={() => setLogoError(true)}
              />
            ) : (
              <h2
                style={{
                  fontSize: "3rem",
                  fontWeight: "bold",
                  lineHeight: "1.2",
                  margin: 0,
                  position: "relative",
                  zIndex: 1,
                  textAlign: "center",
                }}
              >
                {program.universityName?.split(" ").slice(0, 2).join(" ")}
                <br />
                {program.universityName?.split(" ").slice(2).join(" ")}
              </h2>
            )}
          </div>
        </div>

        <div style={{ flex: 1 }}>
          <div
            style={{
              background: "#E8E8E8",
              padding: "30px",
              borderRadius: "8px",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "24px",
              marginBottom: "30px",
            }}
          >
            <div>
              <h3 style={{ margin: "0 0 8px 0", fontWeight: "bold" }}>
                Length of study
              </h3>
              <p style={{ margin: 0, fontSize: "1.1rem" }}>
                {program.lengthOfStudy || "N/A"}
              </p>
            </div>
            <div>
              <h3 style={{ margin: "0 0 8px 0", fontWeight: "bold" }}>
                Co-op availability
              </h3>
              <p style={{ margin: 0, fontSize: "1.1rem" }}>
                {program.coopAvailability || "N/A"}
              </p>
            </div>
            <div>
              <h3 style={{ margin: "0 0 8px 0", fontWeight: "bold" }}>
                Program Level
              </h3>
              <p style={{ margin: 0, fontSize: "1.1rem" }}>
                {program.degreeType || "N/A"}
              </p>
            </div>
            <div>
              <h3 style={{ margin: "0 0 8px 0", fontWeight: "bold" }}>
                Remote learning
              </h3>
              <p style={{ margin: 0, fontSize: "1.1rem" }}>
                {program.remoteLearning || "N/A"}
              </p>
            </div>
            <div>
              <h3 style={{ margin: "0 0 8px 0", fontWeight: "bold" }}>
                Language
              </h3>
              <p style={{ margin: 0, fontSize: "1.1rem" }}>
                {program.language || "English"}
              </p>
            </div>
            <div>
              <h3 style={{ margin: "0 0 8px 0", fontWeight: "bold" }}>
                Area of Study
              </h3>
              <p style={{ margin: 0, fontSize: "1.1rem" }}>
                {program.areaOfStudy || "N/A"}
              </p>
            </div>
          </div>

          <div style={{ textAlign: "center" }}>
            {program.websiteLink ? (
              <a
                href={program.websiteLink}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-block",
                  padding: "14px 40px",
                  background: "#000",
                  color: "white",
                  textDecoration: "none",
                  borderRadius: "25px",
                  fontSize: "1rem",
                }}
              >
                Official Website link
              </a>
            ) : null}
          </div>
        </div>
      </div>

      {isRatingOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
          onClick={() => setIsRatingOpen(false)}
        >
          <div
            style={{
              background: "white",
              padding: "30px",
              borderRadius: "10px",
              textAlign: "center",
              minWidth: "300px",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2>Rate this Program</h2>

            <p style={{ margin: "10px 0", color: "#555" }}>
              Current Rating:{" "}
              <strong>{rating.toFixed(1)} / 5</strong> (
              {ratingCount} {ratingCount === 1 ? "rating" : "ratings"})
            </p>

            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "8px",
                margin: "20px 0",
              }}
            >
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  style={{
                    fontSize: "2rem",
                    cursor: "pointer",
                    color:
                      (hover || userRating) >= star ? "#FFD700" : "#ccc",
                    transition: "color 0.2s",
                  }}
                  onClick={() => setUserRating(star)}
                  onMouseEnter={() => setHover(star)}
                  onMouseLeave={() => setHover(0)}
                >
                  ★
                </span>
              ))}
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "12px",
              }}
            >
              <button
                onClick={async () => {
                  if (!userRating) return;
                  try {
                    const res = await fetch("/api/ratings", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        programName: program.programName,
                        universityName: program.universityName,
                        location: program.location || "Unknown",
                        rating: userRating,
                      }),
                    });

                    if (!res.ok) throw new Error("Failed to submit rating");
                    await fetchRating();
                  } catch (err) {
                    console.error("Error saving rating:", err);
                    alert("Error saving rating.");
                  } finally {
                    setIsRatingOpen(false);
                  }
                }}
                style={{
                  padding: "10px 20px",
                  background: "#000",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
              >
                Submit
              </button>
              <button
                onClick={() => setIsRatingOpen(false)}
                style={{
                  padding: "10px 20px",
                  background: "#ccc",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
