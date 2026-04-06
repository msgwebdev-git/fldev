import ResetPasswordClient from "./ResetPasswordClient";

export const metadata = {
  title: "Reset Password — Festivalul Lupilor",
  description: "Set a new password for your Festivalul Lupilor account",
  robots: { index: false, follow: false },
};

// Always render dynamically — the page only ever executes for a live
// recovery link with query parameters; there is nothing to pre-render.
// This also avoids the Next.js build-time warning about useSearchParams
// without a Suspense boundary in the client component.
export const dynamic = "force-dynamic";

export default ResetPasswordClient;
