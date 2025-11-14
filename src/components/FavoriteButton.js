"use client";
import { useEffect, useState } from "react";

function HeartIcon({ size = 18, filled = false }) {
  const fill = filled ? "#e63946" : "none";
  const stroke = "#e63946";
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      style={{ display: "inline-block", verticalAlign: "middle" }}
    >
      <path
        d="M12 21s-5.2-3.2-8-6.1C2.1 13 1.5 11.7 1.5 10.2 1.5 7.9 3.2 6 5.4 6c1.5 0 2.8.9 3.6 2.1C10.8 6.9 12.1 6 13.6 6c2.2 0 3.9 1.9 3.9 4.2 0 1.5-.6 2.8-2.5 4.7-2.8 2.9-8 6.1-8 6.1z"
        fill={fill}
        stroke={stroke}
        strokeWidth="1"
      />
    </svg>
  );
}

export default function FavoriteButton({ programId }) {
  const [isFav, setIsFav] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!programId) return;

    let cancelled = false;

    (async () => {
      try {
        const res = await fetch(
          `/api/favorites/${encodeURIComponent(programId)}`
        );
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) {
          setIsFav(!!data.isFav);
        }
      } catch (e) {
        console.error("Error loading favorite status:", e);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [programId]);

  const toggle = async () => {
    if (busy || !programId) return;
    setBusy(true);
    setErr("");

    try {
      if (isFav) {
        await fetch(`/api/favorites/${encodeURIComponent(programId)}`, {
          method: "DELETE",
        });
        setIsFav(false);
      } else {
        const res = await fetch("/api/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ programId }),
        });
        const data = await res.json();
        if (res.status === 403) {
          setErr(data.message || "Favorites limit reached (10).");
        } else {
          setIsFav(true);
        }
      }
    } catch (e) {
      console.error("Error toggling favorite:", e);
      setErr("Could not update favorite.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
      }}
    >
      <button
        onClick={toggle}
        disabled={busy}
        style={{
          padding: "10px 24px",
          background: "white",
          border: "2px solid #333",
          borderRadius: "8px",
          fontSize: "1rem",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          height: "44px",
          lineHeight: "1",
          fontWeight: "500",
        }}
      >
        <span style={{ color: "#000" }}>
          {isFav ? "Favorited" : "Favorite"}
        </span>
        <HeartIcon filled={isFav} />
      </button>

      {err && (
        <span
          style={{
            color: "crimson",
            fontSize: "0.85rem",
            marginTop: "4px",
          }}
        >
          {err}
        </span>
      )}
    </div>
  );
}
