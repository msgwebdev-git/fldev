"use client";

import { useEffect, useRef } from "react";

// Minimal typing for the global Turnstile API loaded by the Cloudflare script.
declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          "error-callback"?: () => void;
          "expired-callback"?: () => void;
          theme?: "light" | "dark" | "auto";
          size?: "normal" | "compact";
          action?: string;
        }
      ) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId?: string) => void;
    };
    onloadTurnstileCallback?: () => void;
  }
}

interface TurnstileProps {
  siteKey: string;
  onVerify: (token: string) => void;
  onExpire?: () => void;
  onError?: () => void;
  action?: string;
}

/**
 * Cloudflare Turnstile captcha widget.
 *
 * Loads the Turnstile JS once per page, then renders the widget on mount and
 * cleans up on unmount. Calls `onVerify(token)` when the user passes the
 * challenge. The token is short-lived (a few minutes) — consume it on the
 * very next auth call.
 */
export function Turnstile({
  siteKey,
  onVerify,
  onExpire,
  onError,
  action,
}: TurnstileProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Load the Turnstile script once.
    const SCRIPT_ID = "cf-turnstile-script";
    let script = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;

    const render = () => {
      if (!window.turnstile || !containerRef.current) return;
      // If we already rendered a widget in this container (StrictMode double
      // mount), remove it first to avoid duplicates.
      if (widgetIdRef.current) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {
          // ignore
        }
        widgetIdRef.current = null;
      }
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        callback: onVerify,
        "error-callback": onError,
        "expired-callback": onExpire,
        theme: "light",
        action,
      });
    };

    if (!script) {
      script = document.createElement("script");
      script.id = SCRIPT_ID;
      script.src =
        "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.async = true;
      script.defer = true;
      script.onload = render;
      document.head.appendChild(script);
    } else if (window.turnstile) {
      render();
    } else {
      // Script tag exists but API not yet ready — wait for its load event.
      script.addEventListener("load", render);
    }

    return () => {
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {
          // ignore
        }
        widgetIdRef.current = null;
      }
    };
  }, [siteKey, onVerify, onExpire, onError, action]);

  return <div ref={containerRef} className="flex justify-center" />;
}
