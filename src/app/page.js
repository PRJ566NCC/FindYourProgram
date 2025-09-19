"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./globals.module.css";
import Navbar from "@/components/Navbar";

export default function Home() {
  const [isAuthed, setIsAuthed] = useState(false);
  const [authResolved, setAuthResolved] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch("/api/me", { cache: "no-store", credentials: "include" });
        const data = await res.json();
        if (mounted) setIsAuthed(!!data?.authenticated);
      } catch {
        if (mounted) setIsAuthed(false);
      } finally {
        if (mounted) setAuthResolved(true);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // hold UI until auth check completes to avoid flashing wrong state
  if (!authResolved) {
    return (
      <>
        <Navbar isAuthenticated={false} authResolved={false} />
        <div className={styles.pageSkeleton}>Loading…</div>
      </>
    );
  }

  return (
    <>
      <Navbar isAuthenticated={isAuthed} authResolved />
      {isAuthed ? <SignedInMain /> : <Landing />}
    </>
  );
}

/* Sign in view  */
function SignedInMain() {
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
          <div className={styles.resultCard}>
            <a className={styles.sponsoredLink} href="#">Sponsored</a>
            <h3 className={styles.cardTitle}>B.Comm. in Management (Honours)</h3>
            <p className={styles.cardMeta}>
              Toronto Metropolitan University · Ted Rogers School of Management · Ontario
            </p>
          </div>

          <div className={styles.resultCard}>
            <a className={styles.sponsoredLink} href="#">Sponsored</a>
            <h3 className={styles.cardTitle}>B.Comm. in Accounting & Finance (Honours)</h3>
            <p className={styles.cardMeta}>
              Toronto Metropolitan University · Ted Rogers School of Management · Ontario
            </p>
          </div>

          <div className={styles.ctaRow}>
            <Link href="/search" className={styles.primaryBtn}>New Search</Link>
            <Link href="/history" className={styles.secondaryBtn}>Search History</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

/* Before Sign in view  */
function Landing() {
  return (
    <div className={styles.landingBackground}>
        <img 
        src="/FindYourProgramLogo.png" 
        alt="Find Your Program" 
        className={styles.heroLogo}/>
        <p className={styles.heroText}>
          Realize, Admit, Adept<br/>Register to realize your opportunities!
        </p>
    </div>
  );
}
