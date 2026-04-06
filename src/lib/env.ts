/**
 * Validated environment variables.
 *
 * Rules:
 * - `API_URL` is client-safe (baked into the bundle via NEXT_PUBLIC_ prefix).
 *   It is required in production — if missing, this module throws at import
 *   time. In development it falls back to `http://localhost:3001`.
 * - `getAdminApiKey()` is server-only. It reads lazily and throws at call
 *   time if missing. Do NOT call it from client components.
 * - `TURNSTILE_SITE_KEY` is client-safe and optional. When unset, captcha is
 *   not rendered (useful for local dev).
 */

const isProd = process.env.NODE_ENV === "production";

function requiredInProd(
  name: string,
  value: string | undefined,
  devFallback: string
): string {
  if (value && value.length > 0) return value;
  if (isProd) {
    throw new Error(
      `[env] Missing required environment variable in production: ${name}`
    );
  }
  return devFallback;
}

/**
 * Base URL of the Express backend (festival-site-api).
 * Client-safe: callable from both server and browser code.
 */
export const API_URL = requiredInProd(
  "NEXT_PUBLIC_API_URL",
  process.env.NEXT_PUBLIC_API_URL,
  "http://localhost:3001"
);

/**
 * Cloudflare Turnstile site key for the admin login captcha.
 * Optional: if unset, the login page falls back to no-captcha mode (dev only).
 * Set it in prod via Vercel env → NEXT_PUBLIC_TURNSTILE_SITE_KEY.
 */
export const TURNSTILE_SITE_KEY =
  process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";

/**
 * Admin API key used to authenticate Next.js admin routes against the
 * Express backend. SERVER-ONLY. Throws at call time if missing.
 *
 * Accessed via function (not module-level const) so that accidentally
 * importing this file from a client component does not crash the whole
 * build — only the actual call site fails, with a clear error.
 */
export function getAdminApiKey(): string {
  const key = process.env.ADMIN_API_KEY;
  if (!key || key.length === 0) {
    throw new Error(
      "[env] ADMIN_API_KEY is not set. This is required for admin API routes."
    );
  }
  return key;
}
