"use client";
import Link from "next/link";
import Image from "next/image";
import styles from "./globals.module.css";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/components/AuthProvider";

export default function Home() {
  const { isAuthed, loading } = useAuth(); // single source of truth

  // hold UI until auth check completes to avoid flashing wrong state
  if (loading) {
    return (
      <>
        <Navbar />
        <div className={styles.pageSkeleton}>Loading…</div>
      </>
    );
  }

  return (
    <>
      <Navbar />
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
