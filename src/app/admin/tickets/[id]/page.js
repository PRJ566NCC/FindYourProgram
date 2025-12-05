"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import styles from "../tickets.module.css";

function formatDateTime(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString(undefined, {
    year: "numeric",
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

function statusClass(status) {
  if (status === "in-progress") return styles.statusInProgress;
  if (status === "closed") return styles.statusClosed;
  return styles.statusOpen;
}

function formatLabel(key) {
  return key
    .replace(/summary/i, "summary")
    .replace(/([A-Z])/g, " $1")
    .replace(/[_-]/g, " ")
    .replace(/\s+/g, " ")
    .replace(/^./, (c) => c.toUpperCase());
}

export default function TicketDetailPage() {
  const params = useParams();
  const id = params?.id;

  const [ticket, setTicket] = useState(null);
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingStatus, setSavingStatus] = useState(false);
  const [newNote, setNewNote] = useState("");
  const [addingNote, setAddingNote] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    let active = true;

    fetch(`/api/tickets/${id}`, { cache: "no-store" })
      .then((res) => {
        if (!res.ok) throw new Error("Failed");
        return res.json();
      })
      .then((data) => {
        if (!active) return;
        setTicket(data.ticket || null);
        setUpdates(Array.isArray(data.updates) ? data.updates : []);
        setLoading(false);
      })
      .catch(() => {
        if (!active) return;
        setError("Could not load ticket.");
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id]);

  const displayName = ticket?.name || "Not provided";
  const displayEmail = ticket?.email || "Not provided";
  const created = ticket ? formatDateTime(ticket.createdAt) : "";
  const updated = ticket ? formatDateTime(ticket.updatedAt) : "";

  async function handleStatusChange(nextStatus) {
    if (!ticket) return;
    if (ticket.status === nextStatus) return;

    setSavingStatus(true);
    setError("");

    try {
      const res = await fetch(`/api/tickets/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (!res.ok) throw new Error("Failed");

      const data = await res.json();

      setTicket((prev) =>
        prev
          ? { ...prev, status: data.status || nextStatus, updatedAt: data.updatedAt }
          : prev
      );

      if (data.update) setUpdates((prev) => [...prev, data.update]);
    } catch {
      setError("Could not update status.");
    } finally {
      setSavingStatus(false);
    }
  }

  async function handleAddNote() {
    const value = newNote.trim();
    if (!value) return;

    setAddingNote(true);
    setError("");

    try {
      const res = await fetch(`/api/tickets/${id}/updates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: value }),
      });

      if (!res.ok) throw new Error("Failed");

      const data = await res.json();
      if (data.update) setUpdates((prev) => [...prev, data.update]);
      setNewNote("");
    } catch {
      setError("Could not add update.");
    } finally {
      setAddingNote(false);
    }
  }

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.shell}>
          <div className={styles.empty}>Loading ticket…</div>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className={styles.page}>
        <div className={styles.shell}>
          <Link href="/admin/tickets" className={styles.backLink}>
            ← Back to tickets
          </Link>
          <div className={styles.empty}>Ticket not found.</div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.shell}>
        <Link href="/admin/tickets" className={styles.backLink}>
          ← Back to tickets
        </Link>

        <div className={styles.detailHeader}>
          <div>
            <h1 className={styles.detailTitle}>{ticket.summary}</h1>
            <div className={styles.detailMetaRow}>
              <span>{displayName}</span>
              <span className={styles.dot}>•</span>
              <span>{displayEmail}</span>
            </div>
          </div>

          <div className={styles.detailStatusBlock}>
            <span className={`${styles.statusChip} ${statusClass(ticket.status)}`}>
              {prettyStatus(ticket.status)}
            </span>

            <div className={styles.statusButtons}>
              {ticket.status === "open" && (
                <>
                  <button
                    onClick={() => handleStatusChange("in-progress")}
                    disabled={savingStatus}
                    className={styles.statusButtonPrimary}
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleStatusChange("closed")}
                    disabled={savingStatus}
                    className={styles.statusButtonGhost}
                  >
                    Close
                  </button>
                </>
              )}

              {ticket.status === "in-progress" && (
                <button
                  onClick={() => handleStatusChange("closed")}
                  disabled={savingStatus}
                  className={styles.statusButtonPrimary}
                >
                  Close
                </button>
              )}
            </div>
          </div>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.detailGrid}>
          <section className={styles.detailCard}>
            <h2 className={styles.sectionTitle}>Ticket details</h2>

            <div className={styles.detailRows}>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Created</span>
                <span className={styles.detailValue}>{created}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Last updated</span>
                <span className={styles.detailValue}>{updated}</span>
              </div>
            </div>

            <h3 className={styles.detailSubTitle}>Details</h3>
            {ticket.details ? (
              <dl className={styles.detailsList}>
                {Object.entries(ticket.details).map(([key, value]) => {
                  if (["summary", "name", "email"].includes(key)) return null;
                  const text = value ? String(value).trim() : "";
                  if (!text) return null;
                  return (
                    <div key={key} className={styles.detailPair}>
                      <dt className={styles.detailLabelDt}>{formatLabel(key)}</dt>
                      <dd className={styles.detailValueDd}>{text}</dd>
                    </div>
                  );
                })}
              </dl>
            ) : (
              <p className={styles.muted}>No additional details provided.</p>
            )}
          </section>

          <section className={styles.detailCard}>
            <h2 className={styles.sectionTitle}>Requester</h2>

            <div className={styles.detailRows}>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Name</span>
                <span className={styles.detailValue}>{displayName}</span>
              </div>

              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Email</span>
                <span className={styles.detailValue}>{displayEmail}</span>
              </div>

              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Type</span>
                <span className={styles.detailValue}>
                  {formatLabel(ticket.type)}
                </span>
              </div>

              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Status</span>
                <span className={`${styles.detailValue} ${styles.detailStatusText}`}>
                  {prettyStatus(ticket.status)}
                </span>
              </div>
            </div>
          </section>
        </div>

        <section className={`${styles.detailCard} ${styles.updatesCard}`}>
          <h2 className={styles.sectionTitle}>Updates</h2>

          {updates.length === 0 ? (
            <p className={styles.muted}>No updates yet.</p>
          ) : (
            <ul className={styles.updateList}>
              {updates.map((u) => {
                const isStatus = u.kind === "status";
                const dt = formatDateTime(u.createdAt);

                return (
                  <li key={u._id} className={styles.updateItem}>
                    <div className={styles.updateMeta}>
                      <span className={styles.updateKind}>
                        {isStatus ? "Status change" : "Note"}
                      </span>
                      <span className={styles.updateTime}>{dt}</span>
                    </div>
                    <p className={styles.updateText}>
                      {isStatus
                        ? `Status changed from ${prettyStatus(
                            u.fromStatus
                          )} to ${prettyStatus(u.toStatus)}.`
                        : u.message}
                    </p>
                  </li>
                );
              })}
            </ul>
          )}

          <div className={styles.newUpdateBox}>
            <textarea
              rows={3}
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              className={styles.newUpdateInput}
              placeholder="Add an update..."
            />

            <div className={styles.newUpdateActions}>
              <button
                disabled={!newNote.trim() || addingNote}
                onClick={handleAddNote}
                className={styles.newUpdateButton}
              >
                Add update
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
