'use client';

import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import { useLanguage } from '@/contexts/LanguageContext';
import { UserMenuWrapper } from '@/components/UI/UserMenuWrapper';
import { getCurrentUser } from '@/lib/session';

interface ManualContentProps {
  markdownContent: string;
  user: Awaited<ReturnType<typeof getCurrentUser>>;
}

export function ManualContent({ markdownContent, user }: ManualContentProps) {
  const { t } = useLanguage();

  return (
    <div style={{ minHeight: '100vh', background: 'var(--background, #fff)', color: 'var(--foreground, #333)', transition: 'background-color 0.2s, color 0.2s' }}>
      <header style={{
        background: 'var(--background, #f8f9fa)',
        borderBottom: '1px solid var(--border, #e0e0e0)',
        padding: '16px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        transition: 'background-color 0.2s, border-color 0.2s'
      }}>
        <Link href="/" style={{ 
          textDecoration: 'none', 
          color: 'var(--primary, #3366ff)', 
          fontSize: '16px', 
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          {t('manual.back')}
        </Link>
        <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 600, color: 'var(--foreground, #333)' }}>{t('manual.title')}</h1>
        <div style={{ display: 'flex', justifyContent: 'flex-end', minWidth: '200px' }}>
          <UserMenuWrapper user={user} />
        </div>
      </header>
      
      <style dangerouslySetInnerHTML={{__html: `
        .markdown-link:hover {
          text-decoration: underline;
        }
      `}} />
      <main style={{
        maxWidth: '900px',
        margin: '0 auto',
        padding: '40px 24px',
        lineHeight: '1.8',
        color: 'var(--foreground, #333)',
        transition: 'color 0.2s'
      }}>
        <article style={{
          fontSize: '16px'
        }}>
          <ReactMarkdown
            components={{
              h1: ({node, ...props}) => <h1 style={{ fontSize: '32px', marginTop: '40px', marginBottom: '20px', fontWeight: 700, color: 'var(--foreground, #1a1a1a)' }} {...props} />,
              h2: ({node, ...props}) => <h2 style={{ fontSize: '24px', marginTop: '32px', marginBottom: '16px', fontWeight: 600, borderBottom: '2px solid var(--border, #e0e0e0)', paddingBottom: '8px', color: 'var(--foreground, #2a2a2a)' }} {...props} />,
              h3: ({node, ...props}) => <h3 style={{ fontSize: '20px', marginTop: '24px', marginBottom: '12px', fontWeight: 600, color: 'var(--foreground, #333)' }} {...props} />,
              p: ({node, ...props}) => <p style={{ marginBottom: '16px', lineHeight: '1.8' }} {...props} />,
              ul: ({node, ...props}) => <ul style={{ marginBottom: '16px', paddingLeft: '24px' }} {...props} />,
              ol: ({node, ...props}) => <ol style={{ marginBottom: '16px', paddingLeft: '24px' }} {...props} />,
              li: ({node, ...props}) => <li style={{ marginBottom: '8px' }} {...props} />,
              code: ({node, className, ...props}: {node?: unknown, className?: string, children?: React.ReactNode}) => {
                const isInline = !className;
                return isInline ? (
                  <code style={{ background: 'var(--background, #f5f5f5)', padding: '2px 6px', borderRadius: '3px', fontFamily: 'monospace', fontSize: '0.9em', color: '#d63384' }} {...props} />
                ) : (
                  <code style={{ background: 'transparent', padding: 0, color: 'var(--foreground, #333)' }} {...props} />
                );
              },
              pre: ({node, ...props}) => <pre style={{ background: 'var(--background, #f5f5f5)', padding: '16px', borderRadius: '6px', overflow: 'auto', marginBottom: '16px', border: '1px solid var(--border, #e0e0e0)' }} {...props} />,
              a: ({node, ...props}) => <a style={{ color: 'var(--primary, #3366ff)', textDecoration: 'none' }} className="markdown-link" {...props} />,
              strong: ({node, ...props}) => <strong style={{ fontWeight: 600 }} {...props} />,
              blockquote: ({node, ...props}) => <blockquote style={{ borderLeft: '4px solid var(--primary, #3366ff)', paddingLeft: '16px', marginLeft: 0, color: 'var(--foreground, #666)', fontStyle: 'italic' }} {...props} />,
              table: ({node, ...props}) => <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '16px' }} {...props} />,
              th: ({node, ...props}) => <th style={{ border: '1px solid var(--border, #e0e0e0)', padding: '8px 12px', textAlign: 'left', background: 'var(--background, #f8f9fa)', fontWeight: 600 }} {...props} />,
              td: ({node, ...props}) => <td style={{ border: '1px solid var(--border, #e0e0e0)', padding: '8px 12px', textAlign: 'left' }} {...props} />,
            }}
          >
            {markdownContent}
          </ReactMarkdown>
        </article>
      </main>
    </div>
  );
}


