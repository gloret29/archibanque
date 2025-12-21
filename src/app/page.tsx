import styles from "./page.module.css";
import { getCurrentUser } from "@/lib/session";
import Link from 'next/link';

export default async function Home() {
  const user = await getCurrentUser();

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link href="/" className={styles.logo} style={{ textDecoration: 'none', color: 'inherit' }}>ArchiModeler</Link>
        <div className={styles.userSection}>
          {user ? (
            <span className={styles.welcomeInfo}>Welcome, <strong>{user.name}</strong> ({user.email})</span>
          ) : (
            <span className={styles.welcomeInfo}>NOT LOGGED IN</span>
          )}
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.hero}>
          <h1>Enterprise Architecture Tool</h1>
          <p>Collaborative modeling platform based on TOGAF, Archimate, and BIAN.</p>
        </div>

        <div className={styles.grid}>
          <div className={styles.card}>
            <h2>Modeling Module</h2>
            <p>Develop objects and views using the full Archimate 3.2 palette.</p>
            <div className={styles.cardActions}>
              <a href="/modeler" className={styles.primaryButton}>Open Editor</a>
            </div>
          </div>

          <div className={styles.card}>
            <h2>Portal Module</h2>
            <p>Publish and disseminate models across your organization.</p>
            <div className={styles.cardActions}>
              <button className={styles.secondaryButton}>Open Portal</button>
            </div>
          </div>

          <div className={styles.card}>
            <h2>Administration</h2>
            <p>Configure ArchiMate elements, visibility rules, and custom data blocks.</p>
            <div className={styles.cardActions}>
              <Link href="/admin" className={styles.secondaryButton}>Open Admin</Link>
            </div>
          </div>
        </div>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <p>&copy; 2025 ArchiModeler | GIT-backed Architecture Analysis</p>
        </div>
      </footer>
    </div>
  );
}
