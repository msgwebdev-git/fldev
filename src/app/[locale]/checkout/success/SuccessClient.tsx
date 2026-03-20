"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import {
  CheckCircle2,
  Download,
  Mail,
  Calendar,
  MapPin,
  Ticket,
  Home,
  Loader2,
  Clock,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { api } from "@/lib/api";

interface TicketInfo {
  ticketCode: string;
  ticketName: string;
  optionName: string | null;
  pdfUrl: string | null;
}

const MAX_POLL_ATTEMPTS = 60; // 60 * 2s = 2 minutes max

export default function CheckoutSuccessPage() {
  const t = useTranslations("CheckoutSuccess");
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("order");

  const [tickets, setTickets] = React.useState<TicketInfo[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isDownloading, setIsDownloading] = React.useState(false);
  const [pollCount, setPollCount] = React.useState(0);

  const readyTickets = tickets.filter((t) => t.pdfUrl);
  const ticketsReady = readyTickets.length > 0 && readyTickets.length === tickets.length;
  const timedOut = pollCount >= MAX_POLL_ATTEMPTS && !ticketsReady;

  // Poll for tickets
  React.useEffect(() => {
    if (!orderNumber) return;

    let interval: NodeJS.Timeout | null = null;
    let attempts = 0;

    const checkTickets = async () => {
      try {
        const response = await api.getOrderTickets(orderNumber);
        if (response.success && response.data?.tickets) {
          const list = response.data.tickets;
          setTickets(list);

          const allReady = list.length > 0 && list.every((t) => t.pdfUrl);
          if (allReady && interval) {
            clearInterval(interval);
          }
        }
      } catch {
        // silent
      } finally {
        setIsLoading(false);
        attempts++;
        setPollCount(attempts);
        if (attempts >= MAX_POLL_ATTEMPTS && interval) {
          clearInterval(interval);
        }
      }
    };

    checkTickets();
    interval = setInterval(checkTickets, 2000);

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [orderNumber]);

  const handleDownload = () => {
    if (!orderNumber || isDownloading || !ticketsReady) return;
    setIsDownloading(true);
    window.location.href = api.getTicketsDownloadUrl(orderNumber);
    setTimeout(() => setIsDownloading(false), 2000);
  };

  // Group tickets by name for display
  const ticketGroups = React.useMemo(() => {
    const groups: Record<string, { name: string; option: string | null; count: number }> = {};
    for (const t of tickets) {
      const key = `${t.ticketName}|${t.optionName || ""}`;
      if (!groups[key]) {
        groups[key] = { name: t.ticketName, option: t.optionName, count: 0 };
      }
      groups[key].count++;
    }
    return Object.values(groups);
  }, [tickets]);

  if (!orderNumber) {
    return (
      <main className="min-h-screen bg-muted/30 pt-24 pb-20">
        <div className="container mx-auto px-4 max-w-lg text-center py-20">
          <h1 className="text-2xl font-bold mb-4">{t("noOrder")}</h1>
          <Button asChild>
            <Link href="/">{t("backToHome")}</Link>
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-muted/30 pt-24 pb-20">
      <div className="container mx-auto px-4 max-w-lg">
        {/* Success icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="flex justify-center mb-6"
        >
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 300 }}
            >
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </motion.div>
          </div>
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-8"
        >
          <h1 className="text-2xl md:text-3xl font-bold mb-2">{t("title")}</h1>
          <p className="text-muted-foreground text-sm">{t("subtitle")}</p>
        </motion.div>

        {/* Order card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="mb-6">
            <CardContent className="p-6 space-y-5">
              {/* Order number */}
              <div className="text-center">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                  {t("orderNumber")}
                </p>
                <p className="text-xl font-mono font-bold">{orderNumber}</p>
              </div>

              <Separator />

              {/* Purchased tickets */}
              {ticketGroups.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">
                    {t("yourTickets")}
                  </p>
                  {ticketGroups.map((group, i) => (
                    <div key={i} className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-2">
                        <Ticket className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{group.name}</span>
                        {group.option && (
                          <Badge variant="secondary" className="text-xs">
                            {group.option}
                          </Badge>
                        )}
                      </div>
                      <span className="text-sm text-muted-foreground">x{group.count}</span>
                    </div>
                  ))}
                </div>
              )}

              <Separator />

              {/* Event details */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-start gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium">{t("eventDate")}</p>
                    <p className="text-muted-foreground">{t("eventDateValue")}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium">{t("eventLocation")}</p>
                    <p className="text-muted-foreground">{t("eventLocationValue")}</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Email notice */}
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                <p className="text-muted-foreground">{t("emailSent")}</p>
              </div>

              {/* Download */}
              <Button
                size="lg"
                className="w-full gap-2"
                onClick={handleDownload}
                disabled={isLoading || isDownloading || !ticketsReady}
              >
                {isLoading || isDownloading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                {isLoading
                  ? t("loading")
                  : isDownloading
                    ? t("downloading")
                    : !ticketsReady
                      ? t("ticketsNotReady")
                      : tickets.length === 1
                        ? t("downloadTicket")
                        : t("downloadTickets")}
              </Button>

              {timedOut && (
                <p className="text-xs text-muted-foreground text-center">
                  {t("timedOut")}
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* What's next */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="mb-8">
            <CardContent className="p-6">
              <p className="font-semibold mb-4 flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                {t("whatsNext.title")}
              </p>
              <ol className="space-y-3">
                {[1, 2, 3].map((step) => (
                  <li key={step} className="flex items-start gap-3 text-sm">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs font-bold shrink-0 mt-0.5">
                      {step}
                    </span>
                    <p className="text-muted-foreground">{t(`whatsNext.step${step}`)}</p>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </motion.div>

        {/* Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex gap-3 justify-center"
        >
          <Button asChild variant="outline" className="gap-2">
            <Link href="/">
              <Home className="h-4 w-4" />
              {t("backToHome")}
            </Link>
          </Button>
          <Button asChild variant="outline" className="gap-2">
            <Link href="/program">
              <Calendar className="h-4 w-4" />
              {t("viewProgram")}
            </Link>
          </Button>
        </motion.div>
      </div>
    </main>
  );
}
