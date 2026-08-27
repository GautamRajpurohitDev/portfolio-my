"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { skillsApi } from "@/lib/api";
import { Skill } from "@/types";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { AdminEditorHeader, SaveState } from "@/components/admin/ui/AdminEditorHeader";
import { DraftRecoveryBanner } from "@/components/admin/ui/DraftRecoveryBanner";
import { useDraftRecovery } from "@/hooks/useDraftRecovery";

const skillSchema = z.object({
  name: z.string().min(1, "Skill name is required").max(100),
  category: z.enum([
    "programming",
    "cs-fundamentals",
    "web",
    "databases",
    "systems",
    "cloud",
    "ai-ml",
    "mobile",
    "tools",
  ]),
  status: z
    .enum([
      "not-started",
      "in-progress",
      "practicing",
      "review",
      "completed",
      "optional",
      "paused",
      "learning",
      "familiar",
      "proficient",
      "advanced",
      "planned",
    ])
    .default("not-started"),
  progress: z.number().min(0).max(100).optional().default(0),
  description: z.string().optional().default(""),
  icon: z.string().optional().default(""),
  published: z.boolean().optional().default(true),
  featured: z.boolean().optional().default(false),
  order: z.number().int().optional().default(0),
});

type SkillFormData = z.infer<typeof skillSchema>;

interface SkillFormProps {
  skill: Skill | null;
}

export default function SkillForm({ skill }: SkillFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>("saved");
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(
    skill ? new Date(skill.updatedAt || skill.createdAt) : null
  );
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    getValues,
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
          featured: skill.featured || false,
          order: skill.order || 0,
        }
      : {
          name: "",
          category: "programming",
          status: "in-progress",
          progress: 0,
          description: "",
          icon: "",
          published: true,
          featured: false,
          order: 0,
        },
  });

  const isPublished = watch("published");
  const nameValue = watch("name");
  const currentProgress = watch("progress") ?? 0;

  // Update saveState when dirty
  useEffect(() => {
    if (isDirty && saveState === "saved") {
      setSaveState("unsaved");
    }
  }, [isDirty, saveState]);

  // Draft recovery hook
  const { hasRecoverableDraft, restoreDraft, discardDraft, clearDraftBackup } =
    useDraftRecovery<SkillFormData>({
      storageKey: `skill_${skill?._id || "new"}`,
      isDirty,
      getValues,
      resetForm: reset,
      serverUpdatedAt: skill?.updatedAt,
      onSaveShortcut: () => handleSave(false),
    });

  const handleSave = async (shouldPublish?: boolean) => {
    const formData = getValues();
    const isPublishAction =
      shouldPublish !== undefined ? shouldPublish : isPublished;

    setIsSubmitting(true);
    setSaveState("saving");

    try {
      const submitData: any = {
        ...formData,
        progress: Number(formData.progress || 0),
        published: isPublishAction,
      };

      if (skill?._id) {
        await skillsApi.update(skill._id, submitData);
        toast.success(isPublishAction ? "Skill published" : "Draft saved");
      } else {
        const res = await skillsApi.create(submitData);
        toast.success("Skill created successfully");
        clearDraftBackup();
        router.push(`/admin/skills/${res.data.data._id}/edit`);
        return;
      }

      clearDraftBackup();
      setValue("published", isPublishAction, { shouldDirty: false });
      reset(formData);
      setSaveState("saved");
      setLastSavedAt(new Date());
    } catch (error: any) {
      setSaveState("failed");
      toast.error(error.response?.data?.message || "Failed to save skill");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* ── Editor Header ─────────────────────────────────────── */}
      <AdminEditorHeader
        backHref="/admin/skills"
        backLabel="Skills"
        breadcrumb={skill ? "SKILLS / EDIT" : "SKILLS / CREATE"}
        title={nameValue || "New Technical Skill"}
        isPublished={isPublished}
        saveState={saveState}
        lastSavedAt={lastSavedAt}
        previewHref="/skills"
        onSaveDraft={() => handleSave(false)}
        onPublish={() => handleSave(true)}
        onUnpublish={isPublished ? () => handleSave(false) : undefined}
        isSubmitting={isSubmitting}
      />

      {/* ── Draft Recovery Banner ─────────────────────────────── */}
      {hasRecoverableDraft && (
        <DraftRecoveryBanner onRestore={restoreDraft} onDiscard={discardDraft} />
      )}

      {/* ── Form Body ─────────────────────────────────────────── */}
      <form onSubmit={handleSubmit(() => handleSave())} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Column (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            <div className="p-6 rounded-2xl bg-[#101010] border border-border/70 space-y-5">
              <h3 className="text-xs font-mono font-semibold uppercase tracking-widest text-text-primary border-b border-border/40 pb-2">
                01 / Skill Definition
              </h3>

              {/* Name & Icon */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="block text-xs font-medium text-text-secondary">
                    Skill Name <span className="text-primary">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Git & GitHub, TypeScript, Rust"
                    {...register("name")}
                    className="w-full h-10 bg-white/[0.03] border border-border/70 rounded-lg px-3.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary/50"
                  />
                  {errors.name && (
                    <p className="text-[11px] font-mono text-red-400">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-text-secondary">
                    Icon / Glyph (optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ⚡ or code"
                    {...register("icon")}
                    className="w-full h-10 bg-white/[0.03] border border-border/70 rounded-lg px-3.5 text-xs font-mono text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary/50"
                  />
                </div>
              </div>

              {/* Category & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-text-secondary">
                    Category <span className="text-primary">*</span>
                  </label>
                  <select
                    {...register("category")}
                    className="w-full h-10 bg-white/[0.03] border border-border/70 rounded-lg px-3 text-xs font-body text-text-primary focus:outline-none focus:border-primary/50 [&>option]:bg-[#111] cursor-pointer"
                  >
                    <option value="programming">Programming Languages</option>
                    <option value="cs-fundamentals">CS Fundamentals</option>
                    <option value="web">Web Development</option>
                    <option value="databases">Databases & Storage</option>
                    <option value="systems">Systems & Architecture</option>
                    <option value="cloud">Cloud & DevOps</option>
                    <option value="ai-ml">AI & Machine Learning</option>
                    <option value="mobile">Mobile Development</option>
                    <option value="tools">Tools & Workflow</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-text-secondary">
                    Proficiency Status <span className="text-primary">*</span>
                  </label>
                  <select
                    {...register("status")}
                    className="w-full h-10 bg-white/[0.03] border border-border/70 rounded-lg px-3 text-xs font-body text-text-primary focus:outline-none focus:border-primary/50 [&>option]:bg-[#111] cursor-pointer capitalize"
                  >
                    <option value="in-progress">In Progress</option>
                    <option value="practicing">Practicing</option>
                    <option value="review">Review</option>
                    <option value="completed">Completed</option>
                    <option value="not-started">Not Started</option>
                    <option value="paused">Paused</option>
                  </select>
                </div>
              </div>

              {/* Progress Slider & Value */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-text-secondary">
                    Mastery Progress (%)
                  </label>
                  <span className="text-sm font-mono font-bold text-primary">
                    {currentProgress}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  {...register("progress", { valueAsNumber: true })}
                  className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <p className="text-[10.5px] font-mono text-text-muted">
                  Progress and status are independent. (e.g. 89% In-Progress).
                </p>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-text-secondary">
                  Focus Topics & Context
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Version control, branching workflows, interactive rebasing, merge conflict resolution..."
                  {...register("description")}
                  className="w-full bg-white/[0.03] border border-border/70 rounded-lg p-3 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary/50 font-body leading-relaxed"
                />
              </div>
            </div>
          </div>

          {/* Right Sidebar (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="p-6 rounded-2xl bg-[#101010] border border-border/70 space-y-4">
              <h3 className="text-xs font-mono font-semibold uppercase tracking-widest text-text-primary border-b border-border/40 pb-2">
                Display & Ordering
              </h3>

              {/* Order */}
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-text-secondary">
                  Display Order
                </label>
                <input
                  type="number"
                  {...register("order", { valueAsNumber: true })}
                  className="w-full h-9 bg-white/[0.03] border border-border/70 rounded-lg px-3 text-xs font-mono text-text-primary focus:outline-none focus:border-primary/50"
                />
              </div>

              {/* Featured */}
              <label className="flex items-center gap-2.5 pt-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  {...register("featured")}
                  className="w-4 h-4 rounded border-border/70 bg-white/5 text-primary accent-primary cursor-pointer"
                />
                <span className="text-xs font-medium text-text-primary">
                  Highlight in Featured Stack
                </span>
              </label>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
