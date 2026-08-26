"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { X as CloseIcon, Menu, ArrowUpRight } from "lucide-react";
import { GithubIcon, LinkedinIcon, XSocialIcon } from "@/components/ui/SocialIcons";
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
  { href: "/",            label: "Home",     enabled: true },
  { href: "/about",       label: "About",    enabled: true },
  { href: "/roadmap",     label: "Roadmap",  enabled: true },
  { href: "/journey",     label: "Journey",  enabled: true },
  { href: "/projects",    label: "Projects", enabled: true },
  { href: "/skills",      label: "Skills",   enabled: true },
  { href: "/contact",     label: "Contact",  enabled: true },
];

export function Navbar({ config }: { config?: any }) {
  const navLinks: NavLink[] = config?.navigation 
    ? config.navigation.filter((n: any) => n.enabled).sort((a: any, b: any) => a.order - b.order)
    : DEFAULT_NAV_LINKS;

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
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll, { passive: true });
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
        initial={shouldReduce ? {} : { opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
        className={cn(
          "fixed top-0 left-0 right-0 z-[200] transition-all duration-300",
          scrolled
            ? "py-3 bg-bg/80 backdrop-blur-[24px] border-b border-border"
            : "py-5 bg-transparent"
        )}
        role="banner"
      >
        <div className="container flex items-center justify-between">
          {/* Logo / Name */}
          <Link
            href="/"
            className="flex items-center gap-3 group"
            aria-label="Gautam Rajpurohit - Home"
          >
            {/* Accent dot */}
            <span className="w-2 h-2 rounded-full bg-accent group-hover:scale-125 transition-transform duration-300" />
            <span
              className="font-display font-semibold text-[13px] tracking-widest uppercase text-text-primary"
            >
              Gautam Rajpurohit
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1" aria-label="Desktop navigation">
            {navLinks.map((link) => (
              <NavLink key={link.href} href={link.href} active={pathname === link.href}>
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Desktop Right — Social + CTA */}
          <div className="hidden lg:flex items-center gap-5">
            {/* Desktop socials */}
            <div className="flex items-center gap-2 pl-4 ml-2 border-l border-border/50">
              {activeSocials.map(({ href, icon: Icon, label }) => (
                <a
                  key={href}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="text-text-secondary hover:text-text-primary transition-colors duration-200"
                >
                  <Icon size={16} strokeWidth={1.5} />
                </a>
              ))}
            </div>

            {/* CTA / Resume */}
            <div className="flex items-center gap-3">
              {hasResume && (
                <a
                  href={resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="View Official Resume (PDF opens in new tab)"
                  className={cn(
                    "flex items-center gap-1.5 px-3.5 py-1.5 rounded-pill text-[11px] font-mono tracking-wider uppercase",
                    "border border-border/80 text-text-secondary hover:text-text-primary hover:border-primary/50",
                    "transition-all duration-200",
                    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
                  )}
                >
                  {resume?.label || "Resume"}
                  <ArrowUpRight size={12} strokeWidth={2} />
                </a>
              )}

              <Link
                href="/projects"
                className={cn(
                  "flex items-center gap-1.5 px-4 py-2 rounded-pill text-[12px] font-semibold tracking-wide uppercase",
                  "bg-accent text-bg hover:bg-accent/90",
                  "transition-all duration-200",
                  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
                )}
              >
                View Projects
                <ArrowUpRight size={13} strokeWidth={2.5} />
              </Link>
            </div>
          </div>

          {/* Mobile hamburger */}
          <button
            className="lg:hidden flex items-center justify-center w-11 h-11 rounded-lg text-text-primary hover:text-accent hover:bg-white/[0.04] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
            onClick={() => setMenuOpen(true)}
            aria-expanded={menuOpen}
            aria-label="Open navigation menu"
          >
            <Menu size={22} strokeWidth={1.5} />
          </button>
        </div>
      </motion.header>

      {/* Fullscreen Mobile Menu Overlay & Drawer */}
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
        "relative text-[13px] font-medium tracking-wide transition-colors duration-200 group px-3 py-2",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent rounded-sm",
        active ? "text-text-primary" : "text-text-secondary hover:text-text-primary"
      )}
    >
      {children}
      {/* Animated underline */}
      <span
        className={cn(
          "absolute bottom-0 left-0 h-px bg-accent transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
          active ? "w-full" : "w-0 group-hover:w-full"
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

function MobileMenu({ open, onClose, pathname, navLinks, activeSocials, hasResume, resumeUrl, resume }: MobileMenuProps) {
  const shouldReduce = useReducedMotion();

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Fullscreen Backdrop */}
          <motion.div
            key="mobile-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[990] bg-[#0a0a0a]/80 backdrop-blur-md lg:hidden"
            onClick={onClose}
            aria-hidden
          />

          {/* Fullscreen Independent Mobile Drawer Panel */}
          <motion.aside
            key="mobile-drawer"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[1000] w-full h-[100dvh] bg-bg flex flex-col lg:hidden overflow-y-auto overscroll-contain"
            style={{
              paddingTop: "env(safe-area-inset-top, 0px)",
              paddingBottom: "env(safe-area-inset-bottom, 0px)",
            }}
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation menu"
          >
            {/* Independent Mobile Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border/80 shrink-0">
              <Link
                href="/"
                onClick={onClose}
                className="flex items-center gap-3 group"
                aria-label="Gautam Rajpurohit - Home"
              >
                <span className="w-2 h-2 rounded-full bg-accent" />
                <span className="font-display font-semibold text-[13px] tracking-widest uppercase text-text-primary">
                  Gautam Rajpurohit
                </span>
              </Link>

              <button
                onClick={onClose}
                className="w-11 h-11 flex items-center justify-center rounded-full text-text-secondary hover:text-text-primary hover:bg-white/[0.06] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
                aria-label="Close menu"
              >
                <CloseIcon size={20} strokeWidth={1.5} />
              </button>
            </div>

            {/* Navigation Section */}
            <div className="flex-1 flex flex-col justify-center px-6 py-8">
              <div className="mb-3 px-3">
                <span className="text-[10px] font-mono text-accent uppercase tracking-[0.2em]">
                  Navigation
                </span>
              </div>

              <nav aria-label="Mobile site navigation">
                <ul className="space-y-1.5">
                  {navLinks.map(({ href, label }, i: number) => {
                    const isActive = pathname === href || (href !== "/" && pathname.startsWith(href));
                    return (
                      <motion.li
                        key={href}
                        initial={shouldReduce ? {} : { opacity: 0, x: -16 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.25, delay: 0.05 + i * 0.03 }}
                      >
                        <Link
                          href={href}
                          onClick={onClose}
                          className={cn(
                            "flex items-center justify-between px-4 py-3.5 rounded-xl text-base font-display tracking-wide transition-all",
                            isActive
                              ? "bg-accent/10 text-accent font-semibold border border-accent/25"
                              : "text-text-secondary hover:text-text-primary hover:bg-white/[0.04] border border-transparent"
                          )}
                          aria-current={isActive ? "page" : undefined}
                        >
                          <span>{label}</span>
                          {isActive ? (
                            <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                          ) : (
                            <ArrowUpRight size={15} className="text-text-tertiary opacity-40" />
                          )}
                        </Link>
                      </motion.li>
                    );
                  })}
                </ul>
              </nav>
            </div>

            {/* Dedicated Drawer Footer */}
            <div className="mt-auto border-t border-border/80 px-6 py-6 bg-bg-card/40 backdrop-blur-sm shrink-0 space-y-4">
              {/* Social Links Row */}
              {activeSocials.length > 0 && (
                <div className="flex items-center gap-4 pb-2 border-b border-white/[0.04]">
                  <span className="text-[10px] font-mono text-text-tertiary uppercase tracking-widest mr-2">
                    Connect
                  </span>
                  {activeSocials.map(({ href, icon: Icon, label }) => (
                    <a
                      key={href}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-white/[0.06] transition-colors"
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
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-pill border border-border hover:border-primary/50 text-text-secondary hover:text-text-primary text-[12px] font-mono tracking-wider uppercase transition-colors"
                  >
                    {resume?.label || "View Resume"}
                    <ArrowUpRight size={13} strokeWidth={2} />
                  </a>
                )}

                <Link
                  href="/projects"
                  onClick={onClose}
                  className="flex items-center justify-center gap-2 w-full py-3.5 rounded-pill bg-accent text-bg text-[12px] font-bold tracking-wider uppercase hover:bg-accent/90 transition-colors shadow-lg shadow-accent/10"
                >
                  View Projects
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
