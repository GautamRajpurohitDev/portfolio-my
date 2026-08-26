"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { settingsApi } from "@/lib/api";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  Save, Plus, Trash2, Eye, EyeOff, Layout, Zap, Image as ImageIcon,
  GripVertical, ArrowUp, ArrowDown, ChevronDown, ChevronUp,
  Globe, FileText, ToggleLeft, ToggleRight, ExternalLink, Check,
  AlertCircle
} from "lucide-react";
import Link from "next/link";
import { MediaPicker } from "@/components/admin/media/MediaPicker";

// ── Shared primitives ─────────────────────────────────────────

const inputCls = "w-full bg-white/[0.03] border border-border/60 rounded-lg px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary/50 transition-colors font-body";
const textareaCls = `${inputCls} resize-none`;

function Field({ label, hint, error, children }: { label: string; hint?: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[11px] font-mono text-text-secondary uppercase tracking-wider">{label}</label>
      {hint && <p className="text-[11px] text-text-muted leading-relaxed">{hint}</p>}
      {children}
      {error && <p className="text-[11px] text-red-400 font-mono mt-1">{error}</p>}
    </div>
  );
}

function Section({ icon, title, badge, children, defaultOpen = true }: {
  icon: React.ReactNode; title: string; badge?: React.ReactNode;
  children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="bg-[#0f0f0f] border border-border/60 rounded-xl overflow-hidden">
      <button type="button" onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-3 px-6 py-4 border-b border-border/40 hover:bg-white/[0.02] transition-colors">
        <div className="flex items-center gap-3">
          <span className="text-text-muted">{icon}</span>
          <h2 className="text-[11px] font-mono text-text-secondary uppercase tracking-widest">{title}</h2>
          {badge}
        </div>
        {open ? <ChevronUp size={14} className="text-text-muted" /> : <ChevronDown size={14} className="text-text-muted" />}
      </button>
      {open && <div className="px-6 py-6 space-y-5">{children}</div>}
    </section>
  );
}

function Toggle({ label, desc, checked, onChange }: { label: string; desc?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange(!checked)} className="flex items-start gap-3 group text-left">
      {checked ? <ToggleRight size={22} className="text-primary flex-shrink-0 mt-0.5" /> : <ToggleLeft size={22} className="text-text-muted flex-shrink-0 mt-0.5" />}
      <div>
        <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors">{label}</span>
        {desc && <p className="text-xs text-text-muted mt-0.5 leading-relaxed">{desc}</p>}
      </div>
    </button>
  );
}

function IntensityPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const opts = ["none", "subtle", "medium", "strong"];
  return (
    <div className="flex gap-2">
      {opts.map((o) => (
        <button key={o} type="button" onClick={() => onChange(o)}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-all ${value === o ? "bg-primary text-bg" : "bg-white/[0.04] border border-border/60 text-text-muted hover:border-primary/30"}`}>
          {o}
        </button>
      ))}
    </div>
  );
}

// ── Publish bar ───────────────────────────────────────────────

function PublishBar({ status, isDirty, isSubmitting, onSaveDraft, onPublish }: {
  status: string; isDirty: boolean; isSubmitting: boolean;
  onSaveDraft: () => void; onPublish: () => void;
}) {
  const isPublished = status === "published";
  return (
    <div className="sticky top-0 z-10 -mx-8 sm:-mx-10 xl:-mx-12 px-8 sm:px-10 xl:px-12 py-3 bg-bg/95 backdrop-blur-md border-b border-border/40 flex items-center justify-between gap-4 mb-8">
      <div className="flex items-center gap-3">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider border ${
          isPublished ? "bg-success/10 border-success/30 text-success" : "bg-yellow-500/10 border-yellow-500/30 text-yellow-400"
        }`}>
          {isPublished ? <Check size={10} /> : <AlertCircle size={10} />}
          {isPublished ? "Published" : "Draft"}
        </span>
        {isDirty && <span className="text-[11px] font-mono text-yellow-500/70">● Unsaved changes</span>}
      </div>
      <div className="flex items-center gap-2">
        <Link href="/" target="_blank"
          className="flex items-center gap-1.5 px-3 py-2 text-[11px] font-mono text-text-muted border border-border/60 rounded-lg hover:border-primary/30 hover:text-primary transition-all uppercase tracking-wider">
          <ExternalLink size={11} /> Preview
        </Link>
        <button type="button" disabled={isSubmitting} onClick={onSaveDraft}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold font-clash border border-border/60 rounded-lg hover:border-primary/30 hover:text-primary transition-all disabled:opacity-40">
          <FileText size={13} /> Save Draft
        </button>
        <button type="button" disabled={isSubmitting} onClick={onPublish}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-bg text-sm font-semibold font-clash rounded-lg hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-40">
          {isSubmitting ? <div className="w-4 h-4 border-2 border-bg border-t-transparent rounded-full animate-spin" /> : <Globe size={13} />}
          {isPublished ? "Update" : "Publish"}
        </button>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────

export default function AdminHomePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, control, handleSubmit, watch, setValue, reset, formState: { isDirty } } = useForm<any>({
    defaultValues: {
      hero: {
        headlineLines: ["BUILDING", "SOFTWARE", "ONE LAYER", "AT A TIME."],
        subtitle: "MCA student focused on building strong programming fundamentals, software engineering skills, and real-world projects. Documenting the journey publicly.",
        eyebrow: [
          { text: "BASED IN INDIA", icon: "MapPin", enabled: true, order: 1 },
          { text: "MCA STUDENT", icon: "GraduationCap", enabled: true, order: 2 },
          { text: "SINCE 2026", icon: "Code2", enabled: true, order: 3 },
          { text: "CURRENTLY LEARNING: GIT → C", icon: "Zap", enabled: true, order: 4 },
        ],
        ctaPrimary:   { label: "View Projects",   url: "/projects", enabled: true, external: false },
        ctaSecondary: { label: "Explore Journey", url: "/journey",  enabled: true, external: false },
        backgroundImage: "",
        heroImage: "",
        overlayOpacity: 0.04,
        effects: {
          liquidCursor:    true,
          liquidIntensity: "medium",
          cursorSize:      36,
          hoverScale:      2.5,
          rippleEnabled:   true,
          rippleIntensity: "medium",
          parallax:        false,
          glow:            true,
          grain:           true,
          animation:       true,
        },
        status:  "published",
        visible: true,
      },
    },
  });

  const { fields: headlineFields, append: appendHeadline, remove: removeHeadline, move: moveHeadline } = useFieldArray({ control, name: "hero.headlineLines" });
  const { fields: eyebrowFields, append: appendEyebrow, remove: removeEyebrow, move: moveEyebrow } = useFieldArray({ control, name: "hero.eyebrow" });

  const heroStatus  = watch("hero.status");
  const heroVisible = watch("hero.visible");
  const effects     = watch("hero.effects");

  // Load full config from admin endpoint
  useEffect(() => {
    (async () => {
      try {
        const res = await settingsApi.getAdmin();
        const s = res.data.data;
        if (!s) return;
        reset({
          hero: {
            headlineLines:   s.hero?.headlineLines   ?? ["BUILDING", "SOFTWARE", "ONE LAYER", "AT A TIME."],
            subtitle:        s.hero?.subtitle        ?? "",
            eyebrow:         s.hero?.eyebrow         ?? [],
            ctaPrimary:      s.hero?.ctaPrimary      ?? { label: "View Projects",   url: "/projects", enabled: true, external: false },
            ctaSecondary:    s.hero?.ctaSecondary    ?? { label: "Explore Journey", url: "/journey",  enabled: true, external: false },
            backgroundImage: s.hero?.backgroundImage ?? "",
            heroImage:       s.hero?.heroImage       ?? "",
            overlayOpacity:  s.hero?.overlayOpacity  ?? 0.04,
            effects:         s.hero?.effects ?? {
              liquidCursor: true, liquidIntensity: "medium",
              cursorSize: 36, hoverScale: 2.5,
              rippleEnabled: true, rippleIntensity: "medium",
              parallax: false, glow: true, grain: true, animation: true,
            },
            status:  s.hero?.status  ?? "published",
            visible: s.hero?.visible ?? true,
          },
        });
      } catch { toast.error("Failed to load hero settings"); }
      finally  { setIsLoading(false); }
    })();
  }, [reset]);

  const submit = useCallback(async (data: any, asDraft: boolean) => {
    setIsSubmitting(true);
    try {
      const payload = {
        hero: {
          ...data.hero,
          headlineLines: data.hero.headlineLines.filter((l: string) => l?.trim()),
          eyebrow: (data.hero.eyebrow as any[]).map((e, i) => ({ ...e, order: i + 1 })),
          status: asDraft ? "draft" : "published",
        },
      };
      await settingsApi.update(payload);
      setValue("hero.status", payload.hero.status, { shouldDirty: false });
      toast.success(asDraft ? "Saved as draft" : "Hero published!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to save");
    } finally {
      setIsSubmitting(false);
    }
  }, [setValue]);

  const onSaveDraft  = () => handleSubmit((d) => submit(d, true))();
  const onPublish    = () => handleSubmit((d) => submit(d, false))();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] gap-4 flex-col">
        <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-[11px] font-mono text-text-muted uppercase tracking-widest">Loading hero config…</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.24 }} className="mb-8">
        <p className="text-[10px] font-mono text-text-muted tracking-[0.18em] uppercase mb-3">Appearance / Home</p>
        <h1 className="text-3xl font-clash font-bold text-text-primary">Hero Section</h1>
        <p className="text-sm text-text-secondary mt-2">
          Control every element of the public homepage hero. Changes go live when you click Publish.
        </p>
      </motion.div>

      <PublishBar
        status={heroStatus}
        isDirty={isDirty}
        isSubmitting={isSubmitting}
        onSaveDraft={onSaveDraft}
        onPublish={onPublish}
      />

      <div className="space-y-5">

        {/* ── Visibility ──────────────────────────────────────── */}
        <Section icon={<Eye size={14} />} title="Visibility">
          <Toggle
            label="Show hero section on homepage"
            desc="When disabled, the hero section is completely hidden from the public site."
            checked={heroVisible}
            onChange={(v) => setValue("hero.visible", v, { shouldDirty: true })}
          />
        </Section>

        {/* ── Headline ────────────────────────────────────────── */}
        <Section icon={<Layout size={14} />} title="Headline Lines"
          badge={<span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-mono">{headlineFields.length} lines</span>}>
          <p className="text-xs text-text-muted -mt-2 leading-relaxed">
            Each line is a separate row in the hero headline. The last line's final character gets a gold accent.
          </p>
          <div className="space-y-2.5">
            {headlineFields.map((field, i) => (
              <div key={field.id} className="flex gap-2 items-center">
                <div className="flex flex-col gap-1">
                  <button type="button" onClick={() => i > 0 && moveHeadline(i, i - 1)} disabled={i === 0}
                    className="p-1 text-text-muted hover:text-text-primary disabled:opacity-30 transition-colors">
                    <ArrowUp size={12} />
                  </button>
                  <button type="button" onClick={() => i < headlineFields.length - 1 && moveHeadline(i, i + 1)} disabled={i === headlineFields.length - 1}
                    className="p-1 text-text-muted hover:text-text-primary disabled:opacity-30 transition-colors">
                    <ArrowDown size={12} />
                  </button>
                </div>
                <span className="text-[10px] font-mono text-text-muted w-4 text-right flex-shrink-0">{i + 1}</span>
                <input {...register(`hero.headlineLines.${i}`)} className={`${inputCls} flex-1 font-display uppercase tracking-tight text-lg`}
                  placeholder={`Line ${i + 1}…`} />
                <button type="button" onClick={() => removeHeadline(i)}
                  className="p-2.5 text-text-muted border border-border/60 rounded-lg hover:text-red-400 hover:border-red-400/30 transition-all flex-shrink-0">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
          <button type="button" onClick={() => appendHeadline("")}
            className="flex items-center gap-1.5 text-xs font-mono text-primary hover:text-primary/80 transition-colors uppercase tracking-wider">
            <Plus size={12} /> Add line
          </button>
        </Section>

        {/* ── Subtitle ────────────────────────────────────────── */}
        <Section icon={<FileText size={14} />} title="Subtitle">
          <Field label="Subtitle Text" hint="1–3 sentences shown below the headline. Aim for under 200 characters.">
            <textarea {...register("hero.subtitle")} rows={3} className={textareaCls}
              placeholder="MCA student focused on building strong programming fundamentals…" />
          </Field>
        </Section>

        {/* ── Eyebrow / Meta items ─────────────────────────────── */}
        <Section icon={<Zap size={14} />} title="Eyebrow / Metadata Items"
          badge={<span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-mono">{eyebrowFields.filter((_: any, i: number) => watch(`hero.eyebrow.${i}.enabled`)).length} active</span>}>
          <p className="text-xs text-text-muted -mt-2 leading-relaxed">
            Short metadata chips shown above the headline. E.g., "BASED IN INDIA", "MCA STUDENT".
            Icon names use Lucide icon names (e.g. MapPin, GraduationCap, Code2, Zap).
          </p>
          <div className="space-y-3">
            {eyebrowFields.map((field, i) => (
              <div key={field.id} className="flex gap-2 items-center">
                <div className="flex flex-col gap-1">
                  <button type="button" onClick={() => i > 0 && moveEyebrow(i, i - 1)} disabled={i === 0}
                    className="p-1 text-text-muted hover:text-text-primary disabled:opacity-30 transition-colors">
                    <ArrowUp size={12} />
                  </button>
                  <button type="button" onClick={() => i < eyebrowFields.length - 1 && moveEyebrow(i, i + 1)} disabled={i === eyebrowFields.length - 1}
                    className="p-1 text-text-muted hover:text-text-primary disabled:opacity-30 transition-colors">
                    <ArrowDown size={12} />
                  </button>
                </div>
                <Controller control={control} name={`hero.eyebrow.${i}.enabled`}
                  render={({ field: f }) => (
                    <button type="button" onClick={() => f.onChange(!f.value)} className="flex-shrink-0">
                      {f.value ? <ToggleRight size={20} className="text-primary" /> : <ToggleLeft size={20} className="text-text-muted" />}
                    </button>
                  )} />
                <input {...register(`hero.eyebrow.${i}.text`)} className={`${inputCls} flex-1 font-mono text-xs uppercase tracking-wider`}
                  placeholder="e.g. BASED IN INDIA" />
                <input {...register(`hero.eyebrow.${i}.icon`)} className={`${inputCls} w-32 text-xs`}
                  placeholder="MapPin" />
                <button type="button" onClick={() => removeEyebrow(i)}
                  className="p-2.5 text-text-muted border border-border/60 rounded-lg hover:text-red-400 hover:border-red-400/30 transition-all flex-shrink-0">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
          <button type="button" onClick={() => appendEyebrow({ text: "", icon: "", enabled: true, order: eyebrowFields.length + 1 })}
            className="flex items-center gap-1.5 text-xs font-mono text-primary hover:text-primary/80 transition-colors uppercase tracking-wider">
            <Plus size={12} /> Add item
          </button>
        </Section>

        {/* ── CTAs ─────────────────────────────────────────────── */}
        <Section icon={<ExternalLink size={14} />} title="Call to Action Buttons">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Primary */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-mono text-text-muted uppercase tracking-wider">Primary CTA</p>
                <Controller control={control} name="hero.ctaPrimary.enabled"
                  render={({ field: f }) => (
                    <button type="button" onClick={() => f.onChange(!f.value)}>
                      {f.value ? <ToggleRight size={18} className="text-primary" /> : <ToggleLeft size={18} className="text-text-muted" />}
                    </button>
                  )} />
              </div>
              <Field label="Label">
                <input {...register("hero.ctaPrimary.label")} className={inputCls} placeholder="View Projects" />
              </Field>
              <Field label="URL">
                <input {...register("hero.ctaPrimary.url")} className={inputCls} placeholder="/projects" />
              </Field>
              <Controller control={control} name="hero.ctaPrimary.external"
                render={({ field: f }) => (
                  <Toggle label="External link" checked={f.value} onChange={f.onChange} />
                )} />
            </div>
            {/* Secondary */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-mono text-text-muted uppercase tracking-wider">Secondary CTA</p>
                <Controller control={control} name="hero.ctaSecondary.enabled"
                  render={({ field: f }) => (
                    <button type="button" onClick={() => f.onChange(!f.value)}>
                      {f.value ? <ToggleRight size={18} className="text-primary" /> : <ToggleLeft size={18} className="text-text-muted" />}
                    </button>
                  )} />
              </div>
              <Field label="Label">
                <input {...register("hero.ctaSecondary.label")} className={inputCls} placeholder="Explore Journey" />
              </Field>
              <Field label="URL">
                <input {...register("hero.ctaSecondary.url")} className={inputCls} placeholder="/journey" />
              </Field>
              <Controller control={control} name="hero.ctaSecondary.external"
                render={({ field: f }) => (
                  <Toggle label="External link" checked={f.value} onChange={f.onChange} />
                )} />
            </div>
          </div>
        </Section>

        {/* ── Visual ───────────────────────────────────────────── */}
        <Section icon={<ImageIcon size={14} />} title="Visual & Background" defaultOpen={false}>
          <Field label="Background Image" hint="Displayed as the hero background. Leave empty for the default grid pattern.">
            <Controller
              control={control}
              name="hero.backgroundImage"
              render={({ field }) => (
                <MediaPicker
                  value={field.value}
                  onChange={(url) => field.onChange(url)}
                />
              )}
            />
          </Field>
          <Field label="Hero Image" hint="Profile/portrait image shown alongside the headline on wider viewports.">
            <Controller
              control={control}
              name="hero.heroImage"
              render={({ field }) => (
                <MediaPicker
                  value={field.value}
                  onChange={(url) => field.onChange(url)}
                />
              )}
            />
          </Field>
          <Field label={`Overlay Opacity: ${Math.round(watch("hero.overlayOpacity") * 100)}%`} hint="Darkens the background image. 0 = fully transparent, 1 = solid black.">
            <input type="range" min={0} max={1} step={0.01} {...register("hero.overlayOpacity", { valueAsNumber: true })}
              className="w-full accent-primary" />
          </Field>
        </Section>

        {/* ── Effects ──────────────────────────────────────────── */}
        <Section icon={<Zap size={14} />} title="Hero Effects & Cursor" defaultOpen={false}>
          <div className="space-y-6">
            <div className="space-y-4">
              <p className="text-[10px] font-mono text-text-muted uppercase tracking-wider">Liquid Cursor (Hero Only)</p>
              <Controller control={control} name="hero.effects.liquidCursor"
                render={({ field: f }) => (
                  <Toggle label="Enable liquid cursor in hero" desc="A subtle custom cursor that only activates while the hero is in view." checked={f.value} onChange={f.onChange} />
                )} />
              {effects?.liquidCursor && (
                <div className="pl-6 space-y-4 border-l border-border/40">
                  <Field label="Cursor Intensity">
                    <Controller control={control} name="hero.effects.liquidIntensity"
                      render={({ field: f }) => <IntensityPicker value={f.value} onChange={f.onChange} />} />
                  </Field>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label={`Cursor Size: ${watch("hero.effects.cursorSize")}px`}>
                      <input type="range" min={12} max={80} step={2} {...register("hero.effects.cursorSize", { valueAsNumber: true })} className="w-full accent-primary" />
                    </Field>
                    <Field label={`Hover Scale: ${watch("hero.effects.hoverScale")}×`}>
                      <input type="range" min={1} max={6} step={0.1} {...register("hero.effects.hoverScale", { valueAsNumber: true })} className="w-full accent-primary" />
                    </Field>
                  </div>
                  <Controller control={control} name="hero.effects.rippleEnabled"
                    render={({ field: f }) => (
                      <Toggle label="Enable click ripple" checked={f.value} onChange={f.onChange} />
                    )} />
                  {effects?.rippleEnabled && (
                    <Field label="Ripple Intensity">
                      <Controller control={control} name="hero.effects.rippleIntensity"
                        render={({ field: f }) => <IntensityPicker value={f.value} onChange={f.onChange} />} />
                    </Field>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-4 pt-4 border-t border-border/40">
              <p className="text-[10px] font-mono text-text-muted uppercase tracking-wider">Background Effects</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Controller control={control} name="hero.effects.glow"
                  render={({ field: f }) => <Toggle label="Background glow" desc="Subtle radial glow in hero corners." checked={f.value} onChange={f.onChange} />} />
                <Controller control={control} name="hero.effects.grain"
                  render={({ field: f }) => <Toggle label="Film grain overlay" desc="Subtle grain texture over hero." checked={f.value} onChange={f.onChange} />} />
                <Controller control={control} name="hero.effects.animation"
                  render={({ field: f }) => <Toggle label="Entrance animations" desc="Animated headline and fade-in effects." checked={f.value} onChange={f.onChange} />} />
                <Controller control={control} name="hero.effects.parallax"
                  render={({ field: f }) => <Toggle label="Parallax on scroll" desc="Background moves at a slower scroll rate." checked={f.value} onChange={f.onChange} />} />
              </div>
            </div>
          </div>
        </Section>

      </div>

      {/* Bottom save */}
      <div className="flex justify-end gap-3 pt-10">
        <button type="button" disabled={isSubmitting} onClick={onSaveDraft}
          className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold font-clash border border-border/60 rounded-lg hover:border-primary/30 hover:text-primary transition-all disabled:opacity-40">
          <FileText size={14} /> Save Draft
        </button>
        <button type="button" disabled={isSubmitting} onClick={onPublish}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-bg text-sm font-semibold font-clash rounded-lg hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-40">
          {isSubmitting ? <div className="w-4 h-4 border-2 border-bg border-t-transparent rounded-full animate-spin" /> : <Globe size={14} />}
          Publish Hero
        </button>
      </div>
    </div>
  );
}
