import {defineRouting} from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['ro', 'ru'],
  defaultLocale: 'ro',
  // Locale is always in the URL path (/ro, /ru) — disable Accept-Language
  // detection AND the NEXT_LOCALE cookie. The cookie forces every response
  // to private/no-store, killing ISR/static caching across the site.
  localeDetection: false,
  localeCookie: false
});
