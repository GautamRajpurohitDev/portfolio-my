"use client";

import React, { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { settingsApi } from "@/lib/api";
import toast from "react-hot-toast";
import {
  Save, Plus, Trash2, BookText, Globe, Share2, Layout,
  User, Eye, Map, FileText, ChevronDown, ChevronUp, ToggleLeft, ToggleRight,
} from "lucide-react";
import { motion } from "framer-motion";

// ── Shared primitives ─────────────────────────────────────────

const inputCls =
  "w-full bg-white/[0.02] border border-white/[0.08] rounded px-3.5 py-2.5 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary/50 transition-colors font-body";
const textareaCls = `${inputCls} resize-none`;

function Field({ label, hint, error, children }: {
  label: string; hint?: string; error?: string; children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[11px] font-mono text-text-secondary uppercase tracking-wider">{label}</label>
      {hint && <p className="text-[11px] text-text-muted leading-relaxed font-body">{hint}</p>}
      {children}
      {error && <p className="text-[11px] text-red-400 font-mono">{error}</p>}
    </div>
  );
}

function SettingsSection({ icon, title, children }: {
  icon: React.ReactNode; title: string; children: React.ReactNode;
}) {
  const [open, setOpen] = useState(true);
  return (
    <section className="bg-[#0d0d0d] border border-white/[0.08] rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-3 px-6 py-4 border-b border-white/[0.06] hover:bg-white/[0.02] transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2.5">
          <span className="text-text-muted">{icon}</span>
          <h2 className="text-xs font-mono font-bold text-text-primary uppercase tracking-wider">{title}</h2>
        </div>
        {open ? <ChevronUp size={14} className="text-text-muted" /> : <ChevronDown size={14} className="text-text-muted" />}
      </button>
      {open && <div className="px-6 py-6 space-y-5">{children}</div>}
    </section>
  );
}

function Toggle({ label, checked, onChange }: {
  label: string; checked: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex items-center gap-3 group cursor-pointer"
    >
      {checked
        ? <ToggleRight size={22} className="text-primary" />
        : <ToggleLeft size={22} className="text-text-muted" />}
      <span className="text-xs font-body text-text-secondary group-hover:text-text-primary transition-colors">{label}</span>
    </button>
  );
}

function SaveBar({ isDirty, isSubmitting, setAction, isDraft, onPreview }: { isDirty: boolean; isSubmitting: boolean; setAction: (v: "draft" | "publish") => void; isDraft: boolean; onPreview: () => void }) {
  return (
    <div className="sticky top-0 z-10 -mx-6 sm:-mx-8 lg:-mx-10 px-6 sm:px-8 lg:px-10 py-3.5
      bg-[#080808]/95 backdrop-blur-md border-b border-white/[0.08] flex items-center justify-between gap-4 mb-8">
      <p className="text-xs font-mono text-text-muted flex gap-3">
        {isDirty
          ? <span className="text-amber-400/90 font-medium">● Unsaved changes</span>
          : <span className="text-emerald-400 font-medium">● All changes saved</span>}
        {isDraft && <span className="text-primary font-medium">● Viewing Draft</span>}
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onPreview}
          className="px-3.5 py-1.5 bg-white/[0.02] border border-white/[0.08] text-text-secondary text-xs font-body
            rounded hover:bg-white/[0.06] hover:text-text-primary transition-all cursor-pointer"
        >
          Preview
        </button>
        <button
          type="submit"
          onClick={() => setAction("draft")}
          disabled={isSubmitting || (!isDirty && !isDraft)}
          className="px-3.5 py-1.5 bg-white/[0.04] border border-white/[0.08] text-text-primary text-xs font-body
            rounded hover:bg-white/[0.08] transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          Save Draft
        </button>
        <button
          type="submit"
          onClick={() => setAction("publish")}
          disabled={isSubmitting}
          className="px-4 py-1.5 bg-primary text-[#080808] text-xs font-clash font-bold
            rounded hover:bg-primary/90 transition-all disabled:opacity-50 cursor-pointer"
        >
          Publish
        </button>
      </div>
    </div>
  );
}

// ── Main form ─────────────────────────────────────────────────

interface Props { settings: any | null }

export default function SettingsForm({ settings: s }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, control, handleSubmit, watch, setValue, formState: { errors, isDirty } } = useForm<any>({
    defaultValues: {
      // Identity
      identity: {
        name:         s?.identity?.name         ?? "Gautam Rajpurohit",
        displayName:  s?.identity?.displayName  ?? "Gautam Rajpurohit",
        role:         s?.identity?.role         ?? "MCA Student",
        headline:     s?.identity?.headline     ?? "",
        shortBio:     s?.identity?.shortBio     ?? "",
        longBio:      s?.identity?.longBio      ?? "",
        location:     s?.identity?.location     ?? "India",
        profileImage: s?.identity?.profileImage ?? "",
        availability: s?.identity?.availability ?? "learning",
        email:        s?.identity?.email        ?? "",
      },
      // Hero
      hero: {
        headlineLines: s?.hero?.headlineLines ?? s?.heroHeadline ?? ["BUILDING", "SOFTWARE", "ONE LAYER", "AT A TIME."],
        subtitle:      s?.hero?.subtitle      ?? s?.heroSubtitle ?? "",
        ctaPrimary:    s?.hero?.ctaPrimary    ?? "View Projects",
        ctaSecondary:  s?.hero?.ctaSecondary  ?? "Explore Journey",
      },
      // Currently Learning
      currentlyLearning: {
        primary:            s?.currentlyLearning?.primary            ?? "",
        primaryDescription: s?.currentlyLearning?.primaryDescription ?? "",
        next:               s?.currentlyLearning?.next               ?? "",
        roadmap:            s?.currentlyLearning?.roadmap            ?? [],
      },
      // Socials
      socials: {
        github:   { label: "GitHub",   url: s?.socials?.github?.url   ?? s?.githubUrl   ?? "", enabled: s?.socials?.github?.enabled   ?? true,  order: 1 },
        linkedin: { label: "LinkedIn", url: s?.socials?.linkedin?.url ?? s?.linkedinUrl ?? "", enabled: s?.socials?.linkedin?.enabled ?? true,  order: 2 },
        x:        { label: "X",        url: s?.socials?.x?.url        ?? s?.xUrl        ?? "", enabled: s?.socials?.x?.enabled        ?? true,  order: 3 },
        email:    { label: "Email",    url: s?.socials?.email?.url    ?? s?.email       ?? "", enabled: s?.socials?.email?.enabled    ?? true,  order: 4 },
      },
      // Navigation
      navigation: s?.navigation ?? [
        { label: "Home",     href: "/",        enabled: true, order: 1, external: false, highlighted: false },
        { label: "About",    href: "/about",    enabled: true, order: 2, external: false, highlighted: false },
        { label: "Journey",  href: "/journey",  enabled: true, order: 3, external: false, highlighted: false },
        { label: "Projects", href: "/projects", enabled: true, order: 4, external: false, highlighted: false },
        { label: "Skills",   href: "/skills",   enabled: true, order: 5, external: false, highlighted: false },
        { label: "Contact",  href: "/contact",  enabled: true, order: 6, external: false, highlighted: false },
      ],
      // Footer
      // Footer
      footer: {
        tagline:     s?.footer?.tagline     ?? "Building software one layer at a time.",
        copyright:   s?.footer?.copyright   ?? "© 2026 Gautam Rajpurohit. All rights reserved.",
        enabled:     s?.footer?.enabled     ?? true,
        showLinks:   s?.footer?.showLinks   ?? true,
        showSocials: s?.footer?.showSocials ?? true,
      },
      // Contact
      contact: {
        email:            s?.contact?.email            ?? "",
        formEnabled:      s?.contact?.formEnabled      ?? true,
        successMessage:   s?.contact?.successMessage   ?? "Thanks for reaching out! I'll get back to you soon.",
        availabilityText: s?.contact?.availabilityText ?? "I'm currently available for freelance work and new opportunities.",
      },
      // Analytics
      analytics: {
        googleAnalyticsId: s?.analytics?.googleAnalyticsId ?? "",
        vercelAnalytics:   s?.analytics?.vercelAnalytics   ?? false,
        customScript:      s?.analytics?.customScript      ?? "",
      },
      // Indexing
      indexing: {
        indexable:       s?.indexing?.indexable       ?? true,
        maintenanceMode: s?.indexing?.maintenanceMode ?? false,
      },
      // Visibility
      visibility: {
        hero:         s?.visibility?.hero         ?? true,
        about:        s?.visibility?.about        ?? true,
        journey:      s?.visibility?.journey      ?? true,
        projects:     s?.visibility?.projects     ?? true,
        skills:       s?.visibility?.skills       ?? true,
        certificates: s?.visibility?.certificates ?? true,
        milestones:   s?.visibility?.milestones   ?? true,
        updates:      s?.visibility?.updates      ?? true,
        contact:      s?.visibility?.contact      ?? true,
      },
      // SEO
      seo: {
        siteTitle:          s?.seo?.siteTitle          ?? "Gautam Rajpurohit — Software Development Journey",
        titleSuffix:        s?.seo?.titleSuffix        ?? "Gautam Rajpurohit",
        defaultDescription: s?.seo?.defaultDescription ?? "",
        keywords:           (s?.seo?.keywords ?? []).join(", "),
        ogImage:            s?.seo?.ogImage            ?? "",
        twitterHandle:      s?.seo?.twitterHandle      ?? "",
        favicon:            s?.seo?.favicon            ?? "",
        canonicalUrl:       s?.seo?.canonicalUrl       ?? "",
        ogTitle:            s?.seo?.ogTitle            ?? "",
        ogDescription:      s?.seo?.ogDescription      ?? "",
      },
      published: s?.published ?? true,
    },
  });

  const { fields: roadmapFields, append: appendRoadmap, remove: removeRoadmap } = useFieldArray({ control, name: "currentlyLearning.roadmap" });
  const { fields: headlineFields, append: appendHeadline, remove: removeHeadline } = useFieldArray({ control, name: "hero.headlineLines" });
  const { fields: navFields, append: appendNav, remove: removeNav } = useFieldArray({ control, name: "navigation" });

  const visibility = watch("visibility");
  const footerEnabled = watch("footer.enabled");
  const published = watch("published");

  const [submitAction, setSubmitAction] = useState<"draft" | "publish">("draft");
  const isDraft = s?._isDraft === true;

  const handlePreview = () => {
    // Open home page with preview param
    window.open("/?preview=true", "_blank");
  };

  const onSubmit = async (data: any) => {
    if (submitAction === "publish") {
      if (!window.confirm("You are about to publish major site configuration changes. Continue?")) {
        return;
      }
    }

    setIsSubmitting(true);
    try {
      // Convert keywords string → array
      const seo = { ...data.seo, keywords: data.seo.keywords?.split(",").map((k: string) => k.trim()).filter(Boolean) ?? [] };
      // Filter empty headline lines and roadmap items
      const hero = { ...data.hero, headlineLines: data.hero.headlineLines.filter((l: string) => l.trim()) };
      const cl = { ...data.currentlyLearning, roadmap: data.currentlyLearning.roadmap.filter((r: string) => r?.trim()) };
      
      await settingsApi.update({ ...data, seo, hero, currentlyLearning: cl }, submitAction);
      toast.success(submitAction === "publish" ? "Settings published" : "Draft saved");
      
      if (submitAction === "publish") {
        window.location.reload();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to save settings");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-3xl">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.24 }}
        className="mb-8"
      >
        <p className="text-[10px] font-mono text-text-muted tracking-[0.18em] uppercase mb-3">08 / Settings</p>
        <h1 className="text-3xl font-clash font-bold text-text-primary">Portfolio CMS</h1>
        <p className="text-sm text-text-secondary mt-2">
          Control every public-facing detail of your portfolio from one place.
        </p>
      </motion.div>

      <SaveBar
        isDirty={isDirty}
        isSubmitting={isSubmitting}
        setAction={setSubmitAction}
        isDraft={isDraft}
        onPreview={handlePreview}
      />

      <div className="space-y-5">

        {/* ── Publishing ───────────────────────────────────────── */}
        <SettingsSection icon={<Globe size={14} />} title="Publishing">
          <div className="flex items-start gap-6">
            <Toggle
              label="Configuration is published (visible to the public)"
              checked={published}
              onChange={(v) => setValue("published", v, { shouldDirty: true })}
            />
          </div>
          <p className="text-xs text-text-muted leading-relaxed">
            When unpublished, the public site uses fallback defaults. Useful for drafting major changes before going live.
          </p>
        </SettingsSection>

        {/* ── Identity ─────────────────────────────────────────── */}
        <SettingsSection icon={<User size={14} />} title="Identity">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field label="Name"><input {...register("identity.name")} className={inputCls} placeholder="Gautam Rajpurohit" /></Field>
            <Field label="Display Name"><input {...register("identity.displayName")} className={inputCls} placeholder="Gautam Rajpurohit" /></Field>
            <Field label="Role / Title"><input {...register("identity.role")} className={inputCls} placeholder="MCA Student" /></Field>
            <Field label="Location"><input {...register("identity.location")} className={inputCls} placeholder="India" /></Field>
            <Field label="Availability Status">
              <select {...register("identity.availability")} className={inputCls}>
                <option value="open">Open to opportunities</option>
                <option value="learning">Actively learning</option>
                <option value="busy">Busy / not available</option>
                <option value="unavailable">Unavailable</option>
              </select>
            </Field>
            <Field label="Contact Email (admin only — not exposed publicly)">
              <input type="email" {...register("identity.email")} className={inputCls} placeholder="you@example.com" />
            </Field>
          </div>
          <Field label="One-line Headline">
            <input {...register("identity.headline")} className={inputCls} placeholder="Building software one layer at a time." />
          </Field>
          <Field label="Short Bio (shown in hero / about preview)" hint="2–3 sentences. Shown on cards and meta descriptions.">
            <textarea {...register("identity.shortBio")} rows={3} className={textareaCls} placeholder="MCA student focused on building strong programming fundamentals…" />
          </Field>
          <Field label="Long Bio (shown on About page)" hint="Full about section text. Markdown will be supported in Phase 2.">
            <textarea {...register("identity.longBio")} rows={6} className={textareaCls} placeholder="Full biography…" />
          </Field>
          <Field label="Profile Image URL">
            <input {...register("identity.profileImage")} className={inputCls} placeholder="https://…" />
          </Field>
        </SettingsSection>

        {/* ── Hero Section ─────────────────────────────────────── */}
        <SettingsSection icon={<Layout size={14} />} title="Hero Section">
          <Field label="Headline Lines" hint="Each line is a separate animated row in the hero. Max 4 lines recommended.">
            <div className="space-y-2">
              {headlineFields.map((field, i) => (
                <div key={field.id} className="flex gap-2">
                  <input {...register(`hero.headlineLines.${i}`)} className={`${inputCls} flex-1`} placeholder={`Line ${i + 1}…`} />
                  <button type="button" onClick={() => removeHeadline(i)}
                    className="p-2.5 text-text-muted border border-border/60 rounded-lg hover:text-red-400 hover:border-red-400/30 transition-all">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
            <button type="button" onClick={() => appendHeadline("")}
              className="mt-2 flex items-center gap-1.5 text-xs font-mono text-primary hover:text-primary/80 transition-colors uppercase tracking-wider">
              <Plus size={12} /> Add line
            </button>
          </Field>
          <Field label="Hero Subtitle" hint="Shown below the headline. 1–2 sentences.">
            <textarea {...register("hero.subtitle")} rows={3} className={textareaCls} placeholder="MCA student focused on building strong programming fundamentals…" />
          </Field>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field label="Primary CTA Label"><input {...register("hero.ctaPrimary")} className={inputCls} placeholder="View Projects" /></Field>
            <Field label="Secondary CTA Label"><input {...register("hero.ctaSecondary")} className={inputCls} placeholder="Explore Journey" /></Field>
          </div>
        </SettingsSection>

        {/* ── Currently Learning ───────────────────────────────── */}
        <SettingsSection icon={<BookText size={14} />} title="Current Learning Focus">
          <Field label="Primary Focus" hint="What are you actively learning right now?">
            <input {...register("currentlyLearning.primary")} className={inputCls} placeholder="e.g. Git & GitHub" />
          </Field>
          <Field label="Focus Description">
            <textarea {...register("currentlyLearning.primaryDescription")} rows={2} className={textareaCls}
              placeholder="What specifically are you learning or building with this?" />
          </Field>
          <Field label="Up Next (Optional)">
            <input {...register("currentlyLearning.next")} className={inputCls} placeholder="e.g. C Programming" />
          </Field>
          <Field label="Roadmap Items" hint="Ordered list of upcoming topics in your learning path.">
            <div className="space-y-2">
              {roadmapFields.map((field, i) => (
                <div key={field.id} className="flex gap-2">
                  <input {...register(`currentlyLearning.roadmap.${i}`)} className={`${inputCls} flex-1`} placeholder={`Step ${i + 1}…`} />
                  <button type="button" onClick={() => removeRoadmap(i)}
                    className="p-2.5 text-text-muted border border-border/60 rounded-lg hover:text-red-400 hover:border-red-400/30 transition-all">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
            <button type="button" onClick={() => appendRoadmap("")}
              className="mt-2 flex items-center gap-1.5 text-xs font-mono text-primary hover:text-primary/80 transition-colors uppercase tracking-wider">
              <Plus size={12} /> Add step
            </button>
          </Field>
        </SettingsSection>

        {/* ── Social Links ─────────────────────────────────────── */}
        <SettingsSection icon={<Share2 size={14} />} title="Social Links">
          {(["github","linkedin","x","email"] as const).map((key) => (
            <div key={key} className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3 items-end">
              <Field label={`${key.charAt(0).toUpperCase() + key.slice(1)} URL`}>
                <input {...register(`socials.${key}.url`)} className={inputCls}
                  placeholder={key === "email" ? "mailto:you@example.com" : `https://${key}.com/…`} />
              </Field>
              <div className="pb-0.5">
                <Toggle
                  label="Enabled"
                  checked={watch(`socials.${key}.enabled`)}
                  onChange={(v) => setValue(`socials.${key}.enabled`, v, { shouldDirty: true })}
                />
              </div>
            </div>
          ))}
        </SettingsSection>

        {/* ── Navigation ───────────────────────────────────────── */}
        <SettingsSection icon={<Map size={14} />} title="Navigation">
          <div className="space-y-3">
            {navFields.map((field, i) => (
              <div key={field.id} className="flex gap-2 items-center">
                <input {...register(`navigation.${i}.label`)} className={`${inputCls} w-32 flex-shrink-0`} placeholder="Label" />
                <input {...register(`navigation.${i}.href`)} className={`${inputCls} flex-1`} placeholder="/path" />
                <Toggle
                  label=""
                  checked={watch(`navigation.${i}.enabled`)}
                  onChange={(v) => setValue(`navigation.${i}.enabled`, v, { shouldDirty: true })}
                />
                <button type="button" onClick={() => removeNav(i)}
                  className="p-2.5 text-text-muted border border-border/60 rounded-lg hover:text-red-400 hover:border-red-400/30 transition-all flex-shrink-0">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
          <button type="button"
            onClick={() => appendNav({ label: "", href: "/", enabled: true, order: navFields.length + 1, external: false, highlighted: false })}
            className="mt-2 flex items-center gap-1.5 text-xs font-mono text-primary hover:text-primary/80 transition-colors uppercase tracking-wider">
            <Plus size={12} /> Add nav item
          </button>
        </SettingsSection>

        {/* ── Section Visibility ───────────────────────────────── */}
        <SettingsSection icon={<Eye size={14} />} title="Section Visibility">
          <p className="text-xs text-text-muted leading-relaxed -mt-1">
            Toggle sections on and off. Disabled sections are hidden from the public portfolio.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
            {(["hero","about","journey","projects","skills","certificates","milestones","updates","contact"] as const).map((key) => (
              <Toggle
                key={key}
                label={key.charAt(0).toUpperCase() + key.slice(1)}
                checked={visibility?.[key] ?? true}
                onChange={(v) => setValue(`visibility.${key}`, v, { shouldDirty: true })}
              />
            ))}
          </div>
        </SettingsSection>

        {/* ── Footer ───────────────────────────────────────────── */}
        <SettingsSection icon={<FileText size={14} />} title="Footer">
          <Toggle
            label="Show footer"
            checked={footerEnabled}
            onChange={(v) => setValue("footer.enabled", v, { shouldDirty: true })}
          />
          {footerEnabled && (
            <>
              <Field label="Footer Tagline">
                <input {...register("footer.tagline")} className={inputCls} placeholder="Building software one layer at a time." />
              </Field>
              <Field label="Copyright Text">
                <input {...register("footer.copyright")} className={inputCls} placeholder="© 2026 Gautam Rajpurohit…" />
              </Field>
              <div className="flex flex-col gap-3 mt-2">
                <Toggle
                  label="Show Navigation Links"
                  checked={watch("footer.showLinks")}
                  onChange={(v) => setValue("footer.showLinks", v, { shouldDirty: true })}
                />
                <Toggle
                  label="Show Social Links"
                  checked={watch("footer.showSocials")}
                  onChange={(v) => setValue("footer.showSocials", v, { shouldDirty: true })}
                />
              </div>
            </>
          )}
        </SettingsSection>

        {/* ── SEO ──────────────────────────────────────────────── */}
        <SettingsSection icon={<Globe size={14} />} title="SEO & Meta">
          <Field label="Site Title" hint="Main title tag. Appears in browser tab and search results.">
            <input {...register("seo.siteTitle")} className={inputCls} placeholder="Gautam Rajpurohit — Software Development Journey" />
          </Field>
          <Field label="Title Suffix" hint="Appended to page-level titles: 'Projects | {suffix}'">
            <input {...register("seo.titleSuffix")} className={inputCls} placeholder="Gautam Rajpurohit" />
          </Field>
          <Field label="Default Meta Description" hint="Used on pages without a specific description. 150–160 characters ideal.">
            <textarea {...register("seo.defaultDescription")} rows={3} className={textareaCls} placeholder="MCA student building strong programming fundamentals…" />
          </Field>
          <Field label="Keywords" hint="Comma-separated. Used for meta keywords tag.">
            <input {...register("seo.keywords")} className={inputCls} placeholder="MCA, software development, programming, portfolio" />
          </Field>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field label="OG Image URL"><input {...register("seo.ogImage")} className={inputCls} placeholder="https://…/og.png" /></Field>
            <Field label="Twitter Handle"><input {...register("seo.twitterHandle")} className={inputCls} placeholder="@username" /></Field>
            <Field label="Favicon URL"><input {...register("seo.favicon")} className={inputCls} placeholder="https://…/favicon.ico" /></Field>
            <Field label="Canonical URL"><input {...register("seo.canonicalUrl")} className={inputCls} placeholder="https://…" /></Field>
            <Field label="OG Title"><input {...register("seo.ogTitle")} className={inputCls} placeholder="Custom OG Title" /></Field>
            <Field label="OG Description"><input {...register("seo.ogDescription")} className={inputCls} placeholder="Custom OG Description" /></Field>
          </div>
        </SettingsSection>

        {/* ── Contact ──────────────────────────────────────────── */}
        <SettingsSection icon={<User size={14} />} title="Contact Settings">
          <Toggle
            label="Enable Contact Form"
            checked={watch("contact.formEnabled")}
            onChange={(v) => setValue("contact.formEnabled", v, { shouldDirty: true })}
          />
          <Field label="Contact Email" hint="Where form submissions will be sent.">
            <input type="email" {...register("contact.email")} className={inputCls} placeholder="you@example.com" />
          </Field>
          <Field label="Success Message" hint="Shown after a user submits the form.">
            <input {...register("contact.successMessage")} className={inputCls} placeholder="Thanks for reaching out! I'll get back to you soon." />
          </Field>
          <Field label="Availability Text" hint="Shown on the contact page.">
            <textarea {...register("contact.availabilityText")} rows={2} className={textareaCls} placeholder="I'm currently available for freelance work and new opportunities." />
          </Field>
        </SettingsSection>

        {/* ── Analytics ────────────────────────────────────────── */}
        <SettingsSection icon={<Map size={14} />} title="Analytics">
          <Field label="Google Analytics Measurement ID" hint="e.g. G-XXXXXXXXXX (Optional)">
            <input {...register("analytics.googleAnalyticsId")} className={inputCls} placeholder="G-XXXXXXXXXX" />
          </Field>
          <Toggle
            label="Enable Vercel Analytics"
            checked={watch("analytics.vercelAnalytics")}
            onChange={(v) => setValue("analytics.vercelAnalytics", v, { shouldDirty: true })}
          />
          <Field label="Custom Head Script" hint="Generic script injected into <head>. Do not expose private secrets!">
            <textarea {...register("analytics.customScript")} rows={4} className={textareaCls} placeholder="<script>...</script>" />
          </Field>
        </SettingsSection>

        {/* ── Indexing ─────────────────────────────────────────── */}
        <SettingsSection icon={<Eye size={14} />} title="Robots & Indexing">
          <div className="space-y-4 p-4 border border-red-500/20 bg-red-500/5 rounded-lg">
            <Toggle
              label="Allow Search Engine Indexing"
              checked={watch("indexing.indexable")}
              onChange={(v) => setValue("indexing.indexable", v, { shouldDirty: true })}
            />
            <p className="text-xs text-text-muted leading-relaxed ml-9 -mt-2">
              If disabled, a <code className="text-[10px] bg-black/40 px-1 py-0.5 rounded text-red-400">noindex</code> tag is added to all pages. Search engines will not index your portfolio.
            </p>
          </div>
          
          <div className="space-y-4 p-4 border border-yellow-500/20 bg-yellow-500/5 rounded-lg mt-4">
            <Toggle
              label="Maintenance Mode"
              checked={watch("indexing.maintenanceMode")}
              onChange={(v) => setValue("indexing.maintenanceMode", v, { shouldDirty: true })}
            />
            <p className="text-xs text-text-muted leading-relaxed ml-9 -mt-2">
              If enabled, all public visitors will see a maintenance page. You will still have access to the admin panel.
            </p>
          </div>
        </SettingsSection>

      </div>

      {/* Bottom save */}
      <div className="flex justify-end pt-8 gap-3">
        <button
          type="button"
          onClick={handlePreview}
          className="px-6 py-3 bg-white/[0.03] border border-border/40 text-text-secondary text-sm font-semibold font-clash
            rounded-lg hover:bg-white/[0.08] hover:text-text-primary transition-all"
        >
          Preview
        </button>
        <button
          type="submit"
          onClick={() => setSubmitAction("draft")}
          disabled={isSubmitting || (!isDirty && !isDraft)}
          className="px-6 py-3 bg-white/[0.05] border border-border/60 text-text-primary text-sm font-semibold font-clash
            rounded-lg hover:bg-white/[0.1] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Save Draft
        </button>
        <button type="submit" onClick={() => setSubmitAction("publish")} disabled={isSubmitting || !isDirty}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-bg text-sm font-semibold font-clash
            rounded-lg hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed">
          {isSubmitting
            ? <div className="w-4 h-4 border-2 border-bg border-t-transparent rounded-full animate-spin" />
            : <Save size={15} />}
          Publish
        </button>
      </div>
    </form>
  );
}
