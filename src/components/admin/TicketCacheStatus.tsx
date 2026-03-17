"use client";

import { useEffect, useState } from "react";
import { Database, RefreshCw, CheckCircle, XCircle, Loader2, Wifi } from "lucide-react";

interface CacheStatus {
  ready: boolean;
  totalTickets: number;
  regular: { total: number; checkedIn: number };
  b2b: { total: number; checkedIn: number };
  pendingWrites: number;
}

export function TicketCacheStatus() {
  const [status, setStatus] = useState<CacheStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStatus = async () => {
    try {
      const res = await fetch("/api/admin/scan-cache");
      if (!res.ok) throw new Error(`${res.status}`);
      const json = await res.json();
      setStatus(json.data);
      setError(null);
    } catch (err) {
      setError("Сервер недоступен");
      setStatus(null);
    } finally {
      setLoading(false);
    }
  };

  const handleWarmup = async () => {
    setRefreshing(true);
    try {
      const res = await fetch("/api/admin/scan-cache", { method: "POST" });
      if (!res.ok) throw new Error(`${res.status}`);
      await fetchStatus();
    } catch {
      setError("Ошибка обновления кеша");
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30_000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center gap-3 text-gray-400">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm">Загрузка статуса кеша...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl border border-red-200 p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-50">
              <XCircle className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Кеш билетов</p>
              <p className="text-xs text-red-500">{error}</p>
            </div>
          </div>
          <button
            onClick={fetchStatus}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  if (!status) return null;

  const totalCheckedIn = status.regular.checkedIn + status.b2b.checkedIn;
  const checkinPercent = status.totalTickets > 0
    ? Math.round((totalCheckedIn / status.totalTickets) * 100)
    : 0;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${status.ready ? "bg-green-50" : "bg-yellow-50"}`}>
            <Database className={`w-5 h-5 ${status.ready ? "text-green-600" : "text-yellow-600"}`} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">Кеш билетов</p>
            <div className="flex items-center gap-1.5">
              {status.ready ? (
                <>
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  <span className="text-xs text-green-600">Активен</span>
                </>
              ) : (
                <>
                  <Loader2 className="w-3 h-3 text-yellow-500 animate-spin" />
                  <span className="text-xs text-yellow-600">Загружается...</span>
                </>
              )}
            </div>
          </div>
        </div>
        <button
          onClick={handleWarmup}
          disabled={refreshing}
          className="p-2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          title="Перезагрузить кеш"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <p className="text-2xl font-bold text-gray-900">{status.totalTickets}</p>
          <p className="text-xs text-gray-500 mt-0.5">В кеше</p>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <p className="text-2xl font-bold text-gray-900">{totalCheckedIn}</p>
          <p className="text-xs text-gray-500 mt-0.5">Check-in</p>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <p className="text-2xl font-bold text-gray-900">{checkinPercent}%</p>
          <p className="text-xs text-gray-500 mt-0.5">Прошли</p>
        </div>
      </div>

      {/* Progress bar */}
      {status.totalTickets > 0 && (
        <div className="mt-3">
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full transition-all duration-500"
              style={{ width: `${checkinPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Details */}
      <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
        <span>Обычные: {status.regular.checkedIn}/{status.regular.total}</span>
        <span>B2B: {status.b2b.checkedIn}/{status.b2b.total}</span>
        {status.pendingWrites > 0 && (
          <span className="flex items-center gap-1 text-yellow-500">
            <Wifi className="w-3 h-3" />
            Записывается: {status.pendingWrites}
          </span>
        )}
      </div>
    </div>
  );
}
