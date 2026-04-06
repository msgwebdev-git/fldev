"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { API_URL } from "@/lib/env";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import {
  ArrowUpDown,
  Search,
  Eye,
  Copy,
  MoreHorizontal,
  Download,
  RefreshCw,
  Gift,
  CheckCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  Mail,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export interface InvitationData {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  promo_code: string | null;
  created_at: string;
  items: Array<{
    id: string;
    ticket_code: string;
    pdf_url: string | null;
    ticket: { name_ro: string; name_ru: string } | null;
  }>;
}

interface InvitationsTableProps {
  invitations: InvitationData[];
}

function formatDate(dateStr: string) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateStr));
}

export function InvitationsTable({ invitations }: InvitationsTableProps) {
  const router = useRouter();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [dateFilter, setDateFilter] = React.useState<string>("all");
  const [resending, setResending] = React.useState<string | null>(null);

  const getDateRange = React.useCallback((filter: string) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    switch (filter) {
      case "today":
        return { from: today, to: new Date(today.getTime() + 86400000) };
      case "week":
        return { from: new Date(today.getTime() - 7 * 86400000), to: new Date(today.getTime() + 86400000) };
      case "month":
        return { from: new Date(today.getFullYear(), today.getMonth() - 1, today.getDate()), to: new Date(today.getTime() + 86400000) };
      default:
        return { from: null, to: null };
    }
  }, []);

  // Filter data
  const filtered = React.useMemo(() => {
    let result = invitations;

    // Status: sent vs unsent
    if (statusFilter === "sent") {
      result = result.filter((inv) => inv.items.every((i) => i.pdf_url));
    } else if (statusFilter === "unsent") {
      result = result.filter((inv) => inv.items.some((i) => !i.pdf_url));
    }

    // Date
    if (dateFilter !== "all") {
      const { from, to } = getDateRange(dateFilter);
      result = result.filter((inv) => {
        const d = new Date(inv.created_at);
        if (from && d < from) return false;
        if (to && d >= to) return false;
        return true;
      });
    }

    // Search
    if (globalFilter) {
      const s = globalFilter.toLowerCase();
      result = result.filter(
        (inv) =>
          inv.order_number.toLowerCase().includes(s) ||
          inv.customer_name.toLowerCase().includes(s) ||
          inv.customer_email.toLowerCase().includes(s) ||
          (inv.promo_code || "").toLowerCase().includes(s)
      );
    }

    return result;
  }, [invitations, statusFilter, dateFilter, getDateRange, globalFilter]);

  const handleResend = async (orderId: string) => {
    setResending(orderId);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/resend-tickets`, { method: "POST" });
      if (!res.ok) throw new Error("Failed");
      alert("Приглашение отправлено повторно!");
    } catch {
      alert("Ошибка при отправке");
    } finally {
      setResending(null);
    }
  };

  const columns: ColumnDef<InvitationData>[] = [
    {
      accessorKey: "order_number",
      header: ({ column }) => (
        <Button variant="ghost" className="-ml-4" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Номер <ArrowUpDown className="ml-1 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => (
        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 font-mono text-xs">
          {row.getValue("order_number")}
        </Badge>
      ),
    },
    {
      accessorKey: "customer_name",
      header: ({ column }) => (
        <Button variant="ghost" className="-ml-4" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Получатель <ArrowUpDown className="ml-1 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => (
        <div>
          <p className="font-medium text-sm">{row.original.customer_name}</p>
          <p className="text-xs text-gray-500">{row.original.customer_email}</p>
        </div>
      ),
    },
    {
      id: "tickets",
      header: "Билеты",
      cell: ({ row }) => (
        <span className="text-sm text-gray-600">{row.original.items.length}</span>
      ),
    },
    {
      accessorKey: "promo_code",
      header: "Заметка",
      cell: ({ row }) => (
        <span className="text-sm text-gray-500 max-w-[200px] truncate block">
          {row.original.promo_code || "—"}
        </span>
      ),
    },
    {
      id: "status",
      header: "Статус",
      cell: ({ row }) => {
        const allSent = row.original.items.length > 0 && row.original.items.every((i) => i.pdf_url);
        return allSent ? (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 gap-1">
            <CheckCircle className="h-3 w-3" />
            Отправлено
          </Badge>
        ) : (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 gap-1">
            <Clock className="h-3 w-3" />
            Ожидает
          </Badge>
        );
      },
    },
    {
      accessorKey: "created_at",
      header: ({ column }) => (
        <Button variant="ghost" className="-ml-4" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Дата <ArrowUpDown className="ml-1 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => (
        <span className="text-sm text-gray-600">{formatDate(row.getValue("created_at"))}</span>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const inv = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => router.push(`/admin/orders/${inv.id}`)}>
                <Eye className="mr-2 h-4 w-4" />
                Открыть
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleResend(inv.id)} disabled={resending === inv.id}>
                <RefreshCw className={`mr-2 h-4 w-4 ${resending === inv.id ? "animate-spin" : ""}`} />
                Отправить повторно
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  window.open(`${API_URL}/api/checkout/tickets/${inv.order_number}/download`, "_blank");
                }}
              >
                <Download className="mr-2 h-4 w-4" />
                Скачать билеты
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(inv.customer_email)}>
                <Mail className="mr-2 h-4 w-4" />
                Копировать email
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(inv.order_number)}>
                <Copy className="mr-2 h-4 w-4" />
                Копировать номер
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data: filtered,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 20 } },
  });

  const hasFilters = globalFilter || statusFilter !== "all" || dateFilter !== "all";

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Поиск по имени, email, номеру..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Статус" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все статусы</SelectItem>
            <SelectItem value="sent">Отправлено</SelectItem>
            <SelectItem value="unsent">Ожидает</SelectItem>
          </SelectContent>
        </Select>
        <Select value={dateFilter} onValueChange={setDateFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Дата" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все даты</SelectItem>
            <SelectItem value="today">Сегодня</SelectItem>
            <SelectItem value="week">Неделя</SelectItem>
            <SelectItem value="month">Месяц</SelectItem>
          </SelectContent>
        </Select>
        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { setGlobalFilter(""); setStatusFilter("all"); setDateFilter("all"); }}
          >
            Сбросить
          </Button>
        )}
      </div>

      {/* Results count */}
      <p className="text-sm text-gray-500">
        {filtered.length === invitations.length
          ? `Всего: ${invitations.length}`
          : `Найдено: ${filtered.length} из ${invitations.length}`}
      </p>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/50">
              {table.getHeaderGroups().map((hg) =>
                hg.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className="hover:bg-gray-50">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-32 text-center">
                  <Gift className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                  <p className="text-gray-500">
                    {hasFilters ? "Ничего не найдено" : "Приглашения пока не созданы"}
                  </p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {table.getPageCount() > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Страница {table.getState().pagination.pageIndex + 1} из {table.getPageCount()}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
