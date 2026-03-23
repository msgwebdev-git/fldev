"use client";

import { useState, useEffect } from "react";
import { Bell, Send, Smartphone, Loader2, CheckCircle, AlertCircle } from "lucide-react";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface DeviceStats {
  total: number;
  ios: number;
  android: number;
}

interface PushHistoryItem {
  id: string;
  title: string;
  body: string;
  type: string;
  target: string;
  target_value: string;
  sent_at: string;
}

const NOTIFICATION_TYPES = [
  { value: "general", label: "Общее" },
  { value: "news", label: "Новости" },
  { value: "lineup", label: "Лайнап" },
  { value: "ticket", label: "Билеты" },
  { value: "promo", label: "Промо" },
  { value: "reminder", label: "Напоминание" },
];

const ACTION_ROUTES = [
  { value: "", label: "Без ссылки" },
  { value: "/news", label: "Новости" },
  { value: "/lineup", label: "Лайнап" },
  { value: "/tickets", label: "Билеты" },
  { value: "/program", label: "Программа" },
  { value: "/more", label: "Ещё" },
];

export default function NotificationsPage() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [type, setType] = useState("general");
  const [actionRoute, setActionRoute] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const [stats, setStats] = useState<DeviceStats | null>(null);
  const [history, setHistory] = useState<PushHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    try {
      const res = await fetch("/api/admin/notifications");
      const data = await res.json();
      if (data.success) {
        setStats(data.data.devices);
        setHistory(data.data.history || []);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }

  async function handleSend() {
    if (!title.trim() || !body.trim()) return;

    setSending(true);
    setResult(null);

    try {
      const res = await fetch("/api/admin/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          body: body.trim(),
          type,
          ...(actionRoute && { actionRoute }),
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setResult({ success: true, message: "Уведомление отправлено" });
        setTitle("");
        setBody("");
        setType("general");
        setActionRoute("");
        loadStats();
      } else {
        setResult({ success: false, message: data.error || "Ошибка отправки" });
      }
    } catch {
      setResult({ success: false, message: "Ошибка сети" });
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Push-уведомления</h1>
        <p className="text-gray-500 mt-1">Отправка уведомлений пользователям приложения</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Smartphone className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{loading ? "—" : stats?.total ?? 0}</p>
                <p className="text-sm text-gray-500">Всего устройств</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-50 rounded-lg">
                <Smartphone className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{loading ? "—" : stats?.ios ?? 0}</p>
                <p className="text-sm text-gray-500">iOS</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <Smartphone className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{loading ? "—" : stats?.android ?? 0}</p>
                <p className="text-sm text-gray-500">Android</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Send form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              Отправить уведомление
            </CardTitle>
            <CardDescription>
              Будет отправлено всем пользователям с установленным приложением
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Заголовок</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Новый артист в лайнапе!"
                maxLength={100}
              />
              <p className="text-xs text-gray-400">{title.length}/100</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="body">Текст</Label>
              <Textarea
                id="body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Мы добавили нового хедлайнера..."
                maxLength={500}
                rows={3}
              />
              <p className="text-xs text-gray-400">{body.length}/500</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Тип</Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {NOTIFICATION_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Ссылка в приложении</Label>
                <Select value={actionRoute} onValueChange={setActionRoute}>
                  <SelectTrigger>
                    <SelectValue placeholder="Без ссылки" />
                  </SelectTrigger>
                  <SelectContent>
                    {ACTION_ROUTES.map((r) => (
                      <SelectItem key={r.value || "none"} value={r.value || "none"}>
                        {r.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {result && (
              <div className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
                result.success ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
              }`}>
                {result.success ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                {result.message}
              </div>
            )}

            <Button
              onClick={handleSend}
              disabled={sending || !title.trim() || !body.trim()}
              className="w-full"
            >
              {sending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Отправка...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Отправить всем
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              История отправок
            </CardTitle>
          </CardHeader>
          <CardContent>
            {history.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-8">
                Ещё не было отправлено уведомлений
              </p>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {history.map((item) => (
                  <div
                    key={item.id}
                    className="border rounded-lg p-3 space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm">{item.title}</p>
                      <span className="text-xs px-2 py-0.5 bg-gray-100 rounded-full text-gray-600">
                        {item.type}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 line-clamp-2">{item.body}</p>
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>{item.target_value}</span>
                      <span>
                        {new Date(item.sent_at).toLocaleString("ru-RU", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
