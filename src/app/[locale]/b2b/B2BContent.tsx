"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  ArrowLeft,
  Trophy,
  Sparkles,
  Mail,
  Phone,
  MessageSquare,
  CalendarCheck,
  TrendingUp,
  Award,
  Target,
  Handshake,
  Briefcase,
  Crown,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { B2BOrderSection } from "@/components/B2BOrderSection";

const benefits = [
  { icon: Target, key: "benefits.reach" },
  { icon: Award, key: "benefits.brand" },
  { icon: TrendingUp, key: "benefits.engagement" },
  { icon: Handshake, key: "benefits.networking" },
  { icon: Trophy, key: "benefits.experience" },
  { icon: Crown, key: "benefits.exclusive" },
];

export function B2BContent() {
  const t = useTranslations("B2B");
  const [formData, setFormData] = React.useState({
    company: "",
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log("Form submitted:", formData);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <main className="min-h-screen bg-background pt-24 pb-20">
      <div className="container mx-auto px-4">
        {/* Back Button */}
        <div className="mb-8">
          <Button variant="ghost" asChild>
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t("backToHome")}
            </Link>
          </Button>
        </div>

        {/* Hero Section */}
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4">
            <Briefcase className="h-3 w-3 mr-1" />
            {t("badge")}
          </Badge>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            {t("title")}
          </h1>
          <p className="text-muted-foreground max-w-3xl mx-auto text-lg md:text-xl leading-relaxed">
            {t("subtitle")}
          </p>
        </div>


        {/* B2B Order Section */}
        <B2BOrderSection />

        {/* Benefits Section */}
        <div className="mt-20 mb-20">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4">
              {t("benefitsBadge")}
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t("benefitsTitle")}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t("benefitsSubtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {benefits.map((benefit) => {
              const Icon = benefit.icon;
              return (
                <div
                  key={benefit.key}
                  className="flex items-start gap-4 p-6 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{t(`${benefit.key}.title`)}</h3>
                    <p className="text-sm text-muted-foreground">
                      {t(`${benefit.key}.description`)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-20 mb-20 max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t("faqTitle")}</h2>
            <p className="text-muted-foreground">{t("faqSubtitle")}</p>
          </div>

          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-left">
                {t("faq.q1.question")}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {t("faq.q1.answer")}
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger className="text-left">
                {t("faq.q2.question")}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {t("faq.q2.answer")}
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3">
              <AccordionTrigger className="text-left">
                {t("faq.q3.question")}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {t("faq.q3.answer")}
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4">
              <AccordionTrigger className="text-left">
                {t("faq.q4.question")}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {t("faq.q4.answer")}
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5">
              <AccordionTrigger className="text-left">
                {t("faq.q5.question")}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {t("faq.q5.answer")}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

      </div>
    </main>
  );
}
