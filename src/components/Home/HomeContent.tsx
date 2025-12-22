'use client';

import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import styles from '@/app/page.module.css';

export function HomeContent() {
  const { t } = useLanguage();

  return (
    <>
      <main className={styles.main}>
        <div className={styles.hero}>
          <h1>{t('home.hero.title')}</h1>
          <p>{t('home.hero.subtitle')}</p>
          <div style={{ marginTop: '24px' }}>
            <Link
              href="/manual"
              className={styles.manualLink}
              style={{
                color: 'var(--primary, #3366ff)',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: 500,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                border: '1px solid var(--primary, #3366ff)',
                borderRadius: '6px',
                transition: 'all 0.2s'
              }}>
              {t('home.manual.link')}
            </Link>
          </div>
        </div>

        <div className={styles.grid}>
          <div className={styles.card}>
            <h2>{t('home.card.modeling.title')}</h2>
            <p>{t('home.card.modeling.description')}</p>
            <div className={styles.cardActions}>
              <a href="/modeler" className={styles.primaryButton}>{t('home.card.modeling.button')}</a>
            </div>
          </div>

          <div className={styles.card}>
            <h2>{t('home.card.portal.title')}</h2>
            <p>{t('home.card.portal.description')}</p>
            <div className={styles.cardActions}>
              <Link href="/portal" className={styles.secondaryButton}>{t('home.card.portal.button')}</Link>
            </div>
          </div>

          <div className={styles.card}>
            <h2>{t('home.card.admin.title')}</h2>
            <p>{t('home.card.admin.description')}</p>
            <div className={styles.cardActions}>
              <Link href="/admin" className={styles.secondaryButton}>{t('home.card.admin.button')}</Link>
            </div>
          </div>
        </div>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <p>{t('home.footer.copyright')}</p>
          <div style={{ marginTop: '16px' }}>
            <Link href="/manual" style={{
              color: 'var(--primary, #3366ff)',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: 500,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              📘 {t('home.manual.footer')}
            </Link>
          </div>
        </div>
      </footer>
    </>
  );
}




