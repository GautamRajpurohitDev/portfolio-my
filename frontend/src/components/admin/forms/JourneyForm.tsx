"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { journeyApi } from "@/lib/api";
import { JourneyEntry } from "@/types";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { AdminEditorHeader, SaveState } from "@/components/admin/ui/AdminEditorHeader";
import { DraftRecoveryBanner } from "@/components/admin/ui/DraftRecoveryBanner";
import { useDraftRecovery } from "@/hooks/useDraftRecovery";
import { MediaPicker } from "@/components/admin/media/MediaPicker";

const journeySchema = z.object({
  date: z.string().min(1, "Date is required"),
  title: z.string().min(1, "Title is required").max(200),
  topic: z.string().min(1, "Topic is required").max(100),
  summary: z.string().min(1, "Summary is required").max(500),
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
  learned: z.string().optional().default(""),
  built: z.string().optional().default(""),
  problems: z.string().optional().default(""),
  solved: z.string().optional().default(""),
  nextStep: z.string().optional().default(""),
  githubUrl: z.string().url("Invalid URL").optional().or(z.literal("")).default(""),
  relatedCertificate: z.string().optional().nullable().default(null),
  featured: z.boolean().optional().default(false),
  published: z.boolean().optional().default(false),
  order: z.number().int().optional().default(0),
});

type JourneyFormData = z.infer<typeof journeySchema>;

interface JourneyFormProps {
  journey: JourneyEntry | null;
}

export default function JourneyForm({ journey }: JourneyFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>("saved");
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(
    journey ? new Date(journey.updatedAt || journey.createdAt) : null
  );
  const router = useRouter();

  const formatDateForInput = (dateString?: Date | string) => {
    if (!dateString) return new Date().toISOString().split("T")[0];
    try {
      return new Date(dateString).toISOString().split("T")[0];
    } catch {
      return new Date().toISOString().split("T")[0];
    }
  };

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    getValues,
    formState: { errors, isDirty },
  } = useForm<JourneyFormData>({
    resolver: zodResolver(journeySchema) as any,
    defaultValues: journey
      ? {
          date: formatDateForInput(journey.date),
          title: journey.title,
          topic: journey.topic,
          summary: journey.summary,
          content: journey.content || "",
          media: journey.media || [],
          learned: journey.learned || "",
          built: journey.built || "",
          problems: journey.problems || "",
          solved: journey.solved || "",
          nextStep: journey.nextStep || "",
          githubUrl: journey.githubUrl || "",
          relatedCertificate: journey.relatedCertificate || null,
          featured: journey.featured || false,
          published: journey.published || false,
          order: journey.order || 0,
        }
      : {
          date: formatDateForInput(),
          title: "",
          topic: "",
          summary: "",
          content: "",
          media: [],
          learned: "",
          built: "",
          problems: "",
          solved: "",
          nextStep: "",
          githubUrl: "",
          relatedCertificate: null,
          featured: false,
          published: false,
          order: 0,
        },
  });

  const isPublished = watch("published");
  const titleValue = watch("title");
  const mediaList = watch("media") || [];

  // Update saveState when dirty
  useEffect(() => {
    if (isDirty && saveState === "saved") {
      setSaveState("unsaved");
    }
  }, [isDirty, saveState]);

  // Draft recovery hook
  const { hasRecoverableDraft, restoreDraft, discardDraft, clearDraftBackup } =
    useDraftRecovery<JourneyFormData>({
      storageKey: `journey_${journey?._id || "new"}`,
      isDirty,
      getValues,
      resetForm: reset,
      serverUpdatedAt: journey?.updatedAt,
      onSaveShortcut: () => handleSave(false),
    });

  const handleSave = async (shouldPublish?: boolean) => {
    const formData = getValues();
    const isPublishAction =
      shouldPublish !== undefined ? shouldPublish : isPublished;

    setIsSubmitting(true);
    setSaveState("saving");

    try {
      const submitData: any = { ...formData, published: isPublishAction };
      if (!submitData.githubUrl) delete submitData.githubUrl;
      if (!submitData.relatedCertificate) delete submitData.relatedCertificate;

      if (journey?._id) {
        await journeyApi.update(journey._id, submitData);
        toast.success(isPublishAction ? "Journal entry published" : "Draft saved");
      } else {
        const res = await journeyApi.create(submitData);
        toast.success("Journal entry created");
        clearDraftBackup();
        router.push(`/admin/journey/${res.data.data._id}/edit`);
        return;
      }

      clearDraftBackup();
      setValue("published", isPublishAction, { shouldDirty: false });
      reset(formData);
      setSaveState("saved");
      setLastSavedAt(new Date());
    } catch (error: any) {
      setSaveState("failed");
      toast.error(error.response?.data?.message || "Failed to save entry");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* ── Editor Header ─────────────────────────────────────── */}
      <AdminEditorHeader
        backHref="/admin/journey"
        backLabel="Journey"
        breadcrumb={journey ? "JOURNEY / EDIT" : "JOURNEY / CREATE"}
        title={titleValue || "New Learning Log"}
        isPublished={isPublished}
        saveState={saveState}
        lastSavedAt={lastSavedAt}
        previewHref="/journey"
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
            {/* Primary Entry Details */}
            <div className="p-6 rounded-2xl bg-[#101010] border border-border/70 space-y-5">
              <h3 className="text-xs font-mono font-semibold uppercase tracking-widest text-text-primary border-b border-border/40 pb-2">
                01 / Daily Log Overview
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Date */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-text-secondary">
                    Log Date <span className="text-primary">*</span>
                  </label>
                  <input
                    type="date"
                    {...register("date")}
                    className="w-full h-10 bg-white/[0.03] border border-border/70 rounded-lg px-3.5 text-xs font-mono text-text-primary focus:outline-none focus:border-primary/50"
                  />
                  {errors.date && (
                    <p className="text-[11px] font-mono text-red-400">
                      {errors.date.message}
                    </p>
                  )}
                </div>

                {/* Topic */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-text-secondary">
                    Topic / Domain <span className="text-primary">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Git & Version Control"
                    {...register("topic")}
                    className="w-full h-10 bg-white/[0.03] border border-border/70 rounded-lg px-3.5 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary/50"
                  />
                  {errors.topic && (
                    <p className="text-[11px] font-mono text-red-400">
                      {errors.topic.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Title */}
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-text-secondary">
                  Entry Headline <span className="text-primary">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mastered Interactive Git Rebasing and Cherry-Picking"
                  {...register("title")}
                  className="w-full h-10 bg-white/[0.03] border border-border/70 rounded-lg px-3.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary/50 font-body"
                />
                {errors.title && (
                  <p className="text-[11px] font-mono text-red-400">
                    {errors.title.message}
                  </p>
                )}
              </div>

              {/* Summary */}
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-text-secondary">
                  Key Takeaway / Summary <span className="text-primary">*</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="Concise summary of what was accomplished and internal mental models built..."
                  {...register("summary")}
                  className="w-full bg-white/[0.03] border border-border/70 rounded-lg p-3 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary/50 leading-relaxed font-body"
                />
                {errors.summary && (
                  <p className="text-[11px] font-mono text-red-400">
                    {errors.summary.message}
                  </p>
                )}
              </div>
            </div>

            {/* Deep-dive Learning Details */}
            <div className="p-6 rounded-2xl bg-[#101010] border border-border/70 space-y-5">
              <h3 className="text-xs font-mono font-semibold uppercase tracking-widest text-text-primary border-b border-border/40 pb-2">
                02 / Structured Learnings & Insights
              </h3>

              {/* What I Learned */}
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-text-secondary">
                  What I Learned & Understood
                </label>
                <textarea
                  rows={3}
                  placeholder="Key conceptual breakthroughs, syntax patterns, or architectural principles..."
                  {...register("learned")}
                  className="w-full bg-white/[0.03] border border-border/70 rounded-lg p-3 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary/50 font-body"
                />
              </div>

              {/* What I Built / Practiced */}
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-text-secondary">
                  What I Built / Code Written
                </label>
                <textarea
                  rows={3}
                  placeholder="Specific scripts, experiments, repositories, or algorithms implemented..."
                  {...register("built")}
                  className="w-full bg-white/[0.03] border border-border/70 rounded-lg p-3 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary/50 font-body"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Problems Encountered */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-text-secondary">
                    Problems & Edge Cases
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Bugs, confusion, or conceptual bottlenecks..."
                    {...register("problems")}
                    className="w-full bg-white/[0.03] border border-border/70 rounded-lg p-3 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary/50 font-body"
                  />
                </div>

                {/* How I Solved It */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-text-secondary">
                    How It Was Solved
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Debugging steps, docs consulted, or solution implemented..."
                    {...register("solved")}
                    className="w-full bg-white/[0.03] border border-border/70 rounded-lg p-3 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary/50 font-body"
                  />
                </div>
              </div>

              {/* Next Step */}
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-text-secondary">
                  Next Step / Immediate Target
                </label>
                <input
                  type="text"
                  placeholder="e.g. Implement multi-branch conflict resolution and cherry-picking"
                  {...register("nextStep")}
                  className="w-full h-9 bg-white/[0.03] border border-border/70 rounded-lg px-3 text-xs font-body text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary/50"
                />
              </div>
            </div>

            {/* Media Attachment */}
            <div className="p-6 rounded-2xl bg-[#101010] border border-border/70 space-y-4">
              <h3 className="text-xs font-mono font-semibold uppercase tracking-widest text-text-primary border-b border-border/40 pb-2">
                03 / Screenshot or Diagram
              </h3>

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
                accept="image/*"
              />
            </div>
          </div>

          {/* Right Sidebar (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Metadata & Publishing */}
            <div className="p-6 rounded-2xl bg-[#101010] border border-border/70 space-y-4">
              <h3 className="text-xs font-mono font-semibold uppercase tracking-widest text-text-primary border-b border-border/40 pb-2">
                Log Settings
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

              {/* GitHub Link */}
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-text-secondary">
                  Code Repo / Commit Link
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

              {/* Featured Checkbox */}
              <label className="flex items-center gap-2.5 pt-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  {...register("featured")}
                  className="w-4 h-4 rounded border-border/70 bg-white/5 text-primary accent-primary cursor-pointer"
                />
                <span className="text-xs font-medium text-text-primary">
                  Highlight as Key Milestone
                </span>
              </label>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
