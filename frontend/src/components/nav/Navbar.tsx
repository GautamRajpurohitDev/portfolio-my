"use client";

import { useState, useEffect, useRef } from "react";
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
            className="lg:hidden flex items-center justify-center w-10 h-10 rounded-md text-text-primary hover:text-accent transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
          >
            {menuOpen ? <CloseIcon size={20} strokeWidth={1.5} /> : <Menu size={20} strokeWidth={1.5} />}
          </button>
        </div>
      </motion.header>

      {/* Mobile Menu Overlay */}
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

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  };

  const menuVariants = {
    hidden: { x: "100%" },
    visible: { x: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
    exit: { x: "100%", transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] } },
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="mobile-backdrop"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={shouldReduce ? {} : overlayVariants}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[190] bg-bg/60 backdrop-blur-sm lg:hidden"
            onClick={onClose}
            aria-hidden
          />

          {/* Menu panel */}
          <motion.nav
            key="mobile-menu"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={shouldReduce ? {} : (menuVariants as any)}
            className="fixed top-0 right-0 bottom-0 z-[195] w-80 bg-bg-card border-l border-border flex flex-col lg:hidden"
            aria-label="Mobile navigation"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <span className="font-display font-semibold text-[13px] tracking-widest uppercase text-text-primary">
                Menu
              </span>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors"
                aria-label="Close menu"
              >
                <CloseIcon size={18} strokeWidth={1.5} />
              </button>
            </div>

            {/* Nav links */}
            <ul className="space-y-1 mb-8 flex-1 flex flex-col justify-center" aria-label="Mobile navigation">
              {navLinks.map(({ href, label }, i: number) => {
                const isActive = pathname === href || (href !== "/" && pathname.startsWith(href));
                return (
                  <motion.li
                    key={href}
                    initial={shouldReduce ? {} : { opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 + i * 0.05 }}
                  >
                    <Link
                      href={href}
                      className={cn(
                        "flex items-center justify-between px-6 py-4 text-lg font-display tracking-wide transition-colors",
                        isActive
                          ? "bg-accent/10 text-text-primary"
                          : "text-text-secondary hover:bg-bg-alt hover:text-text-primary"
                      )}
                      aria-current={isActive ? "page" : undefined}
                    >
                      {label}
                      {isActive && <ArrowUpRight className="w-5 h-5 text-accent opacity-50" />}
                    </Link>
                  </motion.li>
                );
              })}
            </ul>
            <div className="pt-6 border-t border-border mt-auto p-6">
              <div className="flex items-center gap-4 mb-6">
                {activeSocials.map(({ href, icon: Icon, label }) => (
                  <a
                    key={href}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="text-text-secondary hover:text-text-primary transition-colors duration-200"
                  >
                    <Icon size={18} />
                  </a>
                ))}
              </div>
              {hasResume && (
                <a
                  href={resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={onClose}
                  className="flex items-center justify-center gap-2 w-full py-3 mb-3 rounded-pill border border-border text-text-primary text-[13px] font-semibold tracking-wide uppercase hover:border-primary/50 transition-colors"
                >
                  {resume?.label || "View Resume"}
                  <ArrowUpRight size={14} />
                </a>
              )}
              <Link
                href="/projects"
                onClick={onClose}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-pill bg-accent text-bg text-[13px] font-semibold tracking-wide uppercase"
              >
                View Projects
                <ArrowUpRight size={13} />
              </Link>
            </div>
          </motion.nav>
        </>
      )}
    </AnimatePresence>
  );
}
