"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth/require-admin";
import { revalidateActiveMerch } from "@/lib/data/merch";

export interface VariantInput {
  id?: string;
  size: string;
  stockQuantity: number;
  priceModifier: number;
  sortOrder: number;
  isActive: boolean;
}

export interface ProductInput {
  id?: string;
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
  originalPrice?: number | null;
  currency: string;
  images: string[];
  sizeChartRo?: string;
  sizeChartRu?: string;
  maxPerOrder: number;
  isActive: boolean;
  sortOrder: number;
  variants: VariantInput[];
}

type ActionResult = { ok: true; id: string } | { ok: false; error: string };

export async function saveProduct(input: ProductInput): Promise<ActionResult> {
  const { isAdmin } = await requireAdmin();
  if (!isAdmin) return { ok: false, error: "Unauthorized" };

  const supabase = createAdminClient();

  const productRow = {
    slug: input.slug.trim(),
    name_ro: input.nameRo.trim(),
    name_ru: input.nameRu.trim(),
    description_ro: input.descriptionRo?.trim() || null,
    description_ru: input.descriptionRu?.trim() || null,
    category_id: input.categoryId,
    color_ro: input.colorRo?.trim() || null,
    color_ru: input.colorRu?.trim() || null,
    color_hex: input.colorHex?.trim() || null,
    price: input.price,
    original_price: input.originalPrice ?? null,
    currency: input.currency || "MDL",
    images: input.images,
    size_chart_ro: input.sizeChartRo?.trim() || null,
    size_chart_ru: input.sizeChartRu?.trim() || null,
    max_per_order: input.maxPerOrder,
    is_active: input.isActive,
    sort_order: input.sortOrder,
  };

  let productId = input.id;

  if (productId) {
    const { error } = await supabase.from("merch_products").update(productRow).eq("id", productId);
    if (error) return { ok: false, error: error.message };
  } else {
    const { data, error } = await supabase.from("merch_products").insert(productRow).select("id").single();
    if (error || !data) return { ok: false, error: error?.message || "Insert failed" };
    productId = data.id;
  }

  // Upsert variants by (product_id, size); deactivate sizes no longer present.
  const providedSizes = input.variants.map((v) => v.size);
  if (input.variants.length > 0) {
    const variantRows = input.variants.map((v) => ({
      product_id: productId,
      size: v.size,
      stock_quantity: v.stockQuantity,
      price_modifier: v.priceModifier,
      sort_order: v.sortOrder,
      is_active: v.isActive,
    }));
    const { error: vErr } = await supabase
      .from("merch_variants")
      .upsert(variantRows, { onConflict: "product_id,size" });
    if (vErr) return { ok: false, error: vErr.message };
  }

  // Deactivate variants whose size was removed in the editor (kept for order FK integrity).
  const { data: existing } = await supabase
    .from("merch_variants")
    .select("id, size")
    .eq("product_id", productId);
  const toDeactivate = (existing ?? []).filter((v) => !providedSizes.includes(v.size)).map((v) => v.id);
  if (toDeactivate.length > 0) {
    await supabase.from("merch_variants").update({ is_active: false }).in("id", toDeactivate);
  }

  revalidateActiveMerch();
  return { ok: true, id: productId! };
}

export async function toggleProductActive(id: string, isActive: boolean): Promise<ActionResult> {
  const { isAdmin } = await requireAdmin();
  if (!isAdmin) return { ok: false, error: "Unauthorized" };

  const supabase = createAdminClient();
  const { error } = await supabase.from("merch_products").update({ is_active: isActive }).eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidateActiveMerch();
  return { ok: true, id };
}

export async function deleteProduct(id: string): Promise<ActionResult> {
  const { isAdmin } = await requireAdmin();
  if (!isAdmin) return { ok: false, error: "Unauthorized" };

  const supabase = createAdminClient();
  // Variants cascade; will fail if any variant is referenced by an order item.
  const { error } = await supabase.from("merch_products").delete().eq("id", id);
  if (error) {
    return {
      ok: false,
      error: "Товар уже участвует в заказах — его нельзя удалить. Отключите его вместо удаления.",
    };
  }
  revalidateActiveMerch();
  return { ok: true, id };
}

const FULFILLMENT_STATUSES = [
  "processing",
  "ready_for_pickup",
  "shipped",
  "delivered",
  "picked_up",
] as const;

// ─── Shop settings (banner + shipping) ───────

export interface MerchSettingsInput {
  shopEnabled: boolean;
  bannerUrl: string | null;
  bannerUrlMobile: string | null;
  shippingFee: number;
  freeShippingThreshold: number | null;
}

export async function setMerchSettings(input: MerchSettingsInput): Promise<ActionResult> {
  const { isAdmin } = await requireAdmin();
  if (!isAdmin) return { ok: false, error: "Unauthorized" };

  const supabase = createAdminClient();
  const rows = [
    { key: "merch_shop_enabled", value: input.shopEnabled ? "true" : "false", description: "Показывать магазин на сайте", category: "merch" },
    { key: "merch_banner_url", value: input.bannerUrl ?? "", description: "Баннер магазина (desktop)", category: "merch" },
    { key: "merch_banner_url_mobile", value: input.bannerUrlMobile ?? "", description: "Баннер магазина (mobile)", category: "merch" },
    { key: "merch_shipping_fee", value: String(input.shippingFee ?? 0), description: "Стоимость доставки мерча (MDL)", category: "merch" },
    {
      key: "merch_free_shipping_threshold",
      value: input.freeShippingThreshold != null ? String(input.freeShippingThreshold) : "",
      description: "Сумма для бесплатной доставки (MDL); пусто = отключено",
      category: "merch",
    },
  ];

  const { error } = await supabase.from("site_settings").upsert(rows, { onConflict: "key" });
  if (error) return { ok: false, error: error.message };

  revalidateActiveMerch();
  return { ok: true, id: "settings" };
}

// ─── Categories ──────────────────────────────

export interface CategoryInput {
  id?: string;
  slug: string;
  nameRo: string;
  nameRu: string;
  sortOrder: number;
  isActive: boolean;
}

export async function saveCategory(input: CategoryInput): Promise<ActionResult> {
  const { isAdmin } = await requireAdmin();
  if (!isAdmin) return { ok: false, error: "Unauthorized" };
  if (!input.nameRo.trim() || !input.nameRu.trim()) return { ok: false, error: "Укажите название на обоих языках" };
  if (!input.slug.trim()) return { ok: false, error: "Укажите slug" };

  const supabase = createAdminClient();
  const row = {
    slug: input.slug.trim(),
    name_ro: input.nameRo.trim(),
    name_ru: input.nameRu.trim(),
    sort_order: input.sortOrder,
    is_active: input.isActive,
  };

  let catId = input.id;
  if (catId) {
    const { error } = await supabase.from("merch_categories").update(row).eq("id", catId);
    if (error) return { ok: false, error: error.message };
  } else {
    const { data, error } = await supabase.from("merch_categories").insert(row).select("id").single();
    if (error || !data) return { ok: false, error: error?.message || "Insert failed" };
    catId = data.id;
  }

  revalidateActiveMerch();
  return { ok: true, id: catId! };
}

export async function toggleCategory(id: string, isActive: boolean): Promise<ActionResult> {
  const { isAdmin } = await requireAdmin();
  if (!isAdmin) return { ok: false, error: "Unauthorized" };
  const supabase = createAdminClient();
  const { error } = await supabase.from("merch_categories").update({ is_active: isActive }).eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidateActiveMerch();
  return { ok: true, id };
}

export async function deleteCategory(id: string): Promise<ActionResult> {
  const { isAdmin } = await requireAdmin();
  if (!isAdmin) return { ok: false, error: "Unauthorized" };
  const supabase = createAdminClient();
  const { error } = await supabase.from("merch_categories").delete().eq("id", id);
  if (error) {
    return { ok: false, error: "Категория используется товарами — отключите её вместо удаления." };
  }
  revalidateActiveMerch();
  return { ok: true, id };
}

// ─── Promotions ──────────────────────────────

export interface PromotionInput {
  id?: string;
  name: string;
  isActive: boolean;
  minOrderAmount: number;
  amountBasis: "subtotal" | "total";
  rewardTicketId: string;
  rewardOptionId?: string | null;
  rewardQuantity: number;
  maxRedemptions?: number | null;
  startsAt?: string | null;
  endsAt?: string | null;
}

export async function savePromotion(input: PromotionInput): Promise<ActionResult> {
  const { isAdmin } = await requireAdmin();
  if (!isAdmin) return { ok: false, error: "Unauthorized" };
  if (!input.name.trim()) return { ok: false, error: "Укажите название" };
  if (!input.rewardTicketId) return { ok: false, error: "Выберите билет-подарок" };

  const supabase = createAdminClient();
  const row = {
    name: input.name.trim(),
    is_active: input.isActive,
    min_order_amount: input.minOrderAmount,
    amount_basis: input.amountBasis,
    reward_ticket_id: input.rewardTicketId,
    reward_option_id: input.rewardOptionId || null,
    reward_quantity: input.rewardQuantity,
    max_redemptions: input.maxRedemptions ?? null,
    starts_at: input.startsAt || null,
    ends_at: input.endsAt || null,
  };

  let promoId = input.id;
  if (promoId) {
    const { error } = await supabase.from("merch_promotions").update(row).eq("id", promoId);
    if (error) return { ok: false, error: error.message };
  } else {
    const { data, error } = await supabase.from("merch_promotions").insert(row).select("id").single();
    if (error || !data) return { ok: false, error: error?.message || "Insert failed" };
    promoId = data.id;
  }

  revalidateActiveMerch();
  return { ok: true, id: promoId! };
}

export async function togglePromotion(id: string, isActive: boolean): Promise<ActionResult> {
  const { isAdmin } = await requireAdmin();
  if (!isAdmin) return { ok: false, error: "Unauthorized" };
  const supabase = createAdminClient();
  const { error } = await supabase.from("merch_promotions").update({ is_active: isActive }).eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidateActiveMerch();
  return { ok: true, id };
}

export async function deletePromotion(id: string): Promise<ActionResult> {
  const { isAdmin } = await requireAdmin();
  if (!isAdmin) return { ok: false, error: "Unauthorized" };
  const supabase = createAdminClient();
  const { error } = await supabase.from("merch_promotions").delete().eq("id", id);
  if (error) {
    return { ok: false, error: "Акция уже выдавала подарки — её нельзя удалить. Отключите её." };
  }
  revalidateActiveMerch();
  return { ok: true, id };
}

export async function updateMerchFulfillment(
  orderId: string,
  status: string,
  trackingNumber?: string
): Promise<ActionResult> {
  const { isAdmin } = await requireAdmin();
  if (!isAdmin) return { ok: false, error: "Unauthorized" };
  if (!FULFILLMENT_STATUSES.includes(status as (typeof FULFILLMENT_STATUSES)[number])) {
    return { ok: false, error: "Invalid status" };
  }

  const supabase = createAdminClient();
  const update: Record<string, unknown> = { fulfillment_status: status };
  if (trackingNumber !== undefined) update.tracking_number = trackingNumber || null;
  const { error } = await supabase.from("merch_orders").update(update).eq("id", orderId);
  if (error) return { ok: false, error: error.message };
  return { ok: true, id: orderId };
}
