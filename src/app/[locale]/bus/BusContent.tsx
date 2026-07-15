"use client";

import * as React from "react";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { motion } from "motion/react";
import {
  ArrowLeft,
  ArrowRight,
  Bus,
  Users,
  Baby,
  Minus,
  Plus,
  Loader2,
  Lock,
  ShieldCheck,
  User,
  Mail,
  AlertCircle,
  Check,
  MapPin,
  RefreshCw,
  Clock,
} from "lucide-react";
import { isValidPhoneNumber } from "react-phone-number-input";

import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Checkbox } from "@/components/ui/checkbox";
import { PhoneInput } from "@/components/ui/phone-input";
import { api } from "@/lib/api";
import type { BusDate } from "@/lib/data/bus";

const MONTHS_RU = ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"];
const MONTHS_RO = ["ianuarie", "februarie", "martie", "aprilie", "mai", "iunie", "iulie", "august", "septembrie", "octombrie", "noiembrie", "decembrie"];

function dayNum(iso: string) {
  return Number(iso.split("-")[2]);
}
function monthName(iso: string, isRu: boolean) {
  const m = Number(iso.split("-")[1]);
  return (isRu ? MONTHS_RU : MONTHS_RO)[(m || 1) - 1];
}
function weekday(iso: string, isRu: boolean) {
  return new Date(iso + "T00:00:00").toLocaleDateString(isRu ? "ru-RU" : "ro-RO", { weekday: "short" });
}
function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function BusContent({ dates, departureAddress }: { dates: BusDate[]; departureAddress?: string }) {
  const t = useTranslations("Bus");
  const locale = useLocale() as "ro" | "ru";
  const isRu = locale === "ru";

  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [adults, setAdults] = React.useState(1);
  const [childrenSeated, setChildrenSeated] = React.useState(0); // 2–7, half price, own seat
  const [children, setChildren] = React.useState(0); // under 2, lap, free
  const [form, setForm] = React.useState({ firstName: "", lastName: "", email: "", phone: "" });
  const [acceptTerms, setAcceptTerms] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [submitting, setSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState("");

  const selectedDates = dates.filter((d) => selected.has(d.id));
  const currency = dates[0]?.currency ?? "MDL";
  const childFare = (price: number) => Math.round(price / 2);
  // Seats consumed = adults + seated 2–7 children → capped by the tightest date.
  const seatCap = selectedDates.length ? Math.max(1, Math.min(20, ...selectedDates.map((d) => d.seatsLeft))) : 20;
  const maxAdults = Math.max(1, seatCap - childrenSeated);
  const maxChildrenSeated = Math.max(0, seatCap - adults);
  // Lap infants take no seat, but need a lap → at most one per adult.
  const maxInfants = adults;

  React.useEffect(() => {
    // Keep adults + seated children within the seat cap; adults ≥ 1.
    if (adults > seatCap) setAdults(Math.max(1, seatCap));
    if (adults + childrenSeated > seatCap) setChildrenSeated(Math.max(0, seatCap - adults));
    if (children > adults) setChildren(adults);
  }, [seatCap, adults, childrenSeated, children]);

  // Adults full fare + seated 2–7 children at half fare; lap infants free.
  const total = selectedDates.reduce(
    (sum, d) => sum + d.price * adults + childFare(d.price) * childrenSeated,
    0,
  );

  const toggleDate = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (selectedDates.length === 0) e.dates = t("errors.selectDate");
    if (!form.firstName.trim()) e.firstName = t("errors.required");
    if (!form.lastName.trim()) e.lastName = t("errors.required");
    if (!form.email.trim()) e.email = t("errors.required");
    else if (!validateEmail(form.email)) e.email = t("errors.invalidEmail");
    if (!form.phone) e.phone = t("errors.required");
    else if (!isValidPhoneNumber(form.phone)) e.phone = t("errors.invalidPhone");
    if (!acceptTerms) e.terms = t("errors.acceptTerms");
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setSubmitError("");
    try {
      const result = await api.createBusOrder({ customer: form, busDateIds: [...selected], passengers: adults, childrenSeated, children, language: locale });
      if (result.success && result.data) window.location.href = result.data.redirectUrl;
      else { setSubmitError(result.error || t("errors.orderFailed")); setSubmitting(false); }
    } catch {
      setSubmitError(t("errors.orderFailed"));
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-neutral-100 dark:bg-neutral-950">
      {/* ── Cinematic hero ─────────────────────────────── */}
      <section className="relative overflow-hidden bg-neutral-900 pt-24 pb-32 text-white">
        {/* Background photo + dark overlay so the white text stays readable */}
        <Image
          src="https://ybumbbtackrfdhijvfkz.supabase.co/storage/v1/object/public/gallery/bus-image.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          style={{ objectFit: "cover", objectPosition: "center" }}
          className="pointer-events-none select-none"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-neutral-950/85 via-neutral-950/65 to-neutral-950/40" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.15]" style={{ backgroundImage: "radial-gradient(circle at 20% 30%, var(--primary), transparent 45%), radial-gradient(circle at 85% 60%, var(--primary), transparent 40%)" }} />
        <div className="pointer-events-none absolute -bottom-24 left-1/2 h-64 w-[120%] -translate-x-1/2 rounded-[100%] bg-primary/20 blur-3xl" />
        <div className="container relative mx-auto max-w-5xl px-4">
          <Link href="/" className="mb-8 inline-flex items-center gap-1.5 text-sm text-white/70 transition-colors hover:text-white">
            <ArrowLeft className="h-4 w-4" /> {t("backToHome")}
          </Link>
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium backdrop-blur-sm">
              <Bus className="h-3.5 w-3.5" /> {t("badge")}
            </span>
            <h1 className="mt-4 text-4xl font-black leading-[1.05] tracking-tight md:text-6xl">{t("title")}</h1>
            <p className="mt-3 text-lg text-white/70">{t("subtitle")}</p>
          </div>
        </div>
      </section>

      {/* ── Boarding pass ──────────────────────────────── */}
      {/* pb-20 here (not mb-20 on the form): a bottom MARGIN on the last child
          collapses through <main> and lets the white body show as a strip. */}
      <div className="container mx-auto max-w-5xl px-4 pb-20">
        <form onSubmit={handleSubmit} className="relative -mt-20">
          <div className="relative overflow-hidden rounded-[1.75rem] bg-card shadow-[0_40px_100px_-40px_rgba(0,0,0,0.5)] lg:grid lg:grid-cols-[1fr_23rem]">
            {/* ── Left: trip + passenger ─────────────── */}
            <div className="p-6 md:p-8 lg:p-10">
              {/* Route */}
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{isRu ? "Откуда" : "De la"}</p>
                  <p className="text-xl font-black">Chișinău</p>
                </div>
                <div className="flex flex-1 flex-col items-center">
                  <span className="mb-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-semibold text-primary">
                    {isRu ? "туда-обратно" : "dus-întors"}
                  </span>
                  <div className="relative flex w-full items-center">
                    <span className="h-2 w-2 rounded-full bg-primary" />
                    <span className="h-px flex-1 border-t-2 border-dashed border-primary/40" />
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm"><Bus className="h-4 w-4" /></span>
                    <span className="h-px flex-1 border-t-2 border-dashed border-primary/40" />
                    <MapPin className="h-4 w-4 text-primary" />
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{isRu ? "Куда" : "Către"}</p>
                  <p className="text-xl font-black">Festival</p>
                </div>
              </div>

              {departureAddress && (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(departureAddress)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 flex items-start gap-2 rounded-xl bg-muted/50 px-3.5 py-2.5 text-sm transition-colors hover:bg-muted"
                >
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span className="text-muted-foreground">
                    <span className="font-semibold text-foreground">{isRu ? "Отправление из Кишинёва: " : "Plecare din Chișinău: "}</span>
                    <span className="text-primary underline underline-offset-2">{departureAddress}</span>
                  </span>
                </a>
              )}

              <div className="my-7 h-px bg-border" />

              {/* Dates */}
              <div>
                <p className="mb-3 text-sm font-bold">{t("selectDates")}</p>
                {dates.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-border py-8 text-center text-sm text-muted-foreground">{t("noDates")}</div>
                ) : (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {dates.map((d, i) => {
                      const soldOut = d.seatsLeft <= 0;
                      const isSel = selected.has(d.id);
                      const firstDep = d.departTimeTur ?? "12:00";
                      const lastRet = d.departTimeRetur ?? "00:30";
                      return (
                        <motion.button
                          key={d.id}
                          type="button"
                          disabled={soldOut}
                          onClick={() => toggleDate(d.id)}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.04 * i }}
                          whileTap={{ scale: 0.98 }}
                          className={`group relative overflow-hidden rounded-2xl border-2 p-4 text-left transition-all ${
                            isSel ? "border-primary" : "border-border hover:border-primary/40"
                          } ${soldOut ? "cursor-not-allowed opacity-45" : ""}`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-baseline gap-2">
                              <span className="text-3xl font-black leading-none">{dayNum(d.travelDate)}</span>
                              <span className="text-sm font-semibold text-muted-foreground">{monthName(d.travelDate, isRu)}</span>
                            </div>
                            <span className={`flex h-6 w-6 items-center justify-center rounded-full border-2 transition-colors ${isSel ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/25"}`}>
                              {isSel && <Check className="h-3.5 w-3.5" />}
                            </span>
                          </div>
                          <p className="mt-1 text-xs capitalize text-muted-foreground">
                            {weekday(d.travelDate, isRu)}
                          </p>
                          <div className="mt-2 space-y-1 text-[11px] font-medium text-muted-foreground">
                            <p className="flex items-center gap-1.5">
                              <ArrowRight className="h-3 w-3 text-primary" />
                              {t("cardDepart")} <span className="font-bold text-foreground">{firstDep}</span>
                            </p>
                            <p className="flex items-center gap-1.5">
                              <ArrowLeft className="h-3 w-3 text-primary" />
                              {t("cardReturn")} <span className="font-bold text-foreground">{lastRet}</span>
                            </p>
                          </div>
                          <div className="mt-3 flex items-center justify-between">
                            <span className="text-lg font-bold text-primary">{d.price} {currency}</span>
                            {soldOut && (
                              <span className="text-xs font-medium text-muted-foreground">{t("soldOut")}</span>
                            )}
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                )}
                {errors.dates && <p className="mt-2 text-sm text-destructive">{errors.dates}</p>}
              </div>

              {/* Schedule info */}
              <div className="mt-5 flex gap-3 rounded-2xl border border-primary/15 bg-primary/[0.04] p-4">
                <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Clock className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-bold">{t("scheduleTitle")}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{t("scheduleNote")}</p>
                </div>
              </div>

              {/* Passengers: adults 7+, seated 2–7 (half price), lap under-2 (free) */}
              <div className="mt-6 space-y-3">
                {/* Adults 7+ */}
                <div className="flex items-center justify-between rounded-2xl bg-muted/50 p-4">
                  <div className="flex items-center gap-2.5">
                    <Users className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-sm font-bold">{t("adults")}</p>
                      <p className="text-xs text-muted-foreground">{t("adultsHint")}</p>
                    </div>
                  </div>
                  <div className="flex items-center rounded-xl border border-border bg-card">
                    <button type="button" disabled={adults <= 1} onClick={() => setAdults((p) => Math.max(1, p - 1))} className="flex h-10 w-10 items-center justify-center text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30"><Minus className="h-4 w-4" /></button>
                    <span className="w-10 text-center text-lg font-bold tabular-nums">{adults}</span>
                    <button type="button" disabled={adults >= maxAdults} onClick={() => setAdults((p) => Math.min(maxAdults, p + 1))} className="flex h-10 w-10 items-center justify-center text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30"><Plus className="h-4 w-4" /></button>
                  </div>
                </div>

                {/* Children 2–7 (half price, own seat + ticket) */}
                <div className="flex items-center justify-between rounded-2xl bg-muted/50 p-4">
                  <div className="flex items-center gap-2.5">
                    <Baby className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-sm font-bold">{t("children")}</p>
                      <p className="text-xs text-muted-foreground">{t("childrenHint")}</p>
                    </div>
                  </div>
                  <div className="flex items-center rounded-xl border border-border bg-card">
                    <button type="button" disabled={childrenSeated <= 0} onClick={() => setChildrenSeated((c) => Math.max(0, c - 1))} className="flex h-10 w-10 items-center justify-center text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30"><Minus className="h-4 w-4" /></button>
                    <span className="w-10 text-center text-lg font-bold tabular-nums">{childrenSeated}</span>
                    <button type="button" disabled={childrenSeated >= maxChildrenSeated} onClick={() => setChildrenSeated((c) => Math.min(maxChildrenSeated, c + 1))} className="flex h-10 w-10 items-center justify-center text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30"><Plus className="h-4 w-4" /></button>
                  </div>
                </div>

                {/* Infants under 2 (free, on a lap) */}
                <div className="flex items-center justify-between rounded-2xl bg-muted/50 p-4">
                  <div className="flex items-center gap-2.5">
                    <Baby className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-sm font-bold">{t("infants")}</p>
                      <p className="text-xs text-muted-foreground">{t("infantsHint")}</p>
                    </div>
                  </div>
                  <div className="flex items-center rounded-xl border border-border bg-card">
                    <button type="button" disabled={children <= 0} onClick={() => setChildren((c) => Math.max(0, c - 1))} className="flex h-10 w-10 items-center justify-center text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30"><Minus className="h-4 w-4" /></button>
                    <span className="w-10 text-center text-lg font-bold tabular-nums">{children}</span>
                    <button type="button" disabled={children >= maxInfants} onClick={() => setChildren((c) => Math.min(maxInfants, c + 1))} className="flex h-10 w-10 items-center justify-center text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30"><Plus className="h-4 w-4" /></button>
                  </div>
                </div>
              </div>

              {/* Customer */}
              <div className="mt-6">
                <p className="mb-3 text-sm font-bold">{t("customerInfo")}</p>
                <div className="space-y-3">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <InputGroup className={`h-12 ${errors.firstName ? "border-destructive" : ""}`}><InputGroupAddon><User className="h-4 w-4" /></InputGroupAddon><InputGroupInput name="firstName" value={form.firstName} onChange={handleInput} placeholder={t("firstName")} className="h-12 text-base" /></InputGroup>
                      {errors.firstName && <p className="pl-1 text-sm text-destructive">{errors.firstName}</p>}
                    </div>
                    <div className="space-y-1.5">
                      <InputGroup className={`h-12 ${errors.lastName ? "border-destructive" : ""}`}><InputGroupAddon><User className="h-4 w-4" /></InputGroupAddon><InputGroupInput name="lastName" value={form.lastName} onChange={handleInput} placeholder={t("lastName")} className="h-12 text-base" /></InputGroup>
                      {errors.lastName && <p className="pl-1 text-sm text-destructive">{errors.lastName}</p>}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <InputGroup className={`h-12 ${errors.email ? "border-destructive" : validateEmail(form.email) ? "border-green-500" : ""}`}><InputGroupAddon><Mail className="h-4 w-4" /></InputGroupAddon><InputGroupInput name="email" type="email" value={form.email} onChange={handleInput} placeholder="Email" className="h-12 text-base" /></InputGroup>
                      {errors.email && <p className="pl-1 text-sm text-destructive">{errors.email}</p>}
                    </div>
                    <div className="space-y-1.5">
                      <div className={errors.phone ? "[&_button]:border-destructive [&_input]:border-destructive" : ""}>
                        <PhoneInput value={form.phone} onChange={(value) => { setForm((p) => ({ ...p, phone: value })); if (errors.phone) setErrors((p) => ({ ...p, phone: "" })); }} />
                      </div>
                      {errors.phone && <p className="pl-1 text-sm text-destructive">{errors.phone}</p>}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Right: stub (summary + pay) ─────────── */}
            <div className="relative border-t border-dashed border-border bg-muted/30 p-6 md:p-8 lg:border-l lg:border-t-0 lg:p-8">
              <div className="lg:sticky lg:top-24">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">{t("orderSummary")}</p>

                <div className="mt-4 space-y-3">
                  {selectedDates.length === 0 ? (
                    <p className="py-6 text-center text-sm text-muted-foreground">{t("emptySummary")}</p>
                  ) : (
                    selectedDates.map((d) => (
                      <div key={d.id} className="text-sm">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <RefreshCw className="h-3.5 w-3.5 text-primary" />
                            <p className="font-semibold">{dayNum(d.travelDate)} {monthName(d.travelDate, isRu)}</p>
                          </div>
                          <span className="font-semibold tabular-nums">{d.price * adults + childFare(d.price) * childrenSeated} {currency}</span>
                        </div>
                        <div className="mt-1 space-y-0.5 pl-[22px] text-xs text-muted-foreground">
                          <div className="flex items-center justify-between gap-2">
                            <span>{t("adults")} · {adults}</span>
                            <span className="tabular-nums">{d.price * adults} {currency}</span>
                          </div>
                          {childrenSeated > 0 && (
                            <div className="flex items-center justify-between gap-2">
                              <span>{t("children")} · {childrenSeated}</span>
                              <span className="tabular-nums">{childFare(d.price) * childrenSeated} {currency}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                  {selectedDates.length > 0 && children > 0 && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Baby className="h-3.5 w-3.5 text-primary" />
                      {t("infantsSummary", { count: children })}
                    </div>
                  )}
                </div>

                <div className="my-5 h-px bg-border" />

                <div className="flex items-end justify-between">
                  <span className="text-sm font-semibold text-muted-foreground">{t("total")}</span>
                  <span className="text-3xl font-black text-primary">{total}<span className="ml-1 text-base font-bold text-muted-foreground">{currency}</span></span>
                </div>

                {submitError && (
                  <div className="mt-4 rounded-lg border border-destructive/20 bg-destructive/10 p-3">
                    <p className="flex items-center gap-2 text-sm text-destructive"><AlertCircle className="h-4 w-4" />{submitError}</p>
                  </div>
                )}

                <Button type="submit" size="lg" className="mt-5 w-full gap-2 rounded-xl py-6 text-base shadow-lg shadow-primary/25" disabled={submitting || total <= 0}>
                  {submitting ? <><Loader2 className="h-5 w-5 animate-spin" />{t("processing")}</> : <><Lock className="h-5 w-5" />{t("pay")}</>}
                </Button>

                <label htmlFor="terms" className="mt-4 flex cursor-pointer items-start gap-2.5">
                  <Checkbox id="terms" checked={acceptTerms} onCheckedChange={(c) => { setAcceptTerms(c as boolean); if (errors.terms) setErrors((p) => ({ ...p, terms: "" })); }} className={`mt-0.5 flex-shrink-0 ${errors.terms ? "border-destructive" : ""}`} />
                  <span className="text-xs leading-relaxed text-muted-foreground">
                    {t("terms.accept")} <Link href="/terms" className="text-primary hover:underline">{t("terms.termsLink")}</Link> {t("terms.and")} <Link href="/privacy" className="text-primary hover:underline">{t("terms.privacyLink")}</Link>
                    {errors.terms && <span className="mt-1 block text-destructive">{errors.terms}</span>}
                  </span>
                </label>

                <div className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-card/60 py-2.5 text-xs text-muted-foreground">
                  <ShieldCheck className="h-4 w-4 text-primary" /> {t("secure")} · {t("encrypted")}
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}
