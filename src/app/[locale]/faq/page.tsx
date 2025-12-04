"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  ArrowLeft,
  Search,
  HelpCircle,
  Ticket,
  Tent,
  Car,
  Baby,
  Utensils,
  ShieldCheck,
  MapPin,
  Smartphone,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// FAQ categories with icons
const categoryIcons: Record<string, React.ElementType> = {
  tickets: Ticket,
  camping: Tent,
  transport: Car,
  children: Baby,
  food: Utensils,
  safety: ShieldCheck,
  location: MapPin,
  general: HelpCircle,
  app: Smartphone,
};

export default function FAQPage() {
  const t = useTranslations("FAQ");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [activeCategory, setActiveCategory] = React.useState<string | null>(null);

  // Get FAQ data from translations
  const categories = [
    "tickets",
    "camping",
    "transport",
    "children",
    "food",
    "safety",
    "location",
    "app",
    "general",
  ];

  // Build FAQ items from translations
  const faqItems = React.useMemo(() => {
    const items: Array<{
      id: string;
      category: string;
      question: string;
      answer: string;
      keywords: string[];
    }> = [];

    categories.forEach((category) => {
      // Each category has multiple Q&A pairs (q1, a1, q2, a2, etc.)
      for (let i = 1; i <= 10; i++) {
        try {
          const question = t.raw(`categories.${category}.q${i}`) as string;
          const answer = t.raw(`categories.${category}.a${i}`) as string;
          if (question && answer) {
            items.push({
              id: `${category}-${i}`,
              category,
              question,
              answer,
              keywords: [question.toLowerCase(), answer.toLowerCase()],
            });
          }
        } catch {
          // Question doesn't exist, stop iterating for this category
          break;
        }
      }
    });

    return items;
  }, [t]);

  // Filter FAQ items based on search query and active category
  const filteredItems = React.useMemo(() => {
    let items = faqItems;

    if (activeCategory) {
      items = items.filter((item) => item.category === activeCategory);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      items = items.filter(
        (item) =>
          item.question.toLowerCase().includes(query) ||
          item.answer.toLowerCase().includes(query)
      );
    }

    return items;
  }, [faqItems, searchQuery, activeCategory]);

  // Group filtered items by category
  const groupedItems = React.useMemo(() => {
    const groups: Record<string, typeof filteredItems> = {};
    filteredItems.forEach((item) => {
      if (!groups[item.category]) {
        groups[item.category] = [];
      }
      groups[item.category].push(item);
    });
    return groups;
  }, [filteredItems]);

  const clearSearch = () => {
    setSearchQuery("");
  };

  const clearCategory = () => {
    setActiveCategory(null);
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
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4">
            <HelpCircle className="h-3 w-3 mr-1" />
            {t("badge")}
          </Badge>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            {t("pageTitle")}
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            {t("pageSubtitle")}
          </p>
        </div>

        {/* Search Section */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder={t("searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10 h-12 text-base"
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        {/* Category Filters */}
        <div className="max-w-4xl mx-auto mb-8">
          <p className="text-sm text-muted-foreground mb-3 text-center">
            {t("filterByCategory")}:
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((category) => {
              const Icon = categoryIcons[category];
              const isActive = activeCategory === category;
              return (
                <Badge
                  key={category}
                  variant={isActive ? "default" : "secondary"}
                  className="cursor-pointer hover:bg-primary/80 transition-colors py-2 px-3"
                  onClick={() =>
                    setActiveCategory(isActive ? null : category)
                  }
                >
                  <Icon className="h-3 w-3 mr-1" />
                  {t(`categories.${category}.title`)}
                </Badge>
              );
            })}
          </div>
          {activeCategory && (
            <div className="text-center mt-4">
              <Button variant="ghost" size="sm" onClick={clearCategory}>
                <X className="h-3 w-3 mr-1" />
                {t("clearFilter")}
              </Button>
            </div>
          )}
        </div>

        {/* Results Count */}
        {(searchQuery || activeCategory) && (
          <div className="text-center mb-6">
            <p className="text-muted-foreground">
              {t("foundQuestions", { count: filteredItems.length })}
            </p>
          </div>
        )}

        {/* FAQ Content */}
        <div className="max-w-3xl mx-auto">
          {filteredItems.length === 0 ? (
            <Card className="p-8 text-center">
              <HelpCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">{t("noResults")}</p>
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                {searchQuery && (
                  <Button variant="outline" onClick={clearSearch}>
                    {t("clearSearch")}
                  </Button>
                )}
                {activeCategory && (
                  <Button variant="outline" onClick={clearCategory}>
                    {t("clearFilter")}
                  </Button>
                )}
              </div>
            </Card>
          ) : (
            Object.entries(groupedItems).map(([category, items]) => {
              const Icon = categoryIcons[category];
              return (
                <div key={category} className="mb-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <h2 className="text-xl font-bold">
                      {t(`categories.${category}.title`)}
                    </h2>
                  </div>
                  <Card className="p-4 md:p-6">
                    <Accordion type="single" collapsible className="w-full">
                      {items.map((item) => (
                        <AccordionItem key={item.id} value={item.id}>
                          <AccordionTrigger className="text-left">
                            {item.question}
                          </AccordionTrigger>
                          <AccordionContent className="text-muted-foreground">
                            {item.answer}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </Card>
                </div>
              );
            })
          )}
        </div>

        {/* Still Have Questions CTA */}
        <div className="max-w-3xl mx-auto mt-12">
          <Card className="p-6 md:p-8 text-center bg-primary/5 border-primary/20">
            <HelpCircle className="h-10 w-10 mx-auto mb-4 text-primary" />
            <h2 className="text-2xl font-bold mb-2">{t("stillHaveQuestions")}</h2>
            <p className="text-muted-foreground mb-6">
              {t("stillHaveQuestionsDescription")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/contacts">{t("contactUs")}</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/rules">{t("viewRules")}</Link>
              </Button>
            </div>
          </Card>
        </div>

        {/* Buy Tickets CTA */}
        <div className="text-center mt-12 p-8 rounded-2xl bg-primary/5 border border-primary/20 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-4">{t("ctaTitle")}</h2>
          <p className="text-muted-foreground mb-6">{t("ctaDescription")}</p>
          <Button size="lg" asChild>
            <Link href="/tickets">{t("ctaBuyTickets")}</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
