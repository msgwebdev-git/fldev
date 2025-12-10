"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useTranslations } from "next-intl";
import { Loader2, Upload, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { submitPartnerApplication } from "./actions";

const formSchema = z.object({
  contactName: z.string().min(2, "nameRequired"),
  email: z.string().email("emailInvalid"),
  companyName: z.string().min(2, "companyRequired"),
  website: z.string().url("websiteInvalid").optional().or(z.literal("")),
  category: z.string().min(1, "categoryRequired"),
  message: z.string().min(10, "messageRequired"),
  agree: z.boolean().refine((val) => val === true, "agreeRequired"),
});

type FormValues = z.infer<typeof formSchema>;

interface PartnerApplicationFormProps {
  onSuccess?: () => void;
}

export function PartnerApplicationForm({ onSuccess }: PartnerApplicationFormProps) {
  const t = useTranslations("Partners.form");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [logoFile, setLogoFile] = React.useState<File | null>(null);
  const [logoPreview, setLogoPreview] = React.useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      contactName: "",
      email: "",
      companyName: "",
      website: "",
      category: "",
      message: "",
      agree: false,
    },
  });

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast.error(t("logoTooLarge"));
        return;
      }

      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error(t("logoInvalidType"));
        return;
      }

      setLogoFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
  };

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("contactName", data.contactName);
      formData.append("email", data.email);
      formData.append("companyName", data.companyName);
      formData.append("website", data.website || "");
      formData.append("category", data.category);
      formData.append("message", data.message);

      if (logoFile) {
        formData.append("logo", logoFile);
      }

      const result = await submitPartnerApplication(formData);

      if (result.success) {
        toast.success(t("successMessage"));
        form.reset();
        removeLogo();
        onSuccess?.();
      } else {
        toast.error(result.error || t("errorMessage"));
      }
    } catch (error) {
      toast.error(t("errorMessage"));
      console.error("Form submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Contact Name */}
        <FormField
          control={form.control}
          name="contactName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("contactName")}</FormLabel>
              <FormControl>
                <Input placeholder={t("contactNamePlaceholder")} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Email */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("email")}</FormLabel>
              <FormControl>
                <Input type="email" placeholder={t("emailPlaceholder")} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Company Name */}
        <FormField
          control={form.control}
          name="companyName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("companyName")}</FormLabel>
              <FormControl>
                <Input placeholder={t("companyNamePlaceholder")} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Website */}
        <FormField
          control={form.control}
          name="website"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("website")}</FormLabel>
              <FormControl>
                <Input placeholder="https://example.com" {...field} />
              </FormControl>
              <FormDescription>{t("websiteDescription")}</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Category */}
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("category")}</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t("categoryPlaceholder")} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="patronage">{t("categories.patronage")}</SelectItem>
                  <SelectItem value="generalPartner">{t("categories.generalPartner")}</SelectItem>
                  <SelectItem value="partners">{t("categories.partners")}</SelectItem>
                  <SelectItem value="generalMediaPartner">{t("categories.generalMediaPartner")}</SelectItem>
                  <SelectItem value="mediaPartners">{t("categories.mediaPartners")}</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>{t("categoryDescription")}</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Logo Upload */}
        <FormItem>
          <FormLabel>{t("logo")}</FormLabel>
          <FormControl>
            <div className="space-y-4">
              {logoPreview ? (
                <div className="relative w-32 h-32 border-2 border-dashed rounded-lg overflow-hidden">
                  <img src={logoPreview} alt="Logo preview" className="w-full h-full object-contain" />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-1 right-1 h-6 w-6"
                    onClick={removeLogo}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                  <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                  <span className="text-sm text-muted-foreground">{t("logoUpload")}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleLogoChange}
                  />
                </label>
              )}
            </div>
          </FormControl>
          <FormDescription>{t("logoDescription")}</FormDescription>
        </FormItem>

        {/* Message */}
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("message")}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={t("messagePlaceholder")}
                  className="min-h-[120px]"
                  {...field}
                />
              </FormControl>
              <FormDescription>{t("messageDescription")}</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Terms Agreement */}
        <FormField
          control={form.control}
          name="agree"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>{t("agreeTerms")}</FormLabel>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />

        {/* Submit Button */}
        <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {t("submit")}
        </Button>
      </form>
    </Form>
  );
}
