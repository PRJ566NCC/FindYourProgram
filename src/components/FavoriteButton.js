"use client";
import { useEffect, useState } from "react";

export default function FavoriteButton({ programId }) {
  const [isFav, setIsFav] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      const res = await fetch(`/api/favorites/${encodeURIComponent(programId)}`);
      const data = await res.json();
      setIsFav(!!data.isFav);
    })();
  }, [programId]);

  const toggle = async () => {
    if (busy) return;
    setBusy(true);
    setErr("");
    try {
      if (isFav) {
        await fetch(`/api/favorites/${encodeURIComponent(programId)}`, { method: "DELETE" });
        setIsFav(false);
      } else {
        const res = await fetch("/api/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ programId }),
        });
        const data = await res.json();
        if (res.status === 403) setErr(data.message || "Favorites limit reached (10).");
        else setIsFav(true);
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
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
        <span style={{ color: "#000" }}>{isFav ? "Favorited" : "Favorite"}</span>
        <span
          style={{
            color: isFav ? "red" : "black",
            fontSize: "1.1rem",
            marginTop: "1px",
          }}
        >
          {isFav ? '❤️' : '🤍'}
        </span>
      </button>

      {err && (
        <span style={{ color: "crimson", fontSize: "0.85rem", marginTop: "4px" }}>
          {err}
        </span>
      )}
    </div>
  );
}
