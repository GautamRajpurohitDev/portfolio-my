import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";

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
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
    { media: "(prefers-color-scheme: light)", color: "#f6f4ef" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable}`} suppressHydrationWarning>
      <head>
        {/* Prevent Flash of Wrong Theme (FOUC) - Default to Dark */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('theme');
                  var theme = saved ? saved : 'dark';
                  document.documentElement.setAttribute('data-theme', theme);
                  if (theme === 'dark') {
                    document.documentElement.classList.add('dark');
                    document.documentElement.classList.remove('light');
                  } else {
                    document.documentElement.classList.add('light');
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {
                  document.documentElement.setAttribute('data-theme', 'dark');
                  document.documentElement.classList.add('dark');
                }
              })();
            `,
          }}
        />
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
        <ThemeProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "var(--color-bg-card)",
              color: "var(--color-text-primary)",
              border: "1px solid var(--color-border)",
              borderRadius: "8px",
              fontSize: "14px",
            },
            success: {
              iconTheme: { primary: "var(--color-success)", secondary: "var(--color-bg)" },
            },
            error: {
              iconTheme: { primary: "var(--color-error)", secondary: "var(--color-bg)" },
            },
          }}
        />
      </body>
    </html>
  );
}
