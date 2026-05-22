"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import { deleteRule, toggleRuleActive, updateRule } from "./actions";
import { RuleForm, fromRuleRow } from "./RuleForm";

export interface Rule {
  id: string;
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
}

interface RulesTableProps {
  rules: Rule[];
}

export function RulesTable({ rules }: RulesTableProps) {
  const router = useRouter();
  const [deletingItem, setDeletingItem] = useState<Rule | null>(null);
  const [editingItem, setEditingItem] = useState<Rule | null>(null);
  const [isPending, startTransition] = useTransition();
  const [actionError, setActionError] = useState<string | null>(null);

  const handleDelete = () => {
    if (!deletingItem) return;
    const id = deletingItem.id;
    setActionError(null);

    startTransition(async () => {
      const result = await deleteRule(id);
      if (!result.success) {
        setActionError(result.error);
        return;
      }
      setDeletingItem(null);
      router.refresh();
    });
  };

  const handleToggleActive = (rule: Rule) => {
    startTransition(async () => {
      await toggleRuleActive(rule.id, !rule.is_active);
      router.refresh();
    });
  };

  if (rules.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
        <p className="text-gray-500">
          Нет правил. Добавьте первое — оно появится на странице /rules.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                №
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Заголовок
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                section_id / иконка
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Абзацы
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Статус
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Действия
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {rules.map((rule) => (
              <tr key={rule.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-500 text-sm">
                  {rule.sort_order}
                </td>
                <td className="px-4 py-3">
                  <div className="max-w-md">
                    <span className="text-gray-900 font-medium block">
                      {rule.title_ru}
                    </span>
                    <span className="text-gray-500 text-sm">
                      {rule.title_ro}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <code className="text-xs text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded">
                    {rule.section_id}
                  </code>
                  <div className="text-xs text-gray-500 mt-1">{rule.icon}</div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <Badge variant="secondary" className="text-xs">
                      RU: {rule.content_ru?.length ?? 0}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      RO: {rule.content_ro?.length ?? 0}
                    </Badge>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => handleToggleActive(rule)}
                    disabled={isPending}
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                      rule.is_active
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {rule.is_active ? (
                      <>
                        <Eye className="w-3 h-3" />
                        Активен
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-3 h-3" />
                        Скрыт
                      </>
                    )}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-gray-500 hover:text-gray-900"
                      onClick={() => setEditingItem(rule)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-gray-500 hover:text-red-600"
                      onClick={() => {
                        setActionError(null);
                        setDeletingItem(rule);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Delete Dialog */}
      <Dialog
        open={!!deletingItem}
        onOpenChange={(open) => {
          if (!open) {
            setDeletingItem(null);
            setActionError(null);
          }
        }}
      >
        <DialogContent className="bg-white border-gray-200">
          <DialogHeader>
            <DialogTitle className="text-gray-900">Удалить правило?</DialogTitle>
          </DialogHeader>
          <p className="text-gray-500">
            Удалить «{deletingItem?.title_ru}» (
            <code>{deletingItem?.section_id}</code>)? Действие нельзя отменить.
          </p>
          {actionError && (
            <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">
              {actionError}
            </div>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setDeletingItem(null)}
            >
              Отмена
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isPending}
            >
              {isPending ? "Удаление..." : "Удалить"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={!!editingItem}
        onOpenChange={(open) => !open && setEditingItem(null)}
      >
        <DialogContent className="bg-white border-gray-200 max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-gray-900">
              Редактировать правило
            </DialogTitle>
          </DialogHeader>
          {editingItem && (
            <RuleForm
              initial={fromRuleRow(editingItem)}
              submitLabel="Сохранить"
              isSectionIdLocked
              onSubmit={(input) => updateRule(editingItem.id, input)}
              onCancel={() => setEditingItem(null)}
              onSuccess={() => {
                setEditingItem(null);
                router.refresh();
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
