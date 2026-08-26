import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/context/AuthContext";
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://gautamrajpurohit.dev"),
  title: {
    default: "Gautam Rajpurohit — Software Development Journey",
    template: "%s | Gautam Rajpurohit",
  },
  description:
    "MCA student building strong programming fundamentals, software engineering skills, and real-world projects. Documenting the journey publicly.",
  keywords: [
    "Gautam Rajpurohit",
    "developer portfolio",
    "MCA student",
    "software engineering",
    "programming journey",
    "web development",
    "India",
  ],
  authors: [{ name: "Gautam Rajpurohit" }],
  creator: "Gautam Rajpurohit",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://gautamrajpurohit.dev",
    title: "Gautam Rajpurohit — Software Development Journey",
    description:
      "MCA student building strong programming fundamentals, software engineering skills, and real-world projects.",
    siteName: "Gautam Rajpurohit",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Gautam Rajpurohit — Developer Portfolio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Gautam Rajpurohit — Software Development Journey",
    description:
      "MCA student building strong programming fundamentals, software engineering skills, and real-world projects.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} dark`} suppressHydrationWarning>
      <head>
        {/* Clash Grotesk via Fontshare */}
        <link rel="preconnect" href="https://api.fontshare.com" />
        <link
          rel="stylesheet"
          href="https://api.fontshare.com/v2/css?f[]=clash-grotesk@400,500,600,700&display=swap"
        />
        {/* JetBrains Mono via CDN */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
        <style>{`
          :root {
            --font-clash: 'Clash Grotesk';
            --font-archivo: 'Archivo';
            --font-jetbrains: 'JetBrains Mono';
          }
        `}</style>
      </head>
      <body className="bg-bg text-text-primary font-body antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "#161616",
              color: "#f0ede8",
              border: "1px solid #1e1e1e",
              borderRadius: "8px",
              fontSize: "14px",
            },
            success: {
              iconTheme: { primary: "#4caf79", secondary: "#161616" },
            },
            error: {
              iconTheme: { primary: "#e85a4c", secondary: "#161616" },
            },
          }}
        />
      </body>
    </html>
  );
}
