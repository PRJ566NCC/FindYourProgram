import styles from "@/app/globals.module.css";

export default function Navbar() {
    return (
        <header className={styles.header}>
            <nav>
                <ul className={styles.navList}>
                <li><a href="#" className={styles.navItem}>Home</a></li>
                <li><a href="#" className={styles.navItem}>About</a></li>
                <li><a href="#" className={styles.navItem}>Contact Us</a></li>
                <li><a href="#" className={styles.navItem}>Donate</a></li>
                <li><a href="#" className={styles.navItem}>Sponsor</a></li>
                </ul>
            </nav>
            <div>
                <a href="#" className={styles.register}>Register</a>
                <a href="#" className={styles.login}>Login</a>
            </div>
        </header>
    );
}