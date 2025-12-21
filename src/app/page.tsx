import styles from "./page.module.css";
import { getCurrentUser } from "@/lib/session";
import Link from 'next/link';
import { UserMenuWrapper } from '@/components/UI/UserMenuWrapper';

export default async function Home() {
  const user = await getCurrentUser();

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link href="/" className={styles.logo} style={{ textDecoration: 'none', color: 'inherit' }}>ArchiModeler</Link>
        <div className={styles.userSection}>
          <UserMenuWrapper user={user} />
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.hero}>
          <h1>Enterprise Architecture Tool</h1>
          <p>Collaborative modeling platform based on TOGAF, Archimate, and BIAN.</p>
          <div style={{ marginTop: '24px' }}>
            <Link 
              href="/manual" 
              className={styles.manualLink}
              style={{
                color: '#3366ff',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: 500,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                border: '1px solid #3366ff',
                borderRadius: '6px',
                transition: 'all 0.2s'
              }}>
              📘 Documentation utilisateur
            </Link>
          </div>
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
          <div style={{ marginTop: '16px' }}>
            <Link href="/manual" style={{ 
              color: '#3366ff', 
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: 500,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              📘 Consulter le manuel utilisateur
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
