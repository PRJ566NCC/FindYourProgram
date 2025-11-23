"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import styles from "./globals.module.css";
import { useAuth } from "@/components/AuthProvider";

/**
 * Home page.
 * Renders landing for unauthenticated users or the signed-in main view.
 */
export default function Home() {
  const { isAuthed, loading, user } = useAuth();

  if (loading) {
    return <div className={styles.pageSkeleton}>Loading…</div>;
  }

  if (!isAuthed) return <Landing />;

  // SHOW ADMIN DASHBOARD IF ADMIN USER
  if (user?.isAdmin) return <AdminDashboard />;

  return <SignedInMain />;
}

/**
 * ADMIN DASHBOARD VIEW
 * Appears ONLY when user.isAdmin === true
 */
function AdminDashboard() {
  return (
    <div className={styles.background}>
      <div style={{ textAlign: "center" }}>
        <h1 className={styles.adminTitle}>Admin Dashboard</h1>

        <div className={styles.adminButtonWrapper}>
          <Link href="/admin/donations" className={styles.adminButton}>
            Donations
          </Link>

          <Link href="/admin/sponsorships" className={styles.adminButton}>
            Sponsorships
          </Link>

          <Link href="/admin/tickets" className={styles.adminButton}>
            Tickets
          </Link>
        </div>
      </div>
    </div>
  );
}

/**
 * Signed-in view with dynamic sponsorship tiles.
 */
function SignedInMain() {
  const [sponsors, setSponsors] = useState([]);
  const [loadingSponsors, setLoadingSponsors] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch("/api/sponsorships/active", { cache: "no-store" });
        if (!res.ok) throw new Error("Load error");
        const data = await res.json();
        if (mounted && Array.isArray(data?.sponsors)) setSponsors(data.sponsors);
      } catch {
        if (mounted) setSponsors([]);
      } finally {
        if (mounted) setLoadingSponsors(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className={styles.background}>
      <div className={styles.authedMain}>
        {/* Left logo column */}
        <div className={styles.logoCol}>
          <img
            src="/FindYourProgramLogo.png"
            alt="Logo for website"
            className={styles.sideLogo}
          />
        </div>

        {/* Right content column */}
        <div className={styles.resultsCol}>
          {/* Dynamic sponsorship tiles; render nothing when zero */}
          {!loadingSponsors && sponsors.length > 0 && (
            <>
              {sponsors.map((s) => (
                <div key={s._id} className={styles.resultCard}>
                  <a className={styles.sponsoredLink} href="#">Sponsored</a>
                  <h3 className={styles.cardTitle}>{s.programName}</h3>
                  <p className={styles.cardMeta}>
                    {s.uniName}
                    {s.departmentName ? ` · ${s.departmentName}` : ""} · Ontario
                  </p>
                </div>
              ))}
            </>
          )}

          <div className={styles.ctaRow}>
            <Link href="/search" className={styles.primaryBtn}>
              New Search
            </Link>
            <Link href="/history" className={styles.secondaryCtaBtn}>
              Search History
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Landing view for unauthenticated users.
 */
function Landing() {
  return (
    <div className={styles.landingBackground}>
      <img
        src="/FindYourProgramLogo.png"
        alt="Find Your Program"
        className={styles.heroLogo}
      />
      <p className={styles.heroText}>
        Realize, Admit, Adept
        <br />
        Register to realize opportunities.
      </p>
    </div>
  );
}
