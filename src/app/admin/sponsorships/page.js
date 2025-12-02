"use client";

import { useEffect, useState } from "react";
import styles from "../adminTable.module.css";

export default function AdminSponsorshipsPage() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/sponsorships/list", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        const list = Array.isArray(d) ? d : d.sponsorships || [];
        setRecords(list);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className={styles.page}>Loading…</div>;

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Sponsorship Records</h1>

        <table className={styles.table}>
          <thead>
            <tr>
              <th>University</th>
              <th>Program</th>
              <th>Department</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Start</th>
              <th>End</th>
            </tr>
          </thead>

          <tbody>
            {records.map((r) => (
              <tr key={r._id} className={styles.row}>
                <td>{r.uniName}</td>
                <td>{r.programName}</td>
                <td>{r.departmentName}</td>
                <td>{r.email}</td>
                <td>{r.phone}</td>
                <td>
                  {r.amountCents
                    ? `$${(r.amountCents / 100).toFixed(2)} CAD`
                    : "—"}
                </td>
                <td>{r.status}</td>
                <td>{new Date(r.startsAt).toLocaleDateString()}</td>
                <td>{new Date(r.expiresAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
