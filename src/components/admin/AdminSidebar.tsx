"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LucideIcon, LayoutDashboard, Video, Newspaper, Music, Calendar, Handshake, Sparkles, Ticket, BarChart3, ShoppingCart, Gift, TrendingUp, Percent, ChevronDown, Phone, Briefcase, Images, HelpCircle, ShieldCheck, ScanLine, Bell, ToggleLeft, Inbox, ShoppingBag, Package, Tag, Film, Bus, Users } from "lucide-react";
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
      { name: "Трафик", href: "/admin/traffic", icon: BarChart3 },
      { name: "Заказы", href: "/admin/orders", icon: ShoppingCart },
      { name: "B2B Заказы", href: "/admin/b2b-orders", icon: Briefcase },
      { name: "Билеты", href: "/admin/tickets", icon: Ticket },
      { name: "Приглашения", href: "/admin/invitations", icon: Gift },
      { name: "Промо-коды", href: "/admin/promo-codes", icon: Percent },
      { name: "Автобус", href: "/admin/bus", icon: Bus },
      { name: "Заказы автобуса", href: "/admin/bus/orders", icon: Package },
      { name: "Сканирование", href: "/admin/scanning", icon: ScanLine },
    ]
  },
  {
    category: "Магазин",
    items: [
      { name: "Товары", href: "/admin/merch", icon: ShoppingBag },
      { name: "Категории", href: "/admin/merch/categories", icon: Tag },
      { name: "Заказы мерча", href: "/admin/merch/orders", icon: Package },
      { name: "Акции", href: "/admin/merch/promotions", icon: Gift },
      { name: "Настройки", href: "/admin/merch/settings", icon: ToggleLeft },
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
      { name: "Сторис", href: "/admin/stories", icon: Film },
      { name: "Новости", href: "/admin/news", icon: Newspaper },
      { name: "Aftermovie", href: "/admin/aftermovies", icon: Video },
      { name: "Галерея", href: "/admin/gallery", icon: Images },
      { name: "FAQ", href: "/admin/faq", icon: HelpCircle },
      { name: "Правила", href: "/admin/rules", icon: ShieldCheck },
    ]
  },
  {
    category: "Партнёры",
    items: [
      { name: "Партнёры", href: "/admin/partners", icon: Handshake },
      { name: "Заявки", href: "/admin/partner-requests", icon: Inbox },
    ]
  },
  {
    category: "Коммуникация",
    items: [
      { name: "Push-уведомления", href: "/admin/notifications", icon: Bell },
      { name: "Контакты", href: "/admin/contacts", icon: Phone },
    ]
  },
  {
    category: "Настройки",
    items: [
      { name: "Маркетинг", href: "/admin/settings/marketing", icon: BarChart3 },
      { name: "Секции", href: "/admin/settings/sections", icon: ToggleLeft },
      { name: "Команда", href: "/admin/team", icon: Users },
    ]
  },
];

// Get all category names
const allCategories = navigation
  .filter((item): item is NavCategory => "category" in item)
  .map((cat) => cat.category);

// Collect every nav href once, so active-matching can pick the MOST SPECIFIC
// one. Without this, `/admin/bus/orders` matches both `/admin/bus` and
// `/admin/bus/orders` (prefix match) and highlights two items.
const allHrefs = navigation.flatMap((item) =>
  "category" in item ? item.items.map((i) => i.href) : [item.href]
);

// The single href that best matches the current path: exact, else the longest
// href that is a path-prefix of it. Returns null if nothing matches.
function activeHrefFor(pathname: string): string | null {
  let best: string | null = null;
  for (const href of allHrefs) {
    if (pathname === href || pathname.startsWith(href + "/")) {
      if (!best || href.length > best.length) best = href;
    }
  }
  return best;
}

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

// One nav row — modern "tinted" active state (soft brand fill + accent bar)
// instead of a heavy solid fill. Icons muted when inactive.
function NavLink({ href, icon: Icon, label, active }: { href: string; icon: LucideIcon; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={cn(
        "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
        active
          ? "bg-primary/10 font-semibold text-primary"
          : "font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
      )}
    >
      {active && <span className="absolute inset-y-1.5 left-0 w-[3px] rounded-full bg-primary" />}
      <Icon
        className={cn(
          "h-[18px] w-[18px] shrink-0 transition-colors",
          active ? "text-primary" : "text-gray-400 group-hover:text-gray-500"
        )}
      />
      <span className="truncate">{label}</span>
    </Link>
  );
}

export function AdminSidebar() {
  const pathname = usePathname();
  const activeHref = activeHrefFor(pathname);
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
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {navigation.map((item) => {
          if ("category" in item) {
            const category = item as NavCategory;
            const isExpanded = expandedCategories.has(category.category);
            const hasActiveItem = category.items.some((subItem) => subItem.href === activeHref);

            return (
              <div key={category.category} className="pt-3 first:pt-0">
                <button
                  onClick={() => toggleCategory(category.category)}
                  className={cn(
                    "group w-full flex items-center justify-between px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider transition-colors",
                    hasActiveItem ? "text-gray-500" : "text-gray-400 hover:text-gray-600"
                  )}
                >
                  <span>{category.category}</span>
                  <ChevronDown
                    className={cn(
                      "w-3.5 h-3.5 text-gray-300 transition-transform duration-200 group-hover:text-gray-400",
                      isExpanded ? "rotate-0" : "-rotate-90"
                    )}
                  />
                </button>
                <div
                  className={cn(
                    "overflow-hidden transition-all duration-200 ease-in-out",
                    isExpanded ? "max-h-[32rem] opacity-100" : "max-h-0 opacity-0"
                  )}
                >
                  {/* py-1 gives the rounded active pill breathing room so
                      overflow-hidden doesn't clip its corners. */}
                  <div className="space-y-0.5 py-1">
                    {category.items.map((subItem) => (
                      <NavLink key={subItem.name} href={subItem.href} icon={subItem.icon} label={subItem.name} active={subItem.href === activeHref} />
                    ))}
                  </div>
                </div>
              </div>
            );
          }

          const navItem = item as NavItem;
          return (
            <NavLink key={navItem.name} href={navItem.href} icon={navItem.icon} label={navItem.name} active={navItem.href === activeHref} />
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
