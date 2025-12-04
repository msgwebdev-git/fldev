"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LucideIcon, LayoutDashboard, Video, Newspaper, Music, Calendar, Handshake, Sparkles } from "lucide-react";
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
    category: "Контент",
    items: [
      { name: "Lineup", href: "/admin/lineup", icon: Music },
      { name: "Программа", href: "/admin/program", icon: Calendar },
      { name: "Активности", href: "/admin/activities", icon: Sparkles },
      { name: "Партнёры", href: "/admin/partners", icon: Handshake },
      { name: "Aftermovie", href: "/admin/aftermovies", icon: Video },
      { name: "Новости", href: "/admin/news", icon: Newspaper },
    ]
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 hidden lg:block">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-gray-200">
        <Link href="/admin" className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">FL</span>
          </div>
          <span className="font-semibold text-gray-900">Админ-панель</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-1">
        {navigation.map((item) => {
          if ("category" in item) {
            const category = item as NavCategory;
            return (
              <div key={category.category} className="pt-4">
                <div className="px-3 mb-2 text-xs font-medium text-gray-400 uppercase tracking-wider">
                  {category.category}
                </div>
                <div className="space-y-1">
                  {category.items.map((subItem) => {
                    const isActive = pathname === subItem.href;
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
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
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
