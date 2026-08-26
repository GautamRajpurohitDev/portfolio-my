import Link from "next/link";
import { GithubIcon as Github, LinkedinIcon as Linkedin, XSocialIcon as XIcon } from "@/components/ui/SocialIcons";

const YEAR = new Date().getFullYear();

interface FooterLink {
  href: string;
  label: string;
  enabled?: boolean;
}

interface ActiveSocial {
  href: string;
  icon: any;
  label: string;
}

const DEFAULT_QUICK_LINKS: FooterLink[] = [
  { href: "/",             label: "Home",         enabled: true },
  { href: "/about",        label: "About",        enabled: true },
  { href: "/journey",      label: "Journey",      enabled: true },
  { href: "/projects",     label: "Projects",     enabled: true },
  { href: "/skills",       label: "Skills",       enabled: true },
  { href: "/certificates", label: "Certificates", enabled: true },
  { href: "/milestones",   label: "Milestones",   enabled: true },
  { href: "/updates",      label: "Updates",      enabled: true },
  { href: "/contact",      label: "Contact",      enabled: true },
];

export function Footer({ config }: { config?: any }) {
  if (config?.footer?.enabled === false) return null;

  const quickLinks: FooterLink[] = config?.navigation
    ? config.navigation.filter((n: any) => n.enabled).sort((a: any, b: any) => a.order - b.order)
    : DEFAULT_QUICK_LINKS;

  const socials = config?.socials || {};
  const activeSocials: ActiveSocial[] = [];
  if (socials.github?.enabled && socials.github?.url) activeSocials.push({ href: socials.github.url, icon: Github, label: "GitHub" });
  if (socials.linkedin?.enabled && socials.linkedin?.url) activeSocials.push({ href: socials.linkedin.url, icon: Linkedin, label: "LinkedIn" });
  if (socials.x?.enabled && socials.x?.url) activeSocials.push({ href: socials.x.url, icon: XIcon, label: "X" });

  const tagline = config?.footer?.tagline || "Building software one layer at a time.";
  const copyright = config?.footer?.copyright || `© ${YEAR} Gautam Rajpurohit. All rights reserved.`;

  return (
    <footer
      className="border-t border-border bg-bg-alt"
      role="contentinfo"
    >
      <div className="container">

        {/* Main footer grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 py-20">

          {/* Brand */}
          <div className="md:col-span-5">
            <div className="flex items-center gap-3 mb-5">
              <span className="w-2 h-2 rounded-full bg-accent" aria-hidden />
              <span className="font-display font-semibold text-[13px] tracking-widest uppercase text-text-primary">
                Gautam Rajpurohit
              </span>
            </div>

            <p className="text-body-md text-text-secondary leading-relaxed max-w-xs mb-6">
              {tagline}
            </p>

            <p className="font-display font-semibold text-heading-lg text-text-tertiary tracking-wide">
              Building. Learning. Shipping.
            </p>
          </div>

          {/* Quick links */}
          {config?.footer?.showLinks !== false && (
            <div className="md:col-span-4">
              <h3 className="label-meta mb-5">Quick Links</h3>
              <nav aria-label="Footer navigation">
                <ul className="space-y-2.5">
                  {quickLinks.map(({ href, label }) => (
                    <li key={href}>
                      <Link
                        href={href}
                        className="text-body-sm text-text-secondary hover:text-text-primary transition-colors hover:underline decoration-border underline-offset-4"
                      >
                        {label}
                      </Link>
                    </li>
                  ))}
                  {config?.resume?.published && config?.resume?.fileUrl && (
                    <li>
                      <a
                        href={config.resume.fileUrl.startsWith("http") ? config.resume.fileUrl : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}${config.resume.fileUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-body-sm text-accent hover:underline decoration-accent/40 underline-offset-4 font-mono text-[11px] uppercase tracking-wider"
                      >
                        {config.resume.label || "Curriculum Vitae (PDF)"} ↗
                      </a>
                    </li>
                  )}
                </ul>
              </nav>
            </div>
          )}

          {/* Socials */}
          {config?.footer?.showSocials !== false && (
            <div className="md:col-span-3">
              <h3 className="label-meta mb-5">Connect</h3>
              <ul className="space-y-4">
                {activeSocials.map(({ href, icon: Icon, label }) => (
                  <li key={label}>
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-3 text-body-sm text-text-secondary hover:text-text-primary transition-colors group"
                    >
                      <span className="p-2 bg-bg border border-border rounded-md group-hover:border-text-muted transition-colors">
                        <Icon className="w-4 h-4" />
                      </span>
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Bottom bar */}
        <div className="py-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-body-sm text-text-tertiary">
            {copyright}
          </p>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-[pulseAccent_2s_ease-in-out_infinite]" aria-hidden />
            <span className="font-mono text-mono-sm text-text-tertiary">
              Building in public
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
}
