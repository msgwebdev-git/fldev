"use client";

import { Tag, Percent, ShoppingCart, TrendingDown, CheckCircle, XCircle, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface PromoCodeData {
  code: string;
  discountPercent: number | null;
  discountAmount: number | null;
  usageLimit: number | null;
  usedCount: number;
  isActive: boolean;
  validUntil: string | null;
  ordersCount: number;
  totalDiscount: number;
  totalRevenue: number;
}

interface PromoStatsProps {
  data: {
    promoCodes: PromoCodeData[];
    totalDiscountGiven: number;
    totalOrdersWithPromo: number;
  };
}

function formatPrice(amount: number) {
  return `${amount.toLocaleString("ru-RU")} MDL`;
}

function isExpired(validUntil: string | null): boolean {
  if (!validUntil) return false;
  return new Date(validUntil) < new Date();
}

export function PromoStats({ data }: PromoStatsProps) {
  const { promoCodes, totalDiscountGiven, totalOrdersWithPromo } = data;

  if (promoCodes.length === 0) {
    return (
      <div className="h-[200px] flex items-center justify-center text-gray-500">
        <p>Промокоды не созданы</p>
      </div>
    );
  }

  const activeCodes = promoCodes.filter((p) => p.isActive && !isExpired(p.validUntil));
  const totalUsed = promoCodes.reduce((s, p) => s + p.usedCount, 0);

  return (
    <div className="space-y-5">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 rounded-lg bg-blue-50 text-center">
          <p className="text-xs text-gray-500">Активных</p>
          <p className="text-xl font-bold text-blue-700">{activeCodes.length}</p>
        </div>
        <div className="p-3 rounded-lg bg-green-50 text-center">
          <p className="text-xs text-gray-500">Использований</p>
          <p className="text-xl font-bold text-green-700">{totalUsed}</p>
        </div>
        <div className="p-3 rounded-lg bg-orange-50 text-center">
          <p className="text-xs text-gray-500">Скидки всего</p>
          <p className="text-xl font-bold text-orange-700">{formatPrice(totalDiscountGiven)}</p>
        </div>
      </div>

      {/* Promo codes table */}
      <div className="max-h-[350px] overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="text-gray-500 border-b sticky top-0 bg-white">
            <tr>
              <th className="text-left py-2 font-medium">Код</th>
              <th className="text-center py-2 font-medium">Скидка</th>
              <th className="text-center py-2 font-medium">Исп-но</th>
              <th className="text-right py-2 font-medium">Статус</th>
            </tr>
          </thead>
          <tbody>
            {promoCodes.map((promo) => {
              const expired = isExpired(promo.validUntil);
              const exhausted = promo.usageLimit !== null && promo.usedCount >= promo.usageLimit;
              const usagePct = promo.usageLimit ? Math.round((promo.usedCount / promo.usageLimit) * 100) : null;

              return (
                <tr key={promo.code} className="border-b border-gray-100">
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <div>
                        <code className="font-mono font-semibold text-gray-900">{promo.code}</code>
                        {promo.ordersCount > 0 && (
                          <p className="text-xs text-gray-400 mt-0.5">
                            {promo.ordersCount} заказов • скидки {formatPrice(promo.totalDiscount)}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 text-center">
                    <span className="inline-flex items-center gap-1 text-gray-700 font-medium">
                      {promo.discountPercent ? (
                        <>{promo.discountPercent}%</>
                      ) : promo.discountAmount ? (
                        <>{promo.discountAmount} MDL</>
                      ) : (
                        "—"
                      )}
                    </span>
                  </td>
                  <td className="py-3 text-center">
                    <div>
                      <span className="font-medium text-gray-900">{promo.usedCount}</span>
                      {promo.usageLimit && (
                        <span className="text-gray-400">/{promo.usageLimit}</span>
                      )}
                      {usagePct !== null && (
                        <div className="w-full bg-gray-100 rounded-full h-1 mt-1">
                          <div
                            className={`h-1 rounded-full ${usagePct >= 90 ? "bg-red-500" : usagePct >= 50 ? "bg-amber-500" : "bg-green-500"}`}
                            style={{ width: `${Math.min(usagePct, 100)}%` }}
                          />
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-3 text-right">
                    {!promo.isActive ? (
                      <Badge variant="outline" className="bg-gray-50 text-gray-500 border-gray-200 text-xs">
                        <XCircle className="w-3 h-3 mr-1" />Выключен
                      </Badge>
                    ) : expired ? (
                      <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200 text-xs">
                        <Clock className="w-3 h-3 mr-1" />Истёк
                      </Badge>
                    ) : exhausted ? (
                      <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200 text-xs">
                        <XCircle className="w-3 h-3 mr-1" />Исчерпан
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200 text-xs">
                        <CheckCircle className="w-3 h-3 mr-1" />Активен
                      </Badge>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
