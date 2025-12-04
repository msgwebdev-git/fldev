"use client";

import * as React from "react";
import { TicketData } from "@/components/TicketCard";

const CART_STORAGE_KEY = "fl-cart";

export interface CartItem {
  ticket: TicketData;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (ticket: TicketData, quantity: number) => void;
  removeItem: (ticketId: string) => void;
  updateQuantity: (ticketId: string, quantity: number) => void;
  setItemQuantity: (ticket: TicketData, quantity: number) => void;
  getItemQuantity: (ticketId: string) => number;
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

  const addItem = React.useCallback((ticket: TicketData, quantity: number) => {
    setItems((prev) => {
      const existingIndex = prev.findIndex((item) => item.ticket.id === ticket.id);
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
      return [...prev, { ticket, quantity }];
    });
  }, []);

  const removeItem = React.useCallback((ticketId: string) => {
    setItems((prev) => prev.filter((item) => item.ticket.id !== ticketId));
  }, []);

  const updateQuantity = React.useCallback((ticketId: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((item) => item.ticket.id !== ticketId));
    } else {
      setItems((prev) =>
        prev.map((item) =>
          item.ticket.id === ticketId
            ? { ...item, quantity }
            : item
        )
      );
    }
  }, []);

  const clearCart = React.useCallback(() => {
    setItems([]);
  }, []);

  const setItemQuantity = React.useCallback((ticket: TicketData, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((item) => item.ticket.id !== ticket.id));
    } else {
      setItems((prev) => {
        const existingIndex = prev.findIndex((item) => item.ticket.id === ticket.id);
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = {
            ...updated[existingIndex],
            quantity: Math.min(quantity, ticket.maxPerOrder ?? 10),
          };
          return updated;
        }
        return [...prev, { ticket, quantity: Math.min(quantity, ticket.maxPerOrder ?? 10) }];
      });
    }
  }, []);

  const getItemQuantity = React.useCallback((ticketId: string) => {
    const item = items.find((item) => item.ticket.id === ticketId);
    return item?.quantity ?? 0;
  }, [items]);

  const totalItems = React.useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  const totalPrice = React.useMemo(
    () => items.reduce((sum, item) => sum + item.ticket.price * item.quantity, 0),
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
      clearCart,
      totalItems,
      totalPrice,
      isHydrated,
    }),
    [items, addItem, removeItem, updateQuantity, setItemQuantity, getItemQuantity, clearCart, totalItems, totalPrice, isHydrated]
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
