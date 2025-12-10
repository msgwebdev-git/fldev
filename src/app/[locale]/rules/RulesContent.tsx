"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  ArrowLeft,
  Search,
  ShieldCheck,
  Ban,
  Tent,
  Car,
  Baby,
  Camera,
  AlertTriangle,
  Ticket,
  Package,
  Users,
  X,
  LucideIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";

export interface Rule {
  id: string;
  section_id: string;
  title: string;
  icon: string;
  keywords: string[];
  content: string[];
  sort_order: number;
}

interface RulesContentProps {
  rules: Rule[];
  quickTopics: { keyword: string; label: string }[];
}

const iconMap: Record<string, LucideIcon> = {
  Ticket,
  ShieldCheck,
  Users,
  Ban,
  AlertTriangle,
  Package,
  Car,
  Baby,
  Tent,
  Camera,
};

export function RulesContent({ rules, quickTopics }: RulesContentProps) {
  const t = useTranslations("Rules");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [activeSection, setActiveSection] = React.useState<string | null>(null);
  const sectionRefs = React.useRef<Record<string, HTMLDivElement | null>>({});

  // Filter rules based on search query
  const filteredRules = React.useMemo(() => {
    if (!searchQuery.trim()) return rules;

    const query = searchQuery.toLowerCase().trim();
    return rules.filter(
      (rule) =>
        rule.title.toLowerCase().includes(query) ||
        rule.keywords.some((keyword) => keyword.toLowerCase().includes(query)) ||
        rule.content.some((item) => item.toLowerCase().includes(query))
    );
  }, [searchQuery, rules]);

  // Handle quick topic click
  const handleTopicClick = (keyword: string) => {
    setSearchQuery(keyword);
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery("");
  };

  // Scroll to section
  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = sectionRefs.current[sectionId];
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const getIcon = (iconName: string): LucideIcon => {
    return iconMap[iconName] || ShieldCheck;
  };

  return (
    <main className="min-h-screen bg-background pt-24 pb-20">
      <div className="container mx-auto px-4 relative">
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
            <ShieldCheck className="h-3 w-3 mr-1" />
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

          {/* Quick Topics */}
          <div className="mt-4">
            <p className="text-sm text-muted-foreground mb-2">{t("quickTopics")}:</p>
            <div className="flex flex-wrap gap-2">
              {quickTopics.map((topic) => (
                <Badge
                  key={topic.keyword}
                  variant={searchQuery === topic.keyword ? "default" : "secondary"}
                  className="cursor-pointer hover:bg-primary/80 transition-colors"
                  onClick={() => handleTopicClick(topic.keyword)}
                >
                  {topic.label}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Search Results Count */}
        {searchQuery && (
          <div className="text-center mb-6">
            <p className="text-muted-foreground">
              {t("foundSections", { count: filteredRules.length })}
            </p>
          </div>
        )}

        {/* Rules Content with Sidebar */}
        <div className="xl:flex xl:gap-8 xl:justify-center">
          {/* Table of Contents - Desktop */}
          <aside className="hidden xl:block xl:w-[280px] xl:flex-shrink-0">
            <div className="sticky top-28">
              <Card className="p-4">
                <p className="text-sm font-medium mb-3">{t("tableOfContents")}</p>
                <nav className="space-y-1">
                  {rules.map((rule) => {
                    const Icon = getIcon(rule.icon);
                    const isFiltered = filteredRules.some((r) => r.section_id === rule.section_id);
                    return (
                      <button
                        key={rule.section_id}
                        onClick={() => scrollToSection(rule.section_id)}
                        className={`flex items-center gap-2 text-sm py-2 px-2 rounded-md transition-colors w-full text-left ${
                          activeSection === rule.section_id
                            ? "bg-primary/10 text-primary"
                            : isFiltered
                            ? "hover:bg-muted text-foreground"
                            : "text-muted-foreground/50"
                        }`}
                        disabled={!isFiltered}
                      >
                        <Icon className="h-4 w-4 flex-shrink-0" />
                        <span className="leading-tight">{rule.title}</span>
                      </button>
                    );
                  })}
                </nav>
              </Card>
            </div>
          </aside>

          {/* Rules Content */}
          <div className="max-w-3xl w-full space-y-8">
            {filteredRules.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">{t("noResults")}</p>
                <Button variant="link" onClick={clearSearch} className="mt-2">
                  {t("clearSearch")}
                </Button>
              </Card>
            ) : (
              filteredRules.map((rule, index) => {
                const Icon = getIcon(rule.icon);
                return (
                  <div
                    key={rule.section_id}
                    ref={(el) => {
                      sectionRefs.current[rule.section_id] = el;
                    }}
                    className="scroll-mt-32"
                  >
                    <Card className="p-6 md:p-8">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Icon className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h2 className="text-xl md:text-2xl font-bold">{rule.title}</h2>
                        </div>
                      </div>
                      <Separator className="mb-4" />
                      <div className="space-y-3">
                        {rule.content.map((item, itemIndex) => (
                          <p
                            key={itemIndex}
                            className={`text-muted-foreground leading-relaxed ${
                              item.startsWith("•") ? "pl-4" : ""
                            }`}
                          >
                            {item}
                          </p>
                        ))}
                      </div>
                    </Card>
                    {index < filteredRules.length - 1 && <div className="h-2" />}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Important Notice */}
        <div className="max-w-3xl mx-auto mt-12">
          <Card className="p-6 bg-destructive/5 border-destructive/20">
            <div className="flex items-start gap-4">
              <AlertTriangle className="h-6 w-6 text-destructive flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-lg mb-2">{t("importantTitle")}</h3>
                <p className="text-muted-foreground">{t("importantText")}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* CTA */}
        <div className="text-center mt-12 p-8 rounded-2xl bg-primary/5 border border-primary/20 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-4">{t("ctaTitle")}</h2>
          <p className="text-muted-foreground mb-6">{t("ctaDescription")}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/tickets">{t("ctaBuyTickets")}</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/contacts">{t("ctaContacts")}</Link>
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
