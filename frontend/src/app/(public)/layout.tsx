import { Navbar } from "@/components/nav/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageTransition } from "@/components/motion/PageTransition";
import { cookies } from "next/headers";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

async function getSiteConfig() {
  try {
    const res = await fetch(`${API_BASE}/api/settings`, {
      next: { revalidate: 30 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data ?? null;
  } catch {
    return null;
  }
}

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const config = await getSiteConfig();

  return (
    <>
      <Navbar config={config} />
      {/*
       * padding-top: var(--nav-h) is the SINGLE canonical offset for the fixed navbar.
       * All pages use this clearance. Pages add their own breathing room ABOVE the content.
       */}
      <main id="main-content" tabIndex={-1} style={{ paddingTop: "var(--nav-h, 82px)" }}>
        <PageTransition>
          {children}
        </PageTransition>
      </main>
      <Footer config={config} />
    </>
  );
}
