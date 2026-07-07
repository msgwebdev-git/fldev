import { unstable_cache, revalidateTag } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";

// -----------------------------------------------------------------------------
// Types (camelCase view of the DB rows) — imported by shop components.
// -----------------------------------------------------------------------------

export interface ProductVariant {
  id: string;
  size: string;
  sku?: string;
  priceModifier: number;
  stockQuantity: number;
}

export interface MerchCategory {
  id: string;
  slug: string;
  nameRo: string;
  nameRu: string;
  sortOrder: number;
  isActive: boolean;
}

export interface ProductData {
  id: string;
  slug: string;
  nameRo: string;
  nameRu: string;
  descriptionRo?: string;
  descriptionRu?: string;
  categoryId: string | null;
  colorRo?: string;
  colorRu?: string;
  colorHex?: string;
  price: number;
  originalPrice?: number;
  currency: string;
  images: string[];
  sizeChartRo?: string;
  sizeChartRu?: string;
  maxPerOrder: number;
  variants: ProductVariant[];
}

export interface ActivePromotion {
  id: string;
  name: string;
  minOrderAmount: number;
  rewardQuantity: number;
  maxRedemptions: number | null;
  redemptionCount: number;
  remaining: number | null; // null = unlimited; else max - count (>= 0)
  startsAt: string | null;
  endsAt: string | null;
}

export const MERCH_CACHE_TAG = "merch";
const MERCH_REVALIDATE_PROFILE = { expire: 3600 } as const;

// -----------------------------------------------------------------------------
// Row mapping
// -----------------------------------------------------------------------------

interface VariantRow {
  id: string;
  size: string;
  sku: string | null;
  price_modifier: number | null;
  stock_quantity: number | null;
  sort_order: number | null;
  is_active: boolean | null;
}

interface ProductRow {
  id: string;
  slug: string;
  name_ro: string;
  name_ru: string;
  description_ro: string | null;
  description_ru: string | null;
  category_id: string | null;
  color_ro: string | null;
  color_ru: string | null;
  color_hex: string | null;
  price: number;
  original_price: number | null;
  currency: string | null;
  images: string[] | null;
  size_chart_ro: string | null;
  size_chart_ru: string | null;
  max_per_order: number | null;
  merch_variants: VariantRow[] | null;
}

const PRODUCT_SELECT = `
  id,
  slug,
  name_ro,
  name_ru,
  description_ro,
  description_ru,
  category_id,
  color_ro,
  color_ru,
  color_hex,
  price,
  original_price,
  currency,
  images,
  size_chart_ro,
  size_chart_ru,
  max_per_order,
  merch_variants (
    id,
    size,
    sku,
    price_modifier,
    stock_quantity,
    sort_order,
    is_active
  )
`;

function mapProduct(row: ProductRow): ProductData {
  return {
    id: row.id,
    slug: row.slug,
    nameRo: row.name_ro,
    nameRu: row.name_ru,
    descriptionRo: row.description_ro ?? undefined,
    descriptionRu: row.description_ru ?? undefined,
    categoryId: row.category_id ?? null,
    colorRo: row.color_ro ?? undefined,
    colorRu: row.color_ru ?? undefined,
    colorHex: row.color_hex ?? undefined,
    price: Number(row.price),
    originalPrice: row.original_price ? Number(row.original_price) : undefined,
    currency: row.currency ?? "MDL",
    images: Array.isArray(row.images) ? row.images : [],
    sizeChartRo: row.size_chart_ro ?? undefined,
    sizeChartRu: row.size_chart_ru ?? undefined,
    maxPerOrder: row.max_per_order ?? 10,
    variants: (row.merch_variants ?? [])
      .filter((v) => v.is_active !== false)
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
      .map((v) => ({
        id: v.id,
        size: v.size,
        sku: v.sku ?? undefined,
        priceModifier: v.price_modifier ? Number(v.price_modifier) : 0,
        stockQuantity: v.stock_quantity ?? 0,
      })),
  };
}

// -----------------------------------------------------------------------------
// Catalog reads (public, cached, invalidated by admin mutations)
// -----------------------------------------------------------------------------

async function fetchActiveProducts(): Promise<ProductData[]> {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("merch_products")
    .select(PRODUCT_SELECT)
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  return ((data as ProductRow[] | null) ?? []).map(mapProduct);
}

// Cached across the deployment; busted by revalidateActiveMerch() on admin edits.
// 1h TTL is a safety net; products change infrequently.
export const getActiveProducts = unstable_cache(
  fetchActiveProducts,
  ["active-merch-v1"],
  { revalidate: 3600, tags: [MERCH_CACHE_TAG] }
);

async function fetchProductBySlug(slug: string): Promise<ProductData | null> {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("merch_products")
    .select(PRODUCT_SELECT)
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  return data ? mapProduct(data as ProductRow) : null;
}

export const getProductBySlug = (slug: string) =>
  unstable_cache(() => fetchProductBySlug(slug), ["merch-product-v1", slug], {
    revalidate: 3600,
    tags: [MERCH_CACHE_TAG],
  })();

export function revalidateActiveMerch() {
  revalidateTag(MERCH_CACHE_TAG, MERCH_REVALIDATE_PROFILE);
}

// -----------------------------------------------------------------------------
// Categories (admin-managed reference table)
// -----------------------------------------------------------------------------

async function fetchActiveCategories(): Promise<MerchCategory[]> {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("merch_categories")
    .select("id, slug, name_ro, name_ru, sort_order, is_active")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  return (data ?? []).map((c) => ({
    id: c.id as string,
    slug: c.slug as string,
    nameRo: c.name_ro as string,
    nameRu: c.name_ru as string,
    sortOrder: (c.sort_order as number) ?? 0,
    isActive: c.is_active !== false,
  }));
}

export const getMerchCategories = unstable_cache(
  fetchActiveCategories,
  ["active-merch-categories-v1"],
  { revalidate: 3600, tags: [MERCH_CACHE_TAG] }
);

// -----------------------------------------------------------------------------
// Active promotions (best-effort marketing display; short TTL for the counter)
// -----------------------------------------------------------------------------

interface PromotionRow {
  id: string;
  name: string;
  min_order_amount: number;
  reward_quantity: number | null;
  max_redemptions: number | null;
  redemption_count: number | null;
  starts_at: string | null;
  ends_at: string | null;
}

async function fetchActivePromotions(nowIso: string): Promise<ActivePromotion[]> {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("merch_promotions")
    .select(
      "id, name, min_order_amount, reward_quantity, max_redemptions, redemption_count, starts_at, ends_at"
    )
    .eq("is_active", true);

  const now = new Date(nowIso).getTime();

  return ((data as PromotionRow[] | null) ?? [])
    .filter((p) => {
      const startsOk = !p.starts_at || new Date(p.starts_at).getTime() <= now;
      const endsOk = !p.ends_at || new Date(p.ends_at).getTime() >= now;
      return startsOk && endsOk;
    })
    .map((p) => {
      const count = p.redemption_count ?? 0;
      const max = p.max_redemptions;
      const remaining = max == null ? null : Math.max(0, max - count);
      return {
        id: p.id,
        name: p.name,
        minOrderAmount: Number(p.min_order_amount),
        rewardQuantity: p.reward_quantity ?? 1,
        maxRedemptions: max,
        redemptionCount: count,
        remaining,
        startsAt: p.starts_at,
        endsAt: p.ends_at,
      };
    })
    .filter((p) => p.remaining == null || p.remaining > 0);
}

// Bucketed to the minute so the "N left" counter is fresh-ish without a cache
// stampede. Callers pass a minute-granular ISO string as the cache key input.
const getActivePromotionsCached = unstable_cache(
  fetchActivePromotions,
  ["active-merch-promotions-v1"],
  { revalidate: 60, tags: [MERCH_CACHE_TAG] }
);

export function getActivePromotions(): Promise<ActivePromotion[]> {
  const d = new Date();
  d.setSeconds(0, 0);
  return getActivePromotionsCached(d.toISOString());
}

// -----------------------------------------------------------------------------
// Shipping settings (admin-editable via site_settings) — for checkout display.
// The server recomputes authoritatively on order creation.
// -----------------------------------------------------------------------------

export interface MerchShippingSettings {
  shippingFee: number;
  freeShippingThreshold: number | null;
}

async function fetchShippingSettings(): Promise<MerchShippingSettings> {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("site_settings")
    .select("key, value")
    .in("key", ["merch_shipping_fee", "merch_free_shipping_threshold"]);

  const map = new Map((data ?? []).map((r) => [r.key as string, r.value as string | null]));
  const fee = Number(map.get("merch_shipping_fee") ?? 0) || 0;
  const rawThreshold = map.get("merch_free_shipping_threshold");
  const threshold =
    rawThreshold != null && rawThreshold !== "" && !Number.isNaN(Number(rawThreshold))
      ? Number(rawThreshold)
      : null;
  return { shippingFee: fee, freeShippingThreshold: threshold };
}

export const getMerchShippingSettings = unstable_cache(
  fetchShippingSettings,
  ["merch-shipping-settings-v1"],
  { revalidate: 300, tags: [MERCH_CACHE_TAG] }
);

// -----------------------------------------------------------------------------
// Shop banner (admin-uploaded photo URLs in site_settings)
// -----------------------------------------------------------------------------

export interface MerchBanner {
  url: string | null;
  urlMobile: string | null;
}

async function fetchMerchBanner(): Promise<MerchBanner> {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("site_settings")
    .select("key, value")
    .in("key", ["merch_banner_url", "merch_banner_url_mobile"]);

  const map = new Map((data ?? []).map((r) => [r.key as string, r.value as string | null]));
  return {
    url: map.get("merch_banner_url") || null,
    urlMobile: map.get("merch_banner_url_mobile") || null,
  };
}

export const getMerchBanner = unstable_cache(fetchMerchBanner, ["merch-banner-v1"], {
  revalidate: 300,
  tags: [MERCH_CACHE_TAG],
});

// -----------------------------------------------------------------------------
// Shop visibility toggle (admin) — hides /shop and the navbar link when off.
// Missing/empty setting = disabled (shop hidden until explicitly enabled).
// -----------------------------------------------------------------------------

async function fetchShopEnabled(): Promise<boolean> {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "merch_shop_enabled")
    .maybeSingle();
  return data?.value === "true";
}

export const getMerchShopEnabled = unstable_cache(fetchShopEnabled, ["merch-shop-enabled-v1"], {
  revalidate: 300,
  tags: [MERCH_CACHE_TAG],
});
