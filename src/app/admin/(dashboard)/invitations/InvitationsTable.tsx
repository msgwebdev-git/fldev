"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Copy, Download, Eye, Gift, MoreHorizontal, RefreshCw } from "lucide-react";

interface Invitation {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  promo_code: string | null; // Used for note
  created_at: string;
  items: Array<{
    id: string;
    ticket_code: string;
    ticket: {
      name_ro: string;
      name_ru: string;
    } | null;
  }>;
}

interface InvitationsTableProps {
  invitations: Invitation[];
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function InvitationsTable({ invitations }: InvitationsTableProps) {
  const router = useRouter();
  const [resending, setResending] = useState<string | null>(null);

  const handleResend = async (orderId: string) => {
    setResending(orderId);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      const response = await fetch(`${apiUrl}/api/admin/orders/${orderId}/resend-tickets`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to resend");
      }

      alert("Приглашение отправлено повторно!");
    } catch (error) {
      console.error("Resend error:", error);
      alert("Ошибка при повторной отправке");
    } finally {
      setResending(null);
    }
  };

  if (invitations.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
        <Gift className="w-12 h-12 mx-auto text-gray-300 mb-4" />
        <p className="text-gray-500">Приглашения пока не созданы</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50/50">
            <TableHead className="font-medium">Номер</TableHead>
            <TableHead className="font-medium">Получатель</TableHead>
            <TableHead className="font-medium">Билеты</TableHead>
            <TableHead className="font-medium">Заметка</TableHead>
            <TableHead className="font-medium">Дата</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invitations.map((invitation) => (
            <TableRow key={invitation.id} className="hover:bg-gray-50">
              <TableCell>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className="bg-amber-50 text-amber-700 border-amber-200 font-mono"
                  >
                    {invitation.order_number}
                  </Badge>
                </div>
              </TableCell>
              <TableCell>
                <div>
                  <p className="font-medium">{invitation.customer_name}</p>
                  <p className="text-xs text-gray-500">{invitation.customer_email}</p>
                </div>
              </TableCell>
              <TableCell>
                <span className="text-gray-600">{invitation.items.length} шт.</span>
              </TableCell>
              <TableCell>
                <span className="text-gray-500 text-sm">
                  {invitation.promo_code || "—"}
                </span>
              </TableCell>
              <TableCell>
                <span className="text-gray-600 text-sm">
                  {formatDate(invitation.created_at)}
                </span>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => router.push(`/admin/orders/${invitation.id}`)}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Открыть
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleResend(invitation.id)}
                      disabled={resending === invitation.id}
                    >
                      <RefreshCw
                        className={`mr-2 h-4 w-4 ${
                          resending === invitation.id ? "animate-spin" : ""
                        }`}
                      />
                      Отправить повторно
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        const apiUrl =
                          process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
                        window.open(
                          `${apiUrl}/api/checkout/tickets/${invitation.order_number}/download`,
                          "_blank"
                        );
                      }}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Скачать билеты
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        navigator.clipboard.writeText(invitation.order_number);
                      }}
                    >
                      <Copy className="mr-2 h-4 w-4" />
                      Копировать номер
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
