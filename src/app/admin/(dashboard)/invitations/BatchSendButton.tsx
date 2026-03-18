"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Send, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BatchSendButtonProps {
  unsentCount: number;
}

interface JobStatus {
  status: "processing" | "completed" | "failed";
  total: number;
  processed: number;
  sent: number;
  failed: number;
  errors: Array<{ orderNumber: string; error: string }>;
}

export function BatchSendButton({ unsentCount }: BatchSendButtonProps) {
  const router = useRouter();
  const [sending, setSending] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const [status, setStatus] = useState<JobStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Poll job status
  useEffect(() => {
    if (!jobId) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/admin/invitations/send-unsent/${jobId}`);
        const data = await res.json();

        if (data.success === false) {
          clearInterval(interval);
          setError(data.error || "Job not found");
          setSending(false);
          return;
        }

        setStatus(data);

        if (data.status === "completed" || data.status === "failed") {
          clearInterval(interval);
          setSending(false);
          // Refresh page to update stats/table
          setTimeout(() => router.refresh(), 1000);
        }
      } catch {
        clearInterval(interval);
        setError("Ошибка при получении статуса");
        setSending(false);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [jobId, router]);

  const handleSend = async () => {
    setSending(true);
    setError(null);
    setStatus(null);

    try {
      const res = await fetch("/api/admin/invitations/send-unsent", { method: "POST" });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to start");
      }

      if (data.total === 0) {
        setSending(false);
        return;
      }

      setJobId(data.jobId);
    } catch (err: any) {
      setError(err.message);
      setSending(false);
    }
  };

  if (unsentCount === 0) return null;

  // Show progress
  if (sending && status) {
    const pct = status.total > 0 ? Math.round((status.processed / status.total) * 100) : 0;
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-sm">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          <span className="text-gray-600">
            {status.processed}/{status.total} ({pct}%)
          </span>
          {status.failed > 0 && (
            <span className="text-red-500">{status.failed} ошибок</span>
          )}
        </div>
        {/* Progress bar */}
        <div className="w-32 h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    );
  }

  // Completed state
  if (status && (status.status === "completed" || status.status === "failed")) {
    return (
      <div className="flex items-center gap-2 text-sm">
        {status.failed === 0 ? (
          <>
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-green-600">Отправлено: {status.sent}</span>
          </>
        ) : (
          <>
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <span className="text-amber-600">
              Отправлено: {status.sent}, ошибок: {status.failed}
            </span>
          </>
        )}
      </div>
    );
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={handleSend}
        disabled={sending}
        className="gap-2"
      >
        {sending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Send className="h-4 w-4" />
        )}
        Отправить все ({unsentCount})
      </Button>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </>
  );
}
