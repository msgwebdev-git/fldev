import type { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';

const SITE_URL = 'https://www.festivalul-lupilor.md';
const LOCALES = ['ro', 'ru'] as const;

// Static public pages (without locale prefix)
const STATIC_PAGES = [
  { path: '', changeFrequency: 'weekly' as const, priority: 1.0 },
  { path: '/tickets', changeFrequency: 'weekly' as const, priority: 0.9 },
  { path: '/lineup', changeFrequency: 'weekly' as const, priority: 0.8 },
  { path: '/program', changeFrequency: 'weekly' as const, priority: 0.8 },
  { path: '/news', changeFrequency: 'daily' as const, priority: 0.7 },
  { path: '/gallery', changeFrequency: 'monthly' as const, priority: 0.6 },
  { path: '/about', changeFrequency: 'monthly' as const, priority: 0.6 },
  { path: '/activities', changeFrequency: 'monthly' as const, priority: 0.6 },
  { path: '/partners', changeFrequency: 'monthly' as const, priority: 0.5 },
  { path: '/faq', changeFrequency: 'monthly' as const, priority: 0.6 },
  { path: '/contacts', changeFrequency: 'monthly' as const, priority: 0.5 },
  { path: '/b2b', changeFrequency: 'monthly' as const, priority: 0.5 },
  { path: '/how-to-get', changeFrequency: 'monthly' as const, priority: 0.5 },
  { path: '/rules', changeFrequency: 'yearly' as const, priority: 0.3 },
  { path: '/privacy', changeFrequency: 'yearly' as const, priority: 0.2 },
  { path: '/terms', changeFrequency: 'yearly' as const, priority: 0.2 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];

  // Static pages × locales
  for (const page of STATIC_PAGES) {
    for (const locale of LOCALES) {
      entries.push({
        url: `${SITE_URL}/${locale}${page.path}`,
        lastModified: new Date(),
        changeFrequency: page.changeFrequency,
        priority: page.priority,
        alternates: {
          languages: {
            ro: `${SITE_URL}/ro${page.path}`,
            ru: `${SITE_URL}/ru${page.path}`,
          },
        },
      });
    }
  }

  // Dynamic news articles
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );

    const { data: articles } = await supabase
      .from('news')
      .select('slug, published_at')
      .eq('is_published', true)
      .order('published_at', { ascending: false });

    if (articles) {
      for (const article of articles) {
        for (const locale of LOCALES) {
          entries.push({
            url: `${SITE_URL}/${locale}/news/${article.slug}`,
            lastModified: new Date(article.published_at),
            changeFrequency: 'monthly',
            priority: 0.6,
            alternates: {
              languages: {
                ro: `${SITE_URL}/ro/news/${article.slug}`,
                ru: `${SITE_URL}/ru/news/${article.slug}`,
              },
            },
          });
        }
      }
    }
  } catch {
    // Sitemap generation should never fail — return static pages only
  }

  return entries;
}
