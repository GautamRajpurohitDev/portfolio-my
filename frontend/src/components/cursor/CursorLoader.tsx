"use client";

/**
 * CursorLoader — thin Client Component wrapper that lazy-loads
 * LiquidCursor only on the client, avoiding SSR issues.
 * Required because root layout.tsx is a Server Component and
 * `dynamic({ ssr: false })` is not allowed there in Next.js App Router.
 */

import dynamic from "next/dynamic";

const LiquidCursor = dynamic(
  () => import("./LiquidCursor"),
  {
    ssr: false,
    // No loading fallback — cursor is a progressive enhancement
    loading: () => null,
  }
);

export default function CursorLoader() {
  return <LiquidCursor />;
}
