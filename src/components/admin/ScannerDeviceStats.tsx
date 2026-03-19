"use client";

import { useEffect, useState } from "react";
import { Smartphone, Loader2, WifiOff } from "lucide-react";

interface DeviceStat {
  deviceId: string;
  checkins: number;
  lastScanAt: string | null;
}

function formatTime(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Chisinau",
  });
}

function formatDate(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "short",
    timeZone: "Europe/Chisinau",
  });
}

export function ScannerDeviceStats() {
  const [devices, setDevices] = useState<DeviceStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDevices = async () => {
    try {
      const res = await fetch("/api/admin/scan-devices");
      if (!res.ok) throw new Error(`${res.status}`);
      const json = await res.json();
      setDevices(json.data || []);
      setError(null);
    } catch {
      setError("Не удалось загрузить");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
    const interval = setInterval(fetchDevices, 15_000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center gap-3 text-gray-400">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm">Загрузка устройств...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl border border-red-200 p-5">
        <div className="flex items-center gap-3">
          <WifiOff className="w-5 h-5 text-red-400" />
          <span className="text-sm text-red-500">{error}</span>
        </div>
      </div>
    );
  }

  if (devices.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
        <Smartphone className="w-8 h-8 text-gray-300 mx-auto mb-3" />
        <p className="text-sm text-gray-500">Нет активных сканеров</p>
        <p className="text-xs text-gray-400 mt-1">Устройства появятся после первого сканирования</p>
      </div>
    );
  }

  const sorted = [...devices].sort((a, b) => b.checkins - a.checkins);
  const totalCheckins = sorted.reduce((sum, d) => sum + d.checkins, 0);

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Устройство
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Check-ins
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
              % от всех
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
              Последний скан
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sorted.map((device) => {
            const percent = totalCheckins > 0
              ? Math.round((device.checkins / totalCheckins) * 100)
              : 0;

            return (
              <tr key={device.deviceId} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-lg bg-blue-50">
                      <Smartphone className="w-4 h-4 text-blue-600" />
                    </div>
                    <span className="text-sm font-mono font-medium text-gray-900">
                      {device.deviceId}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="text-sm font-bold text-gray-900">
                    {device.checkins.toLocaleString("ru-RU")}
                  </span>
                </td>
                <td className="px-4 py-3 text-right hidden sm:table-cell">
                  <span className="text-sm text-gray-500">{percent}%</span>
                </td>
                <td className="px-4 py-3 text-right hidden md:table-cell">
                  <div className="text-sm text-gray-500">
                    {formatTime(device.lastScanAt)}
                    <span className="text-xs text-gray-400 ml-1">
                      {formatDate(device.lastScanAt)}
                    </span>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot className="bg-gray-50">
          <tr>
            <td className="px-4 py-3 text-sm font-medium text-gray-700">
              Всего: {sorted.length} устройств
            </td>
            <td className="px-4 py-3 text-right text-sm font-bold text-gray-900">
              {totalCheckins.toLocaleString("ru-RU")}
            </td>
            <td className="px-4 py-3 hidden sm:table-cell" />
            <td className="px-4 py-3 hidden md:table-cell" />
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
