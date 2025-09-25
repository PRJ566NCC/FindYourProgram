"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import styles from "@/app/globals.module.css";

export default function Navbar() {
  const { isAuthed, loading, refresh } = useAuth();
  const router = useRouter();

  const handleLogout = async (e) => {
    e.preventDefault();
    await fetch("/api/logout", { method: "POST" });
    await refresh();     
    router.replace("/");
  };

  return (
    <header className={styles.header}>
      <nav className={styles.navbar}>
        <ul className={styles.navList}>
          <li><Link href="/" className={styles.navItem}>Home</Link></li>
          <li><Link href="/about" className={styles.navItem}>About</Link></li>
          <li><Link href="/contact" className={styles.navItem}>Contact Us</Link></li>

          {isAuthed && (
            <>
              <li><Link href="/favorites" className={styles.navItem}>Favorites</Link></li>
              <li><Link href="/profile" className={styles.navItem}>Profile</Link></li>
            </>
          )}

          <li><Link href="/donate" className={styles.navItem}>Donate</Link></li>
          <li><Link href="/sponsor" className={styles.navItem}>Sponsor</Link></li>
        </ul>

        <div className={styles.authLinks}>
          {loading ? (
            <span className={styles.navItem} style={{ visibility: "hidden" }}>Loading</span>
          ) : isAuthed ? (
            <a href="/login" onClick={handleLogout} className={styles.navItem}>Logout</a>
          ) : (
            <>
              <Link href="/register" className={styles.navItem}>Register</Link>
              <Link href="/login" className={styles.navItem}>Login</Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}