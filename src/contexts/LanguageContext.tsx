'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Language = 'fr' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  fr: {
    'user.menu.profile': 'Profil',
    'user.menu.theme': 'Thème',
    'user.menu.theme.light': 'Clair',
    'user.menu.theme.dark': 'Sombre',
    'user.menu.language': 'Langue',
    'user.menu.language.fr': 'Français',
    'user.menu.language.en': 'English',
    'user.menu.logout': 'Se déconnecter',
    'user.menu.welcome': 'Bienvenue',
  },
  en: {
    'user.menu.profile': 'Profile',
    'user.menu.theme': 'Theme',
    'user.menu.theme.light': 'Light',
    'user.menu.theme.dark': 'Dark',
    'user.menu.language': 'Language',
    'user.menu.language.fr': 'Français',
    'user.menu.language.en': 'English',
    'user.menu.logout': 'Sign out',
    'user.menu.welcome': 'Welcome',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

function getInitialLanguage(): Language {
  if (typeof window === 'undefined') return 'fr';
  const savedLanguage = localStorage.getItem('language') as Language | null;
  if (savedLanguage && (savedLanguage === 'fr' || savedLanguage === 'en')) {
    return savedLanguage;
  }
  // Détecter la langue du navigateur
  const browserLang = navigator.language.split('-')[0];
  return browserLang === 'fr' ? 'fr' : 'en';
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(getInitialLanguage);

  useEffect(() => {
    localStorage.setItem('language', language);
    document.documentElement.setAttribute('lang', language);
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string): string => {
    return translations[language]?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

