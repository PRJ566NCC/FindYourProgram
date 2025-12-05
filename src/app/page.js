"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import styles from "./globals.module.css";
import { useAuth } from "@/components/AuthProvider";

export default function Home() {
  const { isAuthed, loading, user } = useAuth();

  if (loading) {
    return <div className={styles.pageSkeleton}>Loading…</div>;
  }

  if (!isAuthed) return <Landing />;

  if (user?.isAdmin) return <AdminDashboard />;

  return <SignedInMain />;
}

function AdminDashboard() {
  return (
    <div className={styles.background}>
      <div className={styles.authedMain}>
        <div className={styles.logoCol}>
          <div className={styles.adminLogoStack}>
            <Image
              src="/FindYourProgramLogo.png"
              alt="Find Your Program"
              width={260}
              height={260}
              className={styles.sideLogo}
            />
            <p className={styles.adminSubtitle}>
              Review donations, sponsorships, and student tickets from one place.
            </p>
          </div>
        </div>

        <div className={styles.resultsCol}>
          <div className={styles.adminHeader}>
            <h1 className={styles.adminTitle}>Admin Dashboard</h1>
            <p className={styles.adminTagline}>
              Quickly jump into the areas you manage most often.
            </p>
          </div>

          <div className={styles.adminCardGrid}>
            <Link href="/admin/donations" className={styles.adminCard}>
              <div className={styles.adminCardTop}>
                <span className={styles.adminCardLabel}>Financial</span>
                <span className={styles.adminCardArrow}>→</span>
              </div>
              <h2 className={styles.adminCardTitle}>Donations</h2>
              <p className={styles.adminCardDescription}>
                View recent donations, monitor funding trends, and export data
                for reports.
              </p>
              <div className={styles.adminCardFooter}>
                <span>Open donations panel</span>
              </div>
            </Link>

            <Link href="/admin/sponsorships" className={styles.adminCard}>
              <div className={styles.adminCardTop}>
                <span className={styles.adminCardLabel}>Partners</span>
                <span className={styles.adminCardArrow}>→</span>
              </div>
              <h2 className={styles.adminCardTitle}>Sponsorships</h2>
              <p className={styles.adminCardDescription}>
                Manage active sponsorships and see which programs are currently
                being promoted.
              </p>
              <div className={styles.adminCardFooter}>
                <span>Open sponsorships panel</span>
              </div>
            </Link>

            <Link href="/admin/tickets" className={styles.adminCard}>
              <div className={styles.adminCardTop}>
                <span className={styles.adminCardLabel}>Support</span>
                <span className={styles.adminCardArrow}>→</span>
              </div>
              <h2 className={styles.adminCardTitle}>Tickets</h2>
              <p className={styles.adminCardDescription}>
                Track student and sponsor requests, update statuses, and keep a
                clear timeline of follow-ups.
              </p>
              <div className={styles.adminCardFooter}>
                <span>Open tickets workspace</span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function SignedInMain() {
  const [sponsors, setSponsors] = useState([]);
  const [loadingSponsors, setLoadingSponsors] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch("/api/sponsorships/active", {
          cache: "no-store",
        });
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
        <div className={styles.logoCol}>
          <img
            src="/FindYourProgramLogo.png"
            alt="Logo for website"
            className={styles.sideLogo}
          />
        </div>

        <div className={styles.resultsCol}>
          {!loadingSponsors && sponsors.length > 0 && (
            <>
              {sponsors.map((s) => (
                <div key={s._id} className={styles.resultCard}>
                  <a className={styles.sponsoredLink} href="#">
                    Sponsored
                  </a>
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
