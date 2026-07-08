"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2, ShieldCheck, ShieldOff, Users, Crown } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { addAdmin, revokeAdmin, type AdminUser } from "./actions";

export function TeamManager({ admins, currentUserId, isOwner }: { admins: AdminUser[]; currentUserId: string; isOwner: boolean }) {
  const router = useRouter();
  const [adding, setAdding] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [toRevoke, setToRevoke] = React.useState<AdminUser | null>(null);

  const handleAdd = async () => {
    setSaving(true);
    const res = await addAdmin({ email, password });
    setSaving(false);
    if (res.ok) {
      toast.success(
        res.promoted
          ? "Роль выдана. Пользователь должен перезайти, чтобы она применилась."
          : "Админ создан. Передайте ему пароль."
      );
      setAdding(false);
      setEmail("");
      setPassword("");
      router.refresh();
    } else {
      toast.error(res.error);
    }
  };

  const handleRevoke = async () => {
    if (!toRevoke) return;
    setSaving(true);
    const res = await revokeAdmin(toRevoke.id);
    setSaving(false);
    if (res.ok) {
      toast.success("Роль отозвана. Действующая сессия пользователя закроется при следующем обновлении токена.");
      setToRevoke(null);
      router.refresh();
    } else {
      toast.error(res.error);
    }
  };

  return (
    <>
      {isOwner && (
        <div className="flex justify-end">
          <Button onClick={() => setAdding(true)}>
            <Plus className="mr-2 h-4 w-4" /> Добавить админа
          </Button>
        </div>
      )}

      {admins.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 py-16 text-center text-gray-500">
          <Users className="mx-auto mb-3 h-10 w-10 text-gray-300" />
          Админы не найдены.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 text-left text-gray-500">
              <tr>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Добавлен</th>
                <th className="px-4 py-3 font-medium">Последний вход</th>
                <th className="px-4 py-3 font-medium text-right">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {admins.map((a) => {
                const isSelf = a.id === currentUserId;
                return (
                  <tr key={a.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-2 font-medium text-gray-900">
                        {a.is_owner ? (
                          <Crown className="h-4 w-4 text-amber-500" />
                        ) : (
                          <ShieldCheck className="h-4 w-4 text-green-600" />
                        )}
                        {a.email}
                        {a.is_owner && (
                          <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs text-amber-600">владелец</span>
                        )}
                        {isSelf && (
                          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">это вы</span>
                        )}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {new Date(a.created_at).toLocaleDateString("ru-RU")}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {a.last_sign_in_at ? new Date(a.last_sign_in_at).toLocaleString("ru-RU") : "—"}
                    </td>
                    <td className="px-4 py-3">
                      {isOwner && (
                        <div className="flex justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-600"
                            disabled={isSelf || a.is_owner || admins.length <= 1}
                            title={a.is_owner ? "Роль владельца нельзя отозвать" : isSelf ? "Нельзя забрать роль у себя" : undefined}
                            onClick={() => setToRevoke(a)}
                          >
                            <ShieldOff className="mr-1.5 h-4 w-4" /> Забрать роль
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-xs text-gray-400">
        Роль хранится в app_metadata пользователя Supabase и попадает в токен при входе — новый админ
        должен зайти на /admin/login, а разжалованный теряет доступ после обновления токена.
        Удаление самих аккаунтов — через дашборд Supabase.
      </p>

      <Dialog open={adding} onOpenChange={(open) => !open && setAdding(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Добавить админа</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <Label>Пароль</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Минимум 8 символов"
              />
              <p className="text-xs text-gray-400">
                Для нового аккаунта — обязателен. Для существующего: если заполнить — пароль будет заменён на этот
                (нужно для Google-аккаунтов без пароля), если оставить пустым — останется прежний.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAdding(false)} disabled={saving}>Отмена</Button>
            <Button onClick={handleAdd} disabled={saving || !email}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Добавить"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!toRevoke} onOpenChange={(open) => !open && setToRevoke(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Забрать роль админа?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-500">
            {toRevoke?.email} потеряет доступ к админ-панели. Аккаунт не удаляется — роль можно выдать снова.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setToRevoke(null)} disabled={saving}>Отмена</Button>
            <Button variant="destructive" onClick={handleRevoke} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Забрать роль"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
