"use client";

import * as React from "react";
import { TicketData, TicketOption } from "@/components/TicketCard";

const CART_STORAGE_KEY = "fl-cart";

export interface CartItem {
  ticket: TicketData;
  quantity: number;
  selectedOption?: TicketOption;
}

// Уникальный ключ для элемента корзины (ticketId + optionId)
function getCartItemKey(ticketId: string, optionId?: string): string {
  return optionId ? `${ticketId}:${optionId}` : ticketId;
}

interface CartContextType {
  items: CartItem[];
  addItem: (ticket: TicketData, quantity: number, option?: TicketOption) => void;
  removeItem: (ticketId: string, optionId?: string) => void;
  updateQuantity: (ticketId: string, quantity: number, optionId?: string) => void;
  setItemQuantity: (ticket: TicketData, quantity: number, option?: TicketOption) => void;
  getItemQuantity: (ticketId: string, optionId?: string) => number;
  getSelectedOption: (ticketId: string) => TicketOption | undefined;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  isHydrated: boolean;
}

const CartContext = React.createContext<CartContextType | undefined>(undefined);

// Load cart from localStorage
function loadCartFromStorage(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error("Failed to load cart from storage:", error);
  }
  return [];
}

// Save cart to localStorage
function saveCartToStorage(items: CartItem[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    console.error("Failed to save cart to storage:", error);
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<CartItem[]>([]);
  const [isHydrated, setIsHydrated] = React.useState(false);

  // Load cart from localStorage on mount
  React.useEffect(() => {
    const storedItems = loadCartFromStorage();
    if (storedItems.length > 0) {
      setItems(storedItems);
    }
    setIsHydrated(true);
  }, []);

  // Save cart to localStorage whenever items change
  React.useEffect(() => {
    if (isHydrated) {
      saveCartToStorage(items);
    }
  }, [items, isHydrated]);

  const addItem = React.useCallback((ticket: TicketData, quantity: number, option?: TicketOption) => {
    setItems((prev) => {
      const key = getCartItemKey(ticket.id, option?.id);
      const existingIndex = prev.findIndex(
        (item) => getCartItemKey(item.ticket.id, item.selectedOption?.id) === key
      );
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: Math.min(
            updated[existingIndex].quantity + quantity,
            ticket.maxPerOrder ?? 10
          ),
        };
        return updated;
      }
      return [...prev, { ticket, quantity, selectedOption: option }];
    });
  }, []);

  const removeItem = React.useCallback((ticketId: string, optionId?: string) => {
    const key = getCartItemKey(ticketId, optionId);
    setItems((prev) => prev.filter(
      (item) => getCartItemKey(item.ticket.id, item.selectedOption?.id) !== key
    ));
  }, []);

  const updateQuantity = React.useCallback((ticketId: string, quantity: number, optionId?: string) => {
    const key = getCartItemKey(ticketId, optionId);
    if (quantity <= 0) {
      setItems((prev) => prev.filter(
        (item) => getCartItemKey(item.ticket.id, item.selectedOption?.id) !== key
      ));
    } else {
      setItems((prev) =>
        prev.map((item) =>
          getCartItemKey(item.ticket.id, item.selectedOption?.id) === key
            ? { ...item, quantity }
            : item
        )
      );
    }
  }, []);

  const clearCart = React.useCallback(() => {
    setItems([]);
  }, []);

  const setItemQuantity = React.useCallback((ticket: TicketData, quantity: number, option?: TicketOption) => {
    const key = getCartItemKey(ticket.id, option?.id);
    if (quantity <= 0) {
      setItems((prev) => prev.filter(
        (item) => getCartItemKey(item.ticket.id, item.selectedOption?.id) !== key
      ));
    } else {
      setItems((prev) => {
        const existingIndex = prev.findIndex(
          (item) => getCartItemKey(item.ticket.id, item.selectedOption?.id) === key
        );
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = {
            ...updated[existingIndex],
            quantity: Math.min(quantity, ticket.maxPerOrder ?? 10),
            selectedOption: option,
          };
          return updated;
        }
        return [...prev, { ticket, quantity: Math.min(quantity, ticket.maxPerOrder ?? 10), selectedOption: option }];
      });
    }
  }, []);

  const getItemQuantity = React.useCallback((ticketId: string, optionId?: string) => {
    const key = getCartItemKey(ticketId, optionId);
    const item = items.find(
      (item) => getCartItemKey(item.ticket.id, item.selectedOption?.id) === key
    );
    return item?.quantity ?? 0;
  }, [items]);

  const getSelectedOption = React.useCallback((ticketId: string) => {
    const item = items.find((item) => item.ticket.id === ticketId);
    return item?.selectedOption;
  }, [items]);

  const totalItems = React.useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  const totalPrice = React.useMemo(
    () => items.reduce((sum, item) => {
      const optionPrice = item.selectedOption?.priceModifier ?? 0;
      return sum + (item.ticket.price + optionPrice) * item.quantity;
    }, 0),
    [items]
  );

  const value = React.useMemo(
    () => ({
      items,
      addItem,
      removeItem,
      updateQuantity,
      setItemQuantity,
      getItemQuantity,
      getSelectedOption,
      clearCart,
      totalItems,
      totalPrice,
      isHydrated,
    }),
    [items, addItem, removeItem, updateQuantity, setItemQuantity, getItemQuantity, getSelectedOption, clearCart, totalItems, totalPrice, isHydrated]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = React.useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
