"use client";

import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { CheckCircle2, Mail, ArrowRight, Home } from "lucide-react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";

export default function B2BThankYouPage() {
  const t = useTranslations("B2B");
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("order");

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="max-w-md w-full text-center"
      >
        {/* Success icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 15 }}
          className="mb-8 flex justify-center"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-green-500 rounded-full blur-2xl opacity-20" />
            <div className="relative bg-gradient-to-br from-green-500 to-green-600 rounded-full p-5">
              <CheckCircle2 className="h-10 w-10 text-white" strokeWidth={2.5} />
            </div>
          </div>
        </motion.div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-foreground mb-3">
          {t("orderSuccess")}
        </h1>

        {/* Description */}
        <p className="text-muted-foreground mb-6 leading-relaxed">
          {t("orderSuccessMessage")}
        </p>

        {/* Order number */}
        {orderNumber && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mb-6 inline-flex items-center gap-2 bg-muted rounded-lg px-4 py-2.5 text-sm"
          >
            <span className="text-muted-foreground">{t("orderNumberLabel")}:</span>
            <span className="font-semibold text-foreground font-mono">{orderNumber}</span>
          </motion.div>
        )}

        {/* Email notice */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex items-center justify-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-lg py-3 px-4 mb-8"
        >
          <Mail className="h-4 w-4 flex-shrink-0" />
          <span>{t("checkEmail")}</span>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col gap-3"
        >
          <Button size="lg" className="w-full rounded-xl gap-2" asChild>
            <Link href="/b2b">
              {t("createNewOrder")}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" size="lg" className="w-full rounded-xl gap-2" asChild>
            <Link href="/">
              <Home className="h-4 w-4" />
              {t("backToHome")}
            </Link>
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}
