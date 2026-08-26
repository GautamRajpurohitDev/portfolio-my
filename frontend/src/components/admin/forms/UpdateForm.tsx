"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { updatesApi, uploadApi } from "@/lib/api";
import { Update } from "@/types";
import toast from "react-hot-toast";
import {
  Save, Check, X, Plus, ImageIcon, Video, Film, Upload,
  ExternalLink, GitBranch, Link2, Eye, EyeOff, AtSign,
  AlertTriangle, ChevronDown, ChevronUp, Loader2
} from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Composer } from "../composer/Composer";

// ── Form schema ───────────────────────────────────────────────
const updateSchema = z.object({
  title:          z.string().min(1, "Title is required").max(200),
  slug:           z.string().regex(/^[a-z0-9-]+$/).optional().or(z.literal("")),
  summary:        z.string().min(1, "Summary is required").max(400),
  content:        z.string().optional().default(""),
  media:          z.array(z.object({
                    url: z.string(),
                    mimeType: z.string(),
                    alt: z.string().optional().default(""),
                    order: z.number().int().optional().default(0),
                  })).optional().default([]),
  date:           z.string().min(1, "Date is required"),
  tags:           z.array(z.string()).optional().default([]),
  coverImage:     z.string().url("Invalid URL").optional().or(z.literal("")).default(""),
  linkedinUrl:    z.string().url("Invalid URL").optional().or(z.literal("")).default(""),
  xUrl:           z.string().url("Invalid URL").optional().or(z.literal("")).default(""),
  githubUrl:      z.string().url("Invalid URL").optional().or(z.literal("")).default(""),
  relatedProject: z.string().optional().nullable().default(null),
  published:      z.boolean().optional().default(false),
});

type UpdateFormData = z.infer<typeof updateSchema>;

// ── Upload state ──────────────────────────────────────────────
type UploadState = "idle" | "uploading" | "done" | "error";

// ── Helpers ───────────────────────────────────────────────────
const formatDate = (d?: Date | string) => {
  if (!d) return new Date().toISOString().split("T")[0];
  try { return new Date(d).toISOString().split("T")[0]; }
  catch { return new Date().toISOString().split("T")[0]; }
};

const isVideo = (url: string) =>
  /\.(mp4|webm|ogg)(\?|$)/i.test(url) || url.includes("video");

const isGif = (url: string) =>
  /\.gif(\?|$)/i.test(url);

const inputCls = "w-full bg-white/[0.03] border border-border/60 rounded-lg px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary/50 transition-colors";
const textareaCls = `${inputCls} resize-none`;

// ── Sub-components ────────────────────────────────────────────
function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-[11px] font-mono text-text-secondary uppercase tracking-wider mb-1.5">
      {children}{required && <span className="text-primary ml-0.5">*</span>}
    </label>
  );
}

function FieldError({ msg }: { msg?: string }) {
  return msg ? <p className="mt-1 text-[11px] text-red-400 font-mono">{msg}</p> : null;
}

// ── Tag Pill Editor ───────────────────────────────────────────
function TagEditor({ tags, onChange }: { tags: string[]; onChange: (t: string[]) => void }) {
  const [input, setInput] = useState("");

  const addTag = (raw: string) => {
    const trimmed = raw.trim().replace(/^#/, "");
    if (!trimmed || tags.includes(trimmed)) return;
    onChange([...tags, trimmed]);
    setInput("");
  };

  const removeTag = (i: number) => {
    onChange(tags.filter((_, idx) => idx !== i));
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5 bg-white/[0.03] border border-border/60 rounded-lg px-3 py-2.5 min-h-[44px] focus-within:border-primary/50 transition-colors">
      {tags.map((t, i) => (
        <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/10 border border-primary/20 rounded text-[11px] font-mono text-primary">
          #{t}
          <button type="button" onClick={() => removeTag(i)} className="hover:text-red-400 transition-colors">
            <X size={10} />
          </button>
        </span>
      ))}
      <input
        type="text"
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={e => {
          if (e.key === "Enter" || e.key === "," || e.key === " ") {
            e.preventDefault();
            addTag(input);
          }
          if (e.key === "Backspace" && !input && tags.length) {
            removeTag(tags.length - 1);
          }
        }}
        onBlur={() => { if (input.trim()) addTag(input); }}
        placeholder={tags.length === 0 ? "Add tags… (Enter or comma to add)" : ""}
        className="flex-1 min-w-24 bg-transparent text-sm text-text-primary placeholder:text-text-muted outline-none"
      />
    </div>
  );
}

// ── Media Uploader Zone ───────────────────────────────────────
function MediaUploader({
  value, onChange, onRemove,
}: {
  value: string;
  onChange: (url: string) => void;
  onRemove: () => void;
}) {
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [progress, setProgress]       = useState(0);
  const [dragActive, setDragActive]   = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const doUpload = useCallback(async (file: File) => {
    const ALLOWED = ["image/jpeg","image/jpg","image/png","image/gif","image/webp","image/avif","video/mp4","video/webm","video/ogg"];
    if (!ALLOWED.includes(file.type)) {
      toast.error("Only images (JPEG, PNG, GIF, WebP) and videos (MP4, WebM) are allowed.");
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      toast.error("File too large. Maximum 50 MB.");
      return;
    }

    setUploadState("uploading");
    setProgress(0);

    // Simulate progress while real upload runs
    const ticker = setInterval(() => setProgress(p => Math.min(p + 8, 85)), 150);

    try {
      const res = await uploadApi.upload(file);
      clearInterval(ticker);
      setProgress(100);
      setUploadState("done");
      onChange(res.data.url);
      toast.success("Media uploaded");
    } catch (err: any) {
      clearInterval(ticker);
      setUploadState("error");
      toast.error(err.response?.data?.message || "Upload failed");
    }
  }, [onChange]);

  // Clipboard paste support
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const files = e.clipboardData?.files;
      if (files && files.length > 0) doUpload(files[0]);
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [doUpload]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) doUpload(file);
  }, [doUpload]);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) doUpload(file);
  };

  // ── Preview if URL is already set ──
  if (value) {
    return (
      <div className="relative rounded-xl overflow-hidden border border-border/60 group">
        {isVideo(value) || isGif(value) ? (
          <video
            src={value}
            autoPlay loop muted playsInline
            className="w-full max-h-64 object-cover"
          />
        ) : (
          <img src={value} alt="Cover" className="w-full max-h-64 object-cover" />
        )}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => { onRemove(); setUploadState("idle"); setProgress(0); }}
            className="px-4 py-2 bg-red-500/90 text-white text-xs font-mono uppercase tracking-wider rounded-lg hover:bg-red-500 transition-colors flex items-center gap-1.5"
          >
            <X size={13} /> Remove
          </button>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="px-4 py-2 bg-white/20 text-white text-xs font-mono uppercase tracking-wider rounded-lg hover:bg-white/30 transition-colors flex items-center gap-1.5"
          >
            <Upload size={13} /> Replace
          </button>
        </div>
        {/* Media type badge */}
        <div className="absolute top-2 left-2">
          <span className="px-2 py-0.5 bg-black/60 rounded text-[10px] font-mono text-white uppercase tracking-wider backdrop-blur-sm">
            {isVideo(value) ? "Video" : isGif(value) ? "GIF" : "Image"}
          </span>
        </div>
        <input ref={inputRef} type="file" accept="image/*,video/*" onChange={onFileChange} className="hidden" />
      </div>
    );
  }

  // ── Drop zone ──
  return (
    <div
      onDragOver={e => { e.preventDefault(); setDragActive(true); }}
      onDragLeave={() => setDragActive(false)}
      onDrop={onDrop}
      onClick={() => uploadState === "idle" && inputRef.current?.click()}
      className={`relative rounded-xl border-2 border-dashed transition-all cursor-pointer ${
        dragActive
          ? "border-primary/60 bg-primary/5"
          : uploadState === "uploading"
          ? "border-primary/30 bg-primary/[0.03]"
          : uploadState === "error"
          ? "border-red-400/40 bg-red-400/[0.03]"
          : "border-border/50 hover:border-primary/30 hover:bg-white/[0.02]"
      }`}
    >
      <div className="p-8 flex flex-col items-center gap-3 text-center">
        {uploadState === "uploading" ? (
          <>
            <Loader2 size={28} className="text-primary animate-spin" />
            <p className="text-sm text-text-secondary font-mono">Uploading… {progress}%</p>
            <div className="w-full max-w-xs h-1 bg-border rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-primary rounded-full"
                animate={{ width: `${progress}%` }}
                transition={{ ease: "easeOut" }}
              />
            </div>
          </>
        ) : uploadState === "error" ? (
          <>
            <AlertTriangle size={28} className="text-red-400" />
            <p className="text-sm text-red-400 font-mono">Upload failed — click to retry</p>
          </>
        ) : (
          <>
            <div className="flex items-center gap-3 text-text-muted/40">
              <ImageIcon size={22} />
              <Video size={22} />
              <Film size={22} />
            </div>
            <div>
              <p className="text-sm text-text-secondary font-medium">
                Drop media here, or <span className="text-primary">browse</span>
              </p>
              <p className="text-[11px] text-text-muted mt-1 font-mono">
                JPEG · PNG · GIF · WebP · MP4 · WebM · up to 50 MB<br />
                <span className="text-text-muted/60">Paste from clipboard also works (Ctrl+V)</span>
              </p>
            </div>
          </>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp,image/avif,video/mp4,video/webm,video/ogg"
        onChange={onFileChange}
        className="hidden"
      />
    </div>
  );
}

// ── Live Preview Card ─────────────────────────────────────────
function LivePreview({ data }: { data: Partial<UpdateFormData> }) {
  const date = data.date
    ? new Date(data.date).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase()
    : "DATE";

  return (
    <div className="bg-[#0f0f0f] border border-border/60 rounded-xl overflow-hidden">
      {data.coverImage && (
        <div className="h-32 overflow-hidden">
          {isVideo(data.coverImage) || isGif(data.coverImage) ? (
            <video src={data.coverImage} autoPlay loop muted playsInline className="w-full h-full object-cover" />
          ) : (
            <img src={data.coverImage} alt="" className="w-full h-full object-cover opacity-80" />
          )}
        </div>
      )}
      <div className="p-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono text-text-muted">{date}</span>
          <span className={`text-[10px] font-mono uppercase border px-1.5 py-0.5 rounded ${
            data.published ? "status-published" : "status-draft"
          }`}>
            {data.published ? "Published" : "Draft"}
          </span>
        </div>
        <h3 className="text-sm font-clash font-bold text-text-primary leading-snug">
          {data.title || <span className="text-text-muted italic">Untitled update</span>}
        </h3>
        {data.summary && (
          <p className="text-xs text-text-muted leading-relaxed line-clamp-3">{data.summary}</p>
        )}
        {data.tags && data.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {data.tags.slice(0, 5).map((t, i) => (
              <span key={i} className="text-[10px] font-mono text-primary/70 bg-primary/[0.06] border border-primary/10 px-1.5 py-0.5 rounded">
                #{t}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Form ─────────────────────────────────────────────────
interface UpdateFormProps {
  update: Update | null;
}

export default function UpdateForm({ update }: UpdateFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLinks, setShowLinks]       = useState(
    !!(update?.linkedinUrl || update?.xUrl || update?.githubUrl)
  );
  const [showPreview, setShowPreview]   = useState(true);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    control,
    setValue,
    formState: { errors, isDirty },
  } = useForm<UpdateFormData>({
    resolver: zodResolver(updateSchema) as any,
    defaultValues: update
      ? {
          title:          update.title,
          slug:           update.slug,
          summary:        update.summary,
          content:        update.content || "",
          date:           formatDate(update.date),
          tags:           update.tags || [],
          coverImage:     update.coverImage || "",
          linkedinUrl:    update.linkedinUrl || "",
          xUrl:           update.xUrl || "",
          githubUrl:      update.githubUrl || "",
          relatedProject: update.relatedProject || null,
          published:      update.published,
          media:          update.media || [],
        }
      : {
          title: "", slug: "", summary: "", content: "",
          date: formatDate(),
          tags: [],
          coverImage: "", linkedinUrl: "", xUrl: "", githubUrl: "",
          relatedProject: null, published: false, media: []
        },
  });

  // Watch values for live preview
  const watched = watch();

  // Unsaved changes guard
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (isDirty) { e.preventDefault(); e.returnValue = ""; }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  const onSubmit = async (data: UpdateFormData) => {
    setIsSubmitting(true);
    try {
      const submitData: any = {
        ...data,
        date: new Date(data.date).toISOString(),
      };
      if (!submitData.slug)           delete submitData.slug;
      if (!submitData.coverImage)     delete submitData.coverImage;
      if (!submitData.linkedinUrl)    delete submitData.linkedinUrl;
      if (!submitData.xUrl)           delete submitData.xUrl;
      if (!submitData.githubUrl)      delete submitData.githubUrl;
      if (!submitData.relatedProject) delete submitData.relatedProject;
      submitData.tags = (submitData.tags || []).filter((t: string) => t.trim() !== "");

      if (update) {
        await updatesApi.update(update._id, submitData);
        toast.success("Update saved");
      } else {
        await updatesApi.create(submitData);
        toast.success("Update created");
      }

      router.push("/admin/updates");
      router.refresh();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to save update");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isPublished = watched.published;

  return (
    <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-0 pb-14">
      {/* ── Page header ─────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-7">
        <div>
          <p className="text-[11px] font-mono text-text-muted tracking-widest uppercase mb-2">
            {update ? "Edit Update" : "New Update"} / Build Log
          </p>
          <h1 className="text-2xl font-clash font-bold text-text-primary">
            {update ? "Edit Update" : "Compose Update"}
          </h1>
          {isDirty && (
            <p className="text-[11px] font-mono text-yellow-500/80 mt-1 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle size={11} /> Unsaved changes
            </p>
          )}
        </div>
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => router.push("/admin/updates")}
            className="px-4 py-2.5 text-sm text-text-secondary hover:text-text-primary border border-border/60 rounded-lg transition-colors"
          >
            Cancel
          </button>
          {/* Draft toggle */}
          <label className="flex items-center gap-2 px-4 py-2.5 bg-white/[0.03] border border-border/60 rounded-lg cursor-pointer hover:bg-white/[0.06] transition-colors">
            <input
              type="checkbox"
              {...register("published")}
              className="w-3.5 h-3.5 accent-primary"
            />
            <span className="text-sm text-text-secondary font-mono">Publish</span>
          </label>
          {/* Save button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`flex items-center gap-2 px-5 py-2.5 text-sm font-semibold font-clash rounded-lg transition-all active:scale-[0.98] disabled:opacity-60 ${
              isPublished
                ? "bg-primary text-bg hover:bg-primary/90"
                : "bg-white/[0.08] text-text-primary border border-border/60 hover:bg-white/[0.12]"
            }`}
          >
            {isSubmitting
              ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              : isPublished ? <Check size={15} /> : <Save size={15} />
            }
            {isSubmitting ? "Saving…" : isPublished ? "Publish Update" : "Save Draft"}
          </button>
        </div>
      </div>

      {/* ── Two-column layout ────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6">

        {/* ── Left: Composer ────────────────────────────────── */}
        <div className="space-y-5">

          {/* Media zone */}
          <div className="bg-[#0f0f0f] border border-border/60 rounded-xl p-5 space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <ImageIcon size={13} className="text-text-muted" />
              <h2 className="text-[11px] font-mono text-text-secondary uppercase tracking-widest">Cover Media</h2>
              <span className="text-[10px] font-mono text-text-muted ml-auto">Photo · Video · GIF</span>
            </div>
            <MediaUploader
              value={watched.coverImage || ""}
              onChange={url => setValue("coverImage", url, { shouldDirty: true })}
              onRemove={() => setValue("coverImage", "", { shouldDirty: true })}
            />
            {/* Manual URL override */}
            <div className="flex items-center gap-2">
              <div className="flex-shrink-0 text-[10px] font-mono text-text-muted uppercase tracking-wider">URL</div>
              <input
                {...register("coverImage")}
                placeholder="Or paste a URL directly"
                className="flex-1 bg-white/[0.02] border border-border/40 rounded-lg px-3 py-2 text-xs text-text-muted font-mono placeholder:text-text-muted/40 focus:outline-none focus:border-primary/40 transition-colors"
              />
            </div>
            {errors.coverImage && <FieldError msg={errors.coverImage.message} />}
          </div>

          {/* Content */}
          <div className="bg-[#0f0f0f] border border-border/60 rounded-xl p-5 space-y-5">
            <h2 className="text-[11px] font-mono text-text-secondary uppercase tracking-widest">Content</h2>

            <div>
              <FieldLabel required>Title</FieldLabel>
              <input
                {...register("title")}
                placeholder="What did you build or ship?"
                className={inputCls}
              />
              <FieldError msg={errors.title?.message} />
            </div>

            <div>
              <FieldLabel required>
                Summary
                <span className="ml-auto text-text-muted/50 font-mono normal-case tracking-normal">
                  {(watched.summary || "").length}/400
                </span>
              </FieldLabel>
              <textarea
                {...register("summary")}
                rows={3}
                maxLength={400}
                placeholder="Brief description — shown in the card view and feed. Max 400 characters."
                className={textareaCls}
              />
              <FieldError msg={errors.summary?.message} />
            </div>

            <div>
              <FieldLabel>Full Content <span className="text-text-muted normal-case font-normal">(Markdown)</span></FieldLabel>
              <Composer 
                contentField="content" 
                mediaField="media" 
                control={control} 
                watch={watch} 
                setValue={setValue} 
              />
            </div>
          </div>

          {/* Tags */}
          <div className="bg-[#0f0f0f] border border-border/60 rounded-xl p-5 space-y-3">
            <div className="flex items-center gap-2">
              <h2 className="text-[11px] font-mono text-text-secondary uppercase tracking-widest">Tags</h2>
              <span className="text-[10px] font-mono text-text-muted ml-auto">Enter, comma, or space to add</span>
            </div>
            <TagEditor
              tags={watched.tags || []}
              onChange={tags => setValue("tags", tags, { shouldDirty: true })}
            />
          </div>

          {/* Social links (collapsible) */}
          <div className="bg-[#0f0f0f] border border-border/60 rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => setShowLinks(v => !v)}
              className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/[0.02] transition-colors"
            >
              <div className="flex items-center gap-2">
                <Link2 size={13} className="text-text-muted" />
                <h2 className="text-[11px] font-mono text-text-secondary uppercase tracking-widest">Social Links</h2>
                {(watched.linkedinUrl || watched.xUrl || watched.githubUrl) && (
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                )}
              </div>
              {showLinks ? <ChevronUp size={14} className="text-text-muted" /> : <ChevronDown size={14} className="text-text-muted" />}
            </button>

            <AnimatePresence>
              {showLinks && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="overflow-hidden"
                >
                  <div className="px-5 pb-5 space-y-3 border-t border-border/40">
                    <div className="pt-4">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <FieldLabel><span className="flex items-center gap-1.5"><AtSign size={11} /> LinkedIn</span></FieldLabel>
                          <input {...register("linkedinUrl")} placeholder="https://linkedin.com/posts/…" className={inputCls} />
                          <FieldError msg={errors.linkedinUrl?.message} />
                        </div>
                        <div>
                          <FieldLabel><span className="flex items-center gap-1.5"><AtSign size={11} /> X / Twitter</span></FieldLabel>
                          <input {...register("xUrl")} placeholder="https://x.com/…" className={inputCls} />
                          <FieldError msg={errors.xUrl?.message} />
                        </div>
                        <div>
                          <FieldLabel><span className="flex items-center gap-1.5"><GitBranch size={11} /> GitHub</span></FieldLabel>
                          <input {...register("githubUrl")} placeholder="https://github.com/…" className={inputCls} />
                          <FieldError msg={errors.githubUrl?.message} />
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ── Right: Sidebar ────────────────────────────────── */}
        <div className="space-y-5">

          {/* Publishing panel */}
          <div className="bg-[#0f0f0f] border border-border/60 rounded-xl p-5 space-y-4">
            <h2 className="text-[11px] font-mono text-text-secondary uppercase tracking-widest">Publishing</h2>

            <div>
              <FieldLabel required>Date</FieldLabel>
              <input
                type="date"
                {...register("date")}
                className={`${inputCls} [&::-webkit-calendar-picker-indicator]:opacity-50 [&::-webkit-calendar-picker-indicator]:invert`}
              />
              <FieldError msg={errors.date?.message} />
            </div>

            <div>
              <FieldLabel>Slug Override</FieldLabel>
              <input
                {...register("slug")}
                placeholder="auto-generated-from-title"
                className={`${inputCls} font-mono text-xs`}
              />
              <FieldError msg={errors.slug?.message} />
              <p className="text-[10px] text-text-muted mt-1 font-mono">Leave blank to auto-generate from title</p>
            </div>

            <div>
              <FieldLabel>Related Project</FieldLabel>
              <input
                {...register("relatedProject")}
                placeholder="Project MongoDB ID (optional)"
                className={`${inputCls} font-mono text-xs`}
              />
            </div>
          </div>

          {/* Live Preview */}
          <div className="bg-[#0f0f0f] border border-border/60 rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => setShowPreview(v => !v)}
              className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/[0.02] transition-colors"
            >
              <div className="flex items-center gap-2">
                {showPreview ? <Eye size={13} className="text-text-muted" /> : <EyeOff size={13} className="text-text-muted" />}
                <h2 className="text-[11px] font-mono text-text-secondary uppercase tracking-widest">Live Preview</h2>
              </div>
              {showPreview ? <ChevronUp size={14} className="text-text-muted" /> : <ChevronDown size={14} className="text-text-muted" />}
            </button>

            <AnimatePresence>
              {showPreview && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="overflow-hidden border-t border-border/40"
                >
                  <div className="p-4">
                    <p className="text-[10px] font-mono text-text-muted uppercase tracking-wider mb-3">As it appears publicly</p>
                    <LivePreview data={watched} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Keyboard shortcuts hint */}
          <div className="text-[10px] font-mono text-text-muted/50 space-y-1 px-1">
            <p>Ctrl+V — paste image from clipboard</p>
            <p>Enter / comma — add tag</p>
            <p>Backspace — remove last tag</p>
          </div>
        </div>
      </div>

      {/* Sticky bottom save bar (mobile) */}
      <div className="xl:hidden fixed bottom-0 left-0 right-0 z-50 bg-bg/90 backdrop-blur border-t border-border/60 px-4 py-3 flex items-center justify-between gap-3">
        {isDirty && (
          <span className="text-[11px] font-mono text-yellow-500/80 flex items-center gap-1.5">
            <AlertTriangle size={11} /> Unsaved
          </span>
        )}
        <div className="flex items-center gap-2 ml-auto">
          <button type="button" onClick={() => router.push("/admin/updates")}
            className="px-3 py-2 text-xs text-text-secondary border border-border/60 rounded-lg">
            Cancel
          </button>
          <button type="submit" disabled={isSubmitting}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg disabled:opacity-60 ${
              isPublished ? "bg-primary text-bg" : "bg-white/10 text-text-primary border border-border/60"
            }`}>
            {isSubmitting ? <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" /> : null}
            {isPublished ? "Publish" : "Save Draft"}
          </button>
        </div>
      </div>
    </form>
  );
}
