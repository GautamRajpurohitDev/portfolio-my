import type { Metadata } from "next";
import { ContactSection } from "@/components/portfolio/ContactSection";
import { PublicPageHeader, PublicPageShell } from "@/components/layout/PublicPageShell";

export const metadata: Metadata = {
  title: "Contact & Collaboration",
  description: "Get in touch with Gautam Rajpurohit — open to collaboration, technical conversations, and engineering opportunities.",
};

const API_BASE = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

async function getSiteConfig() {
  try {
    const res = await fetch(`${API_BASE}/api/settings`, { cache: "no-store" });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data ?? null;
  } catch {
    return null;
  }
}

export default async function ContactPage() {
  const config = await getSiteConfig();

  return (
    <PublicPageShell>
      <PublicPageHeader
        eyebrow="07 / Get In Touch"
        title="Contact"
        subtitle="Open to technical conversations, software engineering discussions, and collaboration opportunities."
      />
      <ContactSection config={config} hideHeader={true} />
    </PublicPageShell>
  );
}
