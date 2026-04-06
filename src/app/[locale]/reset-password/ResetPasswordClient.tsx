"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { CheckCircle2, Loader2, Lock, ShieldAlert } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Stage = "verifying" | "form" | "updating" | "success" | "invalid";

/**
 * Password reset landing page.
 *
 * Flow:
 *  1. User taps the reset link in the email.
 *  2. The link is built by our custom Supabase email template as:
 *       {{ .SiteURL }}/reset-password?token_hash={{ .TokenHash }}&type=recovery
 *     This avoids the default {{ .ConfirmationURL }} variable, which
 *     points to the Site URL root and has no knowledge of our app path.
 *  3. This page reads `token_hash` + `type` from the query, calls
 *     supabase.auth.verifyOtp({ token_hash, type: 'recovery' }), which
 *     validates the token with gotrue and establishes a recovery session.
 *  4. We show the new-password form. User submits →
 *     supabase.auth.updateUser({ password }) → force signOut() so the
 *     recovery session cannot be reused.
 *  5. Success screen: "return to the app". No automatic deep link —
 *     the mobile app has no intent-filter; the user switches back manually.
 *
 * Backwards compatibility:
 *  If a legacy recovery link (with `?code=...` PKCE or `#access_token=...`
 *  hash) still lands here, the Supabase JS client auto-parses it on init
 *  and fires PASSWORD_RECOVERY. We listen for that too, so both old and
 *  new flows work.
 */
export default function ResetPasswordClient() {
  const t = useTranslations("ResetPassword");
  const supabase = useMemo(() => createClient(), []);
  const searchParams = useSearchParams();

  const [stage, setStage] = useState<Stage>("verifying");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  // On mount: establish a recovery session from whatever the URL contains.
  useEffect(() => {
    let cancelled = false;

    const establish = async () => {
      // Preferred path: explicit token_hash + type=recovery (custom template).
      const tokenHash = searchParams.get("token_hash");
      const type = searchParams.get("type");

      if (tokenHash && type === "recovery") {
        const { error: verifyError } = await supabase.auth.verifyOtp({
          type: "recovery",
          token_hash: tokenHash,
        });
        if (cancelled) return;
        if (verifyError) {
          setStage("invalid");
          return;
        }
        setStage("form");
        return;
      }

      // Fallback path: legacy PKCE (?code=) or hash (#access_token=).
      // Supabase JS auto-parses these on client init. Give it a tick, then
      // check for a session.
      await new Promise((r) => setTimeout(r, 150));
      if (cancelled) return;

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (cancelled) return;
      setStage(session ? "form" : "invalid");
    };

    // Also react to PASSWORD_RECOVERY event (fires in the legacy flow
    // when Supabase finishes parsing the URL).
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (cancelled) return;
      if (event === "PASSWORD_RECOVERY" || (event === "SIGNED_IN" && session)) {
        setStage((prev) => (prev === "success" ? prev : "form"));
      }
    });

    establish();

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [supabase, searchParams]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError("");

      if (password.length < 8) {
        setError(t("errorPasswordTooShort"));
        return;
      }
      if (password !== confirmPassword) {
        setError(t("errorPasswordMismatch"));
        return;
      }

      setStage("updating");

      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) {
        setError(updateError.message || t("errorGeneric"));
        setStage("form");
        return;
      }

      // Invalidate the recovery session so it cannot be reused.
      await supabase.auth.signOut();

      setStage("success");
    },
    [password, confirmPassword, supabase, t]
  );

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: "#1a1a1a" }}
    >
      <div
        className="w-full max-w-md rounded-2xl overflow-hidden"
        style={{ backgroundColor: "#242424" }}
      >
        {/* Header */}
        <div
          className="px-8 py-7 text-center"
          style={{ backgroundColor: "#DC5722" }}
        >
          <div className="text-white font-bold text-lg tracking-[0.2em]">
            FESTIVALUL LUPILOR
          </div>
          <div className="text-white/70 text-xs mt-1 tracking-widest">
            7 • 8 • 9 AUGUST 2026
          </div>
        </div>

        {/* Body — render by stage */}
        <div className="px-8 py-10">
          {stage === "verifying" && (
            <div className="flex flex-col items-center text-center">
              <Loader2
                className="w-10 h-10 animate-spin mb-4"
                style={{ color: "#DC5722" }}
              />
              <div className="text-white/60 text-sm">{t("verifying")}</div>
            </div>
          )}

          {stage === "invalid" && (
            <div className="flex flex-col items-center text-center">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center mb-5"
                style={{ backgroundColor: "rgba(220, 87, 34, 0.12)" }}
              >
                <ShieldAlert className="w-7 h-7" style={{ color: "#DC5722" }} />
              </div>
              <div className="text-white font-semibold text-lg mb-2">
                {t("invalidTitle")}
              </div>
              <div className="text-white/50 text-sm leading-relaxed">
                {t("invalidBody")}
              </div>
            </div>
          )}

          {(stage === "form" || stage === "updating") && (
            <>
              <div className="text-center mb-8">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5"
                  style={{ backgroundColor: "rgba(220, 87, 34, 0.12)" }}
                >
                  <Lock className="w-6 h-6" style={{ color: "#DC5722" }} />
                </div>
                <div className="text-white font-semibold text-lg mb-2">
                  {t("formTitle")}
                </div>
                <div className="text-white/50 text-sm">{t("formSubtitle")}</div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-white/60 text-xs mb-2 tracking-wide">
                    {t("newPasswordLabel")}
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    required
                    minLength={8}
                    disabled={stage === "updating"}
                    className="w-full px-4 py-3 rounded-xl text-white placeholder:text-white/20 border outline-none focus:border-[#DC5722] transition-colors"
                    style={{
                      backgroundColor: "#1a1a1a",
                      borderColor: "rgba(255,255,255,0.08)",
                    }}
                  />
                </div>

                <div>
                  <label className="block text-white/60 text-xs mb-2 tracking-wide">
                    {t("confirmPasswordLabel")}
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    required
                    minLength={8}
                    disabled={stage === "updating"}
                    className="w-full px-4 py-3 rounded-xl text-white placeholder:text-white/20 border outline-none focus:border-[#DC5722] transition-colors"
                    style={{
                      backgroundColor: "#1a1a1a",
                      borderColor: "rgba(255,255,255,0.08)",
                    }}
                  />
                </div>

                {error && (
                  <div
                    className="rounded-xl px-4 py-3 text-sm text-center"
                    style={{
                      backgroundColor: "rgba(220, 87, 34, 0.08)",
                      color: "#ff8f66",
                      border: "1px solid rgba(220, 87, 34, 0.2)",
                    }}
                  >
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={stage === "updating"}
                  className="w-full py-3.5 rounded-xl text-white font-semibold text-sm tracking-wide transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                  style={{ backgroundColor: "#DC5722" }}
                >
                  {stage === "updating" ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {t("updating")}
                    </>
                  ) : (
                    t("submit")
                  )}
                </button>
              </form>

              <div className="mt-6 text-center text-white/30 text-xs leading-relaxed">
                {t("passwordHint")}
              </div>
            </>
          )}

          {stage === "success" && (
            <div className="flex flex-col items-center text-center">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center mb-5"
                style={{ backgroundColor: "rgba(34, 197, 94, 0.12)" }}
              >
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              </div>
              <div className="text-white font-semibold text-lg mb-2">
                {t("successTitle")}
              </div>
              <div className="text-white/50 text-sm leading-relaxed">
                {t("successBody")}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 pb-6 text-center">
          <div
            className="pt-4 text-[11px] text-white/20"
            style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
          >
            © 2026 Festivalul Lupilor · Orheiul Vechi, Moldova
          </div>
        </div>
      </div>
    </div>
  );
}
