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
    // User menu
    'user.menu.profile': 'Profil',
    'user.menu.theme': 'Thème',
    'user.menu.theme.light': 'Clair',
    'user.menu.theme.dark': 'Sombre',
    'user.menu.language': 'Langue',
    'user.menu.language.fr': 'Français',
    'user.menu.language.en': 'English',
    'user.menu.logout': 'Se déconnecter',
    'user.menu.welcome': 'Bienvenue',
    // Home page
    'home.hero.title': 'Outil d\'Architecture d\'Entreprise',
    'home.hero.subtitle': 'Plateforme de modélisation collaborative basée sur TOGAF, Archimate et BIAN.',
    'home.manual.link': '📘 Documentation utilisateur',
    'home.manual.footer': 'Consulter le manuel utilisateur',
    'home.card.modeling.title': 'Module de Modélisation',
    'home.card.modeling.description': 'Développez des objets et des vues en utilisant la palette complète Archimate 3.2.',
    'home.card.modeling.button': 'Ouvrir l\'Éditeur',
    'home.card.portal.title': 'Module Portail',
    'home.card.portal.description': 'Publiez et diffusez les modèles à travers votre organisation.',
    'home.card.portal.button': 'Ouvrir le Portail',
    'home.card.admin.title': 'Administration',
    'home.card.admin.description': 'Configurez les éléments ArchiMate, les règles de visibilité et les blocs de données personnalisés.',
    'home.card.admin.button': 'Ouvrir l\'Admin',
    'home.footer.copyright': '© 2025 ArchiModeler | Analyse d\'Architecture basée sur GIT',
    // Modeler page
    'modeler.status.saving': 'Enregistrement...',
    'modeler.status.saved': 'Enregistré',
    'modeler.expertMode': 'Mode Expert',
    // Admin page
    'admin.title': 'Administration',
    'admin.subtitle': 'Configuration du Système',
    'admin.tab.visibility': 'Visibilité',
    'admin.tab.datablocks': 'Blocs de Données',
    'admin.search.placeholder': 'Rechercher des éléments...',
    'admin.button.enableAll': 'Tout Activer',
    'admin.button.disableAll': 'Tout Désactiver',
    'admin.back': 'Retour au Modélisateur',
    // Manual page
    'manual.title': 'Manuel Utilisateur',
    'manual.back': '← Retour à l\'accueil',
  },
  en: {
    // User menu
    'user.menu.profile': 'Profile',
    'user.menu.theme': 'Theme',
    'user.menu.theme.light': 'Light',
    'user.menu.theme.dark': 'Dark',
    'user.menu.language': 'Language',
    'user.menu.language.fr': 'Français',
    'user.menu.language.en': 'English',
    'user.menu.logout': 'Sign out',
    'user.menu.welcome': 'Welcome',
    // Home page
    'home.hero.title': 'Enterprise Architecture Tool',
    'home.hero.subtitle': 'Collaborative modeling platform based on TOGAF, Archimate, and BIAN.',
    'home.manual.link': '📘 User Documentation',
    'home.manual.footer': 'View user manual',
    'home.card.modeling.title': 'Modeling Module',
    'home.card.modeling.description': 'Develop objects and views using the full Archimate 3.2 palette.',
    'home.card.modeling.button': 'Open Editor',
    'home.card.portal.title': 'Portal Module',
    'home.card.portal.description': 'Publish and disseminate models across your organization.',
    'home.card.portal.button': 'Open Portal',
    'home.card.admin.title': 'Administration',
    'home.card.admin.description': 'Configure ArchiMate elements, visibility rules, and custom data blocks.',
    'home.card.admin.button': 'Open Admin',
    'home.footer.copyright': '© 2025 ArchiModeler | GIT-backed Architecture Analysis',
    // Modeler page
    'modeler.status.saving': 'Saving...',
    'modeler.status.saved': 'Saved',
    'modeler.expertMode': 'Expert Mode',
    // Admin page
    'admin.title': 'Administration',
    'admin.subtitle': 'System Configuration',
    'admin.tab.visibility': 'Visibility',
    'admin.tab.datablocks': 'Data Blocks',
    'admin.search.placeholder': 'Search elements...',
    'admin.button.enableAll': 'Enable All',
    'admin.button.disableAll': 'Disable All',
    'admin.back': 'Back to Modeler',
    // Manual page
    'manual.title': 'User Manual',
    'manual.back': '← Back to home',
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

