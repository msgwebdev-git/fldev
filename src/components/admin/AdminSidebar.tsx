"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LucideIcon, LayoutDashboard, Video, Newspaper, Music, Calendar, Handshake, Sparkles, Ticket, BarChart3, ShoppingCart, Gift, TrendingUp, Percent, ChevronDown, Phone } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
}

interface NavCategory {
  category: string;
  items: NavItem[];
}

type NavElement = NavItem | NavCategory;

const navigation: NavElement[] = [
  { name: "Главная", href: "/admin", icon: LayoutDashboard },
  {
    category: "Продажи",
    items: [
      { name: "Аналитика", href: "/admin/analytics", icon: TrendingUp },
      { name: "Заказы", href: "/admin/orders", icon: ShoppingCart },
      { name: "Билеты", href: "/admin/tickets", icon: Ticket },
      { name: "Приглашения", href: "/admin/invitations", icon: Gift },
      { name: "Промо-коды", href: "/admin/promo-codes", icon: Percent },
    ]
  },
  {
    category: "Фестиваль",
    items: [
      { name: "Lineup", href: "/admin/lineup", icon: Music },
      { name: "Программа", href: "/admin/program", icon: Calendar },
      { name: "Активности", href: "/admin/activities", icon: Sparkles },
    ]
  },
  {
    category: "Контент",
    items: [
      { name: "Новости", href: "/admin/news", icon: Newspaper },
      { name: "Aftermovie", href: "/admin/aftermovies", icon: Video },
    ]
  },
  {
    category: "Партнёры",
    items: [
      { name: "Партнёры", href: "/admin/partners", icon: Handshake },
    ]
  },
  {
    category: "Настройки",
    items: [
      { name: "Контакты", href: "/admin/contacts", icon: Phone },
      { name: "Маркетинг", href: "/admin/settings/marketing", icon: BarChart3 },
    ]
  },
];

// Get all category names
const allCategories = navigation
  .filter((item): item is NavCategory => "category" in item)
  .map((cat) => cat.category);

// Find which category contains a given path
function findCategoryForPath(pathname: string): string | null {
  for (const item of navigation) {
    if ("category" in item) {
      const hasActiveItem = item.items.some(
        (subItem) => pathname === subItem.href || pathname.startsWith(subItem.href + "/")
      );
      if (hasActiveItem) {
        return item.category;
      }
    }
  }
  return null;
}

export function AdminSidebar() {
  const pathname = usePathname();
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(allCategories));

  // Load saved state from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("admin-sidebar-expanded");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setExpandedCategories(new Set(parsed));
      } catch {
        // Ignore parse errors
      }
    }
  }, []);

  // Auto-expand category containing active item
  useEffect(() => {
    const activeCategory = findCategoryForPath(pathname);
    if (activeCategory && !expandedCategories.has(activeCategory)) {
      setExpandedCategories((prev) => {
        const next = new Set(prev);
        next.add(activeCategory);
        return next;
      });
    }
  }, [pathname]);

  // Save state to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("admin-sidebar-expanded", JSON.stringify([...expandedCategories]));
  }, [expandedCategories]);

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  return (
    <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 hidden lg:flex lg:flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-gray-200 shrink-0">
        <Link href="/admin" className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">FL</span>
          </div>
          <span className="font-semibold text-gray-900">Админ-панель</span>
        </Link>
      </div>

      {/* Navigation with scroll */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {navigation.map((item) => {
          if ("category" in item) {
            const category = item as NavCategory;
            const isExpanded = expandedCategories.has(category.category);
            const hasActiveItem = category.items.some(
              (subItem) => pathname === subItem.href || pathname.startsWith(subItem.href + "/")
            );

            return (
              <div key={category.category} className="pt-2">
                <button
                  onClick={() => toggleCategory(category.category)}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium uppercase tracking-wider transition-colors",
                    hasActiveItem
                      ? "text-gray-700"
                      : "text-gray-400 hover:text-gray-600"
                  )}
                >
                  <span>{category.category}</span>
                  <ChevronDown
                    className={cn(
                      "w-4 h-4 transition-transform duration-200",
                      isExpanded ? "rotate-0" : "-rotate-90"
                    )}
                  />
                </button>
                <div
                  className={cn(
                    "overflow-hidden transition-all duration-200 ease-in-out",
                    isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                  )}
                >
                  <div className="space-y-1 mt-1">
                    {category.items.map((subItem) => {
                      const isActive = pathname === subItem.href || pathname.startsWith(subItem.href + "/");
                      const Icon = subItem.icon;
                      return (
                        <Link
                          key={subItem.name}
                          href={subItem.href}
                          className={cn(
                            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                            isActive
                              ? "bg-primary text-primary-foreground"
                              : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                          )}
                        >
                          <Icon className="w-5 h-5" />
                          {subItem.name}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          }

          const navItem = item as NavItem;
          const isActive = pathname === navItem.href;
          const Icon = navItem.icon;
          return (
            <Link
              key={navItem.name}
              href={navItem.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              )}
            >
              <Icon className="w-5 h-5" />
              {navItem.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="shrink-0 p-4 border-t border-gray-200">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 text-sm transition-colors"
        >
          <span>Открыть сайт</span>
          <span>↗</span>
        </Link>
      </div>
    </aside>
  );
}
