"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "@/app/globals.module.css";

export default function Navbar() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/me", { cache: "no-store" });
        const data = await res.json();
        if (mounted) setIsAuthenticated(!!data?.authenticated);
      } catch (err) {
        if (mounted) setIsAuthenticated(false);
        console.error("Auth check failed:", err);
      }
    };
    checkAuth();
    return () => {
      mounted = false;
    };
  }, []);

  const handleLogout = async (e) => {
    e.preventDefault();
    try {
      await fetch("/api/logout", { method: "POST" });
      setIsAuthenticated(false); // update state immediately
      router.push("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <header className={styles.header}>
      <nav className={styles.navbar}>
        {/* LEFT: primary nav */}
        <ul className={styles.navList}>
          <li><Link href="/" className={styles.navItem}>Home</Link></li>
          <li><Link href="/about" className={styles.navItem}>About</Link></li>
          <li><Link href="/contact" className={styles.navItem}>Contact Us</Link></li>
          {isAuthenticated && (
            <>
              <li><Link href="/favorites" className={styles.navItem}>Favorites</Link></li>
              <li><Link href="/profile" className={styles.navItem}>Profile</Link></li>
            </>
          )}
          <li><Link href="/donate" className={styles.navItem}>Donate</Link></li>
          <li><Link href="/sponsor" className={styles.navItem}>Sponsor</Link></li>
        </ul>

        {/* RIGHT: auth links */}
        <div className={styles.authLinks}>
          {isAuthenticated ? (
            <a href="/login" onClick={handleLogout} className={styles.navItem}>
              Logout
            </a>
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
