# Vercel Free Plan — план оптимизации

> Аудит проекта `fl-site` на Vercel Free. Лимиты на момент анализа:
> Image Transformations 5K/5K · Fluid CPU 3h46m/4h · Fast Data Transfer 89.55 GB/100 GB · Edge Requests 542K/1M

---

## 1. Корневые причины

### 1.1 Image Optimization — Transformations 5K/5K 🔴
- В `next.config.ts` в `remotePatterns` подключены Supabase Storage, YouTube, Instagram, Facebook CDN — **каждое внешнее изображение** проходит через Vercel image optimizer.
- В коде **31 использование `<Image>`**, **ни одно не помечено `unoptimized`**.
- Главные «жрущие» места:
  - `src/app/[locale]/gallery/GalleryClient.tsx:266` — миниатюры из Supabase лежат уже в `.webp`, гонятся через transform повторно.
  - `src/components/GallerySection.tsx:267` — то же самое на главной.
  - `src/components/AftermovieSection.tsx:128, :208` — превью YouTube (`img.youtube.com`) через `<Image>`, хотя YouTube уже отдаёт оптимизированный JPG.

### 1.2 Fast Data Transfer 89.55 GB / 100 GB 🔴

| Ассет | Размер | Где грузится |
|---|---|---|
| `public/festival-video.mp4` | **19 MB** | `HeroSection.tsx:31` — `<video autoPlay>` на каждом визите главной |
| `public/orheiul-vechi2.jpg` | 2.1 MB | `AboutClient.tsx:135` |
| `public/og.png` | 308 KB | OG-метаданные |

> Арифметика: 19 MB × 5000 уникальных визитов = 95 GB. Только hero-видео исчерпывает весь лимит.

### 1.3 Fluid Active CPU 3h46m / 4h 🟠
- **Главная — fully dynamic SSR без кэша** (`src/app/[locale]/page.tsx`): на каждый запрос 2 round-trip в Supabase (`site_settings` + `tickets` с `ticket_options`).
- **0 страниц используют ISR/SSG** (`grep "revalidate" → 0 хитов`).
- `src/app/[locale]/news/[slug]/page.tsx:42, :67` — два одинаковых SELECT (`generateMetadata` + page).
- Middleware (`src/middleware.ts`) подключает `next-intl` на все non-static роуты, включая prefetch'и.

### 1.4 Edge Requests 542K / 1M 🟡
- Слишком широкий middleware matcher → срабатывает на каждый prefetch от `<Link>`.
- `next-intl` редиректит `/` → `/{locale}` — +1 Edge Request на первом визите.
- Каждое внешнее `<Image>` → запрос на `/_next/image`.

---

## 2. План оптимизации (по фазам)

### 🔥 Фаза 1 — критичные фиксы (делать сразу)

- [ ] **1.1 Hero-видео:** `public/festival-video.mp4` (19 MB) → YouTube embed.
  - Видео уже загружено: `https://youtu.be/2BVoFeiaMbY` (id `2BVoFeiaMbY`).
  - Заменить `<video autoPlay>` в `src/components/HeroSection.tsx` на `<iframe>` YouTube embed с `autoplay=1&mute=1&loop=1&playlist=2BVoFeiaMbY&controls=0&playsinline=1`.
  - После проверки удалить файл `public/festival-video.mp4` из репозитория.
- [ ] **1.2 `unoptimized` на уже-оптимизированные внешние URL:**
  - `src/app/[locale]/gallery/GalleryClient.tsx:266` (Supabase `.webp`)
  - `src/components/GallerySection.tsx:267` (Supabase `.webp`)
  - `src/components/AftermovieSection.tsx:128, :208` (YouTube thumbnail)
  - `src/app/admin/(dashboard)/aftermovies/AftermoviesTable.tsx:102` (YouTube thumbnail)
  - При желании — заменить на нативный `<img loading="lazy" />`, чтобы вообще не идти через `/_next/image`.
- [ ] **1.3 `orheiul-vechi2.jpg`** (2.1 MB) — пересжать в WebP ≤200 KB или перенести в Supabase Storage.

### 🟠 Фаза 2 — снижение CPU и Edge Requests

- [ ] **2.1 ISR на публичные страницы.** Добавить:
  - `src/app/[locale]/page.tsx` — `export const revalidate = 300;`
  - `src/app/[locale]/news/page.tsx` — `export const revalidate = 300;`
  - `src/app/[locale]/lineup/page.tsx` — `export const revalidate = 600;`
  - `src/app/[locale]/partners/page.tsx`, `about/page.tsx`, `gallery/page.tsx` — `revalidate = 3600`
  - `privacy`, `terms`, `faq`, `rules`, `how-to-get` — `export const dynamic = 'force-static'`
- [ ] **2.2 Сузить middleware matcher** в `src/middleware.ts`:
  ```ts
  matcher: [
    "/admin/:path*",
    "/((?!api|_next/static|_next/image|_vercel|favicon.ico|.*\\..*).*)",
  ];
  ```
- [ ] **2.3 Объединить запросы в `news/[slug]`** через `cache()` из React — обернуть fetcher новости и переиспользовать в `generateMetadata` и default export.
- [ ] **2.4 YouTube-превью без image-optimizer.** В `AftermovieSection.tsx` использовать нативный `<img>` + сразу `hqdefault.jpg` (всегда существует, 480×360), убрать onError-цепочку с тремя качествами.

### 🟢 Фаза 3 — гигиена

- [ ] **3.1** Вынести `site_settings.show_mobile_app` и `tickets` в Edge Config или в SSG с `revalidateTag` из админки.
- [ ] **3.2** Убрать из `next.config.ts` `remotePatterns` неиспользуемые домены: `picsum.photos`, `*.cdninstagram.com`, `*.fbcdn.net`, `scontent.cdninstagram.com`, `scontent-*.cdninstagram.com` — если они не нужны фактически.
- [ ] **3.3** `public/og.png` (308 KB) → сжать в WebP ≤80 KB.
- [ ] **3.4** `experimental.optimizePackageImports` для `lucide-react`, `@radix-ui/*`, `recharts` в `next.config.ts`.
- [ ] **3.5** `next-intl` `localePrefix: "as-needed"` в `routing.ts` (если устроит, что `/` остаётся для `ro` без префикса) — уберёт лишние редиректы.

---

## 3. Альтернативы, если оптимизации мало

1. **Vercel Pro $20/mo** — 1 TB Fast Data Transfer, 10K image optimizations, 1000h CPU. Если ожидается высокий трафик к фестивалю — окупит себя одним днём аптайма во время продажи билетов.
2. **Тяжёлые ассеты на Cloudflare R2** ($0/mo до 10 GB + бесплатный egress) или **bunny.net CDN** ($0.01/GB) — кешируемый CDN без счётчика Vercel.
3. **SSR на Cloudflare Workers** через Next-on-Pages — щедрее лимиты CPU.

---

## 4. Ожидаемый эффект Фазы 1+2

| Метрика | До | После | Δ |
|---|---|---|---|
| Fast Data Transfer | 89.55 GB | ~10–15 GB | −80% |
| Image Transformations | 5K/5K (исчерпано) | <500 | −90% |
| Fluid Active CPU | 3h46m | <30 мин | −85% |
| Edge Requests | 542K | ~250K | −50% |
