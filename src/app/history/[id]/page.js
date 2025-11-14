"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import styles from "@/app/globals.module.css";

export default function HistoryDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/history/${id}`, { cache: "no-store" });
        const json = await res.json();
        setData(json);
      } catch {
        setData(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleEdit = () => {
    if (!data?.preferences) return;
    try {
      sessionStorage.setItem(
        "FYP_EDIT_PREFS",
        JSON.stringify(data.preferences)
      );
    } catch {}
    router.push("/search?from=history");
  };

  if (loading)
    return <div className={styles.pageSkeleton}>Loading…</div>;
  if (!data)
    return <div className={styles.pageSkeleton}>Record not found.</div>;

  const prefs = data.preferences || {};
  const summaryChips = [
    prefs.degree || null,
    prefs.field || null,
    prefs.hasLocation === "Yes" && prefs.location ? prefs.location : null,
    prefs.hasBudget === "Yes" && prefs.maxTuition
      ? `≤ $${prefs.maxTuition}`
      : null,
  ].filter(Boolean);

  return (
    <div className={styles.background}>
      <div className={styles.resultsCol}>
        <div
          className={styles.ctaRow}
          style={{ justifyContent: "space-between" }}
        >
          <h1 className={styles.pageTitle}>Saved Search</h1>
          <button onClick={handleEdit} className={styles.secondaryCtaBtn}>
            Edit Search
          </button>
        </div>

        <div
          className={styles.resultCard}
          style={{ marginBottom: 18, background: "#eaf9ff" }}
        >
          <h3 className={styles.cardTitle}>
            {prefs.program || "Unknown Program"}
          </h3>
          <p className={styles.cardMeta}>
            Saved: {new Date(data.createdAt).toLocaleString()}
            {summaryChips.length
              ? " · " + summaryChips.join(" · ")
              : ""}
          </p>
        </div>

        <h3
          className={styles.cardTitle}
          style={{ marginBottom: 8 }}
        >
          Recommendations
        </h3>
        {(data.recommendations || []).map((r, idx) => (
          <div
            key={idx}
            className={styles.resultCard}
            style={{
              position: "relative",
              background: "#dff8f7",
              cursor: "pointer",
            }}
            onClick={() =>
              router.push(
                `/programs/${encodeURIComponent(
                  r.programId || r.courseCode || r.programName
                )}`
              )
            }
          >
            <div
              style={{
                position: "absolute",
                right: 18,
                top: 18,
                fontWeight: 700,
                color: "#1a7f37",
              }}
              aria-hidden="true"
            >
              {typeof r.matchPercentage === "number"
                ? `${r.matchPercentage}%`
                : ""}
            </div>

            <h3
              className={styles.cardTitle}
              style={{ paddingRight: 80 }}
            >
              {r.programName}
            </h3>
            <p className={styles.cardMeta}>
              {r.universityName}
              {r.facultyName ? ` · ${r.facultyName}` : ""} · Ontario
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
