"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { settingsApi } from "@/lib/api";
import { Settings } from "@/types";
import toast from "react-hot-toast";
import { Save, Check } from "lucide-react";

// The full nested schema matching backend
const appearanceSchema = z.object({
  appearance: z.object({
    theme: z.object({
      preset: z.enum(["default", "midnight", "minimal", "warm"]).default("default"),
      background: z.string().default(""),
      surface: z.string().default(""),
      text: z.string().default(""),
      mutedText: z.string().default(""),
      accent: z.string().default(""),
      border: z.string().default(""),
    }),
    typography: z.object({
      fontFamily: z.string().default("inter"),
      headingScale: z.number().default(1.0),
      bodyScale: z.number().default(1.0),
      letterSpacing: z.string().default("normal"),
    }),
    motion: z.object({
      global: z.boolean().default(true),
      pageTransitions: z.boolean().default(true),
      scrollReveals: z.boolean().default(true),
      heroEffects: z.boolean().default(true),
      liquidCursor: z.boolean().default(true),
      intensity: z.enum(["subtle", "medium", "strong"]).default("medium"),
    }),
    cursor: z.object({
      heroOnly: z.boolean().default(true),
    }),
    background: z.object({
      grain: z.object({ enabled: z.boolean().default(true), intensity: z.string().default("medium") }),
      grid: z.object({ enabled: z.boolean().default(false), intensity: z.string().default("medium") }),
      glow: z.object({ enabled: z.boolean().default(true), intensity: z.string().default("medium") }),
      particles: z.object({ enabled: z.boolean().default(false), intensity: z.string().default("medium") }),
    }),
  }),
});

type AppearanceFormData = z.infer<typeof appearanceSchema>;

interface AppearanceFormProps {
  settings: Settings | null;
}

export default function AppearanceForm({ settings }: AppearanceFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("theme");

  const defaultAppearance: any = {
    theme: { preset: "default", background: "", surface: "", text: "", mutedText: "", accent: "", border: "" },
    typography: { fontFamily: "inter", headingScale: 1.0, bodyScale: 1.0, letterSpacing: "normal" },
    motion: { global: true, pageTransitions: true, scrollReveals: true, heroEffects: true, liquidCursor: true, intensity: "medium" },
    cursor: { heroOnly: true },
    background: {
      grain: { enabled: true, intensity: "medium" },
      grid: { enabled: false, intensity: "medium" },
      glow: { enabled: true, intensity: "medium" },
      particles: { enabled: false, intensity: "medium" },
    },
  };

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isDirty },
  } = useForm<AppearanceFormData>({
    resolver: zodResolver(appearanceSchema) as any,
    defaultValues: {
      appearance: settings?.appearance || defaultAppearance,
    },
  });

  const onSubmit = async (data: AppearanceFormData) => {
    setIsSubmitting(true);
    try {
      // Just PATCH the appearance object to the settings model
      await settingsApi.update({ appearance: data.appearance } as any);
      toast.success("Appearance settings updated");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to save settings");
    } finally {
      setIsSubmitting(false);
    }
  };

  const Section = ({ title, children, description }: { title: string, children: React.ReactNode, description?: string }) => (
    <div className="bg-bg-card border border-border rounded-xl p-6 space-y-6">
      <div className="border-b border-border pb-4 mb-4">
        <h3 className="text-sm font-semibold tracking-widest text-text-secondary uppercase">
          {title}
        </h3>
        {description && <p className="text-xs text-text-muted mt-1">{description}</p>}
      </div>
      {children}
    </div>
  );

  const tabs = [
    { id: "theme", label: "Theme" },
    { id: "typography", label: "Typography" },
    { id: "motion", label: "Motion" },
    { id: "background", label: "Background" },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold font-clash text-text-primary">
            Appearance CMS
          </h1>
          {isDirty && <p className="text-sm text-yellow-500 mt-1">Unsaved changes</p>}
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            type="submit" 
            disabled={isSubmitting} 
            className={`px-6 py-2 bg-primary text-bg font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2 text-sm`}
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-bg border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Save size={16} />
            )}
            {isSubmitting ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </div>

      <div className="flex gap-2 border-b border-border/50 pb-2 mb-6 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
              activeTab === tab.id ? "bg-white/10 text-white" : "text-text-secondary hover:text-white hover:bg-white/5"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        {activeTab === "theme" && (
          <Section title="Theme Preset" description="Choose a curated color preset.">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {["default", "midnight", "minimal", "warm"].map(preset => (
                <label key={preset} className="cursor-pointer">
                  <input type="radio" value={preset} {...register("appearance.theme.preset")} className="peer hidden" />
                  <div className="border border-border/50 rounded-xl p-4 peer-checked:border-primary peer-checked:bg-white/5 hover:bg-white/[0.02] transition-colors flex flex-col items-center gap-2 text-center">
                    <div className="w-12 h-12 rounded-full shadow-lg border border-border/50 bg-bg-card" />
                    <span className="text-sm font-medium capitalize text-text-primary">{preset}</span>
                  </div>
                </label>
              ))}
            </div>
            {/* Optional advanced overrides can go here */}
          </Section>
        )}

        {activeTab === "typography" && (
          <Section title="Typography settings" description="Control the global font stacks and scaling.">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-sm font-medium text-text-secondary">Font Family</label>
                <select {...register("appearance.typography.fontFamily")} className="w-full bg-white/5 border border-border rounded-lg px-4 py-2 text-text-primary focus:outline-none focus:border-primary text-sm [&>option]:bg-[#0a0a0a]">
                  <option value="inter">Inter (Default)</option>
                  <option value="roboto">Roboto</option>
                  <option value="outfit">Outfit</option>
                  <option value="jetbrains">JetBrains Mono</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-text-secondary">Letter Spacing</label>
                <select {...register("appearance.typography.letterSpacing")} className="w-full bg-white/5 border border-border rounded-lg px-4 py-2 text-text-primary focus:outline-none focus:border-primary text-sm [&>option]:bg-[#0a0a0a]">
                  <option value="tight">Tight</option>
                  <option value="normal">Normal</option>
                  <option value="wide">Wide</option>
                </select>
              </div>
              
              <div className="space-y-1">
                <label className="text-sm font-medium text-text-secondary">Heading Scale ({watch("appearance.typography.headingScale")})</label>
                <input type="range" min="0.8" max="1.5" step="0.1" {...register("appearance.typography.headingScale", { valueAsNumber: true })} className="w-full accent-primary" />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-text-secondary">Body Scale ({watch("appearance.typography.bodyScale")})</label>
                <input type="range" min="0.8" max="1.5" step="0.1" {...register("appearance.typography.bodyScale", { valueAsNumber: true })} className="w-full accent-primary" />
              </div>
            </div>
          </Section>
        )}

        {activeTab === "motion" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Section title="Global Motion" description="Control global animation behavior.">
              <div className="flex flex-col gap-4">
                <label className="flex items-center justify-between cursor-pointer p-3 rounded-lg border border-border/50 bg-white/5 hover:bg-white/10 transition-colors">
                  <span className="text-sm font-medium text-text-primary">Enable Global Motion</span>
                  <input type="checkbox" {...register("appearance.motion.global")} className="w-5 h-5 rounded border-border bg-black text-primary accent-primary" />
                </label>
                
                <label className="flex items-center justify-between cursor-pointer p-3 rounded-lg border border-border/50 bg-white/5 hover:bg-white/10 transition-colors">
                  <span className="text-sm font-medium text-text-primary">Page Transitions</span>
                  <input type="checkbox" {...register("appearance.motion.pageTransitions")} className="w-5 h-5 rounded border-border bg-black text-primary accent-primary" />
                </label>

                <label className="flex items-center justify-between cursor-pointer p-3 rounded-lg border border-border/50 bg-white/5 hover:bg-white/10 transition-colors">
                  <span className="text-sm font-medium text-text-primary">Scroll Reveals</span>
                  <input type="checkbox" {...register("appearance.motion.scrollReveals")} className="w-5 h-5 rounded border-border bg-black text-primary accent-primary" />
                </label>
              </div>

              <div className="pt-4 border-t border-border/50 space-y-1">
                <label className="text-sm font-medium text-text-secondary">Animation Intensity</label>
                <select {...register("appearance.motion.intensity")} className="w-full bg-white/5 border border-border rounded-lg px-4 py-2 text-text-primary focus:outline-none focus:border-primary text-sm [&>option]:bg-[#0a0a0a]">
                  <option value="subtle">Subtle</option>
                  <option value="medium">Medium</option>
                  <option value="strong">Strong</option>
                </select>
              </div>
            </Section>

            <Section title="Hero & Cursor" description="Special interactive effects for the hero section.">
              <div className="flex flex-col gap-4">
                <label className="flex items-center justify-between cursor-pointer p-3 rounded-lg border border-border/50 bg-white/5 hover:bg-white/10 transition-colors">
                  <span className="text-sm font-medium text-text-primary">Enable Hero Effects</span>
                  <input type="checkbox" {...register("appearance.motion.heroEffects")} className="w-5 h-5 rounded border-border bg-black text-primary accent-primary" />
                </label>
                
                <label className="flex items-center justify-between cursor-pointer p-3 rounded-lg border border-border/50 bg-white/5 hover:bg-white/10 transition-colors">
                  <span className="text-sm font-medium text-text-primary">Liquid Cursor Enabled</span>
                  <input type="checkbox" {...register("appearance.motion.liquidCursor")} className="w-5 h-5 rounded border-border bg-black text-primary accent-primary" />
                </label>
                
                <label className="flex items-center justify-between cursor-pointer p-3 rounded-lg border border-border/50 bg-white/5 hover:bg-white/10 transition-colors opacity-70">
                  <span className="text-sm font-medium text-text-primary flex flex-col">
                    Cursor Scope
                    <span className="text-xs text-text-muted font-normal mt-0.5">Cursor is restricted to Hero-only</span>
                  </span>
                  <input type="checkbox" {...register("appearance.cursor.heroOnly")} disabled className="w-5 h-5 rounded border-border bg-black text-primary accent-primary" />
                </label>
              </div>
            </Section>
          </div>
        )}

        {activeTab === "background" && (
          <Section title="Background Effects" description="Toggle ambient background visual effects.">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="space-y-4 border border-border/50 rounded-xl p-4 bg-white/[0.02]">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm font-medium text-text-primary">Grain Effect</span>
                  <input type="checkbox" {...register("appearance.background.grain.enabled")} className="w-5 h-5 rounded border-border bg-black text-primary accent-primary" />
                </label>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-text-secondary">Intensity</label>
                  <select {...register("appearance.background.grain.intensity")} className="w-full bg-white/5 border border-border rounded-lg px-3 py-1.5 text-text-primary focus:outline-none focus:border-primary text-sm [&>option]:bg-[#0a0a0a]">
                    <option value="subtle">Subtle</option>
                    <option value="medium">Medium</option>
                    <option value="strong">Strong</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4 border border-border/50 rounded-xl p-4 bg-white/[0.02]">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm font-medium text-text-primary">Grid Pattern</span>
                  <input type="checkbox" {...register("appearance.background.grid.enabled")} className="w-5 h-5 rounded border-border bg-black text-primary accent-primary" />
                </label>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-text-secondary">Intensity</label>
                  <select {...register("appearance.background.grid.intensity")} className="w-full bg-white/5 border border-border rounded-lg px-3 py-1.5 text-text-primary focus:outline-none focus:border-primary text-sm [&>option]:bg-[#0a0a0a]">
                    <option value="subtle">Subtle</option>
                    <option value="medium">Medium</option>
                    <option value="strong">Strong</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4 border border-border/50 rounded-xl p-4 bg-white/[0.02]">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm font-medium text-text-primary">Ambient Glow</span>
                  <input type="checkbox" {...register("appearance.background.glow.enabled")} className="w-5 h-5 rounded border-border bg-black text-primary accent-primary" />
                </label>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-text-secondary">Intensity</label>
                  <select {...register("appearance.background.glow.intensity")} className="w-full bg-white/5 border border-border rounded-lg px-3 py-1.5 text-text-primary focus:outline-none focus:border-primary text-sm [&>option]:bg-[#0a0a0a]">
                    <option value="subtle">Subtle</option>
                    <option value="medium">Medium</option>
                    <option value="strong">Strong</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4 border border-border/50 rounded-xl p-4 bg-white/[0.02]">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm font-medium text-text-primary">Particles (If Supported)</span>
                  <input type="checkbox" {...register("appearance.background.particles.enabled")} className="w-5 h-5 rounded border-border bg-black text-primary accent-primary" />
                </label>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-text-secondary">Intensity</label>
                  <select {...register("appearance.background.particles.intensity")} className="w-full bg-white/5 border border-border rounded-lg px-3 py-1.5 text-text-primary focus:outline-none focus:border-primary text-sm [&>option]:bg-[#0a0a0a]">
                    <option value="subtle">Subtle</option>
                    <option value="medium">Medium</option>
                    <option value="strong">Strong</option>
                  </select>
                </div>
              </div>

            </div>
          </Section>
        )}
      </div>
    </form>
  );
}
