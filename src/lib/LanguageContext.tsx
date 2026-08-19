'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language, translations } from './translations';

interface LanguageContextProps {
  language: Language;
  toggleLanguage: () => void;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof translations['ar'] | keyof typeof translations['fr']) => string;
  dir: 'rtl' | 'ltr';
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>('ar');

  // Load language preference from localStorage if available
  useEffect(() => {
    const savedLanguage = localStorage.getItem('takwin_lang') as Language;
    if (savedLanguage === 'ar' || savedLanguage === 'fr') {
      setLanguageState(savedLanguage);
    }
  }, []);

  // Update HTML tag attributes when language changes
  useEffect(() => {
    const direction = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.dir = direction;
    document.documentElement.lang = language;
    localStorage.setItem('takwin_lang', language);
  }, [language]);

  const toggleLanguage = () => {
    setLanguageState((prev) => (prev === 'ar' ? 'fr' : 'ar'));
  };

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: keyof typeof translations['ar'] | keyof typeof translations['fr']): string => {
    const dictionary = translations[language];
    // Return translation if exists, otherwise fallback to Arabic, then the key itself
    return (dictionary[key as keyof typeof dictionary] || 
            translations['ar'][key as keyof typeof translations['ar']] || 
            String(key)) as string;
  };

  const dir = language === 'ar' ? 'rtl' : 'ltr';

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, setLanguage, t, dir }}>
      <div dir={dir} className={language === 'ar' ? 'font-arabic' : 'font-latin'}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
