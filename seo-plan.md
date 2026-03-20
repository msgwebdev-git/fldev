# SEO Plan — Festivalul Lupilor

> Next.js 16 · App Router · next-intl (ro/ru) · Supabase

---

## ТЕКУЩЕЕ СОСТОЯНИЕ: 2/10

| Что | Статус |
|-----|--------|
| `<html lang>` | OK — динамически из locale |
| `<title>` | ПЛОХО — "FL Site" на всех страницах |
| `<meta description>` | ПЛОХО — "FL Site" на всех страницах |
| Open Graph (og:title, og:image, og:url) | НЕТ |
| Twitter Cards | НЕТ |
| sitemap.xml | НЕТ |
| robots.txt | НЕТ |
| Canonical URLs | НЕТ |
| hreflang (ro/ru) | НЕТ |
| JSON-LD structured data | НЕТ |
| Metadata на страницах | 2 из 21 (только news) |
| Favicon в metadata | НЕТ (есть файл, не прописан) |
| manifest.json | НЕТ |

**Google видит:** 21 страницу с одинаковым title "FL Site" и description "FL Site". Нет sitemap, нет robots.txt, нет structured data. Google не понимает что это фестиваль, не знает про два языка, не видит Open Graph при шаринге.

---

## ПЛАН ДЕЙСТВИЙ (по приоритету)

### ФАЗА 1: Фундамент (КРИТИЧНО)

#### 1.1 Root layout metadata → generateMetadata с locale
**Файл:** `src/app/[locale]/layout.tsx`
**Что:** Заменить static `metadata` на `generateMetadata()` с:
- Locale-specific title template: `"%s | Festivalul Lupilor"` / `"%s | Фестиваль Волков"`
- Default description (ro/ru)
- Open Graph defaults (type, siteName, locale, images)
- Twitter Card defaults (card: summary_large_image)
- Canonical URL + alternateLanguages (hreflang)
- Favicon / icons metadata
- metadataBase URL

#### 1.2 robots.ts
**Файл:** `src/app/robots.ts`
**Что:**
- Allow all crawlers for public pages
- Disallow `/admin/`, `/checkout/mock-payment`, `/api/`
- Point to sitemap.xml URL

#### 1.3 sitemap.ts
**Файл:** `src/app/sitemap.ts`
**Что:**
- Static pages: все 15 public routes × 2 locales = 30 URLs
- Dynamic pages: `/news/[slug]` — fetch slugs from Supabase
- Каждый URL с `alternates.languages` (ro + ru)
- `lastModified` для dynamic content
- `changeFrequency` и `priority` по типу страницы

#### 1.4 Metadata на КАЖДОЙ странице
**Файлы:** все 21 page.tsx в `src/app/[locale]/`
**Что:** `generateMetadata()` с:
- Unique title и description (из translations)
- Open Graph (title, description, url, type)
- Canonical + alternates
- noindex для checkout/mock-payment, thank-you, success, failed

**Страницы с noindex:**
- `/checkout/*` (все)
- `/b2b/thank-you`

**Страницы с unique metadata:**
- `/` — главная (Event type, полное описание)
- `/tickets` — билеты (цены в description)
- `/lineup` — артисты (имена headliners)
- `/news` — новости (пагинация)
- `/news/[slug]` — уже есть, проверить OG image
- `/gallery` — галерея
- `/program` — программа
- `/about` — о фестивале
- `/faq` — FAQ (FAQPage schema)
- `/contacts` — контакты
- `/b2b` — корпоративные заказы
- `/partners` — партнёры
- `/activities` — активности
- `/how-to-get` — как добраться
- `/privacy`, `/terms`, `/rules` — юридические

---

### ФАЗА 2: Structured Data (JSON-LD)

#### 2.1 Event schema на главной
**Файл:** `src/app/[locale]/page.tsx`
**Что:** JSON-LD `Event` schema:
```json
{
  "@type": "MusicEvent",
  "name": "Festivalul Lupilor 2026",
  "startDate": "2026-08-07",
  "endDate": "2026-08-09",
  "location": { "@type": "Place", "name": "Orheiul Vechi", "address": "Moldova" },
  "image": "og-image-url",
  "description": "...",
  "offers": { "@type": "AggregateOffer", "lowPrice": "...", "priceCurrency": "MDL" },
  "organizer": { "@type": "Organization", "name": "Festivalul Lupilor" }
}
```

#### 2.2 Organization schema
**Файл:** root layout (или dedicated component)
**Что:** JSON-LD `Organization`:
- name, url, logo, sameAs (social links)

#### 2.3 FAQPage schema
**Файл:** `/faq/page.tsx`
**Что:** JSON-LD `FAQPage` — Google показывает FAQ прямо в поиске

#### 2.4 Article schema на новостях
**Файл:** `/news/[slug]/page.tsx`
**Что:** JSON-LD `NewsArticle` — headline, datePublished, image, author

#### 2.5 BreadcrumbList
**Что:** На каждой внутренней странице — помогает Google понять структуру

---

### ФАЗА 3: Open Graph Images

#### 3.1 Default OG image
**Файл:** `src/app/[locale]/opengraph-image.tsx` (или static файл)
**Что:** 1200×630 картинка с:
- Лого фестиваля
- "Festivalul Lupilor 2026"
- "7-9 August · Orheiul Vechi"
- Яркий фон

#### 3.2 Dynamic OG image для новостей
**Файл:** `src/app/[locale]/news/[slug]/opengraph-image.tsx`
**Что:** Генерировать OG image с заголовком статьи через `ImageResponse`

---

### ФАЗА 4: Performance / Technical SEO

#### 4.1 next.config.ts — security headers
```typescript
headers: [
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
]
```

#### 4.2 Preconnect для external resources
В layout.tsx `<head>`:
```html
<link rel="preconnect" href="https://ybumbbtackrfdhijvfkz.supabase.co" />
<link rel="dns-prefetch" href="https://img.youtube.com" />
```

#### 4.3 manifest.json для PWA
**Файл:** `src/app/manifest.ts`
**Что:** name, icons, theme_color, background_color, display

---

## ПРИОРИТЕТ РЕАЛИЗАЦИИ

```
Фаза 1 (фундамент)     → МАКСИМАЛЬНЫЙ IMPACT
  1.1 layout metadata   — Google наконец видит правильные title/description
  1.2 robots.ts         — Google знает что индексировать
  1.3 sitemap.ts        — Google находит все страницы за 1 день
  1.4 page metadata     — каждая страница уникальна в поиске

Фаза 2 (structured data) → ВЫСОКИЙ IMPACT
  2.1 Event schema      — rich snippets в Google (даты, место, цены)
  2.2 Organization      — Knowledge Panel
  2.3 FAQPage           — FAQ прямо в выдаче
  2.4 Article           — rich snippets для новостей

Фаза 3 (OG images)      → СРЕДНИЙ IMPACT (для шаринга в соцсетях)

Фаза 4 (technical)      → НИЗКИЙ IMPACT (полировка)
```

**Начинать с Фазы 1 — это даст 80% результата.**
