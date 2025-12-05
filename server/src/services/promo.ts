import { supabase } from './supabase.js';

interface PromoValidationResult {
  valid: boolean;
  error?: string;
  code?: string;
  discountPercent?: number;
  discountAmount?: number;
}

export const promoService = {
  async validatePromoCode(code: string, totalAmount: number): Promise<PromoValidationResult> {
    const { data: promo, error } = await supabase
      .from('promo_codes')
      .select('*')
      .eq('code', code.toUpperCase())
      .eq('is_active', true)
      .single();

    if (error || !promo) {
      return { valid: false, error: 'Invalid promo code' };
    }

    // Check validity dates
    const now = new Date();
    if (promo.valid_from && new Date(promo.valid_from) > now) {
      return { valid: false, error: 'Promo code not yet active' };
    }
    if (promo.valid_until && new Date(promo.valid_until) < now) {
      return { valid: false, error: 'Promo code expired' };
    }

    // Check usage limit
    if (promo.usage_limit && promo.used_count >= promo.usage_limit) {
      return { valid: false, error: 'Promo code usage limit reached' };
    }

    // Calculate discount
    let discountAmount = 0;
    if (promo.discount_percent) {
      discountAmount = Math.round(totalAmount * promo.discount_percent / 100);
    } else if (promo.discount_amount) {
      discountAmount = Math.min(promo.discount_amount, totalAmount);
    }

    return {
      valid: true,
      code: promo.code,
      discountPercent: promo.discount_percent,
      discountAmount,
    };
  },

  async incrementUsage(code: string): Promise<void> {
    const { data: promo } = await supabase
      .from('promo_codes')
      .select('used_count')
      .eq('code', code.toUpperCase())
      .single();

    if (promo) {
      await supabase
        .from('promo_codes')
        .update({ used_count: promo.used_count + 1 })
        .eq('code', code.toUpperCase());
    }
  },
};
