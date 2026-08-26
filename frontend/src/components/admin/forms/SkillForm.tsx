"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { skillsApi } from "@/lib/api";
import { Skill, SkillStatus } from "@/types";
import toast from "react-hot-toast";
import { Save, Check, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { Composer } from "../composer/Composer";
import Link from "next/link";

const skillSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  category: z.enum(["programming","cs-fundamentals","web","databases","systems","cloud","ai-ml","mobile","tools"]),
  status: z.enum([
    "not-started","in-progress","practicing","review","completed","optional","paused",
    "learning","familiar","proficient","advanced","planned"
  ]).default("not-started"),
  progress: z.number().min(0).max(100).optional().default(0),
  description: z.string().optional().default(""),
  icon: z.string().optional().default(""),
  published: z.boolean().optional().default(true),
  featured: z.boolean().optional().default(false),
  order: z.number().int().optional().default(0),
  media: z.array(z.object({
    url: z.string(),
    mimeType: z.string(),
    alt: z.string().optional().default(""),
    order: z.number().int().optional().default(0),
  })).optional().default([]),
});

type SkillFormData = z.infer<typeof skillSchema>;

interface SkillFormProps {
  skill: Skill | null;
}

export default function SkillForm({ skill }: SkillFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    control,
    setValue,
    formState: { errors, isDirty },
  } = useForm<SkillFormData>({
    resolver: zodResolver(skillSchema) as any,
    defaultValues: skill
      ? {
          name: skill.name,
          category: skill.category as any,
          status: skill.status as any,
          progress: typeof skill.progress === "number" ? skill.progress : 0,
          description: skill.description || "",
          icon: skill.icon || "",
          published: skill.published,
          featured: skill.featured,
          order: skill.order,
          media: skill.media || [],
        }
      : {
          name: "",
          category: "programming",
          status: "not-started",
          progress: 0,
          description: "",
          icon: "",
          published: true,
          featured: false,
          order: 0,
          media: [],
        },
  });

  const isPublished = watch("published");
  const currentProgress = watch("progress") ?? 0;

  const onSubmit = async (data: SkillFormData) => {
    setIsSubmitting(true);
    try {
      if (skill) {
        await skillsApi.update(skill._id, data);
        toast.success("Skill updated successfully");
      } else {
        await skillsApi.create(data);
        toast.success("Skill created successfully");
      }
      
      router.push("/admin/skills");
      router.refresh();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to save skill");
    } finally {
      setIsSubmitting(false);
    }
  };

  const Section = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <div className="bg-[#0f0f0f] border border-border/60 rounded-xl p-6 space-y-6">
      <h3 className="text-xs font-mono font-semibold tracking-widest text-text-muted uppercase border-b border-border/40 pb-3 mb-4">
        {title}
      </h3>
      {children}
    </div>
  );

  return (
    <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <Link href="/admin/skills" className="inline-flex items-center gap-1.5 text-xs font-mono text-text-muted hover:text-primary transition-colors mb-2 uppercase tracking-wider">
            <ArrowLeft size={12} /> Back to Skills Desk
          </Link>
          <h1 className="text-2xl font-bold font-clash text-text-primary">
            {skill ? `Edit Skill: ${skill.name}` : "New Skill Entry"}
          </h1>
          {isDirty && <p className="text-xs font-mono text-yellow-500 mt-1">● Unsaved changes</p>}
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            type="button" 
            onClick={() => router.push("/admin/skills")} 
            className="px-4 py-2 text-text-secondary hover:text-text-primary transition-colors text-sm font-medium"
          >
            Cancel
          </button>

          <button 
            type="submit" 
            disabled={isSubmitting} 
            className="px-6 py-2.5 bg-primary text-bg font-semibold font-clash text-sm rounded-lg hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-bg border-t-transparent rounded-full animate-spin"></div>
            ) : (
              isPublished ? <Check size={15} /> : <Save size={15} />
            )}
            {isSubmitting ? "Saving..." : (isPublished ? "Publish Skill" : "Save Draft")}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          
          <Section title="Skill Information">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-[11px] font-mono text-text-secondary uppercase tracking-wider">Skill Name *</label>
                <input
                  {...register("name")}
                  placeholder="e.g. Git & GitHub, C Programming, Data Structures"
                  className="w-full bg-white/[0.03] border border-border/60 rounded-lg px-4 py-2.5 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary/50 transition-colors text-sm font-body"
                />
                {errors.name && <p className="text-red-400 text-xs font-mono">{errors.name.message}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-mono text-text-secondary uppercase tracking-wider">Description & Documentation Notes</label>
                <div className="mt-2">
                  <Composer
                    contentField="description"
                    mediaField="media"
                    control={control}
                    watch={watch}
                    setValue={setValue}
                  />
                </div>
              </div>
              
              <div className="space-y-1.5">
                <label className="block text-[11px] font-mono text-text-secondary uppercase tracking-wider">Icon identifier / SVG</label>
                <input
                  {...register("icon")}
                  placeholder="e.g. GitBranch, Terminal, Layers"
                  className="w-full bg-white/[0.03] border border-border/60 rounded-lg px-4 py-2.5 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary/50 transition-colors font-mono text-sm"
                />
              </div>
            </div>
          </Section>
        </div>

        <div className="space-y-6">
          <Section title="Classification & Progress">
            <div className="space-y-5">
              <div className="space-y-1.5">
                <label className="block text-[11px] font-mono text-text-secondary uppercase tracking-wider">Domain Category</label>
                <select
                  {...register("category")}
                  className="w-full bg-[#0a0a0a] border border-border/60 rounded-lg px-4 py-2.5 text-text-primary focus:outline-none focus:border-primary/50 text-sm"
                >
                  <option value="programming">Programming Languages</option>
                  <option value="cs-fundamentals">CS Fundamentals</option>
                  <option value="web">Web Development</option>
                  <option value="databases">Databases</option>
                  <option value="systems">Systems & OS</option>
                  <option value="cloud">Cloud & DevOps</option>
                  <option value="ai-ml">AI & Machine Learning</option>
                  <option value="mobile">Mobile Development</option>
                  <option value="tools">Tools & Workflow</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-mono text-text-secondary uppercase tracking-wider">Learning Status</label>
                <select
                  {...register("status")}
                  className="w-full bg-[#0a0a0a] border border-border/60 rounded-lg px-4 py-2.5 text-text-primary focus:outline-none focus:border-primary/50 text-sm font-medium"
                >
                  <option value="not-started">Not Started / Planned</option>
                  <option value="in-progress">In Progress</option>
                  <option value="practicing">Practicing</option>
                  <option value="review">In Review</option>
                  <option value="completed">Completed</option>
                  <option value="optional">Optional</option>
                  <option value="paused">Paused</option>
                </select>
              </div>

              {/* Progress 0 - 100% */}
              <div className="space-y-2 p-3.5 bg-white/[0.02] border border-border/40 rounded-lg">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-mono text-text-secondary uppercase tracking-wider">Progress Percentage</label>
                  <span className="text-xs font-mono font-bold text-accent">{currentProgress}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  {...register("progress", { valueAsNumber: true })}
                  className="w-full accent-primary h-1.5 bg-border/80 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-mono text-text-muted">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>

              <div className="flex flex-col gap-3 pt-2">
                <label className="flex items-center justify-between cursor-pointer p-3 rounded-lg border border-border/60 bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                  <span className="text-xs font-medium text-text-primary">Publish to Public Portfolio</span>
                  <input type="checkbox" {...register("published")} className="w-4 h-4 rounded border-border bg-black text-primary accent-primary" />
                </label>
                <label className="flex items-center justify-between cursor-pointer p-3 rounded-lg border border-border/60 bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                  <span className="text-xs font-medium text-text-primary">Highlight as Featured</span>
                  <input type="checkbox" {...register("featured")} className="w-4 h-4 rounded border-border bg-black text-primary accent-primary" />
                </label>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-mono text-text-secondary uppercase tracking-wider">Display Order</label>
                <input
                  type="number"
                  {...register("order", { valueAsNumber: true })}
                  className="w-full bg-white/[0.03] border border-border/60 rounded-lg px-4 py-2.5 text-text-primary focus:outline-none focus:border-primary/50 text-sm font-mono"
                />
              </div>
            </div>
          </Section>
        </div>
      </div>
    </form>
  );
}
