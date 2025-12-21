'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Moon, Sun, Globe, LogOut, ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface UserMenuProps {
  user: {
    name: string | null;
    email: string;
  };
}

export function UserMenu({ user }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const router = useRouter();

  // Fermer le menu si on clique à l'extérieur
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Générer les initiales pour l'avatar
  const getInitials = (name: string | null, email: string): string => {
    if (name) {
      const parts = name.trim().split(' ');
      if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
      }
      return name.substring(0, 2).toUpperCase();
    }
    return email.substring(0, 2).toUpperCase();
  };

  const handleLogout = async () => {
    try {
      // En production avec Authelia, la déconnexion se fait via Authelia
      // Ici on redirige vers l'URL de déconnexion d'Authelia
      // Pour le développement, on peut simplement rediriger vers la racine
      if (process.env.NODE_ENV === 'production') {
        // En production, rediriger vers Authelia logout
        window.location.href = '/api/auth/logout';
      } else {
        // En développement, simplement recharger la page
        router.push('/');
        router.refresh();
      }
    } catch (error) {
      console.error('Logout failed:', error);
      router.push('/');
      router.refresh();
    }
  };

  const displayName = user.name || user.email.split('@')[0];
  const initials = getInitials(user.name, user.email);

  return (
    <div ref={menuRef} style={{ position: 'relative' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 12px',
          borderRadius: '8px',
          border: '1px solid #e0e0e0',
          background: 'var(--user-menu-bg, #fff)',
          cursor: 'pointer',
          transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'var(--user-menu-hover-bg, #f5f5f5)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'var(--user-menu-bg, #fff)';
        }}
      >
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #3366ff 0%, #6633ff 100%)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            fontWeight: 600,
            flexShrink: 0,
          }}
        >
          {initials}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '2px' }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--user-menu-text, #333)', lineHeight: 1.2 }}>
            {displayName}
          </span>
          <span style={{ fontSize: '11px', color: 'var(--user-menu-text-secondary, #666)', lineHeight: 1.2 }}>
            {user.email}
          </span>
        </div>
        <ChevronDown size={16} style={{ color: 'var(--user-menu-text-secondary, #666)', flexShrink: 0 }} />
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: '8px',
            minWidth: '240px',
            background: 'var(--user-menu-dropdown-bg, #fff)',
            border: '1px solid var(--user-menu-dropdown-border, #e0e0e0)',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            zIndex: 1000,
            overflow: 'hidden',
          }}
        >
          {/* Section Profil */}
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--user-menu-dropdown-border, #e0e0e0)' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--user-menu-text-secondary, #666)', marginBottom: '4px', textTransform: 'uppercase' }}>
              {t('user.menu.profile')}
            </div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--user-menu-text, #333)' }}>
              {displayName}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--user-menu-text-secondary, #666)', marginTop: '2px' }}>
              {user.email}
            </div>
          </div>

          {/* Thème */}
          <div style={{ padding: '8px 0' }}>
            <div style={{ padding: '0 16px', marginBottom: '8px', fontSize: '12px', fontWeight: 600, color: 'var(--user-menu-text-secondary, #666)', textTransform: 'uppercase' }}>
              {t('user.menu.theme')}
            </div>
            <button
              onClick={toggleTheme}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 16px',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                color: 'var(--user-menu-text, #333)',
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--user-menu-item-hover, #f5f5f5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              {theme === 'light' ? <Sun size={18} /> : <Moon size={18} />}
              <span>{theme === 'light' ? t('user.menu.theme.light') : t('user.menu.theme.dark')}</span>
            </button>
          </div>

          {/* Langue */}
          <div style={{ padding: '8px 0', borderTop: '1px solid var(--user-menu-dropdown-border, #e0e0e0)' }}>
            <div style={{ padding: '0 16px', marginBottom: '8px', fontSize: '12px', fontWeight: 600, color: 'var(--user-menu-text-secondary, #666)', textTransform: 'uppercase' }}>
              {t('user.menu.language')}
            </div>
            <button
              onClick={() => setLanguage('fr')}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 16px',
                background: language === 'fr' ? 'var(--user-menu-item-active, #e8f0fe)' : 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                color: 'var(--user-menu-text, #333)',
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => {
                if (language !== 'fr') {
                  e.currentTarget.style.background = 'var(--user-menu-item-hover, #f5f5f5)';
                }
              }}
              onMouseLeave={(e) => {
                if (language !== 'fr') {
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              <Globe size={18} />
              <span>{t('user.menu.language.fr')}</span>
              {language === 'fr' && <span style={{ marginLeft: 'auto', fontSize: '12px', color: '#3366ff' }}>✓</span>}
            </button>
            <button
              onClick={() => setLanguage('en')}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 16px',
                background: language === 'en' ? 'var(--user-menu-item-active, #e8f0fe)' : 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                color: 'var(--user-menu-text, #333)',
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => {
                if (language !== 'en') {
                  e.currentTarget.style.background = 'var(--user-menu-item-hover, #f5f5f5)';
                }
              }}
              onMouseLeave={(e) => {
                if (language !== 'en') {
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              <Globe size={18} />
              <span>{t('user.menu.language.en')}</span>
              {language === 'en' && <span style={{ marginLeft: 'auto', fontSize: '12px', color: '#3366ff' }}>✓</span>}
            </button>
          </div>

          {/* Déconnexion */}
          <div style={{ padding: '8px 0', borderTop: '1px solid var(--user-menu-dropdown-border, #e0e0e0)' }}>
            <button
              onClick={handleLogout}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 16px',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                color: '#dc2626',
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--user-menu-item-hover, #f5f5f5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <LogOut size={18} />
              <span>{t('user.menu.logout')}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

