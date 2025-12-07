"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { motion, useScroll, useTransform } from "motion/react";
import { Smartphone, Bell, Calendar, MapPin } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

function AppleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
    </svg>
  );
}

function GooglePlayIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
    </svg>
  );
}

const features = [
  { icon: Bell, key: "notifications" },
  { icon: Calendar, key: "schedule" },
  { icon: MapPin, key: "map" },
];

interface AppCTABlockProps {
  namespace: string;
  notificationText?: string;
}

export function AppCTABlock({ namespace, notificationText = "Main Stage in 30 min!" }: AppCTABlockProps) {
  const t = useTranslations(namespace);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const phoneY = useTransform(scrollYProgress, [0, 1], [50, -50]);
  const phoneRotate = useTransform(scrollYProgress, [0, 0.5, 1], [-3, 0, 3]);
  const phoneScale = useTransform(scrollYProgress, [0, 0.5, 1], [0.9, 1, 0.95]);

  const textOpacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);
  const textY = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [30, 0, 0, -30]);

  return (
    <div
      ref={containerRef}
      className="relative mt-12 py-12 sm:py-16 overflow-hidden rounded-2xl bg-gradient-to-b from-background via-primary/5 to-background border"
    >
      {/* Декоративные элементы фона */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="px-4 sm:px-8">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* Левая часть - Мокап телефона (только для десктопа) */}
          <motion.div
            style={{ y: phoneY, rotate: phoneRotate, scale: phoneScale }}
            className="relative hidden lg:flex justify-center"
          >
            {/* Свечение за телефоном */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-64 h-64 bg-primary/20 rounded-full blur-3xl animate-pulse" />
            </div>

            {/* Рамка телефона */}
            <div className="relative z-10">
              <div className="relative w-[260px] h-[520px]">
                {/* Корпус телефона */}
                <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 via-zinc-900 to-black rounded-[2.5rem] shadow-2xl">
                  {/* Внутренняя рамка */}
                  <div className="absolute inset-[3px] bg-black rounded-[2.3rem] overflow-hidden">
                    {/* Экран */}
                    <div className="relative w-full h-full bg-gradient-to-br from-primary/80 via-primary to-primary/90 p-3">
                      {/* Notch */}
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-black rounded-b-xl z-20" />

                      {/* Контент экрана приложения */}
                      <div className="mt-8 space-y-3">
                        {/* Лого и заголовок приложения */}
                        <div className="text-center text-white">
                          <div className="text-xl font-bold mb-1">FESTIVALUL</div>
                          <div className="text-sm font-light tracking-widest">LUPILOR</div>
                          <div className="text-xs opacity-80 mt-1">2026</div>
                        </div>

                        {/* Плитки функций */}
                        <div className="grid grid-cols-2 gap-2 mt-4">
                          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-2.5 text-white text-center">
                            <Calendar className="h-5 w-5 mx-auto mb-1" />
                            <div className="text-[10px]">Program</div>
                          </div>
                          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-2.5 text-white text-center">
                            <MapPin className="h-5 w-5 mx-auto mb-1" />
                            <div className="text-[10px]">Map</div>
                          </div>
                          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-2.5 text-white text-center">
                            <Bell className="h-5 w-5 mx-auto mb-1" />
                            <div className="text-[10px]">Alerts</div>
                          </div>
                          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-2.5 text-white text-center">
                            <Smartphone className="h-5 w-5 mx-auto mb-1" />
                            <div className="text-[10px]">Tickets</div>
                          </div>
                        </div>

                        {/* Уведомление */}
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5, duration: 0.5 }}
                          viewport={{ once: true }}
                          className="bg-white/30 backdrop-blur-md rounded-xl p-2.5 mt-3"
                        >
                          <div className="flex items-center gap-2 text-white">
                            <Bell className="h-3.5 w-3.5 shrink-0" />
                            <span className="text-[10px] font-medium">New: {notificationText}</span>
                          </div>
                        </motion.div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Боковые кнопки */}
                <div className="absolute left-0 top-20 w-1 h-6 bg-zinc-700 rounded-l" />
                <div className="absolute left-0 top-28 w-1 h-10 bg-zinc-700 rounded-l" />
                <div className="absolute left-0 top-40 w-1 h-10 bg-zinc-700 rounded-l" />
                <div className="absolute right-0 top-28 w-1 h-12 bg-zinc-700 rounded-r" />
              </div>
            </div>

            {/* Плавающие элементы вокруг телефона */}
            <motion.div
              animate={{ y: [0, -10, 0], rotate: [0, 5, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-8 left-0"
            >
              <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-xl p-2.5 flex items-center gap-2">
                <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                  <Bell className="h-4 w-4 text-primary" />
                </div>
                <div className="pr-1">
                  <div className="text-[10px] font-semibold">Push-уведомления</div>
                  <div className="text-[8px] text-muted-foreground">Не пропусти!</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [0, 10, 0], rotate: [0, -5, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute bottom-16 right-0"
            >
              <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-xl p-2.5 flex items-center gap-2">
                <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                  <MapPin className="h-4 w-4 text-green-600" />
                </div>
                <div className="pr-1">
                  <div className="text-[10px] font-semibold">Карта фестиваля</div>
                  <div className="text-[8px] text-muted-foreground">Offline доступ</div>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Правая часть - Текст и кнопки */}
          <motion.div
            style={{ opacity: textOpacity, y: textY }}
            className="text-center lg:text-left"
          >
            <Badge variant="outline" className="mb-3 sm:mb-4">
              <Smartphone className="h-3 w-3 mr-1" />
              {t("appCta.badge")}
            </Badge>

            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
              {t("appCta.title")}
            </h2>

            <p className="text-base sm:text-lg text-muted-foreground mb-6 sm:mb-8 max-w-lg mx-auto lg:mx-0 px-2 sm:px-0">
              {t("appCta.subtitle")}
            </p>

            {/* Мокап телефона для мобильной версии */}
            <div className="flex justify-center mb-8 lg:hidden">
              <div className="relative">
                {/* Свечение */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-40 h-40 bg-primary/20 rounded-full blur-3xl animate-pulse" />
                </div>

                {/* Телефон */}
                <div className="relative z-10 w-[200px] h-[400px]">
                  <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 via-zinc-900 to-black rounded-[2.5rem] shadow-2xl">
                    <div className="absolute inset-[3px] bg-black rounded-[2.3rem] overflow-hidden">
                      <div className="relative w-full h-full bg-gradient-to-br from-primary/80 via-primary to-primary/90 p-3">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-5 bg-black rounded-b-xl z-20" />

                        <div className="mt-6 space-y-2">
                          <div className="text-center text-white">
                            <div className="text-base font-bold">FESTIVALUL</div>
                            <div className="text-xs font-light tracking-widest">LUPILOR</div>
                            <div className="text-[8px] opacity-80 mt-1">2026</div>
                          </div>

                          <div className="grid grid-cols-2 gap-1 mt-3">
                            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-1.5 text-white text-center">
                              <Calendar className="h-3 w-3 mx-auto mb-0.5" />
                              <div className="text-[8px]">Program</div>
                            </div>
                            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-1.5 text-white text-center">
                              <MapPin className="h-3 w-3 mx-auto mb-0.5" />
                              <div className="text-[8px]">Map</div>
                            </div>
                            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-1.5 text-white text-center">
                              <Bell className="h-3 w-3 mx-auto mb-0.5" />
                              <div className="text-[8px]">Alerts</div>
                            </div>
                            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-1.5 text-white text-center">
                              <Smartphone className="h-3 w-3 mx-auto mb-0.5" />
                              <div className="text-[8px]">Tickets</div>
                            </div>
                          </div>

                          <div className="bg-white/30 backdrop-blur-md rounded-lg p-1.5 mt-2">
                            <div className="flex items-center gap-1 text-white">
                              <Bell className="h-2.5 w-2.5 shrink-0" />
                              <span className="text-[8px] font-medium">{notificationText}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Функции приложения */}
            <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.key}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  viewport={{ once: true }}
                  className="flex items-center gap-2 sm:gap-3 justify-center lg:justify-start"
                >
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <feature.icon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  </div>
                  <span className="text-sm sm:text-base text-foreground">{t(`appCta.features.${feature.key}`)}</span>
                </motion.div>
              ))}
            </div>

            {/* Кнопки скачивания */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start px-4 sm:px-0">
              <Button
                size="lg"
                className="bg-black hover:bg-zinc-800 text-white dark:bg-white dark:text-black dark:hover:bg-zinc-200 h-12 sm:h-14 px-4 sm:px-6 w-full sm:w-auto"
                asChild
              >
                <a href="#" className="flex items-center justify-center sm:justify-start gap-2 sm:gap-3">
                  <AppleIcon className="h-6 w-6 sm:h-7 sm:w-7" />
                  <div className="text-left">
                    <div className="text-[9px] sm:text-[10px] opacity-80">{t("appCta.downloadOn")}</div>
                    <div className="text-xs sm:text-sm font-semibold">App Store</div>
                  </div>
                </a>
              </Button>

              <Button
                size="lg"
                className="bg-black hover:bg-zinc-800 text-white dark:bg-white dark:text-black dark:hover:bg-zinc-200 h-12 sm:h-14 px-4 sm:px-6 w-full sm:w-auto"
                asChild
              >
                <a href="#" className="flex items-center justify-center sm:justify-start gap-2 sm:gap-3">
                  <GooglePlayIcon className="h-6 w-6 sm:h-7 sm:w-7" />
                  <div className="text-left">
                    <div className="text-[9px] sm:text-[10px] opacity-80">{t("appCta.getItOn")}</div>
                    <div className="text-xs sm:text-sm font-semibold">Google Play</div>
                  </div>
                </a>
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
