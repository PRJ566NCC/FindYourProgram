"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./tickets.module.css";

function formatDate(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function prettyStatus(status) {
  if (status === "in-progress") return "In progress";
  if (status === "closed") return "Closed";
  return "Open";
}

function prettyType(type) {
  if (!type) return "Other";
  return type.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function statusClass(status) {
  if (status === "in-progress") return styles.statusInProgress;
  if (status === "closed") return styles.statusClosed;
  return styles.statusOpen;
}

export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");

    fetch("/api/tickets", { cache: "no-store" })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load");
        return res.json();
      })
      .then((data) => {
        if (!active) return;
        setTickets(Array.isArray(data.tickets) ? data.tickets : []);
        setLoading(false);
      })
      .catch(() => {
        if (!active) return;
        setError("Could not load tickets.");
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className={styles.page}>
      <div className={styles.shell}>
        <header className={styles.header}>
          <h1 className={styles.title}>Tickets</h1>
          <p className={styles.subtitle}>
            View and manage requests from all contact forms.
          </p>
        </header>

        {error && <div className={styles.error}>{error}</div>}

        {loading ? (
          <div className={styles.empty}>Loading tickets…</div>
        ) : tickets.length === 0 ? (
          <div className={styles.empty}>No tickets yet.</div>
        ) : (
          <div className={styles.list}>
            {tickets.map((t) => {
              const name = t.name || "Not provided";
              const email = t.email || "Not provided";
              const summary = t.summary || "No summary";
              const type = prettyType(t.type);
              const created = formatDate(t.createdAt);

              return (
                <Link
                  key={t._id}
                  href={`/admin/tickets/${t._id}`}
                  className={styles.ticketCard}
                >
                  <div className={styles.ticketCardTop}>
                    <span
                      className={`${styles.statusChip} ${statusClass(t.status)}`}
                    >
                      {prettyStatus(t.status)}
                    </span>
                    <span className={styles.ticketType}>{type}</span>
                    <span className={styles.ticketTime}>{created}</span>
                  </div>
                  <h2 className={styles.ticketSummary}>{summary}</h2>
                  <p className={styles.ticketMeta}>
                    {name} • {email}
                  </p>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
