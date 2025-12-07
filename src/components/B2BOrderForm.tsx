"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { CreditCard, FileText, Building2, User, Mail, Phone, MapPin, FileDigit, MessageSquare } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export interface B2BOrderFormData {
  company: {
    name: string;
    taxId: string;
    address: string;
  };
  contact: {
    name: string;
    email: string;
    phone: string;
  };
  paymentMethod: "online" | "invoice";
  notes: string;
}

interface B2BOrderFormProps {
  initialData?: Partial<B2BOrderFormData>;
  onSubmit: (data: B2BOrderFormData) => void;
  isLoading?: boolean;
}

export function B2BOrderForm({ initialData, onSubmit, isLoading }: B2BOrderFormProps) {
  const t = useTranslations("B2BOrderForm");

  const [formData, setFormData] = React.useState<B2BOrderFormData>({
    company: {
      name: initialData?.company?.name || "",
      taxId: initialData?.company?.taxId || "",
      address: initialData?.company?.address || "",
    },
    contact: {
      name: initialData?.contact?.name || "",
      email: initialData?.contact?.email || "",
      phone: initialData?.contact?.phone || "",
    },
    paymentMethod: initialData?.paymentMethod || "invoice",
    notes: initialData?.notes || "",
  });

  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const handleChange = (
    section: "company" | "contact",
    field: string,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));

    // Clear error for this field
    const errorKey = `${section}.${field}`;
    if (errors[errorKey]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[errorKey];
        return newErrors;
      });
    }
  };

  const handlePaymentMethodChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      paymentMethod: value as "online" | "invoice",
    }));
  };

  const handleNotesChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      notes: value,
    }));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Company validation
    if (!formData.company.name.trim()) {
      newErrors["company.name"] = t("errors.companyNameRequired");
    }

    if (!formData.company.address.trim()) {
      newErrors["company.address"] = t("errors.addressRequired");
    }

    // Contact validation
    if (!formData.contact.name.trim()) {
      newErrors["contact.name"] = t("errors.contactNameRequired");
    }

    if (!formData.contact.email.trim()) {
      newErrors["contact.email"] = t("errors.emailRequired");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contact.email)) {
      newErrors["contact.email"] = t("errors.emailInvalid");
    }

    if (!formData.contact.phone.trim()) {
      newErrors["contact.phone"] = t("errors.phoneRequired");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validate()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Company and Contact Information - Two Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Company Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              {t("companyInfo")}
            </CardTitle>
            <CardDescription>{t("companyInfoDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">
                {t("companyName")} <span className="text-destructive">*</span>
              </Label>
              <Input
                id="companyName"
                value={formData.company.name}
                onChange={(e) => handleChange("company", "name", e.target.value)}
                placeholder={t("companyNamePlaceholder")}
                className={errors["company.name"] ? "border-destructive" : ""}
              />
              {errors["company.name"] && (
                <p className="text-sm text-destructive">{errors["company.name"]}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="taxId">{t("taxId")}</Label>
              <div className="relative">
                <FileDigit className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="taxId"
                  value={formData.company.taxId}
                  onChange={(e) => handleChange("company", "taxId", e.target.value)}
                  placeholder={t("taxIdPlaceholder")}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">
                {t("address")} <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Textarea
                  id="address"
                  value={formData.company.address}
                  onChange={(e) => handleChange("company", "address", e.target.value)}
                  placeholder={t("addressPlaceholder")}
                  className={`pl-10 ${errors["company.address"] ? "border-destructive" : ""}`}
                  rows={3}
                />
              </div>
              {errors["company.address"] && (
                <p className="text-sm text-destructive">{errors["company.address"]}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              {t("contactInfo")}
            </CardTitle>
            <CardDescription>{t("contactInfoDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="contactName">
                {t("contactName")} <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="contactName"
                  value={formData.contact.name}
                  onChange={(e) => handleChange("contact", "name", e.target.value)}
                  placeholder={t("contactNamePlaceholder")}
                  className={`pl-10 ${errors["contact.name"] ? "border-destructive" : ""}`}
                />
              </div>
              {errors["contact.name"] && (
                <p className="text-sm text-destructive">{errors["contact.name"]}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactEmail">
                {t("contactEmail")} <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="contactEmail"
                  type="email"
                  value={formData.contact.email}
                  onChange={(e) => handleChange("contact", "email", e.target.value)}
                  placeholder={t("contactEmailPlaceholder")}
                  className={`pl-10 ${errors["contact.email"] ? "border-destructive" : ""}`}
                />
              </div>
              {errors["contact.email"] && (
                <p className="text-sm text-destructive">{errors["contact.email"]}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactPhone">
                {t("contactPhone")} <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="contactPhone"
                  type="tel"
                  value={formData.contact.phone}
                  onChange={(e) => handleChange("contact", "phone", e.target.value)}
                  placeholder={t("contactPhonePlaceholder")}
                  className={`pl-10 ${errors["contact.phone"] ? "border-destructive" : ""}`}
                />
              </div>
              {errors["contact.phone"] && (
                <p className="text-sm text-destructive">{errors["contact.phone"]}</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Method */}
      <Card>
        <CardHeader>
          <CardTitle>{t("paymentMethod")}</CardTitle>
          <CardDescription>{t("paymentMethodDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup value={formData.paymentMethod} onValueChange={handlePaymentMethodChange} className="space-y-4">
            <Label htmlFor="online" className="flex items-start gap-4 rounded-lg border-2 p-4 hover:bg-accent transition-colors cursor-pointer">
              <RadioGroupItem value="online" id="online" className="mt-1" />
              <div className="flex-1">
                <div>
                  <p className="font-semibold text-base mb-1">{t("paymentOnline")}</p>
                  <p className="text-sm md:text-base text-muted-foreground leading-relaxed">{t("paymentOnlineDescription")}</p>
                </div>
              </div>
            </Label>

            <Label htmlFor="invoice" className="flex items-start gap-4 rounded-lg border-2 p-4 hover:bg-accent transition-colors cursor-pointer">
              <RadioGroupItem value="invoice" id="invoice" className="mt-1" />
              <div className="flex-1">
                <div>
                  <p className="font-semibold text-base mb-1">{t("paymentInvoice")}</p>
                  <p className="text-sm md:text-base text-muted-foreground leading-relaxed">{t("paymentInvoiceDescription")}</p>
                </div>
              </div>
            </Label>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Additional Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            {t("notes")}
          </CardTitle>
          <CardDescription>{t("notesDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={formData.notes}
            onChange={(e) => handleNotesChange(e.target.value)}
            placeholder={t("notesPlaceholder")}
            rows={4}
          />
        </CardContent>
      </Card>

      {/* Submit Button */}
      <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
        {isLoading ? t("submitting") : t("submit")}
      </Button>
    </form>
  );
}
