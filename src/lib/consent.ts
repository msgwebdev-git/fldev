// Cookie consent model (GDPR / ePrivacy) — framework-agnostic helpers.
//
// Stored in localStorage (NOT a cookie): the site deliberately disables cookies
// in src/i18n/routing.ts because they force responses to no-store and break
// ISR/static caching. localStorage has no such effect.

export type ConsentCategory = "necessary" | "analytics" | "marketing";

// Categories the user can toggle. `necessary` is always granted and not shown
// as a real toggle. The order here is the order rendered in the settings dialog.
export const TOGGLEABLE_CATEGORIES: Exclude<ConsentCategory, "necessary">[] = [
  "analytics",
  "marketing",
];

export type ConsentCategories = Record<ConsentCategory, boolean>;

export interface ConsentState {
  version: number;
  timestamp: number;
  categories: ConsentCategories;
}

// Bump to re-prompt all users (e.g. when adding a new tracker/category).
export const CONSENT_VERSION = 1;
export const STORAGE_KEY = "fl_cookie_consent";
// Re-ask for consent after 6 months.
export const CONSENT_MAX_AGE_MS = 1000 * 60 * 60 * 24 * 182;

export function defaultCategories(): ConsentCategories {
  return { necessary: true, analytics: false, marketing: false };
}

export function allGranted(): ConsentCategories {
  return { necessary: true, analytics: true, marketing: true };
}

export function allDenied(): ConsentCategories {
  return { necessary: true, analytics: false, marketing: false };
}

/**
 * Read a previously stored choice. Returns null when there is no valid,
 * current-version, non-expired choice — meaning the banner should be shown.
 */
export function readConsent(now: number = Date.now()): ConsentState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<ConsentState>;
    if (
      !parsed ||
      parsed.version !== CONSENT_VERSION ||
      typeof parsed.timestamp !== "number" ||
      now - parsed.timestamp > CONSENT_MAX_AGE_MS ||
      !parsed.categories
    ) {
      return null;
    }
    return {
      version: CONSENT_VERSION,
      timestamp: parsed.timestamp,
      categories: {
        necessary: true,
        analytics: !!parsed.categories.analytics,
        marketing: !!parsed.categories.marketing,
      },
    };
  } catch {
    return null;
  }
}

export function writeConsent(
  categories: ConsentCategories,
  now: number = Date.now()
): ConsentState {
  const state: ConsentState = {
    version: CONSENT_VERSION,
    timestamp: now,
    categories: { ...categories, necessary: true },
  };
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore quota / privacy-mode errors
    }
  }
  return state;
}

type GoogleConsentValue = "granted" | "denied";

/**
 * Map our categories to Google Consent Mode v2 signals.
 * analytics_storage  ← analytics
 * ad_*               ← marketing
 * security_storage   ← always granted
 */
export function toGoogleConsent(
  categories: ConsentCategories
): Record<string, GoogleConsentValue> {
  const analytics: GoogleConsentValue = categories.analytics
    ? "granted"
    : "denied";
  const ads: GoogleConsentValue = categories.marketing ? "granted" : "denied";
  return {
    ad_storage: ads,
    ad_user_data: ads,
    ad_personalization: ads,
    analytics_storage: analytics,
    functionality_storage: analytics,
    personalization_storage: analytics,
    security_storage: "granted",
  };
}
