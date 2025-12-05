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
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { api } from "@/lib/api";

interface TicketInfo {
  ticketCode: string;
  pdfUrl: string | null;
}

export default function CheckoutSuccessPage() {
  const t = useTranslations("CheckoutSuccess");
  const searchParams = useSearchParams();
  const [tickets, setTickets] = React.useState<TicketInfo[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isDownloading, setIsDownloading] = React.useState(false);

  // Get order number from URL or generate fallback
  const orderNumber = searchParams.get("order") || React.useMemo(() => {
    return `FL-${Date.now().toString(36).toUpperCase()}`;
  }, []);

  const readyTickets = tickets.filter(t => t.pdfUrl);
  const ticketsReady = readyTickets.length > 0;

  // Check tickets status on mount and poll if not ready
  React.useEffect(() => {
    if (!orderNumber) return;

    let interval: NodeJS.Timeout | null = null;

    const checkTickets = async () => {
      try {
        const response = await api.getOrderTickets(orderNumber);
        if (response.success && response.data?.tickets) {
          const ticketsList = response.data.tickets;
          setTickets(ticketsList);

          // Stop polling when all tickets are ready
          const allReady = ticketsList.length > 0 && ticketsList.every(t => t.pdfUrl);
          if (allReady && interval) {
            clearInterval(interval);
          }
        }
      } catch (error) {
        console.error("Failed to check tickets:", error);
      } finally {
        setIsLoading(false);
      }
    };

    // Initial check
    checkTickets();

    // Poll every 2 seconds until tickets are ready
    interval = setInterval(checkTickets, 2000);

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [orderNumber]);

  const handleDownloadTickets = () => {
    if (!orderNumber || isDownloading || !ticketsReady) return;

    setIsDownloading(true);

    // Always download through server (handles both single PDF and ZIP)
    const downloadUrl = api.getTicketsDownloadUrl(orderNumber);
    window.location.href = downloadUrl;

    setTimeout(() => setIsDownloading(false), 2000);
  };

  return (
    <main className="min-h-screen bg-muted/30 pt-24 pb-20">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Success Animation */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="flex justify-center mb-8"
        >
          <div className="relative">
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4, type: "spring", stiffness: 300 }}
              >
                <CheckCircle2 className="h-12 w-12 text-primary" />
              </motion.div>
            </motion.div>
            {/* Confetti dots */}
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: [0, 1, 0] }}
                transition={{
                  delay: 0.5 + i * 0.1,
                  duration: 1,
                  repeat: 0,
                }}
                className="absolute w-2 h-2 rounded-full bg-primary"
                style={{
                  top: `${50 + Math.sin(i * 45 * Math.PI / 180) * 60}%`,
                  left: `${50 + Math.cos(i * 45 * Math.PI / 180) * 60}%`,
                  transform: "translate(-50%, -50%)",
                }}
              />
            ))}
          </div>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-2">{t("title")}</h1>
          <p className="text-muted-foreground">{t("subtitle")}</p>
        </motion.div>

        {/* Order Details Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="mb-6">
            <CardHeader className="text-center pb-2">
              <CardDescription>{t("orderNumber")}</CardDescription>
              <CardTitle className="text-2xl font-mono">{orderNumber}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Separator />

              {/* Event Info */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{t("eventDate")}</p>
                    <p className="text-sm text-muted-foreground">7-9 August 2026</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{t("eventLocation")}</p>
                    <p className="text-sm text-muted-foreground">Saharna, Moldova</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{t("confirmationEmail")}</p>
                    <p className="text-sm text-muted-foreground">{t("emailSent")}</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Download Button */}
              <div className="space-y-3">
                {tickets.length > 1 && ticketsReady && (
                  <p className="text-sm text-muted-foreground text-center">
                    {t("ticketsCountLabel", { count: readyTickets.length })}
                  </p>
                )}

                <Button
                  size="lg"
                  className="w-full gap-2 text-lg py-6"
                  onClick={handleDownloadTickets}
                  disabled={isLoading || isDownloading || !ticketsReady}
                >
                  {isLoading || isDownloading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Download className="h-5 w-5" />
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
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* What's Next Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="mb-6 border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Ticket className="h-5 w-5 text-primary" />
                {t("whatsNext.title")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {[1, 2, 3].map((step) => (
                  <li key={step} className="flex items-start gap-3">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-bold flex-shrink-0">
                      {step}
                    </span>
                    <p className="text-sm text-muted-foreground">
                      {t(`whatsNext.step${step}`)}
                    </p>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </motion.div>

        {/* Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Button asChild size="lg" className="gap-2">
            <Link href="/">
              <Home className="h-4 w-4" />
              {t("backToHome")}
            </Link>
          </Button>
          <Button variant="outline" asChild size="lg" className="gap-2">
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
