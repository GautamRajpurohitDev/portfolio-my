"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { milestonesApi } from "@/lib/api";
import { Milestone } from "@/types";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { AdminEditorHeader, SaveState } from "@/components/admin/ui/AdminEditorHeader";
import { DraftRecoveryBanner } from "@/components/admin/ui/DraftRecoveryBanner";
import { useDraftRecovery } from "@/hooks/useDraftRecovery";
import { MediaPicker } from "@/components/admin/media/MediaPicker";

const milestoneSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().optional().default(""),
  date: z.string().min(1, "Date is required"),
  status: z.enum(["planned", "in-progress", "completed"]).default("planned"),
  category: z.string().optional().default("general"),
  icon: z.string().optional().default(""),
  published: z.boolean().optional().default(true),
  featured: z.boolean().optional().default(false),
  order: z.number().int().optional().default(0),
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
});

type MilestoneFormData = z.infer<typeof milestoneSchema>;

interface MilestoneFormProps {
  milestone: Milestone | null;
}

export default function MilestoneForm({ milestone }: MilestoneFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>("saved");
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(
    milestone ? new Date(milestone.updatedAt || milestone.createdAt) : null
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
  } = useForm<MilestoneFormData>({
    resolver: zodResolver(milestoneSchema) as any,
    defaultValues: milestone
      ? {
          title: milestone.title,
          description: milestone.description || "",
          date: formatDateForInput(milestone.date),
          status: milestone.status as any,
          category: milestone.category || "general",
          icon: milestone.icon || "",
          published: milestone.published,
          featured: milestone.featured || false,
          order: milestone.order || 0,
          media: milestone.media || [],
        }
      : {
          title: "",
          description: "",
          date: formatDateForInput(),
          status: "planned",
          category: "general",
          icon: "",
          published: true,
          featured: false,
          order: 0,
          media: [],
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
    useDraftRecovery<MilestoneFormData>({
      storageKey: `milestone_${milestone?._id || "new"}`,
      isDirty,
      getValues,
      resetForm: reset,
      serverUpdatedAt: milestone?.updatedAt,
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
        date: new Date(formData.date).toISOString(),
        published: isPublishAction,
      };

      if (milestone?._id) {
        await milestonesApi.update(milestone._id, submitData);
        toast.success(isPublishAction ? "Milestone published" : "Draft saved");
      } else {
        const res = await milestonesApi.create(submitData);
        toast.success("Milestone created successfully");
        clearDraftBackup();
        router.push(`/admin/milestones/${res.data.data._id}/edit`);
        return;
      }

      clearDraftBackup();
      setValue("published", isPublishAction, { shouldDirty: false });
      reset(formData);
      setSaveState("saved");
      setLastSavedAt(new Date());
    } catch (error: any) {
      setSaveState("failed");
      toast.error(error.response?.data?.message || "Failed to save milestone");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* ── Editor Header ─────────────────────────────────────── */}
      <AdminEditorHeader
        backHref="/admin/milestones"
        backLabel="Milestones"
        breadcrumb={milestone ? "MILESTONES / EDIT" : "MILESTONES / CREATE"}
        title={titleValue || "New Milestone"}
        isPublished={isPublished}
        saveState={saveState}
        lastSavedAt={lastSavedAt}
        previewHref="/milestones"
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
                01 / Milestone Details
              </h3>

              {/* Title */}
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-text-secondary">
                  Milestone Title <span className="text-primary">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Launched Portfolio v2.0, Completed Operating Systems Core"
                  {...register("title")}
                  className="w-full h-10 bg-white/[0.03] border border-border/70 rounded-lg px-3.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary/50"
                />
                {errors.title && (
                  <p className="text-[11px] font-mono text-red-400">
                    {errors.title.message}
                  </p>
                )}
              </div>

              {/* Date & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-text-secondary">
                    Target / Achievement Date <span className="text-primary">*</span>
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

                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-text-secondary">
                    Category
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. career, project, education"
                    {...register("category")}
                    className="w-full h-10 bg-white/[0.03] border border-border/70 rounded-lg px-3.5 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary/50"
                  />
                </div>
              </div>

              {/* Status */}
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-text-secondary">
                  Execution Status
                </label>
                <select
                  {...register("status")}
                  className="w-full h-10 bg-white/[0.03] border border-border/70 rounded-lg px-3 text-xs font-body text-text-primary focus:outline-none focus:border-primary/50 [&>option]:bg-[#111] cursor-pointer capitalize"
                >
                  <option value="planned">Planned Target</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed & Verified</option>
                </select>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-text-secondary">
                  Description & Impact
                </label>
                <textarea
                  rows={3}
                  placeholder="Key deliverables, significance, or skills proved..."
                  {...register("description")}
                  className="w-full bg-white/[0.03] border border-border/70 rounded-lg p-3 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary/50 font-body leading-relaxed"
                />
              </div>
            </div>

            {/* Media Attachment */}
            <div className="p-6 rounded-2xl bg-[#101010] border border-border/70 space-y-4">
              <h3 className="text-xs font-mono font-semibold uppercase tracking-widest text-text-primary border-b border-border/40 pb-2">
                02 / Badge or Snapshot
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
            <div className="p-6 rounded-2xl bg-[#101010] border border-border/70 space-y-4">
              <h3 className="text-xs font-mono font-semibold uppercase tracking-widest text-text-primary border-b border-border/40 pb-2">
                Display Options
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
                  Highlight in Roadmap Milestones
                </span>
              </label>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
