"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  MessageCircle,
  Briefcase,
  Handshake,
  Music,
  Megaphone,
  Monitor,
  Clock,
  Newspaper,
  Users,
  Shield
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface Contact {
  id: number;
  department_key: string;
  email: string;
  phone: string | null;
}

interface ContactsContentProps {
  contacts: Contact[];
  siteContacts: Record<string, string>;
}

const departmentIcons: Record<string, React.ElementType> = {
  general: MessageCircle,
  commercial: Briefcase,
  partners: Handshake,
  artists: Music,
  marketing: Megaphone,
  it: Monitor,
  press: Newspaper,
  volunteers: Users,
  security: Shield,
};

export function ContactsContent({ contacts, siteContacts }: ContactsContentProps) {
  const t = useTranslations("Contacts");

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
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4">
            <Phone className="h-3 w-3 mr-1" />
            {t("badge")}
          </Badge>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            {t("title")}
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            {t("subtitle")}
          </p>
        </div>

        {/* Contacts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {contacts.map((contact) => {
            const IconComponent = departmentIcons[contact.department_key] || MessageCircle;
            return (
              <Card
                key={contact.id}
                className="group hover:shadow-lg hover:border-primary/30 transition-all"
              >
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <IconComponent className="h-6 w-6" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">
                        {t(`departments.${contact.department_key}`)}
                      </CardTitle>
                      <CardDescription>
                        {t(`departments.${contact.department_key}Desc`)}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <a
                    href={`mailto:${contact.email}`}
                    className="flex items-center gap-3 text-sm hover:text-primary transition-colors"
                  >
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{contact.email}</span>
                  </a>
                  {contact.phone && (
                    <a
                      href={`tel:${contact.phone.replace(/\s/g, '')}`}
                      className="flex items-center gap-3 text-sm hover:text-primary transition-colors"
                    >
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{contact.phone}</span>
                    </a>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Office Location Section */}
        <div className="mt-20 max-w-4xl mx-auto">
          <Separator className="mb-12" />

          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-2">
              {t("office.title")}
            </h2>
            <p className="text-muted-foreground">
              {t("office.subtitle")}
            </p>
          </div>

          <Card>
            <CardContent className="p-6 md:p-8">
              <div className="grid md:grid-cols-2 gap-8">
                {/* Address Info */}
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">{t("office.addressLabel")}</h3>
                      <p className="text-muted-foreground text-sm">
                        {siteContacts.office_address || "str. Petricani 17, mun. Chișinău, Moldova"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      <Clock className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">{t("office.hours")}</h3>
                      <p className="text-muted-foreground text-sm">
                        {siteContacts.office_hours || t("office.hoursValue")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      <MessageCircle className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">{t("office.social")}</h3>
                      <div className="flex gap-3 mt-2">
                        {siteContacts.facebook && (
                          <a
                            href={siteContacts.facebook}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-primary transition-colors"
                          >
                            Facebook
                          </a>
                        )}
                        {siteContacts.instagram && (
                          <a
                            href={siteContacts.instagram}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-primary transition-colors"
                          >
                            Instagram
                          </a>
                        )}
                        {siteContacts.telegram && (
                          <a
                            href={siteContacts.telegram}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-primary transition-colors"
                          >
                            Telegram
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Map */}
                <div className="relative h-64 md:h-full min-h-[250px] rounded-xl overflow-hidden bg-muted">
                  <iframe
                    src={siteContacts.google_maps_embed || "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2719.8!2d28.8577!3d47.0458!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x40c97c3628b769a1%3A0x0!2sStrada%20Petricani%2017%2C%20Chi%C8%99in%C4%83u!5e0!3m2!1sro!2smd!4v1"}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="absolute inset-0"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
