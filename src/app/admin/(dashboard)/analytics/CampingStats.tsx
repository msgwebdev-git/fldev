"use client";

import { Tent, Car, Caravan, HelpCircle } from "lucide-react";

interface CampingOptionStats {
  optionName: string;
  optionNameRu: string;
  ticketType: string;
  count: number;
}

interface CampingStatsProps {
  data: {
    options: CampingOptionStats[];
    totalCamping: number;
    withOption: number;
    withoutOption: number;
  };
}

const OPTION_CONFIG: Record<string, { icon: typeof Tent; color: string; bg: string }> = {
  "Tent Spot": { icon: Tent, color: "text-green-600", bg: "bg-green-50" },
  "Parking Spot": { icon: Car, color: "text-blue-600", bg: "bg-blue-50" },
  "Camper / RV Spot": { icon: Caravan, color: "text-amber-600", bg: "bg-amber-50" },
};

function getOptionConfig(name: string) {
  for (const [key, config] of Object.entries(OPTION_CONFIG)) {
    if (name.includes(key)) return config;
  }
  return { icon: HelpCircle, color: "text-gray-600", bg: "bg-gray-50" };
}

export function CampingStats({ data }: CampingStatsProps) {
  const { options, totalCamping, withOption, withoutOption } = data;

  // Aggregate by option type (merge campingPass + familyCampingPass)
  const aggregated = new Map<string, { name: string; nameRu: string; count: number }>();
  for (const opt of options) {
    const key = opt.optionName;
    if (!aggregated.has(key)) {
      aggregated.set(key, { name: opt.optionName, nameRu: opt.optionNameRu, count: 0 });
    }
    aggregated.get(key)!.count += opt.count;
  }
  const merged = Array.from(aggregated.values()).sort((a, b) => b.count - a.count);

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-lg bg-gray-50">
          <p className="text-sm text-gray-500">Всего Camping</p>
          <p className="text-2xl font-bold text-gray-900">{totalCamping}</p>
          <p className="text-xs text-gray-400 mt-1">билетов</p>
        </div>
        <div className="p-4 rounded-lg bg-green-50">
          <p className="text-sm text-gray-500">С опцией</p>
          <p className="text-2xl font-bold text-green-700">{withOption}</p>
          <p className="text-xs text-green-500 mt-1">
            {totalCamping > 0 ? Math.round((withOption / totalCamping) * 100) : 0}%
          </p>
        </div>
        <div className="p-4 rounded-lg bg-yellow-50">
          <p className="text-sm text-gray-500">Без опции</p>
          <p className="text-2xl font-bold text-yellow-700">{withoutOption}</p>
          <p className="text-xs text-yellow-500 mt-1">
            {totalCamping > 0 ? Math.round((withoutOption / totalCamping) * 100) : 0}%
          </p>
        </div>
        <div className="p-4 rounded-lg bg-blue-50">
          <p className="text-sm text-gray-500">Типов опций</p>
          <p className="text-2xl font-bold text-blue-700">{merged.length}</p>
          <p className="text-xs text-blue-500 mt-1">вариантов</p>
        </div>
      </div>

      {/* Option bars */}
      <div className="space-y-3">
        {merged.map((opt) => {
          const config = getOptionConfig(opt.name);
          const Icon = config.icon;
          const pct = withOption > 0 ? Math.round((opt.count / withOption) * 100) : 0;

          return (
            <div key={opt.name} className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-lg ${config.bg} flex items-center justify-center flex-shrink-0`}>
                <Icon className={`w-5 h-5 ${config.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-900 truncate">{opt.name}</span>
                  <span className="text-sm font-bold text-gray-900 ml-2">{opt.count}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      config.color.includes("green") ? "bg-green-500" :
                      config.color.includes("blue") ? "bg-blue-500" :
                      config.color.includes("amber") ? "bg-amber-500" : "bg-gray-500"
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-0.5">{pct}% от всех опций</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail table by ticket type */}
      {options.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-medium text-gray-500 mb-2">По типам билетов</h3>
          <table className="w-full text-sm">
            <thead className="text-gray-500 border-b">
              <tr>
                <th className="text-left py-2 font-medium">Опция</th>
                <th className="text-left py-2 font-medium">Тип билета</th>
                <th className="text-right py-2 font-medium">Кол-во</th>
              </tr>
            </thead>
            <tbody>
              {options.map((opt, i) => {
                const config = getOptionConfig(opt.optionName);
                const Icon = config.icon;
                return (
                  <tr key={i} className="border-b border-gray-100">
                    <td className="py-2">
                      <div className="flex items-center gap-2">
                        <Icon className={`w-4 h-4 ${config.color}`} />
                        <span>{opt.optionName}</span>
                      </div>
                    </td>
                    <td className="py-2 text-gray-500">{opt.ticketType}</td>
                    <td className="py-2 text-right font-medium">{opt.count}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
