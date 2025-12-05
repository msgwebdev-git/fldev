"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  ColumnDef,
  ColumnFiltersState,
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
  Filter,
  X,
  Mail,
  Package,
  Calendar,
  Gift,
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
  DropdownMenuLabel,
  DropdownMenuSeparator,
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
import { OrderData } from "./page";

interface OrdersTableProps {
  orders: OrderData[];
}

const statusConfig: Record<string, { label: string; className: string }> = {
  pending: { label: "Ожидает", className: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  paid: { label: "Оплачен", className: "bg-green-100 text-green-800 border-green-200" },
  failed: { label: "Ошибка", className: "bg-red-100 text-red-800 border-red-200" },
  expired: { label: "Истёк", className: "bg-gray-100 text-gray-800 border-gray-200" },
  cancelled: { label: "Отменён", className: "bg-gray-100 text-gray-800 border-gray-200" },
  refunded: { label: "Возврат", className: "bg-purple-100 text-purple-800 border-purple-200" },
};

const paymentStatusConfig: Record<string, { label: string; className: string }> = {
  pending: { label: "Ожидает", className: "bg-yellow-100 text-yellow-800" },
  ok: { label: "Успешно", className: "bg-green-100 text-green-800" },
  failed: { label: "Ошибка", className: "bg-red-100 text-red-800" },
  reversed: { label: "Отменён", className: "bg-purple-100 text-purple-800" },
};

function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] || { label: status, className: "bg-gray-100 text-gray-800" };
  return (
    <Badge variant="outline" className={`${config.className} font-medium`}>
      {config.label}
    </Badge>
  );
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

function formatPrice(amount: number) {
  return `${amount.toLocaleString("ru-RU")} MDL`;
}

export function OrdersTable({ orders }: OrdersTableProps) {
  const router = useRouter();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [typeFilter, setTypeFilter] = React.useState<string>("all");
  const [dateFilter, setDateFilter] = React.useState<string>("all");
  const [customDateFrom, setCustomDateFrom] = React.useState<string>("");
  const [customDateTo, setCustomDateTo] = React.useState<string>("");

  const getDateRange = React.useCallback((filter: string): { from: Date | null; to: Date | null } => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (filter) {
      case "today":
        return { from: today, to: new Date(today.getTime() + 24 * 60 * 60 * 1000) };
      case "week": {
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        return { from: weekAgo, to: new Date(today.getTime() + 24 * 60 * 60 * 1000) };
      }
      case "month": {
        const monthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
        return { from: monthAgo, to: new Date(today.getTime() + 24 * 60 * 60 * 1000) };
      }
      case "custom": {
        const from = customDateFrom ? new Date(customDateFrom) : null;
        const to = customDateTo ? new Date(new Date(customDateTo).getTime() + 24 * 60 * 60 * 1000) : null;
        return { from, to };
      }
      default:
        return { from: null, to: null };
    }
  }, [customDateFrom, customDateTo]);

  const filteredOrders = React.useMemo(() => {
    let result = orders;

    // Filter by type (orders vs invitations)
    if (typeFilter !== "all") {
      if (typeFilter === "invitation") {
        result = result.filter((order) => order.is_invitation === true);
      } else if (typeFilter === "order") {
        result = result.filter((order) => !order.is_invitation);
      }
    }

    if (statusFilter !== "all") {
      result = result.filter((order) => order.status === statusFilter);
    }

    if (dateFilter !== "all") {
      const { from, to } = getDateRange(dateFilter);
      result = result.filter((order) => {
        const orderDate = new Date(order.created_at);
        if (from && orderDate < from) return false;
        if (to && orderDate >= to) return false;
        return true;
      });
    }

    if (globalFilter) {
      const search = globalFilter.toLowerCase();
      result = result.filter(
        (order) =>
          order.order_number.toLowerCase().includes(search) ||
          order.customer_email.toLowerCase().includes(search) ||
          order.customer_name.toLowerCase().includes(search) ||
          order.customer_phone.includes(search)
      );
    }

    return result;
  }, [orders, statusFilter, typeFilter, dateFilter, getDateRange, globalFilter]);

  const columns: ColumnDef<OrderData>[] = [
    {
      accessorKey: "order_number",
      header: ({ column }) => (
        <Button
          variant="ghost"
          className="-ml-4"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Номер заказа
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span className="font-mono font-medium text-primary">
            {row.getValue("order_number")}
          </span>
          {row.original.is_invitation && (
            <Badge
              variant="outline"
              className="bg-amber-50 text-amber-700 border-amber-200 text-xs"
            >
              <Gift className="w-3 h-3 mr-1" />
              Приглашение
            </Badge>
          )}
        </div>
      ),
    },
    {
      accessorKey: "customer_name",
      header: "Клиент",
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.customer_name}</p>
          <p className="text-xs text-gray-500">{row.original.customer_email}</p>
        </div>
      ),
    },
    {
      accessorKey: "total_amount",
      header: ({ column }) => (
        <Button
          variant="ghost"
          className="-ml-4"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Сумма
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const total = Number(row.getValue("total_amount"));
        const discount = Number(row.original.discount_amount || 0);
        return (
          <div>
            <p className="font-medium">{formatPrice(total - discount)}</p>
            {discount > 0 && (
              <p className="text-xs text-green-600">-{formatPrice(discount)}</p>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "items",
      header: "Билеты",
      cell: ({ row }) => {
        const items = row.original.items || [];
        const totalTickets = items.reduce((sum, item) => sum + item.quantity, 0);
        return (
          <span className="text-gray-600">
            {totalTickets} шт.
          </span>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Статус",
      cell: ({ row }) => <StatusBadge status={row.getValue("status")} />,
    },
    {
      accessorKey: "created_at",
      header: ({ column }) => (
        <Button
          variant="ghost"
          className="-ml-4"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Дата
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <span className="text-gray-600 text-sm">
          {formatDate(row.getValue("created_at"))}
        </span>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const order = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Открыть меню</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Действия</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => router.push(`/admin/orders/${order.id}`)}>
                <Eye className="mr-2 h-4 w-4" />
                Открыть заказ
              </DropdownMenuItem>
              {order.status === "paid" && (
                <DropdownMenuItem
                  onClick={() => {
                    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
                    window.open(`${apiUrl}/api/checkout/tickets/${order.order_number}/download`, "_blank");
                  }}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Скачать билеты
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={() => {
                  navigator.clipboard.writeText(order.order_number);
                }}
              >
                <Copy className="mr-2 h-4 w-4" />
                Копировать номер
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  navigator.clipboard.writeText(order.customer_email);
                }}
              >
                <Mail className="mr-2 h-4 w-4" />
                Копировать email
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data: filteredOrders,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
    initialState: {
      pagination: {
        pageSize: 20,
      },
    },
  });

  const exportToCSV = () => {
    const headers = ["Номер заказа", "Клиент", "Email", "Телефон", "Сумма", "Скидка", "Статус", "Дата"];
    const rows = filteredOrders.map((order) => [
      order.order_number,
      order.customer_name,
      order.customer_email,
      order.customer_phone,
      order.total_amount,
      order.discount_amount || 0,
      statusConfig[order.status]?.label || order.status,
      formatDate(order.created_at),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `orders-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200">
      {/* Toolbar */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Поиск по номеру, email, имени или телефону..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="pl-9 max-w-md"
            />
            {globalFilter && (
              <button
                onClick={() => setGlobalFilter("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[150px]">
                <Gift className="h-4 w-4 mr-2 text-gray-400" />
                <SelectValue placeholder="Тип" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все</SelectItem>
                <SelectItem value="order">Заказы</SelectItem>
                <SelectItem value="invitation">Приглашения</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px]">
                <Filter className="h-4 w-4 mr-2 text-gray-400" />
                <SelectValue placeholder="Статус" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все статусы</SelectItem>
                <SelectItem value="pending">Ожидает</SelectItem>
                <SelectItem value="paid">Оплачен</SelectItem>
                <SelectItem value="failed">Ошибка</SelectItem>
                <SelectItem value="expired">Истёк</SelectItem>
                <SelectItem value="cancelled">Отменён</SelectItem>
                <SelectItem value="refunded">Возврат</SelectItem>
              </SelectContent>
            </Select>

            <Select value={dateFilter} onValueChange={(value) => {
              setDateFilter(value);
              if (value !== "custom") {
                setCustomDateFrom("");
                setCustomDateTo("");
              }
            }}>
              <SelectTrigger className="w-[160px]">
                <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                <SelectValue placeholder="Период" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все время</SelectItem>
                <SelectItem value="today">Сегодня</SelectItem>
                <SelectItem value="week">За неделю</SelectItem>
                <SelectItem value="month">За месяц</SelectItem>
                <SelectItem value="custom">Диапазон...</SelectItem>
              </SelectContent>
            </Select>

            {dateFilter === "custom" && (
              <div className="flex items-center gap-2">
                <Input
                  type="date"
                  value={customDateFrom}
                  onChange={(e) => setCustomDateFrom(e.target.value)}
                  className="w-[140px]"
                  placeholder="От"
                />
                <span className="text-gray-400">—</span>
                <Input
                  type="date"
                  value={customDateTo}
                  onChange={(e) => setCustomDateTo(e.target.value)}
                  className="w-[140px]"
                  placeholder="До"
                />
              </div>
            )}

            <Button variant="outline" onClick={exportToCSV}>
              <Download className="h-4 w-4 mr-2" />
              Экспорт
            </Button>
          </div>
        </div>

        {/* Active filters */}
        {(globalFilter || statusFilter !== "all" || typeFilter !== "all" || dateFilter !== "all") && (
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <span className="text-sm text-gray-500">Фильтры:</span>
            {globalFilter && (
              <Badge variant="secondary" className="gap-1">
                Поиск: {globalFilter}
                <button onClick={() => setGlobalFilter("")}>
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {typeFilter !== "all" && (
              <Badge variant="secondary" className="gap-1">
                Тип: {typeFilter === "invitation" ? "Приглашения" : "Заказы"}
                <button onClick={() => setTypeFilter("all")}>
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {statusFilter !== "all" && (
              <Badge variant="secondary" className="gap-1">
                Статус: {statusConfig[statusFilter]?.label}
                <button onClick={() => setStatusFilter("all")}>
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {dateFilter !== "all" && (
              <Badge variant="secondary" className="gap-1">
                Период: {dateFilter === "today" ? "Сегодня" :
                        dateFilter === "week" ? "За неделю" :
                        dateFilter === "month" ? "За месяц" :
                        `${customDateFrom || "..."} — ${customDateTo || "..."}`}
                <button onClick={() => {
                  setDateFilter("all");
                  setCustomDateFrom("");
                  setCustomDateTo("");
                }}>
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            <button
              onClick={() => {
                setGlobalFilter("");
                setStatusFilter("all");
                setTypeFilter("all");
                setDateFilter("all");
                setCustomDateFrom("");
                setCustomDateTo("");
              }}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Сбросить все
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="bg-gray-50/50">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="font-medium">
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => router.push(`/admin/orders/${row.original.id}`)}
                >
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
                  <div className="text-gray-500">
                    <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Заказы не найдены</p>
                    {(globalFilter || statusFilter !== "all" || typeFilter !== "all" || dateFilter !== "all") && (
                      <button
                        onClick={() => {
                          setGlobalFilter("");
                          setStatusFilter("all");
                          setTypeFilter("all");
                          setDateFilter("all");
                          setCustomDateFrom("");
                          setCustomDateTo("");
                        }}
                        className="text-primary hover:underline mt-1"
                      >
                        Сбросить фильтры
                      </button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between p-4 border-t border-gray-200">
        <div className="text-sm text-gray-500">
          Показано {table.getRowModel().rows.length} из {filteredOrders.length} заказов
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Назад
          </Button>
          <span className="text-sm text-gray-600">
            Страница {table.getState().pagination.pageIndex + 1} из{" "}
            {table.getPageCount() || 1}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Вперёд
          </Button>
        </div>
      </div>

    </div>
  );
}
