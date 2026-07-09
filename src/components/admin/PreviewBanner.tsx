"use client";

import { usePathname } from "next/navigation";
import { Eye } from "lucide-react";

/**
 * Shown to an admin viewing a publicly-hidden page via Draft Mode preview
 * (see /api/admin/preview). Regular visitors never see this — they get 404.
 */
export function PreviewBanner() {
  const pathname = usePathname();

  return (
    <div className="sticky top-0 z-[60] flex items-center justify-center gap-3 bg-amber-500 px-4 py-2 text-sm font-semibold text-amber-950">
      <Eye className="h-4 w-4 flex-shrink-0" />
      <span>Предпросмотр: страница скрыта для посетителей — её видите только вы</span>
      <a
        href={`/api/admin/preview?off=1&path=${encodeURIComponent(pathname || "/")}`}
        className="rounded-full bg-amber-950/15 px-3 py-0.5 text-xs font-bold hover:bg-amber-950/25"
      >
        Выйти
      </a>
    </div>
  );
}
