"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { settingsApi } from "@/lib/api";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import {
  Save, Globe, AlertCircle, Check, GripVertical, Settings as SettingsIcon,
  Eye, EyeOff, LayoutTemplate, Layers, ChevronDown, ExternalLink
} from "lucide-react";
import Link from "next/link";

// ── Publish bar ───────────────────────────────────────────────

function PublishBar({ status, isDirty, isSubmitting, onPublish }: {
  status: string; isDirty: boolean; isSubmitting: boolean; onPublish: () => void;
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
        <button type="button" disabled={isSubmitting || !isDirty} onClick={onPublish}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-bg text-sm font-semibold font-clash rounded-lg hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-40">
          {isSubmitting ? <div className="w-4 h-4 border-2 border-bg border-t-transparent rounded-full animate-spin" /> : <Save size={13} />}
          Save Sections
        </button>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────

const SECTION_LAYOUT_VARIANTS: Record<string, { id: string; label: string }[]> = {
  hero:             [{ id: "default", label: "Default" }],
  about:            [{ id: "default", label: "Default" }],
  currentlyLearning:[{ id: "default", label: "Default" }],
  journey:          [{ id: "timeline", label: "Timeline" }, { id: "cards", label: "Cards" }, { id: "compact", label: "Compact List" }],
  projects:         [{ id: "grid", label: "Standard Grid" }, { id: "featured-first", label: "Featured First" }, { id: "editorial-list", label: "Editorial List" }],
  skills:           [{ id: "grouped", label: "Grouped" }, { id: "grid", label: "Grid" }, { id: "minimal-list", label: "Minimal List" }],
  certificates:     [{ id: "grid", label: "Grid" }, { id: "list", label: "List" }],
  milestones:       [{ id: "timeline", label: "Timeline" }, { id: "cards", label: "Cards" }],
  updates:          [{ id: "feed", label: "Feed" }, { id: "cards", label: "Cards" }],
  contact:          [{ id: "default", label: "Default" }],
};

const SECTION_LABELS: Record<string, string> = {
  hero: "Hero Section", about: "About / Bio", currentlyLearning: "Currently Learning",
  projects: "Projects Showcase", journey: "Journey / Experience", skills: "Skills & Tech Stack",
  certificates: "Certifications", milestones: "Milestones", updates: "Updates / Blog", contact: "Contact Info"
};

export default function AdminSectionsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, control, handleSubmit, reset, watch, formState: { isDirty } } = useForm({
    defaultValues: {
      sections: [] as any[],
    }
  });

  const { fields, move } = useFieldArray({
    control,
    name: "sections"
  });

  useEffect(() => {
    (async () => {
      try {
        const res = await settingsApi.getAdmin();
        const s = res.data.data;
        if (s?.sections) {
          reset({ sections: s.sections.sort((a: any, b: any) => a.order - b.order) });
        }
      } catch (err) {
        toast.error("Failed to load section configuration");
      } finally {
        setIsLoading(false);
      }
    })();
  }, [reset]);

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    move(result.source.index, result.destination.index);
  };

  const submit = async (data: any) => {
    setIsSubmitting(true);
    try {
      const payload = {
        sections: data.sections.map((sec: any, idx: number) => ({
          ...sec,
          order: idx + 1
        }))
      };
      await settingsApi.update(payload);
      reset(payload); // Reset to clear dirty state
      toast.success("Page layout updated successfully");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to save sections");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-[11px] font-mono text-text-muted uppercase tracking-widest">Loading sections…</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl pb-12">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.24 }} className="mb-8">
        <p className="text-[10px] font-mono text-text-muted tracking-[0.18em] uppercase mb-3">Appearance / Sections</p>
        <h1 className="text-3xl font-clash font-bold text-text-primary">Homepage Structure</h1>
        <p className="text-sm text-text-secondary mt-2">
          Drag to reorder sections on your public portfolio. Toggle visibility and configure layout variants for supported sections.
        </p>
      </motion.div>

      <PublishBar
        status="published"
        isDirty={isDirty}
        isSubmitting={isSubmitting}
        onPublish={handleSubmit(submit)}
      />

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="sections">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-4"
            >
              {fields.map((field: any, index: number) => {
                const variants = SECTION_LAYOUT_VARIANTS[field.type] || [];
                const isEnabled = watch(`sections.${index}.enabled`);

                return (
                  <Draggable key={field.id} draggableId={field.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`bg-[#0f0f0f] border border-border/60 rounded-xl transition-all ${snapshot.isDragging ? 'shadow-2xl shadow-black/50 border-primary/50' : ''}`}
                      >
                        <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                          
                          {/* Left: Drag Handle & Visibility */}
                          <div className="flex items-center gap-4 sm:w-[200px] flex-shrink-0">
                            <div
                              {...provided.dragHandleProps}
                              className="p-2 -m-2 text-text-muted hover:text-text-primary cursor-grab active:cursor-grabbing transition-colors"
                            >
                              <GripVertical size={20} />
                            </div>
                            
                            <Controller
                              control={control}
                              name={`sections.${index}.enabled`}
                              render={({ field: f }) => (
                                <button
                                  type="button"
                                  onClick={() => f.onChange(!f.value)}
                                  className="flex items-center gap-2 group outline-none"
                                >
                                  {f.value ? (
                                    <Eye size={18} className="text-primary" />
                                  ) : (
                                    <EyeOff size={18} className="text-text-muted" />
                                  )}
                                  <span className={`text-[11px] font-mono uppercase tracking-widest ${f.value ? 'text-primary' : 'text-text-muted'}`}>
                                    {f.value ? 'Visible' : 'Hidden'}
                                  </span>
                                </button>
                              )}
                            />
                          </div>

                          {/* Middle: Info */}
                          <div className="flex-1 min-w-0 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-white/[0.03] border border-border/60 flex items-center justify-center flex-shrink-0 text-text-muted">
                              <Layers size={14} />
                            </div>
                            <div>
                              <h3 className={`font-semibold font-clash text-base ${isEnabled ? 'text-text-primary' : 'text-text-muted'}`}>
                                {SECTION_LABELS[field.type] || field.type}
                              </h3>
                              <p className="text-[11px] font-mono text-text-muted uppercase tracking-wider">
                                Order: {index + 1}
                              </p>
                            </div>
                          </div>

                          {/* Right: Layout Variant Dropdown */}
                          <div className="sm:w-[200px] flex-shrink-0">
                            {variants.length > 1 ? (
                              <div className="relative group">
                                <select
                                  {...register(`sections.${index}.layoutVariant`)}
                                  className="w-full appearance-none bg-white/[0.03] border border-border/60 rounded-lg pl-4 pr-10 py-2.5 text-sm text-text-primary focus:outline-none focus:border-primary/50 transition-colors cursor-pointer"
                                  disabled={!isEnabled}
                                >
                                  {variants.map(v => (
                                    <option key={v.id} value={v.id} className="bg-bg">{v.label}</option>
                                  ))}
                                </select>
                                <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
                              </div>
                            ) : (
                              <div className="w-full bg-white/[0.01] border border-transparent rounded-lg px-4 py-2.5 text-sm text-text-muted flex items-center gap-2">
                                <LayoutTemplate size={14} />
                                <span>Default Layout</span>
                              </div>
                            )}
                          </div>

                        </div>
                      </div>
                    )}
                  </Draggable>
                );
              })}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}
