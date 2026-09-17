"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Language, translations, SUPPORTED_LANGUAGES } from "./translations";

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
      const isValid = SUPPORTED_LANGUAGES.some((l) => l.code === storedLang);
      if (isValid) {
        setLangState(storedLang);
      } else {
        setLangState("en");
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

    // 1. Try selected language
    let current: unknown = translations[lang];
    let found = true;
    for (const key of keys) {
      if (typeof current === "object" && current !== null && key in current) {
        current = (current as Record<string, unknown>)[key];
      } else {
        found = false;
        break;
      }
    }

    if (found && typeof current === "string") {
      return current;
    }

    // 2. Secondary fallback: English dictionary
    current = translations.en;
    found = true;
    for (const key of keys) {
      if (typeof current === "object" && current !== null && key in current) {
        current = (current as Record<string, unknown>)[key];
      } else {
        found = false;
        break;
      }
    }

    if (found && typeof current === "string") {
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
