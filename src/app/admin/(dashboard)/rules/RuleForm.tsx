"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DialogFooter } from "@/components/ui/dialog";
import type { RuleInput } from "./actions";

// Должно совпадать с iconMap в src/app/[locale]/rules/RulesContent.tsx
export const AVAILABLE_ICONS = [
  "Ticket",
  "ShieldCheck",
  "Users",
  "Ban",
  "AlertTriangle",
  "Package",
  "Car",
  "Baby",
  "Tent",
  "Camera",
] as const;

export type RuleFormState = {
  section_id: string;
  title_ro: string;
  title_ru: string;
  icon: string;
  keywords_ro_raw: string;
  keywords_ru_raw: string;
  content_ro_raw: string;
  content_ru_raw: string;
  sort_order: number;
  is_active: boolean;
};

export const emptyFormState: RuleFormState = {
  section_id: "",
  title_ro: "",
  title_ru: "",
  icon: "ShieldCheck",
  keywords_ro_raw: "",
  keywords_ru_raw: "",
  content_ro_raw: "",
  content_ru_raw: "",
  sort_order: 1,
  is_active: true,
};

const splitLines = (raw: string): string[] =>
  raw
    .split("\n")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

const splitCsv = (raw: string): string[] =>
  raw
    .split(/[,\n]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

export function toRuleInput(state: RuleFormState): RuleInput {
  return {
    section_id: state.section_id.trim(),
    title_ro: state.title_ro.trim(),
    title_ru: state.title_ru.trim(),
    icon: state.icon,
    keywords_ro: splitCsv(state.keywords_ro_raw),
    keywords_ru: splitCsv(state.keywords_ru_raw),
    content_ro: splitLines(state.content_ro_raw),
    content_ru: splitLines(state.content_ru_raw),
    sort_order: state.sort_order,
    is_active: state.is_active,
  };
}

export function fromRuleRow(row: {
  section_id: string;
  title_ro: string;
  title_ru: string;
  icon: string;
  keywords_ro: string[];
  keywords_ru: string[];
  content_ro: string[];
  content_ru: string[];
  sort_order: number;
  is_active: boolean;
}): RuleFormState {
  return {
    section_id: row.section_id,
    title_ro: row.title_ro,
    title_ru: row.title_ru,
    icon: row.icon,
    keywords_ro_raw: (row.keywords_ro ?? []).join(", "),
    keywords_ru_raw: (row.keywords_ru ?? []).join(", "),
    content_ro_raw: (row.content_ro ?? []).join("\n"),
    content_ru_raw: (row.content_ru ?? []).join("\n"),
    sort_order: row.sort_order,
    is_active: row.is_active,
  };
}

interface RuleFormProps {
  initial: RuleFormState;
  submitLabel: string;
  onSubmit: (input: RuleInput) => Promise<{ success: true } | { success: false; error: string }>;
  onCancel: () => void;
  onSuccess: () => void;
  isSectionIdLocked?: boolean;
}

export function RuleForm({
  initial,
  submitLabel,
  onSubmit,
  onCancel,
  onSuccess,
  isSectionIdLocked = false,
}: RuleFormProps) {
  const [state, setState] = useState<RuleFormState>(initial);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const result = await onSubmit(toRuleInput(state));

    setIsLoading(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>
            section_id <span className="text-red-500">*</span>
          </Label>
          <Input
            value={state.section_id}
            onChange={(e) =>
              setState({ ...state, section_id: e.target.value })
            }
            placeholder="например: registration"
            required
            disabled={isSectionIdLocked}
            pattern="[a-z0-9][a-z0-9\-_]*"
            title="Только латиница в нижнем регистре, цифры, дефис и подчёркивание"
          />
          <p className="text-xs text-gray-500">
            Уникальный технический ID. Используется как anchor.
          </p>
        </div>

        <div className="space-y-2">
          <Label>Порядок сортировки</Label>
          <Input
            type="number"
            value={state.sort_order}
            onChange={(e) =>
              setState({
                ...state,
                sort_order: parseInt(e.target.value) || 1,
              })
            }
            min={1}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Иконка</Label>
          <Select
            value={state.icon}
            onValueChange={(value) => setState({ ...state, icon: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {AVAILABLE_ICONS.map((icon) => (
                <SelectItem key={icon} value={icon}>
                  {icon}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={state.is_active}
              onChange={(e) =>
                setState({ ...state, is_active: e.target.checked })
              }
              className="h-4 w-4"
            />
            Активен (показывать на сайте)
          </Label>
        </div>
      </div>

      <div className="space-y-4">
        <div className="border-b pb-2">
          <h3 className="font-semibold text-gray-900">Румынский (RO)</h3>
        </div>

        <div className="space-y-2">
          <Label>
            Заголовок (RO) <span className="text-red-500">*</span>
          </Label>
          <Input
            value={state.title_ro}
            onChange={(e) => setState({ ...state, title_ro: e.target.value })}
            placeholder="Înregistrare și brățări"
            required
          />
        </div>

        <div className="space-y-2">
          <Label>Ключевые слова (RO)</Label>
          <Textarea
            value={state.keywords_ro_raw}
            onChange={(e) =>
              setState({ ...state, keywords_ro_raw: e.target.value })
            }
            placeholder="bilet, brățară, intrare, înregistrare"
            rows={2}
          />
          <p className="text-xs text-gray-500">
            Через запятую или с новой строки.
          </p>
        </div>

        <div className="space-y-2">
          <Label>
            Контент (RO) <span className="text-red-500">*</span>
          </Label>
          <Textarea
            value={state.content_ro_raw}
            onChange={(e) =>
              setState({ ...state, content_ro_raw: e.target.value })
            }
            placeholder="Каждый абзац — новая строка. Строки с '•' рендерятся как пункт списка."
            rows={6}
            required
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="border-b pb-2">
          <h3 className="font-semibold text-gray-900">Русский (RU)</h3>
        </div>

        <div className="space-y-2">
          <Label>
            Заголовок (RU) <span className="text-red-500">*</span>
          </Label>
          <Input
            value={state.title_ru}
            onChange={(e) => setState({ ...state, title_ru: e.target.value })}
            placeholder="Регистрация и браслеты"
            required
          />
        </div>

        <div className="space-y-2">
          <Label>Ключевые слова (RU)</Label>
          <Textarea
            value={state.keywords_ru_raw}
            onChange={(e) =>
              setState({ ...state, keywords_ru_raw: e.target.value })
            }
            placeholder="билет, браслет, вход, регистрация"
            rows={2}
          />
        </div>

        <div className="space-y-2">
          <Label>
            Контент (RU) <span className="text-red-500">*</span>
          </Label>
          <Textarea
            value={state.content_ru_raw}
            onChange={(e) =>
              setState({ ...state, content_ru_raw: e.target.value })
            }
            placeholder="Каждый абзац — новая строка."
            rows={6}
            required
          />
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <DialogFooter>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Отмена
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Сохранение..." : submitLabel}
        </Button>
      </DialogFooter>
    </form>
  );
}
