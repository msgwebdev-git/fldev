"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  ArrowLeft,
  MapPin,
  Navigation,
  Car,
  Clock,
  Compass,
  ExternalLink,
  ChevronRight,
  Locate,
  Bus,
  Ticket
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

// Festival coordinates
const FESTIVAL_COORDS = {
  lat: 47.3076377,
  lng: 28.9878523,
  name: "Festivalul Lupilor",
  address: "Orheiul Vechi, Trebujeni, Moldova"
};

// Public transport departure points (Google Maps)
const GARA_CENTRALA_URL =
  "https://www.google.com/maps/dir//%D0%A6%D0%B5%D0%BD%D1%82%D1%80%D0%B0%D0%BB%D1%8C%D0%BD%D1%8B%D0%B9+%D0%B0%D0%B2%D1%82%D0%BE%D0%B2%D0%BE%D0%BA%D0%B7%D0%B0%D0%BB,+Strada+Mitropolit+Varlaam+58,+Chi%C8%99in%C4%83u,+%D0%9C%D0%BE%D0%BB%D0%B4%D0%BE%D0%B2%D0%B0/@47.0193858,28.8431044,725m/data=!3m1!1e3!4m9!4m8!1m0!1m5!1m1!1s0x40c97c3bbf44d667:0xa25ecbcbf54fb506!2m2!1d28.8452931!2d47.0193858!3e0";
const AUTOGARA_ORHEI_URL =
  "https://www.google.com/maps/place/Autogara+Orhei/@47.3780238,28.8161704,17z/data=!4m7!3m6!1s0x40cbef30b0008b23:0x733bcb1db0003c5a!8m2!3d47.3779322!4d28.8189702";

// Transport options
const transportOptions = [
  {
    id: "car",
    icon: Car,
    duration: "~1h",
    distance: "50 km"
  }
];

export default function HowToGetPage() {
  const t = useTranslations("HowToGet");

  // Generate Google Maps directions URL
  const getDirectionsUrl = () => {
    return `https://www.google.com/maps/dir/?api=1&destination=${FESTIVAL_COORDS.lat},${FESTIVAL_COORDS.lng}&destination_place_id=ChIJTfoJADDhwEARI45i-2a97X0&travelmode=driving`;
  };

  // Generate Google Maps embed URL
  const getEmbedUrl = () => {
    return `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2719.8!2d${FESTIVAL_COORDS.lng}!3d${FESTIVAL_COORDS.lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x40cbe30069bffa4d%3A0x7ded6b62f7268e63!2sFestivalul%20Lupilor!5e0!3m2!1sro!2smd!4v1`;
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

        {/* Header */}
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4">
            <MapPin className="h-3 w-3 mr-1" />
            {t("badge")}
          </Badge>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            {t("title")}
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            {t("subtitle")}
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {/* Map Section - Takes 2 columns on large screens */}
          <div className="lg:col-span-2">
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                {/* Map Container */}
                <div className="relative h-[400px] md:h-[500px] w-full bg-muted">
                  <iframe
                    src={getEmbedUrl()}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="absolute inset-0"
                    title={t("mapTitle")}
                  />
                </div>

                {/* Action Bar */}
                <div className="p-4 md:p-6 border-t">
                  <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-primary/10">
                        <Locate className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold">{FESTIVAL_COORDS.name}</p>
                        <p className="text-sm text-muted-foreground">{FESTIVAL_COORDS.address}</p>
                      </div>
                    </div>
                    <Button size="lg" asChild className="w-full sm:w-auto">
                      <a
                        href={getDirectionsUrl()}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Navigation className="h-4 w-4 mr-2" />
                        {t("getDirections")}
                        <ExternalLink className="h-3 w-3 ml-2" />
                      </a>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Info Sidebar */}
          <div className="space-y-6">
            {/* Location Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Compass className="h-5 w-5 text-primary" />
                  {t("location.title")}
                </CardTitle>
                <CardDescription>{t("location.description")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">{t("location.addressLabel")}</p>
                    <p className="text-sm text-muted-foreground">
                      Orheiul Vechi,<br />
                      r-nul Orhei, Moldova
                    </p>
                  </div>
                </div>
                <Separator />
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">{t("location.distanceLabel")}</p>
                    <p className="text-sm text-muted-foreground">
                      {t("location.distanceValue")}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Transport Options */}
            <Card>
              <CardHeader>
                <CardTitle>{t("transport.title")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {transportOptions.map((option) => {
                  const IconComponent = option.icon;
                  return (
                    <div
                      key={option.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-background">
                          <IconComponent className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{t(`transport.${option.id}.title`)}</p>
                          <p className="text-sm text-muted-foreground">
                            {t(`transport.${option.id}.description`)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-primary">{option.duration}</p>
                        <p className="text-xs text-muted-foreground">{option.distance}</p>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Parking Info */}
            <Card className="border">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Car className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-semibold">{t("parking.title")}</p>
                    <p className="text-sm text-muted-foreground">
                      {t("parking.description")}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Public Transport Section */}
        <div className="mt-16 max-w-5xl mx-auto">
          <Separator className="mb-12" />

          <div className="text-center mb-8">
            <Badge variant="outline" className="mb-4">
              <Bus className="h-3 w-3 mr-1" />
              {t("publicTransport.badge")}
            </Badge>
            <h2 className="text-2xl md:text-3xl font-bold mb-3">
              {t("publicTransport.title")}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t.rich("publicTransport.intro", {
                gara: (chunks) => (
                  <a
                    href={GARA_CENTRALA_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-primary underline-offset-4 hover:underline"
                  >
                    {chunks}
                  </a>
                ),
                autogara: (chunks) => (
                  <a
                    href={AUTOGARA_ORHEI_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-primary underline-offset-4 hover:underline"
                  >
                    {chunks}
                  </a>
                ),
              })}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {(["routeChisinau", "routeOrhei"] as const).map((route) => {
              const trips = t.raw(`publicTransport.${route}.trips`) as {
                from: string;
                times: string;
              }[];
              return (
                <Card key={route} className="overflow-hidden">
                  <CardHeader className="bg-muted/40 border-b">
                    <div className="flex items-center justify-between gap-3">
                      <CardTitle className="flex items-center gap-2.5 text-lg">
                        <span className="p-2 rounded-lg bg-primary/10">
                          <Bus className="h-5 w-5 text-primary" />
                        </span>
                        {t(`publicTransport.${route}.title`)}
                      </CardTitle>
                      <Badge className="shrink-0 gap-1">
                        <Ticket className="h-3 w-3" />
                        {t(`publicTransport.${route}.price`)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-5 space-y-4">
                    {trips.map((trip, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted">
                          <Clock className="h-4 w-4 text-primary" />
                        </span>
                        <div>
                          <p className="font-medium text-sm leading-snug">
                            {trip.from}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {trip.times}
                          </p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <p className="text-xs text-muted-foreground text-center mt-6 max-w-2xl mx-auto">
            {t("publicTransport.note")}
          </p>
        </div>

        {/* Additional Info Section */}
        <div className="mt-16 max-w-4xl mx-auto">
          <Separator className="mb-12" />

          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-2">
              {t("tips.title")}
            </h2>
            <p className="text-muted-foreground">
              {t("tips.subtitle")}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((num) => (
              <Card key={num} className="group hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold transition-colors">
                      {num}
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">{t(`tips.tip${num}.title`)}</h3>
                      <p className="text-sm text-muted-foreground">
                        {t(`tips.tip${num}.description`)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <Card className="max-w-2xl mx-auto border">
            <CardContent className="p-8 md:p-12">
              <h2 className="text-2xl md:text-3xl font-bold mb-3">
                {t("cta.title")}
              </h2>
              <p className="text-muted-foreground mb-6">
                {t("cta.subtitle")}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" asChild>
                  <Link href="/tickets">
                    {t("cta.buyTickets")}
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <a
                    href={getDirectionsUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Navigation className="h-4 w-4 mr-2" />
                    {t("getDirections")}
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
