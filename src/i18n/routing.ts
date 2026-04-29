import {defineRouting} from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['ro', 'ru'],
  defaultLocale: 'ro',
  // Disable cookie-based locale detection: locale is in the URL path,
  // and setting NEXT_LOCALE cookie forces every response to private/no-store,
  // breaking ISR/static caching across the whole site.
  localeDetection: false
});
