"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  ArrowLeft,
  Music,
  Mic2,
  Star,
  Users,
  Calendar,
  CheckCircle2,
  Send,
  Loader2,
  Youtube,
  Instagram,
  Globe,
  Mail,
  Phone,
  ChevronRight,
  Sparkles
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

// Past headliners data
const pastHeadliners = [
  "Dubioza Kolektiv",
  "Zdob și Zdub",
  "Subcarpați",
  "Shantel",
  "La Caravane Passe",
  "Vali Boghean Band"
];

// Benefits for artists
const benefits = [
  { id: "stage", icon: Mic2 },
  { id: "audience", icon: Users },
  { id: "promotion", icon: Star }
];

// Genre options
const genres = [
  "folk-rock",
  "balkan",
  "ethno",
  "alternative",
  "electronic",
  "rock",
  "pop",
  "jazz",
  "other"
];

export default function PerformPage() {
  const t = useTranslations("Perform");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSubmitted, setIsSubmitted] = React.useState(false);
  const [acceptedTerms, setAcceptedTerms] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!acceptedTerms) return;

    setIsSubmitting(true);
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <main className="min-h-screen bg-background pt-24 pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center py-20">
            <div className="mb-6 inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              {t("success.title")}
            </h1>
            <p className="text-muted-foreground text-lg mb-8">
              {t("success.description")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild>
                <Link href="/">
                  {t("success.backToHome")}
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/lineup">
                  {t("success.viewLineup")}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </main>
    );
  }

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

        {/* Header */}
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4">
            <Music className="h-3 w-3 mr-1" />
            {t("badge")}
          </Badge>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            {t("title")}
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            {t("subtitle")}
          </p>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-16">
          {[
            { value: "150+", labelKey: "stats.artists" },
            { value: "2", labelKey: "stats.stages" },
            { value: "30K+", labelKey: "stats.audience" },
            { value: "5", labelKey: "stats.years" }
          ].map((stat, index) => (
            <Card key={index} className="text-center">
              <CardContent className="pt-6">
                <p className="text-3xl md:text-4xl font-bold text-primary mb-1">
                  {stat.value}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t(stat.labelKey)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Past Headliners */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-2">
              {t("headliners.title")}
            </h2>
            <p className="text-muted-foreground">
              {t("headliners.subtitle")}
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {pastHeadliners.map((artist) => (
              <Badge
                key={artist}
                variant="secondary"
                className="text-base py-2 px-4"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                {artist}
              </Badge>
            ))}
          </div>
        </div>

        <Separator className="max-w-4xl mx-auto mb-16" />

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {/* Benefits Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t("benefits.title")}</CardTitle>
                <CardDescription>{t("benefits.subtitle")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {benefits.map((benefit) => {
                  const IconComponent = benefit.icon;
                  return (
                    <div
                      key={benefit.id}
                      className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
                    >
                      <div className="p-2 rounded-lg bg-primary/10">
                        <IconComponent className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">
                          {t(`benefits.${benefit.id}.title`)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {t(`benefits.${benefit.id}.description`)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Contact Card */}
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="text-lg">{t("contact.title")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <a
                  href="mailto:booking@festivalullupilor.md"
                  className="flex items-center gap-3 text-sm hover:text-primary transition-colors"
                >
                  <Mail className="h-4 w-4" />
                  booking@festivalullupilor.md
                </a>
                <a
                  href="tel:+37360123459"
                  className="flex items-center gap-3 text-sm hover:text-primary transition-colors"
                >
                  <Phone className="h-4 w-4" />
                  +373 60 123 459
                </a>
              </CardContent>
            </Card>
          </div>

          {/* Application Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="h-5 w-5" />
                  {t("form.title")}
                </CardTitle>
                <CardDescription>
                  {t("form.subtitle")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Artist/Band Info */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
                      {t("form.sections.artistInfo")}
                    </h3>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="artistName">{t("form.artistName")} *</Label>
                        <Input
                          id="artistName"
                          name="artistName"
                          placeholder={t("form.artistNamePlaceholder")}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="genre">{t("form.genre")} *</Label>
                        <Select name="genre" required>
                          <SelectTrigger>
                            <SelectValue placeholder={t("form.genrePlaceholder")} />
                          </SelectTrigger>
                          <SelectContent>
                            {genres.map((genre) => (
                              <SelectItem key={genre} value={genre}>
                                {t(`form.genres.${genre}`)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="country">{t("form.country")} *</Label>
                        <Input
                          id="country"
                          name="country"
                          placeholder={t("form.countryPlaceholder")}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="members">{t("form.members")} *</Label>
                        <Input
                          id="members"
                          name="members"
                          type="number"
                          min="1"
                          max="50"
                          placeholder={t("form.membersPlaceholder")}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio">{t("form.bio")} *</Label>
                      <Textarea
                        id="bio"
                        name="bio"
                        placeholder={t("form.bioPlaceholder")}
                        rows={4}
                        required
                      />
                    </div>
                  </div>

                  <Separator />

                  {/* Contact Info */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
                      {t("form.sections.contactInfo")}
                    </h3>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="contactName">{t("form.contactName")} *</Label>
                        <Input
                          id="contactName"
                          name="contactName"
                          placeholder={t("form.contactNamePlaceholder")}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">{t("form.email")} *</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder={t("form.emailPlaceholder")}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">{t("form.phone")}</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder={t("form.phonePlaceholder")}
                      />
                    </div>
                  </div>

                  <Separator />

                  {/* Links */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
                      {t("form.sections.links")}
                    </h3>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="youtube" className="flex items-center gap-2">
                          <Youtube className="h-4 w-4" />
                          YouTube
                        </Label>
                        <Input
                          id="youtube"
                          name="youtube"
                          type="url"
                          placeholder="https://youtube.com/..."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="instagram" className="flex items-center gap-2">
                          <Instagram className="h-4 w-4" />
                          Instagram
                        </Label>
                        <Input
                          id="instagram"
                          name="instagram"
                          type="url"
                          placeholder="https://instagram.com/..."
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="website" className="flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        {t("form.website")}
                      </Label>
                      <Input
                        id="website"
                        name="website"
                        type="url"
                        placeholder="https://..."
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="music">{t("form.musicLink")} *</Label>
                      <Input
                        id="music"
                        name="music"
                        type="url"
                        placeholder={t("form.musicLinkPlaceholder")}
                        required
                      />
                      <p className="text-xs text-muted-foreground">
                        {t("form.musicLinkHint")}
                      </p>
                    </div>
                  </div>

                  <Separator />

                  {/* Additional Info */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
                      {t("form.sections.additional")}
                    </h3>

                    <div className="space-y-2">
                      <Label htmlFor="message">{t("form.message")}</Label>
                      <Textarea
                        id="message"
                        name="message"
                        placeholder={t("form.messagePlaceholder")}
                        rows={3}
                      />
                    </div>
                  </div>

                  {/* Terms */}
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="terms"
                      checked={acceptedTerms}
                      onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
                    />
                    <Label
                      htmlFor="terms"
                      className="text-sm text-muted-foreground leading-relaxed cursor-pointer"
                    >
                      {t("form.terms")}
                    </Label>
                  </div>

                  {/* Submit */}
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full"
                    disabled={!acceptedTerms || isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        {t("form.submitting")}
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        {t("form.submit")}
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-20 max-w-4xl mx-auto">
          <Separator className="mb-12" />

          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-2">
              {t("faq.title")}
            </h2>
            <p className="text-muted-foreground">
              {t("faq.subtitle")}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((num) => (
              <Card key={num}>
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-2">{t(`faq.q${num}`)}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t(`faq.a${num}`)}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
