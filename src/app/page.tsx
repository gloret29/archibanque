import styles from "./page.module.css";
import { getCurrentUser } from "@/lib/session";
import Link from 'next/link';
import { UserMenuWrapper } from '@/components/UI/UserMenuWrapper';
import { HomeContent } from '@/components/Home/HomeContent';

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

      <HomeContent />
    </div>
  );
}
