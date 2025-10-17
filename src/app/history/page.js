"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "@/app/globals.module.css";

export default function HistoryPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/history", { cache: "no-store" });
        const data = await res.json();
        setItems(data.items || []);
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className={styles.pageSkeleton}>Loading…</div>;

  return (
    <div className={styles.background}>
      <div className={styles.resultsCol}>
        <h1 className={styles.pageTitle}>Search History</h1>

        {!items.length && (
          <div className={styles.resultCard}>
            <h3 className={styles.cardTitle}>No history yet</h3>
            <p className={styles.cardMeta}>Run a search and it will appear here.</p>
          </div>
        )}

        {items.map((item) => {
          const p = item.preferences || {};
          const quickMeta = [
            p.degree,
            p.field,
            p.location && p.hasLocation === "Yes" ? p.location : null,
          ]
            .filter(Boolean)
            .join(" · ");

        return (
          <div
            key={item._id}
            className={styles.resultCard}
            onClick={() => router.push(`/history/${item._id}`)}
            style={{ cursor: "pointer" }}
          >
            <h3 className={styles.cardTitle}>
              {p.program || "Unknown Program"}
            </h3>
            <p className={styles.cardMeta}>
              {new Date(item.createdAt).toLocaleString()}
              {quickMeta ? ` · ${quickMeta}` : ""}
            </p>
          </div>
        );})}
      </div>
    </div>
  );
}
