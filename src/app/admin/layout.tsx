import "@/app/globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Админ-панель | Festivalul Lupilor",
  description: "Панель управления сайтом",
  robots: "noindex, nofollow",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body className="bg-gray-50 text-gray-900 antialiased">
        {children}
      </body>
    </html>
  );
}
