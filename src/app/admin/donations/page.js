"use client";

import { useEffect, useState } from "react";
import styles from "../adminTable.module.css";

export default function AdminDonationsPage() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/donations/list", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        const list = Array.isArray(d) ? d : d.donations || [];
        setRecords(list);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className={styles.page}>Loading…</div>;

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Donation Records</h1>

        <table className={styles.table}>
          <thead>
            <tr>
              <th>Donor Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Reason</th>
              <th>Created At</th>
            </tr>
          </thead>

          <tbody>
            {records.map((r) => (
              <tr key={r._id} className={styles.row}>
                <td>{r.name}</td>
                <td>{r.email}</td>
                <td>{r.phone}</td>
                <td>
                  {r.amountCents
                    ? `$${(r.amountCents / 100).toFixed(2)} CAD`
                    : "—"}
                </td>
                <td>{r.status}</td>
                <td>{r.reason}</td>
                <td>{new Date(r.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
