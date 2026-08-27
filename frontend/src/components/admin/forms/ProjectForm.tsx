"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { projectsApi } from "@/lib/api";
import { Project } from "@/types";
import toast from "react-hot-toast";
import {
  X,
  Plus,
  Trash2,
  Save,
  Globe,
  Upload,
  Check,
  Sparkles,
  Link2,
  FolderKanban,
  FileCode2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AdminEditorHeader, SaveState } from "@/components/admin/ui/AdminEditorHeader";
import { DraftRecoveryBanner } from "@/components/admin/ui/DraftRecoveryBanner";
import { useDraftRecovery } from "@/hooks/useDraftRecovery";
import { MediaPicker } from "@/components/admin/media/MediaPicker";

const projectSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  slug: z
    .string()
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, hyphens only")
    .optional()
    .or(z.literal("")),
  shortDescription: z.string().min(1, "Short description is required").max(300),
  content: z.string().optional().default(""),
  media: z
    .array(
      z.object({
        url: z.string(),
        mimeType: z.string(),
        alt: z.string().optional().default(""),
        order: z.number().int().optional().default(0),
      })
    )
    .optional()
    .default([]),
  problem: z.string().optional().default(""),
  solution: z.string().optional().default(""),
  architecture: z.string().optional().default(""),
  features: z.string().optional().default(""),
  challenges: z.string().optional().default(""),
  lessonsLearned: z.string().optional().default(""),
  status: z.enum(["idea", "in-progress", "completed", "archived"]).default("idea"),
  category: z.string().optional().default("web"),
  technologies: z.array(z.string()).default([]),
  featured: z.boolean().default(false),
  published: z.boolean().default(false),
  order: z.number().int().default(0),
  githubUrl: z.string().url("Invalid GitHub URL").optional().or(z.literal("")).default(""),
  liveUrl: z.string().url("Invalid live URL").optional().or(z.literal("")).default(""),
});

type ProjectFormData = z.infer<typeof projectSchema>;

interface ProjectFormProps {
  project: Project | null;
}

export default function ProjectForm({ project }: ProjectFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>("saved");
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(
    project ? new Date(project.updatedAt || project.createdAt) : null
  );
  const router = useRouter();

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    getValues,
    formState: { errors, isDirty },
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema) as any,
    defaultValues: project
      ? {
          title: project.title,
          slug: project.slug,
          shortDescription: project.shortDescription,
          content: project.content || "",
          media: project.media || [],
          problem: project.problem || "",
          solution: project.solution || "",
          architecture: project.architecture || "",
          features: project.features || "",
          challenges: project.challenges || "",
          lessonsLearned: project.lessonsLearned || "",
          status: project.status,
          category: project.category || "web",
          technologies: project.technologies?.length ? project.technologies : [""],
          featured: project.featured,
          published: project.published,
          order: project.order || 0,
          githubUrl: project.githubUrl || "",
          liveUrl: project.liveUrl || "",
        }
      : {
          title: "",
          slug: "",
          shortDescription: "",
          content: "",
          media: [],
          problem: "",
          solution: "",
          architecture: "",
          features: "",
          challenges: "",
          lessonsLearned: "",
          status: "in-progress",
          category: "web",
          technologies: [""],
          featured: false,
          published: false,
          order: 0,
          githubUrl: "",
          liveUrl: "",
        },
  });

  const { fields: techFields, append: appendTech, remove: removeTech } = useFieldArray({
    control,
    name: "technologies" as never,
  });

  const isPublished = watch("published");
  const titleValue = watch("title");
  const slugValue = watch("slug");
  const mediaList = watch("media") || [];

  // Update saveState when dirty
  useEffect(() => {
    if (isDirty && saveState === "saved") {
      setSaveState("unsaved");
    }
  }, [isDirty, saveState]);

  // Draft Recovery hook
  const { hasRecoverableDraft, restoreDraft, discardDraft, clearDraftBackup } =
    useDraftRecovery<ProjectFormData>({
      storageKey: `project_${project?._id || "new"}`,
      isDirty,
      getValues,
      resetForm: reset,
      serverUpdatedAt: project?.updatedAt,
      onSaveShortcut: () => handleSave(false),
    });

  // Core save function
  const handleSave = async (shouldPublish?: boolean) => {
    const formData = getValues();
    const isPublishAction =
      shouldPublish !== undefined ? shouldPublish : isPublished;

    setIsSubmitting(true);
    setSaveState("saving");

    try {
      const submitData: any = { ...formData, published: isPublishAction };
      if (!submitData.githubUrl) delete submitData.githubUrl;
      if (!submitData.liveUrl) delete submitData.liveUrl;
      if (!submitData.slug) delete submitData.slug;
      submitData.technologies = (submitData.technologies || []).filter(
        (t: string) => t.trim() !== ""
      );

      if (project?._id) {
        await projectsApi.update(
          project._id,
          submitData,
          isPublishAction ? "publish" : "draft"
        );
        toast.success(isPublishAction ? "Project published to live" : "Draft saved");
      } else {
        const res = await projectsApi.create(submitData);
        toast.success("Project created successfully");
        clearDraftBackup();
        router.push(`/admin/projects/${res.data.data._id}/edit`);
        return;
      }

      clearDraftBackup();
      setValue("published", isPublishAction, { shouldDirty: false });
      reset(formData);
      setSaveState("saved");
      setLastSavedAt(new Date());
    } catch (error: any) {
      setSaveState("failed");
      toast.error(error.response?.data?.message || "Failed to save project");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* ── Editor Header ─────────────────────────────────────── */}
      <AdminEditorHeader
        backHref="/admin/projects"
        backLabel="Projects"
        breadcrumb={project ? "PROJECTS / EDIT" : "PROJECTS / CREATE"}
        title={titleValue || "New Project"}
        isPublished={isPublished}
        saveState={saveState}
        lastSavedAt={lastSavedAt}
        previewHref={slugValue ? `/projects/${slugValue}` : undefined}
        onSaveDraft={() => handleSave(false)}
        onPublish={() => handleSave(true)}
        onUnpublish={isPublished ? () => handleSave(false) : undefined}
        isSubmitting={isSubmitting}
      />

      {/* ── Draft Recovery Notification ───────────────────────── */}
      {hasRecoverableDraft && (
        <DraftRecoveryBanner onRestore={restoreDraft} onDiscard={discardDraft} />
      )}

      {/* ── Form Body (2-Column Desktop / 1-Column Mobile) ────── */}
      <form onSubmit={handleSubmit(() => handleSave())} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Column: Content & Case Study (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Basic Information Panel */}
            <div className="p-6 rounded-2xl bg-[#101010] border border-border/70 space-y-5">
              <h3 className="text-xs font-mono font-semibold uppercase tracking-widest text-text-primary border-b border-border/40 pb-2">
                01 / Basic Information
              </h3>

              {/* Title */}
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-text-secondary">
                  Project Title <span className="text-primary">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Inflow — Fluid Animation Engine"
                  {...register("title")}
                  className="w-full h-10 bg-white/[0.03] border border-border/70 rounded-lg px-3.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary/50 transition-colors font-body"
                />
                {errors.title && (
                  <p className="text-[11px] font-mono text-red-400">
                    {errors.title.message}
                  </p>
                )}
              </div>

              {/* Slug */}
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-text-secondary">
                  URL Slug (optional)
                </label>
                <div className="flex items-center">
                  <span className="h-10 px-3 flex items-center bg-white/[0.02] border border-r-0 border-border/70 rounded-l-lg text-xs font-mono text-text-muted">
                    /projects/
                  </span>
                  <input
                    type="text"
                    placeholder="inflow-engine"
                    {...register("slug")}
                    className="flex-1 h-10 bg-white/[0.03] border border-border/70 rounded-r-lg px-3.5 text-xs font-mono text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary/50 transition-colors"
                  />
                </div>
                {errors.slug && (
                  <p className="text-[11px] font-mono text-red-400">
                    {errors.slug.message}
                  </p>
                )}
              </div>

              {/* Short Description */}
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-text-secondary">
                  Short Summary / Pitch <span className="text-primary">*</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="Brief 1-2 sentence overview shown in project cards and previews..."
                  {...register("shortDescription")}
                  className="w-full bg-white/[0.03] border border-border/70 rounded-lg p-3 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary/50 transition-colors leading-relaxed font-body"
                />
                {errors.shortDescription && (
                  <p className="text-[11px] font-mono text-red-400">
                    {errors.shortDescription.message}
                  </p>
                )}
              </div>
            </div>

            {/* Media Gallery Panel */}
            <div className="p-6 rounded-2xl bg-[#101010] border border-border/70 space-y-4">
              <h3 className="text-xs font-mono font-semibold uppercase tracking-widest text-text-primary border-b border-border/40 pb-2">
                02 / Screenshots & Visual Assets
              </h3>

              <div className="space-y-3">
                <MediaPicker
                  value={mediaList[0]?.url || ""}
                  onChange={(url) => {
                    setValue(
                      "media",
                      url
                        ? [{ url, mimeType: "image/png", alt: titleValue, order: 0 }]
                        : [],
                      { shouldDirty: true }
                    );
                  }}
                  accept="image/*,video/mp4"
                />
                <p className="text-[11px] font-mono text-text-muted">
                  Select cover image or project demo video from your library.
                </p>
              </div>
            </div>

            {/* Case Study Details Panel */}
            <div className="p-6 rounded-2xl bg-[#101010] border border-border/70 space-y-5">
              <h3 className="text-xs font-mono font-semibold uppercase tracking-widest text-text-primary border-b border-border/40 pb-2">
                03 / Engineering Case Study
              </h3>

              {/* Problem */}
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-text-secondary">
                  The Problem
                </label>
                <textarea
                  rows={3}
                  placeholder="What core architectural or UX challenge did this project aim to solve?"
                  {...register("problem")}
                  className="w-full bg-white/[0.03] border border-border/70 rounded-lg p-3 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary/50 transition-colors font-body leading-relaxed"
                />
              </div>

              {/* Solution */}
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-text-secondary">
                  The Solution & Approach
                </label>
                <textarea
                  rows={3}
                  placeholder="How was the problem solved? Key technical decisions and frameworks."
                  {...register("solution")}
                  className="w-full bg-white/[0.03] border border-border/70 rounded-lg p-3 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary/50 transition-colors font-body leading-relaxed"
                />
              </div>

              {/* Architecture & Features */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-text-secondary">
                    Architecture & Stack
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Data flow, state management, storage, backend design..."
                    {...register("architecture")}
                    className="w-full bg-white/[0.03] border border-border/70 rounded-lg p-3 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary/50 transition-colors font-body"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-text-secondary">
                    Key Features
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Core capabilities, benchmarks, standout features..."
                    {...register("features")}
                    className="w-full bg-white/[0.03] border border-border/70 rounded-lg p-3 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary/50 transition-colors font-body"
                  />
                </div>
              </div>

              {/* Lessons Learned */}
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-text-secondary">
                  Challenges & Lessons Learned
                </label>
                <textarea
                  rows={2}
                  placeholder="Key takeaways, bugs resolved, architectural lessons..."
                  {...register("lessonsLearned")}
                  className="w-full bg-white/[0.03] border border-border/70 rounded-lg p-3 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary/50 transition-colors font-body"
                />
              </div>
            </div>
          </div>

          {/* Right Column: Settings & Metadata Sidebar (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Publishing & Status */}
            <div className="p-6 rounded-2xl bg-[#101010] border border-border/70 space-y-4">
              <h3 className="text-xs font-mono font-semibold uppercase tracking-widest text-text-primary border-b border-border/40 pb-2">
                Publishing & Status
              </h3>

              {/* Status */}
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-text-secondary">
                  Project Lifecycle
                </label>
                <select
                  {...register("status")}
                  className="w-full h-9 bg-white/[0.03] border border-border/70 rounded-lg px-3 text-xs font-body text-text-primary focus:outline-none focus:border-primary/50 [&>option]:bg-[#111] cursor-pointer capitalize"
                >
                  <option value="idea">Idea</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              {/* Category */}
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-text-secondary">
                  Category
                </label>
                <select
                  {...register("category")}
                  className="w-full h-9 bg-white/[0.03] border border-border/70 rounded-lg px-3 text-xs font-body text-text-primary focus:outline-none focus:border-primary/50 [&>option]:bg-[#111] cursor-pointer"
                >
                  <option value="web">Web Application</option>
                  <option value="mobile">Mobile Application</option>
                  <option value="systems">Systems & Backend</option>
                  <option value="ai-ml">AI / Machine Learning</option>
                  <option value="tools">Dev Tools / CLI</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Display Order */}
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

              {/* Featured Checkbox */}
              <label className="flex items-center gap-2.5 pt-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  {...register("featured")}
                  className="w-4 h-4 rounded border-border/70 bg-white/5 text-primary accent-primary cursor-pointer"
                />
                <span className="text-xs font-medium text-text-primary">
                  Feature on Homepage
                </span>
              </label>
            </div>

            {/* Links & Repository */}
            <div className="p-6 rounded-2xl bg-[#101010] border border-border/70 space-y-4">
              <h3 className="text-xs font-mono font-semibold uppercase tracking-widest text-text-primary border-b border-border/40 pb-2">
                External Links
              </h3>

              {/* GitHub */}
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-text-secondary">
                  GitHub Repository
                </label>
                <input
                  type="url"
                  placeholder="https://github.com/..."
                  {...register("githubUrl")}
                  className="w-full h-9 bg-white/[0.03] border border-border/70 rounded-lg px-3 text-xs font-body text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary/50"
                />
                {errors.githubUrl && (
                  <p className="text-[10.5px] font-mono text-red-400">
                    {errors.githubUrl.message}
                  </p>
                )}
              </div>

              {/* Live URL */}
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-text-secondary">
                  Live URL / Demo
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  {...register("liveUrl")}
                  className="w-full h-9 bg-white/[0.03] border border-border/70 rounded-lg px-3 text-xs font-body text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary/50"
                />
                {errors.liveUrl && (
                  <p className="text-[10.5px] font-mono text-red-400">
                    {errors.liveUrl.message}
                  </p>
                )}
              </div>
            </div>

            {/* Technologies */}
            <div className="p-6 rounded-2xl bg-[#101010] border border-border/70 space-y-3">
              <div className="flex items-center justify-between border-b border-border/40 pb-2">
                <h3 className="text-xs font-mono font-semibold uppercase tracking-widest text-text-primary">
                  Tech Stack
                </h3>
                <button
                  type="button"
                  onClick={() => appendTech("")}
                  className="inline-flex items-center gap-1 text-[11px] font-mono text-primary hover:underline cursor-pointer"
                >
                  <Plus size={11} /> Add
                </button>
              </div>

              <div className="space-y-2">
                {techFields.map((field, index) => (
                  <div key={field.id} className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="e.g. Next.js, Rust, Docker"
                      {...register(`technologies.${index}` as const)}
                      className="flex-1 h-8 bg-white/[0.03] border border-border/70 rounded-lg px-2.5 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary/50"
                    />
                    <button
                      type="button"
                      onClick={() => removeTech(index)}
                      className="p-1 text-text-muted hover:text-red-400 transition-colors cursor-pointer"
                    >
                      <X size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
