"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { certificatesApi } from "@/lib/api";
import { Certificate } from "@/types";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { AdminEditorHeader, SaveState } from "@/components/admin/ui/AdminEditorHeader";
import { DraftRecoveryBanner } from "@/components/admin/ui/DraftRecoveryBanner";
import { useDraftRecovery } from "@/hooks/useDraftRecovery";
import { MediaPicker } from "@/components/admin/media/MediaPicker";

const certificateSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  provider: z.string().min(1, "Provider is required").max(100),
  credentialId: z.string().optional().default(""),
  credentialUrl: z.string().url("Invalid URL").optional().or(z.literal("")).default(""),
  date: z.string().min(1, "Date is required"),
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
  description: z.string().optional().default(""),
  featured: z.boolean().optional().default(false),
  published: z.boolean().optional().default(true),
  order: z.number().int().optional().default(0),
});

type CertificateFormData = z.infer<typeof certificateSchema>;

interface CertificateFormProps {
  certificate: Certificate | null;
}

export default function CertificateForm({ certificate }: CertificateFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>("saved");
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(
    certificate ? new Date(certificate.updatedAt || certificate.createdAt) : null
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
  } = useForm<CertificateFormData>({
    resolver: zodResolver(certificateSchema) as any,
    defaultValues: certificate
      ? {
          title: certificate.title,
          provider: certificate.provider,
          credentialId: certificate.credentialId || "",
          credentialUrl: certificate.credentialUrl || "",
          date: formatDateForInput(certificate.date),
          media: certificate.media || [],
          description: certificate.description || "",
          featured: certificate.featured || false,
          published: certificate.published,
          order: certificate.order || 0,
        }
      : {
          title: "",
          provider: "",
          credentialId: "",
          credentialUrl: "",
          date: formatDateForInput(),
          media: [],
          description: "",
          featured: false,
          published: true,
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
    useDraftRecovery<CertificateFormData>({
      storageKey: `certificate_${certificate?._id || "new"}`,
      isDirty,
      getValues,
      resetForm: reset,
      serverUpdatedAt: certificate?.updatedAt,
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
      if (!submitData.credentialUrl) delete submitData.credentialUrl;

      if (certificate?._id) {
        await certificatesApi.update(certificate._id, submitData);
        toast.success(isPublishAction ? "Certificate published" : "Draft saved");
      } else {
        const res = await certificatesApi.create(submitData);
        toast.success("Certificate created successfully");
        clearDraftBackup();
        router.push(`/admin/certificates/${res.data.data._id}/edit`);
        return;
      }

      clearDraftBackup();
      setValue("published", isPublishAction, { shouldDirty: false });
      reset(formData);
      setSaveState("saved");
      setLastSavedAt(new Date());
    } catch (error: any) {
      setSaveState("failed");
      toast.error(error.response?.data?.message || "Failed to save certificate");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* ── Editor Header ─────────────────────────────────────── */}
      <AdminEditorHeader
        backHref="/admin/certificates"
        backLabel="Certificates"
        breadcrumb={certificate ? "CERTIFICATES / EDIT" : "CERTIFICATES / CREATE"}
        title={titleValue || "New Certificate"}
        isPublished={isPublished}
        saveState={saveState}
        lastSavedAt={lastSavedAt}
        previewHref="/about"
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
                01 / Credential Details
              </h3>

              {/* Title */}
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-text-secondary">
                  Certificate Title <span className="text-primary">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. AWS Certified Solutions Architect, Meta React Specialization"
                  {...register("title")}
                  className="w-full h-10 bg-white/[0.03] border border-border/70 rounded-lg px-3.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary/50"
                />
                {errors.title && (
                  <p className="text-[11px] font-mono text-red-400">
                    {errors.title.message}
                  </p>
                )}
              </div>

              {/* Provider & Issue Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-text-secondary">
                    Issuing Organization <span className="text-primary">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Coursera, Amazon Web Services, freeCodeCamp"
                    {...register("provider")}
                    className="w-full h-10 bg-white/[0.03] border border-border/70 rounded-lg px-3.5 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary/50"
                  />
                  {errors.provider && (
                    <p className="text-[11px] font-mono text-red-400">
                      {errors.provider.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-text-secondary">
                    Issue Date <span className="text-primary">*</span>
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
              </div>

              {/* Credential ID & URL */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-text-secondary">
                    Credential ID (optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. UC-12345678"
                    {...register("credentialId")}
                    className="w-full h-10 bg-white/[0.03] border border-border/70 rounded-lg px-3.5 text-xs font-mono text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary/50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-text-secondary">
                    Verification URL (optional)
                  </label>
                  <input
                    type="url"
                    placeholder="https://..."
                    {...register("credentialUrl")}
                    className="w-full h-10 bg-white/[0.03] border border-border/70 rounded-lg px-3.5 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary/50"
                  />
                  {errors.credentialUrl && (
                    <p className="text-[11px] font-mono text-red-400">
                      {errors.credentialUrl.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-text-secondary">
                  Key Skills & Knowledge Verified
                </label>
                <textarea
                  rows={3}
                  placeholder="Key concepts, projects completed, or technical domains evaluated..."
                  {...register("description")}
                  className="w-full bg-white/[0.03] border border-border/70 rounded-lg p-3 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary/50 font-body leading-relaxed"
                />
              </div>
            </div>

            {/* Certificate Image Attachment */}
            <div className="p-6 rounded-2xl bg-[#101010] border border-border/70 space-y-4">
              <h3 className="text-xs font-mono font-semibold uppercase tracking-widest text-text-primary border-b border-border/40 pb-2">
                02 / Certificate Badge or Image
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
                accept="image/*,application/pdf"
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
                  Feature in Profile Highlights
                </span>
              </label>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
