"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { X as CloseIcon, Menu, ArrowUpRight } from "lucide-react";
import { GithubIcon, LinkedinIcon, XSocialIcon } from "@/components/ui/SocialIcons";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { cn } from "@/lib/utils";

interface NavLink {
  href: string;
  label: string;
  enabled?: boolean;
}

interface ActiveSocial {
  href: string;
  icon: any;
  label: string;
}

const DEFAULT_NAV_LINKS: NavLink[] = [
  { href: "/",         label: "Home",     enabled: true },
  { href: "/about",    label: "About",    enabled: true },
  { href: "/roadmap",  label: "Roadmap",  enabled: true },
  { href: "/journey",  label: "Journey",  enabled: true },
  { href: "/projects", label: "Projects", enabled: true },
  { href: "/skills",   label: "Skills",   enabled: true },
  { href: "/contact",  label: "Contact",  enabled: true },
];

export function Navbar({ config }: { config?: any }) {
  let navLinks: NavLink[] = DEFAULT_NAV_LINKS;

  if (config?.navigation?.length) {
    const filtered = config.navigation
      .filter((n: any) => n.enabled && !n.href?.includes("ask-gautam") && !n.label?.toLowerCase().includes("ask"))
      .sort((a: any, b: any) => a.order - b.order);

    const hasContact = filtered.some(
      (n: any) => n.href === "/contact" || n.label?.toLowerCase() === "contact"
    );

    if (!hasContact) {
      filtered.push({ href: "/contact", label: "Contact", enabled: true });
    }

    navLinks = filtered;
  }

  const socials = config?.socials || {};
  const resume = config?.resume;
  const hasResume = Boolean(resume?.published && resume?.fileUrl);
  const resumeUrl = resume?.fileUrl?.startsWith("http")
    ? resume.fileUrl
    : resume?.fileUrl
    ? `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}${resume.fileUrl}`
    : "";

  const activeSocials: ActiveSocial[] = [];
  if (socials.github?.enabled && socials.github?.url) activeSocials.push({ href: socials.github.url, icon: GithubIcon, label: "GitHub" });
  if (socials.linkedin?.enabled && socials.linkedin?.url) activeSocials.push({ href: socials.linkedin.url, icon: LinkedinIcon, label: "LinkedIn" });
  if (socials.x?.enabled && socials.x?.url) activeSocials.push({ href: socials.x.url, icon: XSocialIcon, label: "X" });

  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const shouldReduce = useReducedMotion();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menu on route change
  useEffect(() => { setMenuOpen(false); }, [pathname]);

  // Lock body scroll when menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  // Handle Escape key to close menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    if (menuOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [menuOpen]);

  return (
    <>
      <motion.header
        initial={shouldReduce ? {} : { opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
        className={cn(
          "fixed top-0 left-0 right-0 z-[200] transition-all duration-300",
          scrolled
            ? "h-[74px] bg-bg/90 backdrop-blur-[24px] border-b border-border shadow-xs"
            : "h-[82px] bg-transparent"
        )}
        role="banner"
      >
        <div className="container h-full flex items-center justify-between">
          
          {/* ── LEFT & CENTER: BRAND + PRIMARY NAVIGATION ─────────── */}
          <div className="flex items-center gap-10 xl:gap-12">
            {/* ZONE 1: BRAND */}
            <Link
              href="/"
              className="flex items-center gap-2.5 group shrink-0"
              aria-label="Gautam Rajpurohit - Home"
            >
              <span className="w-2 h-2 rounded-full bg-accent group-hover:scale-125 transition-transform duration-300 shrink-0" />
              <span className="font-display font-semibold text-[13px] tracking-widest uppercase text-text-primary whitespace-nowrap">
                Gautam Rajpurohit
              </span>
            </Link>

            {/* ZONE 2: PRIMARY NAVIGATION */}
            <nav
              className="hidden min-[1180px]:flex items-center gap-5 xl:gap-[22px]"
              aria-label="Desktop navigation"
            >
              {navLinks.map((link) => {
                const isActive =
                  pathname === link.href ||
                  (link.href !== "/" && pathname.startsWith(link.href));

                return (
                  <NavLink
                    key={link.href}
                    href={link.href}
                    active={isActive}
                  >
                    {link.label}
                  </NavLink>
                );
              })}
            </nav>
          </div>

          {/* ── ZONE 3: ACTIONS & SOCIAL (RIGHT) ─────────────── */}
          <div className="hidden min-[1180px]:flex items-center gap-6 shrink-0">
            {/* Social Icons */}
            {activeSocials.length > 0 && (
              <div className="flex items-center gap-[16px]">
                {activeSocials.map(({ href, icon: Icon, label }) => (
                  <a
                    key={href}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="text-text-secondary hover:text-text-primary transition-colors duration-200 p-1 flex items-center justify-center"
                  >
                    <Icon size={16} strokeWidth={1.5} />
                  </a>
                ))}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-[14px] pl-4 border-l border-border/60">
              {hasResume && (
                <a
                  href={resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="View Official Resume (PDF opens in new tab)"
                  className={cn(
                    "flex items-center gap-1.5 px-3.5 py-1.5 rounded-pill text-[11px] font-mono tracking-wider uppercase",
                    "border border-border/80 text-text-secondary hover:text-text-primary hover:border-accent",
                    "transition-all duration-200 whitespace-nowrap",
                    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
                  )}
                >
                  <span>{resume?.label || "Resume"}</span>
                  <ArrowUpRight size={12} strokeWidth={2} />
                </a>
              )}

              <Link
                href="/projects"
                className={cn(
                  "flex items-center gap-1.5 px-4 py-2 rounded-pill text-[12px] font-semibold tracking-wide uppercase",
                  "bg-accent text-[#171717] hover:bg-accent/90 active:scale-[0.98]",
                  "transition-all duration-200 whitespace-nowrap shadow-xs",
                  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
                )}
              >
                <span>View Projects</span>
                <ArrowUpRight size={13} strokeWidth={2.5} />
              </Link>

              {/* Theme Switcher Toggle */}
              <ThemeToggle />
            </div>
          </div>

          {/* ── MOBILE / TABLET HAMBURGER (Right-aligned at < 1180px) */}
          <button
            className="min-[1180px]:hidden flex items-center justify-center w-10 h-10 rounded-lg text-text-primary hover:text-accent hover:bg-black/[0.04] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent cursor-pointer"
            onClick={() => setMenuOpen(true)}
            aria-expanded={menuOpen}
            aria-label="Open navigation menu"
          >
            <Menu size={22} strokeWidth={1.5} />
          </button>

        </div>
      </motion.header>

      {/* Mobile Menu Overlay & Drawer */}
      <MobileMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        pathname={pathname}
        navLinks={navLinks}
        activeSocials={activeSocials}
        hasResume={hasResume}
        resumeUrl={resumeUrl}
        resume={resume}
      />
    </>
  );
}

// ── NAV LINK ──────────────────────────────────────────────────

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  active?: boolean;
}

function NavLink({ href, children, active }: NavLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        "relative text-[13px] font-medium tracking-wide transition-colors duration-200 py-1 whitespace-nowrap",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent rounded-sm",
        active ? "text-text-primary font-semibold" : "text-text-secondary hover:text-text-primary"
      )}
    >
      {children}
      {/* Subtle animated underline */}
      <span
        className={cn(
          "absolute -bottom-1 left-0 h-px bg-accent transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
          active ? "w-full" : "w-0 hover:w-full"
        )}
        aria-hidden
      />
    </Link>
  );
}

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
  pathname: string;
  navLinks: NavLink[];
  activeSocials: ActiveSocial[];
  hasResume?: boolean;
  resumeUrl?: string;
  resume?: any;
}

function MobileMenu({
  open,
  onClose,
  pathname,
  navLinks,
  activeSocials,
  hasResume,
  resumeUrl,
  resume,
}: MobileMenuProps) {
  const shouldReduce = useReducedMotion();

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Fullscreen Dimmed Backdrop */}
          <motion.div
            key="mobile-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[990] bg-black/40 backdrop-blur-sm min-[1180px]:hidden"
            onClick={onClose}
            aria-hidden
          />

          {/* Mobile Drawer */}
          <motion.aside
            key="mobile-drawer"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="fixed top-0 right-0 bottom-0 z-[1000] w-[85vw] max-w-[360px] h-[100dvh] bg-bg border-l border-border flex flex-col min-[1180px]:hidden overflow-y-auto overscroll-contain shadow-2xl shadow-black/10"
            style={{
              paddingTop: "env(safe-area-inset-top, 0px)",
              paddingBottom: "env(safe-area-inset-bottom, 0px)",
            }}
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation menu"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-border shrink-0">
              <Link
                href="/"
                onClick={onClose}
                className="flex items-center gap-2.5 group"
                aria-label="Gautam Rajpurohit - Home"
              >
                <span className="w-2 h-2 rounded-full bg-accent" />
                <span className="font-display font-semibold text-[13px] tracking-widest uppercase text-text-primary">
                  Gautam Rajpurohit
                </span>
              </Link>

              <div className="flex items-center gap-2">
                <ThemeToggle />
                <button
                  onClick={onClose}
                  className="w-10 h-10 flex items-center justify-center rounded-full text-text-secondary hover:text-text-primary hover:bg-border/20 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent cursor-pointer"
                  aria-label="Close menu"
                >
                  <CloseIcon size={20} strokeWidth={1.5} />
                </button>
              </div>
            </div>

            {/* Navigation Section */}
            <div className="px-6 pt-8 pb-4">
              <div className="mb-3 px-3">
                <span className="text-[10px] font-mono text-accent-dark uppercase tracking-[0.2em] font-semibold">
                  Navigation
                </span>
              </div>

              <nav aria-label="Mobile site navigation">
                <ul className="space-y-1">
                  {navLinks.map(({ href, label }, i: number) => {
                    const isActive =
                      pathname === href ||
                      (href !== "/" && pathname.startsWith(href));

                    return (
                      <motion.li
                        key={href}
                        initial={shouldReduce ? {} : { opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2, delay: 0.04 + i * 0.025 }}
                      >
                        <Link
                          href={href}
                          onClick={onClose}
                          className={cn(
                            "flex items-center justify-between px-4 py-3 rounded-xl text-[15px] font-display tracking-wide transition-all",
                            isActive
                              ? "bg-accent/15 text-[#171717] dark:text-[#F4F1EA] font-semibold border border-accent/30"
                              : "text-text-secondary hover:text-text-primary hover:bg-black/[0.03] border border-transparent"
                          )}
                          aria-current={isActive ? "page" : undefined}
                        >
                          <span>{label}</span>
                          {isActive && (
                            <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                          )}
                        </Link>
                      </motion.li>
                    );
                  })}
                </ul>
              </nav>
            </div>

            {/* Flexible middle space */}
            <div className="flex-1 min-h-[24px]" />

            {/* Dedicated Drawer Footer */}
            <div className="mt-auto border-t border-border px-6 py-6 bg-bg-card shrink-0 space-y-4">
              {/* Social Links Row */}
              {activeSocials.length > 0 && (
                <div className="flex items-center gap-3 pb-2 border-b border-border/60">
                  <span className="text-[10px] font-mono text-text-tertiary uppercase tracking-widest mr-1">
                    Connect
                  </span>
                  {activeSocials.map(({ href, icon: Icon, label }) => (
                    <a
                      key={href}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-black/[0.05] transition-colors"
                    >
                      <Icon size={16} />
                    </a>
                  ))}
                </div>
              )}

              {/* CTA Buttons */}
              <div className="space-y-3">
                {hasResume && (
                  <a
                    href={resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={onClose}
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-pill border border-border hover:border-accent text-text-secondary hover:text-text-primary text-[12px] font-mono tracking-wider uppercase transition-colors"
                  >
                    <span>{resume?.label || "View Resume"}</span>
                    <ArrowUpRight size={13} strokeWidth={2} />
                  </a>
                )}

                <Link
                  href="/projects"
                  onClick={onClose}
                  className="flex items-center justify-center gap-2 w-full py-3.5 rounded-pill bg-accent text-[#171717] text-[12px] font-bold tracking-wider uppercase hover:bg-accent/90 transition-colors shadow-xs"
                >
                  <span>View Projects</span>
                  <ArrowUpRight size={14} strokeWidth={2.5} />
                </Link>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
