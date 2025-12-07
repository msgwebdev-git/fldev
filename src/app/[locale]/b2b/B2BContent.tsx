"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  ArrowLeft,
  Building2,
  Users,
  Trophy,
  Megaphone,
  CheckCircle2,
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

const corporatePackages = [
  {
    id: "b2b-sales",
    icon: Building2,
    titleKey: "packages.b2b.title",
    descriptionKey: "packages.b2b.description",
    features: [
      "packages.b2b.features.0",
      "packages.b2b.features.1",
      "packages.b2b.features.2",
      "packages.b2b.features.3",
    ],
  },
  {
    id: "team-building",
    icon: Users,
    titleKey: "packages.teamBuilding.title",
    descriptionKey: "packages.teamBuilding.description",
    features: [
      "packages.teamBuilding.features.0",
      "packages.teamBuilding.features.1",
      "packages.teamBuilding.features.2",
      "packages.teamBuilding.features.3",
    ],
  },
  {
    id: "branded-zones",
    icon: Megaphone,
    titleKey: "packages.brandedZones.title",
    descriptionKey: "packages.brandedZones.description",
    features: [
      "packages.brandedZones.features.0",
      "packages.brandedZones.features.1",
      "packages.brandedZones.features.2",
      "packages.brandedZones.features.3",
    ],
  },
];

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

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-20">
          <div className="text-center p-6 rounded-xl bg-muted/50">
            <div className="text-4xl font-bold text-primary mb-2">15,000+</div>
            <div className="text-sm text-muted-foreground">{t("stats.visitors")}</div>
          </div>
          <div className="text-center p-6 rounded-xl bg-muted/50">
            <div className="text-4xl font-bold text-primary mb-2">100+</div>
            <div className="text-sm text-muted-foreground">{t("stats.companies")}</div>
          </div>
          <div className="text-center p-6 rounded-xl bg-muted/50">
            <div className="text-4xl font-bold text-primary mb-2">3</div>
            <div className="text-sm text-muted-foreground">{t("stats.days")}</div>
          </div>
          <div className="text-center p-6 rounded-xl bg-muted/50">
            <div className="text-4xl font-bold text-primary mb-2">24/7</div>
            <div className="text-sm text-muted-foreground">{t("stats.visibility")}</div>
          </div>
        </div>

        {/* Corporate Packages */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t("packagesTitle")}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t("packagesSubtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {corporatePackages.map((pkg) => {
              const Icon = pkg.icon;
              return (
                <Card
                  key={pkg.id}
                  className="transition-all duration-300 hover:shadow-lg"
                >
                  <CardHeader>
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                      <Icon className="h-7 w-7 text-primary" />
                    </div>
                    <CardTitle className="text-2xl mb-2">{t(pkg.titleKey)}</CardTitle>
                    <CardDescription className="text-base">
                      {t(pkg.descriptionKey)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {pkg.features.map((featureKey, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                          <span className="text-sm text-muted-foreground">
                            {t(featureKey)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Benefits Section */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4">
              <Sparkles className="h-3 w-3 mr-1" />
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

        {/* B2B Order Section */}
        <B2BOrderSection />

        {/* FAQ Section */}
        <div className="mb-20 max-w-4xl mx-auto">
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

        {/* Contact Form Section */}
        <div className="max-w-4xl mx-auto">
          <Card className="border-2">
            <CardHeader className="text-center">
              <Badge variant="outline" className="mb-4 mx-auto">
                <MessageSquare className="h-3 w-3 mr-1" />
                {t("contactBadge")}
              </Badge>
              <CardTitle className="text-3xl mb-2">{t("contactTitle")}</CardTitle>
              <CardDescription className="text-base">
                {t("contactSubtitle")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="company">{t("form.company")}</Label>
                    <Input
                      id="company"
                      name="company"
                      placeholder={t("form.companyPlaceholder")}
                      value={formData.company}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name">{t("form.name")}</Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder={t("form.namePlaceholder")}
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="email">{t("form.email")}</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder={t("form.emailPlaceholder")}
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">{t("form.phone")}</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder={t("form.phonePlaceholder")}
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">{t("form.message")}</Label>
                  <Textarea
                    id="message"
                    name="message"
                    placeholder={t("form.messagePlaceholder")}
                    value={formData.message}
                    onChange={handleChange}
                    rows={5}
                    required
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Button type="submit" size="lg" className="flex-1">
                    <Mail className="mr-2 h-4 w-4" />
                    {t("form.submit")}
                  </Button>
                  <Button type="button" variant="outline" size="lg" asChild className="flex-1">
                    <Link href="/contacts">
                      <Phone className="mr-2 h-4 w-4" />
                      {t("form.callUs")}
                    </Link>
                  </Button>
                </div>
              </form>

              {/* Contact Info */}
              <div className="mt-8 pt-8 border-t">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    <span className="text-sm font-medium">corporate@festival.md</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Phone className="h-5 w-5 text-primary" />
                    </div>
                    <span className="text-sm font-medium">+373 XX XXX XXX</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <CalendarCheck className="h-5 w-5 text-primary" />
                    </div>
                    <span className="text-sm font-medium">{t("availability")}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
