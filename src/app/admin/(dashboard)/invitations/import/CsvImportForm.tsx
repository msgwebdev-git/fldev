"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Papa from "papaparse";
import {
  FileUp,
  Upload,
  CheckCircle,
  AlertCircle,
  Loader2,
  X,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface Ticket {
  id: string;
  name: string;
  name_ro: string;
  name_ru: string;
  price: number;
}

interface CsvRow {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  ticketType: string;
  quantity: string;
  language?: string;
  note?: string;
}

interface ParsedRow {
  index: number;
  raw: CsvRow;
  ticketId: string | null;
  quantity: number;
  errors: string[];
}

interface CsvImportFormProps {
  tickets: Ticket[];
}

type State = "idle" | "parsed" | "importing" | "done";

function resolveTicketId(ticketType: string, tickets: Ticket[]): string | null {
  const lower = ticketType.trim().toLowerCase();
  const match = tickets.find(
    (t) =>
      t.name?.toLowerCase() === lower ||
      t.name_ro?.toLowerCase() === lower ||
      t.name_ru?.toLowerCase() === lower
  );
  return match?.id || null;
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateRow(row: CsvRow, tickets: Ticket[]): ParsedRow["errors"] {
  const errors: string[] = [];
  if (!row.firstName?.trim()) errors.push("Имя обязательно");
  if (!row.lastName?.trim()) errors.push("Фамилия обязательна");
  if (!row.email?.trim()) errors.push("Email обязателен");
  else if (!validateEmail(row.email.trim())) errors.push("Невалидный email");
  if (!row.ticketType?.trim()) errors.push("Тип билета обязателен");
  else if (!resolveTicketId(row.ticketType, tickets)) errors.push(`Неизвестный билет: "${row.ticketType}"`);
  const qty = parseInt(row.quantity);
  if (isNaN(qty) || qty < 1) errors.push("Количество должно быть ≥ 1");
  if (row.language && !["ro", "ru"].includes(row.language.trim().toLowerCase())) errors.push("Язык: ro или ru");
  return errors;
}

export function CsvImportForm({ tickets }: CsvImportFormProps) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<State>("idle");
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [fileName, setFileName] = useState("");
  const [importResult, setImportResult] = useState<{ created: number; failed: number; errors: Array<{ row: number; error: string }> } | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  const validRows = rows.filter((r) => r.errors.length === 0);
  const invalidRows = rows.filter((r) => r.errors.length > 0);

  const handleFile = useCallback((file: File) => {
    setFileName(file.name);
    setImportError(null);

    Papa.parse<CsvRow>(file, {
      header: true,
      skipEmptyLines: true,
      encoding: "UTF-8",
      complete: (result) => {
        const parsed: ParsedRow[] = result.data.map((raw, i) => ({
          index: i + 1,
          raw,
          ticketId: resolveTicketId(raw.ticketType || "", tickets),
          quantity: parseInt(raw.quantity) || 1,
          errors: validateRow(raw, tickets),
        }));
        setRows(parsed);
        setState("parsed");
      },
      error: (err) => {
        setImportError(`Ошибка парсинга CSV: ${err.message}`);
      },
    });
  }, [tickets]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith(".csv") || file.type === "text/csv")) {
      handleFile(file);
    }
  }, [handleFile]);

  const handleImport = async () => {
    setState("importing");
    setImportError(null);

    try {
      const invitations = validRows.map((r) => ({
        firstName: r.raw.firstName.trim(),
        lastName: r.raw.lastName.trim(),
        email: r.raw.email.trim(),
        phone: r.raw.phone?.trim() || undefined,
        ticketId: r.ticketId!,
        quantity: r.quantity,
        language: r.raw.language?.trim().toLowerCase() || "ro",
        note: r.raw.note?.trim() || undefined,
      }));

      const res = await fetch("/api/admin/invitations/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invitations }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Import failed");
      }

      setImportResult(data);
      setState("done");
      router.refresh();
    } catch (err: any) {
      setImportError(err.message);
      setState("parsed");
    }
  };

  const reset = () => {
    setState("idle");
    setRows([]);
    setFileName("");
    setImportResult(null);
    setImportError(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-blue-50">
          <FileUp className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Импорт из CSV</h2>
          <p className="text-sm text-gray-500">Массовая загрузка приглашений</p>
        </div>
      </div>

      {importError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
          <p className="text-sm text-red-800">{importError}</p>
          <button onClick={() => setImportError(null)} className="ml-auto text-red-400 hover:text-red-600">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Idle: Upload zone */}
      {state === "idle" && (
        <div>
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className="border-2 border-dashed border-gray-200 rounded-xl p-10 text-center hover:border-primary/50 transition-colors cursor-pointer"
            onClick={() => fileRef.current?.click()}
          >
            <Upload className="w-10 h-10 mx-auto text-gray-300 mb-3" />
            <p className="text-sm text-gray-600 mb-1">
              Перетащите CSV файл сюда или нажмите для выбора
            </p>
            <p className="text-xs text-gray-400">
              Формат: firstName, lastName, email, phone, ticketType, quantity, language, note
            </p>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />

          {/* Available ticket types reference */}
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs font-medium text-gray-500 mb-2">Доступные типы билетов (для колонки ticketType):</p>
            <div className="flex flex-wrap gap-1.5">
              {tickets.map((t) => (
                <Badge key={t.id} variant="secondary" className="text-xs">
                  {t.name_ru || t.name_ro}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Parsed: Preview */}
      {state === "parsed" && (
        <div className="space-y-4">
          {/* Summary */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm">
              <span className="text-gray-500">Файл: <strong>{fileName}</strong></span>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                {validRows.length} валидных
              </Badge>
              {invalidRows.length > 0 && (
                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                  {invalidRows.length} с ошибками
                </Badge>
              )}
            </div>
            <Button variant="ghost" size="sm" onClick={reset}>
              <X className="h-4 w-4 mr-1" />
              Сбросить
            </Button>
          </div>

          {/* Preview table */}
          <div className="border rounded-lg overflow-auto max-h-[400px]">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/50">
                  <TableHead className="w-[40px]">#</TableHead>
                  <TableHead>Имя</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Билет</TableHead>
                  <TableHead>Кол-во</TableHead>
                  <TableHead>Язык</TableHead>
                  <TableHead>Статус</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.slice(0, 100).map((row) => (
                  <TableRow
                    key={row.index}
                    className={row.errors.length > 0 ? "bg-red-50/50" : ""}
                  >
                    <TableCell className="text-xs text-gray-400">{row.index}</TableCell>
                    <TableCell className="text-sm">
                      {row.raw.firstName} {row.raw.lastName}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">{row.raw.email}</TableCell>
                    <TableCell className="text-sm">{row.raw.ticketType}</TableCell>
                    <TableCell className="text-sm">{row.quantity}</TableCell>
                    <TableCell className="text-sm text-gray-500">{row.raw.language || "ro"}</TableCell>
                    <TableCell>
                      {row.errors.length > 0 ? (
                        <span className="text-xs text-red-600">{row.errors.join("; ")}</span>
                      ) : (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {rows.length > 100 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-sm text-gray-400 py-3">
                      ...и ещё {rows.length - 100} строк
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Import button */}
          <div className="flex items-center justify-between pt-2">
            <p className="text-sm text-gray-500">
              {invalidRows.length > 0
                ? `${invalidRows.length} строк будут пропущены`
                : "Все строки валидны"}
            </p>
            <Button
              onClick={handleImport}
              disabled={validRows.length === 0}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Импортировать {validRows.length} приглашений
            </Button>
          </div>
        </div>
      )}

      {/* Importing: Progress */}
      {state === "importing" && (
        <div className="text-center py-10">
          <Loader2 className="w-8 h-8 mx-auto text-primary animate-spin mb-4" />
          <p className="text-gray-600">Импорт {validRows.length} приглашений...</p>
          <p className="text-sm text-gray-400 mt-1">Это может занять до 30 секунд</p>
        </div>
      )}

      {/* Done: Results */}
      {state === "done" && importResult && (
        <div className="space-y-4">
          <div className="text-center py-6">
            <CheckCircle className="w-10 h-10 mx-auto text-green-500 mb-3" />
            <p className="text-lg font-semibold text-gray-900">Импорт завершён</p>
            <div className="flex items-center justify-center gap-4 mt-2 text-sm">
              <span className="text-green-600">Создано: {importResult.created}</span>
              {importResult.failed > 0 && (
                <span className="text-red-600">Ошибок: {importResult.failed}</span>
              )}
            </div>
          </div>

          {importResult.errors.length > 0 && (
            <div className="border rounded-lg p-3 max-h-[200px] overflow-auto">
              <p className="text-sm font-medium text-gray-700 mb-2">Ошибки:</p>
              {importResult.errors.map((err, i) => (
                <p key={i} className="text-xs text-red-600">
                  Строка {err.row}: {err.error}
                </p>
              ))}
            </div>
          )}

          <div className="flex justify-center gap-3">
            <Button variant="outline" onClick={reset}>
              Импортировать ещё
            </Button>
            <Button onClick={() => router.push("/admin/invitations")}>
              К списку приглашений
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
