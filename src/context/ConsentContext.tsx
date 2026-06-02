"use client";

import * as React from "react";
import {
  type ConsentCategories,
  type ConsentState,
  allDenied,
  allGranted,
  defaultCategories,
  readConsent,
  toGoogleConsent,
  writeConsent,
} from "@/lib/consent";

// Window.gtag / Window.dataLayer are declared in src/lib/analytics.ts.

interface ConsentContextValue {
  /** Current effective categories. Before mount/first choice: all denied. */
  categories: ConsentCategories;
  /** True once the user has made (or previously stored) an explicit choice. */
  hasChoice: boolean;
  /** True after the provider has read localStorage on the client. */
  ready: boolean;
  settingsOpen: boolean;
  acceptAll: () => void;
  rejectAll: () => void;
  save: (categories: ConsentCategories) => void;
  openSettings: () => void;
  closeSettings: () => void;
}

const ConsentContext = React.createContext<ConsentContextValue | null>(null);

function pushGoogleConsentUpdate(categories: ConsentCategories) {
  if (typeof window === "undefined") return;
  // gtag is defined by ConsentModeInit before any Google tag loads.
  if (typeof window.gtag === "function") {
    window.gtag("consent", "update", toGoogleConsent(categories));
  }
}

export function ConsentProvider({ children }: { children: React.ReactNode }) {
  const [categories, setCategories] =
    React.useState<ConsentCategories>(defaultCategories);
  const [hasChoice, setHasChoice] = React.useState(false);
  const [ready, setReady] = React.useState(false);
  const [settingsOpen, setSettingsOpen] = React.useState(false);

  // Hydrate from localStorage once, on the client only.
  React.useEffect(() => {
    const stored: ConsentState | null = readConsent();
    if (stored) {
      setCategories(stored.categories);
      setHasChoice(true);
      pushGoogleConsentUpdate(stored.categories);
    }
    setReady(true);
  }, []);

  const commit = React.useCallback((next: ConsentCategories) => {
    writeConsent(next);
    setCategories(next);
    setHasChoice(true);
    setSettingsOpen(false);
    pushGoogleConsentUpdate(next);
  }, []);

  const value = React.useMemo<ConsentContextValue>(
    () => ({
      categories,
      hasChoice,
      ready,
      settingsOpen,
      acceptAll: () => commit(allGranted()),
      rejectAll: () => commit(allDenied()),
      save: (next: ConsentCategories) => commit(next),
      openSettings: () => setSettingsOpen(true),
      closeSettings: () => setSettingsOpen(false),
    }),
    [categories, hasChoice, ready, settingsOpen, commit]
  );

  return (
    <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>
  );
}

export function useConsent(): ConsentContextValue {
  const ctx = React.useContext(ConsentContext);
  if (!ctx) {
    throw new Error("useConsent must be used within a ConsentProvider");
  }
  return ctx;
}
