"use client";

import * as React from "react";
import type { ProductData, ProductVariant } from "@/lib/data/merch";

const MERCH_CART_STORAGE_KEY = "fl-merch-cart";

export interface MerchCartItem {
  product: ProductData;
  variant: ProductVariant;
  quantity: number;
}

// Unique key for a cart line (product + variant/size)
function getCartItemKey(productId: string, variantId: string): string {
  return `${productId}:${variantId}`;
}

// Upper bound for a line: product's per-order cap, but never more than stock.
function maxForLine(product: ProductData, variant: ProductVariant): number {
  return Math.max(0, Math.min(product.maxPerOrder ?? 10, variant.stockQuantity ?? 0));
}

interface MerchCartContextType {
  items: MerchCartItem[];
  addItem: (product: ProductData, variant: ProductVariant, quantity: number) => void;
  removeItem: (productId: string, variantId: string) => void;
  updateQuantity: (productId: string, variantId: string, quantity: number) => void;
  getItemQuantity: (productId: string, variantId: string) => number;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  isHydrated: boolean;
}

const MerchCartContext = React.createContext<MerchCartContextType | undefined>(undefined);

function loadCartFromStorage(): MerchCartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(MERCH_CART_STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch (error) {
    console.error("Failed to load merch cart from storage:", error);
  }
  return [];
}

function saveCartToStorage(items: MerchCartItem[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(MERCH_CART_STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    console.error("Failed to save merch cart to storage:", error);
  }
}

export function MerchCartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<MerchCartItem[]>([]);
  const [isHydrated, setIsHydrated] = React.useState(false);

  React.useEffect(() => {
    const stored = loadCartFromStorage();
    if (stored.length > 0) setItems(stored);
    setIsHydrated(true);
  }, []);

  React.useEffect(() => {
    if (isHydrated) saveCartToStorage(items);
  }, [items, isHydrated]);

  const addItem = React.useCallback(
    (product: ProductData, variant: ProductVariant, quantity: number) => {
      setItems((prev) => {
        const key = getCartItemKey(product.id, variant.id);
        const max = maxForLine(product, variant);
        if (max <= 0) return prev;
        const existingIndex = prev.findIndex(
          (item) => getCartItemKey(item.product.id, item.variant.id) === key
        );
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = {
            ...updated[existingIndex],
            // refresh product/variant snapshot (price/stock may have changed)
            product,
            variant,
            quantity: Math.min(updated[existingIndex].quantity + quantity, max),
          };
          return updated;
        }
        return [...prev, { product, variant, quantity: Math.min(quantity, max) }];
      });
    },
    []
  );

  const removeItem = React.useCallback((productId: string, variantId: string) => {
    const key = getCartItemKey(productId, variantId);
    setItems((prev) =>
      prev.filter((item) => getCartItemKey(item.product.id, item.variant.id) !== key)
    );
  }, []);

  const updateQuantity = React.useCallback(
    (productId: string, variantId: string, quantity: number) => {
      const key = getCartItemKey(productId, variantId);
      setItems((prev) => {
        if (quantity <= 0) {
          return prev.filter(
            (item) => getCartItemKey(item.product.id, item.variant.id) !== key
          );
        }
        return prev.map((item) => {
          if (getCartItemKey(item.product.id, item.variant.id) !== key) return item;
          return { ...item, quantity: Math.min(quantity, maxForLine(item.product, item.variant)) };
        });
      });
    },
    []
  );

  const getItemQuantity = React.useCallback(
    (productId: string, variantId: string) => {
      const key = getCartItemKey(productId, variantId);
      const item = items.find(
        (item) => getCartItemKey(item.product.id, item.variant.id) === key
      );
      return item?.quantity ?? 0;
    },
    [items]
  );

  const clearCart = React.useCallback(() => setItems([]), []);

  const totalItems = React.useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  const totalPrice = React.useMemo(
    () =>
      items.reduce(
        (sum, item) => sum + (item.product.price + item.variant.priceModifier) * item.quantity,
        0
      ),
    [items]
  );

  const value = React.useMemo(
    () => ({
      items,
      addItem,
      removeItem,
      updateQuantity,
      getItemQuantity,
      clearCart,
      totalItems,
      totalPrice,
      isHydrated,
    }),
    [items, addItem, removeItem, updateQuantity, getItemQuantity, clearCart, totalItems, totalPrice, isHydrated]
  );

  return <MerchCartContext.Provider value={value}>{children}</MerchCartContext.Provider>;
}

export function useMerchCart() {
  const context = React.useContext(MerchCartContext);
  if (!context) {
    throw new Error("useMerchCart must be used within a MerchCartProvider");
  }
  return context;
}
