"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Language, translations, TranslationDictionary } from "./translations";

interface I18nContextProps {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (path: string, fallback?: string) => string;
}

const I18nContext = createContext<I18nContextProps | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>("en");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedLang = localStorage.getItem("lucidchat_language") as Language;
      if (storedLang === "id" || storedLang === "en") {
        setLangState(storedLang);
      }
    }
  }, []);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    if (typeof window !== "undefined") {
      localStorage.setItem("lucidchat_language", newLang);
      // Dispatch storage event so all tabs sync language immediately
      window.dispatchEvent(new Event("storage"));
    }
  };

  const t = (path: string, fallback?: string): string => {
    const keys = path.split(".");
    let current: TranslationDictionary | string = translations[lang];

    for (const key of keys) {
      if (typeof current === "object" && current !== null && key in current) {
        current = current[key];
      } else {
        return fallback || path;
      }
    }

    if (typeof current === "string") {
      return current;
    }

    return fallback || path;
  };

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    // Provide a safe fallback if used outside provider
    return {
      lang: "en" as Language,
      setLang: () => {},
      t: (path: string, fallback?: string) => fallback || path,
    };
  }
  return context;
}
