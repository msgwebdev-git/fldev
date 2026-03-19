import { TicketCacheStatus } from "@/components/admin/TicketCacheStatus";
import { ScannerDeviceStats } from "@/components/admin/ScannerDeviceStats";

export const dynamic = "force-dynamic";

export default function ScanningPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Сканирование</h1>
        <p className="text-gray-500 mt-1">Статус кеша, устройства и check-in статистика</p>
      </div>

      {/* Cache Status */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Кеш билетов</h2>
        <TicketCacheStatus />
      </section>

      {/* Scanner Devices */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Устройства</h2>
        <ScannerDeviceStats />
      </section>
    </div>
  );
}
