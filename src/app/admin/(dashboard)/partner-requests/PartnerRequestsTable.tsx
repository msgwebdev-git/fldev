"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Check, X, Eye, Mail, ExternalLink, Inbox } from "lucide-react";

interface PartnerRequest {
  id: string;
  contact_name: string;
  email: string;
  company_name: string;
  website: string | null;
  category: string;
  message: string;
  logo_url: string | null;
  status: string;
  created_at: string;
}

interface PartnerRequestsTableProps {
  requests: PartnerRequest[];
}

const categoryLabels: Record<string, string> = {
  generalPartner: "Генеральный партнёр",
  partners: "Партнёры",
  generalMediaPartner: "Генеральный медиа-партнёр",
  mediaPartners: "Медиа-партнёры",
};

const statusConfig: Record<string, { label: string; className: string }> = {
  pending: {
    label: "Ожидает",
    className: "bg-yellow-100 text-yellow-800 border-yellow-200",
  },
  approved: {
    label: "Одобрена",
    className: "bg-green-100 text-green-800 border-green-200",
  },
  rejected: {
    label: "Отклонена",
    className: "bg-red-100 text-red-800 border-red-200",
  },
};

export function PartnerRequestsTable({ requests }: PartnerRequestsTableProps) {
  const router = useRouter();
  const [viewingRequest, setViewingRequest] = useState<PartnerRequest | null>(null);
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const updateStatus = async (id: string, status: string) => {
    setIsLoading(id);
    const supabase = createClient();

    await supabase
      .from("partnership_requests")
      .update({ status })
      .eq("id", id);

    setIsLoading(null);
    setViewingRequest(null);
    router.refresh();
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (requests.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
        <Inbox className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">Заявок пока нет</p>
      </div>
    );
  }

  const pendingCount = requests.filter((r) => r.status === "pending").length;

  return (
    <>
      {pendingCount > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3 text-sm text-yellow-800">
          {pendingCount} {pendingCount === 1 ? "новая заявка" : "новых заявок"} ожидает рассмотрения
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Компания
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Контакт
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Категория
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Статус
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Дата
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase w-36">
                Действия
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {requests.map((request) => {
              const status = statusConfig[request.status] || statusConfig.pending;
              return (
                <tr key={request.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-900 font-medium">
                        {request.company_name}
                      </span>
                      {request.website && (
                        <a
                          href={request.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-gray-900">{request.contact_name}</div>
                    <a
                      href={`mailto:${request.email}`}
                      className="text-xs text-gray-500 hover:text-primary flex items-center gap-1"
                    >
                      <Mail className="w-3 h-3" />
                      {request.email}
                    </a>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-gray-600">
                      {categoryLabels[request.category] || request.category}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Badge className={status.className}>{status.label}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-gray-500">
                      {formatDate(request.created_at)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-500 hover:text-gray-900"
                        onClick={() => setViewingRequest(request)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      {request.status === "pending" && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-gray-500 hover:text-green-600"
                            disabled={isLoading === request.id}
                            onClick={() => updateStatus(request.id, "approved")}
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-gray-500 hover:text-red-600"
                            disabled={isLoading === request.id}
                            onClick={() => updateStatus(request.id, "rejected")}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* View Dialog */}
      <Dialog open={!!viewingRequest} onOpenChange={() => setViewingRequest(null)}>
        <DialogContent className="bg-white border-gray-200 max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-gray-900">
              Заявка от {viewingRequest?.company_name}
            </DialogTitle>
          </DialogHeader>
          {viewingRequest && (
            <div className="space-y-4">
              {viewingRequest.logo_url && (
                <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-gray-100">
                  <Image
                    src={viewingRequest.logo_url}
                    alt={viewingRequest.company_name}
                    fill
                    className="object-contain p-2"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Контакт</span>
                  <p className="text-gray-900 font-medium">{viewingRequest.contact_name}</p>
                </div>
                <div>
                  <span className="text-gray-500">Email</span>
                  <p>
                    <a href={`mailto:${viewingRequest.email}`} className="text-primary hover:underline">
                      {viewingRequest.email}
                    </a>
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Категория</span>
                  <p className="text-gray-900">
                    {categoryLabels[viewingRequest.category] || viewingRequest.category}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Сайт</span>
                  <p>
                    {viewingRequest.website ? (
                      <a
                        href={viewingRequest.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {viewingRequest.website}
                      </a>
                    ) : (
                      <span className="text-gray-400">Не указан</span>
                    )}
                  </p>
                </div>
              </div>

              <div className="text-sm">
                <span className="text-gray-500">Сообщение</span>
                <p className="text-gray-900 mt-1 whitespace-pre-wrap">
                  {viewingRequest.message}
                </p>
              </div>

              <div className="text-sm">
                <span className="text-gray-500">Дата подачи</span>
                <p className="text-gray-900">{formatDate(viewingRequest.created_at)}</p>
              </div>

              {viewingRequest.status === "pending" && (
                <div className="flex gap-2 pt-2">
                  <Button
                    className="flex-1"
                    onClick={() => updateStatus(viewingRequest.id, "approved")}
                    disabled={isLoading === viewingRequest.id}
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Одобрить
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={() => updateStatus(viewingRequest.id, "rejected")}
                    disabled={isLoading === viewingRequest.id}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Отклонить
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
