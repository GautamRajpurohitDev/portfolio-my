"use client";

import React, { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { settingsApi } from "@/lib/api";
import toast from "react-hot-toast";
import {
  Save, Plus, Trash2, Eye, EyeOff, Layout, Zap, Image as ImageIcon,
  GripVertical, ArrowUp, ArrowDown, ChevronDown, ChevronUp,
  Globe, FileText, ToggleLeft, ToggleRight, ExternalLink, Check,
  AlertCircle
} from "lucide-react";
import Link from "next/link";
import { MediaPicker } from "@/components/admin/media/MediaPicker";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

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

function Section({ icon, title, children, defaultOpen = true }: {
  icon: React.ReactNode; title: string; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="bg-[#0f0f0f] border border-border/60 rounded-xl overflow-hidden">
      <button type="button" onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-3 px-6 py-4 border-b border-border/40 hover:bg-white/[0.02] transition-colors">
        <div className="flex items-center gap-3">
          <span className="text-text-muted">{icon}</span>
          <h2 className="text-[11px] font-mono text-text-secondary uppercase tracking-widest">{title}</h2>
        </div>
        {open ? <ChevronUp size={14} className="text-text-muted" /> : <ChevronDown size={14} className="text-text-muted" />}
      </button>
      {open && <div className="px-6 py-6 space-y-5">{children}</div>}
    </section>
  );
}

function PublishBar({ isDirty, isSubmitting, onSave }: {
  isDirty: boolean; isSubmitting: boolean; onSave: () => void;
}) {
  return (
    <div className="sticky top-0 z-10 -mx-8 sm:-mx-10 xl:-mx-12 px-8 sm:px-10 xl:px-12 py-3 bg-bg/95 backdrop-blur-md border-b border-border/40 flex items-center justify-between gap-4 mb-8">
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-display font-bold text-text-primary tracking-tight">About CMS</h1>
        {isDirty && <span className="text-[11px] font-mono text-yellow-500/70">● Unsaved changes</span>}
      </div>
      <div className="flex items-center gap-2">
        <Link href="/about" target="_blank"
          className="flex items-center gap-1.5 px-3 py-2 text-[11px] font-mono text-text-muted border border-border/60 rounded-lg hover:border-primary/30 hover:text-primary transition-all uppercase tracking-wider">
          <ExternalLink size={11} /> Preview
        </Link>
        <button type="button" disabled={isSubmitting} onClick={onSave}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-bg text-sm font-semibold font-clash rounded-lg hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-40">
          {isSubmitting ? <div className="w-4 h-4 border-2 border-bg border-t-transparent rounded-full animate-spin" /> : <Globe size={13} />}
          Update About
        </button>
      </div>
    </div>
  );
}

export default function AdminAboutPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, control, handleSubmit, watch, setValue, reset, formState: { isDirty } } = useForm<any>({
    defaultValues: {
      about: {
        profileImage: "",
        name: "Gautam Rajpurohit",
        shortIntro: "HEY. I'M GAUTAM.",
        personalStatement: "I'm an MCA student deliberately rebuilding my programming and software engineering fundamentals...",
        location: "INDIA",
        education: "MCA",
        currentFocus: "PROGRAMMING",
        interests: [],
        areasExploring: [],
        timeline: []
      }
    }
  });

  const { fields: areaFields, append: addArea, remove: removeArea, move: moveArea } = useFieldArray({ control, name: "about.areasExploring" });
  const { fields: timelineFields, append: addTimeline, remove: removeTimeline, move: moveTimeline } = useFieldArray({ control, name: "about.timeline" });

  useEffect(() => {
    async function load() {
      try {
        const res = await settingsApi.get();
        if (res.data && res.data.about) {
          reset({ about: res.data.about });
        }
      } catch (error) {
        toast.error("Failed to load settings");
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [reset]);

  const onSave = async (data: any) => {
    setIsSubmitting(true);
    try {
      await settingsApi.update({ about: data.about });
      toast.success("About settings saved");
      reset(data);
    } catch (err) {
      toast.error("Failed to save settings");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDragEndAreas = (result: any) => {
    if (!result.destination) return;
    moveArea(result.source.index, result.destination.index);
  };

  const handleDragEndTimeline = (result: any) => {
    if (!result.destination) return;
    moveTimeline(result.source.index, result.destination.index);
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[50vh]">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const aboutData = watch("about");

  return (
    <div className="pb-16 max-w-4xl">
      <PublishBar isDirty={isDirty} isSubmitting={isSubmitting} onSave={handleSubmit(onSave)} />
      
      <form onSubmit={handleSubmit(onSave)} className="space-y-6">
        
        <Section icon={<FileText size={16} />} title="Identity & Intro">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field label="Name">
              <input {...register("about.name")} className={inputCls} placeholder="Gautam Rajpurohit" />
            </Field>
            <Field label="Short Intro">
              <input {...register("about.shortIntro")} className={inputCls} placeholder="HEY. I'M GAUTAM." />
            </Field>
          </div>
          
          <Field label="Profile Image">
            <MediaPicker 
              value={aboutData.profileImage}
              onChange={(url) => setValue("about.profileImage", url, { shouldDirty: true })}
            />
          </Field>
          
          <Field label="Personal Statement" hint="The main long bio paragraph shown on the about page.">
            <textarea {...register("about.personalStatement")} rows={6} className={textareaCls} />
          </Field>
        </Section>
        
        <Section icon={<Layout size={16} />} title="Metadata Grid">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <Field label="Location">
              <input {...register("about.location")} className={inputCls} placeholder="INDIA" />
            </Field>
            <Field label="Education">
              <input {...register("about.education")} className={inputCls} placeholder="MCA" />
            </Field>
            <Field label="Current Focus">
              <input {...register("about.currentFocus")} className={inputCls} placeholder="PROGRAMMING" />
            </Field>
          </div>
        </Section>
        
        <Section icon={<Zap size={16} />} title="Areas I'm Exploring">
          <DragDropContext onDragEnd={handleDragEndAreas}>
            <Droppable droppableId="areas-list">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                  {areaFields.map((field, index) => (
                    <Draggable key={field.id} draggableId={field.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`flex gap-3 items-start bg-bg border border-border/40 p-4 rounded-xl ${
                            snapshot.isDragging ? "shadow-2xl border-primary/40 ring-1 ring-primary/20 bg-bg-elevated" : ""
                          }`}
                        >
                          <div {...provided.dragHandleProps} className="mt-2 text-text-muted hover:text-text-primary cursor-grab active:cursor-grabbing p-1">
                            <GripVertical size={16} />
                          </div>
                          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Field label="Title">
                              <input {...register(`about.areasExploring.${index}.title` as const)} className={inputCls} placeholder="Programming" />
                            </Field>
                            <Field label="Description">
                              <input {...register(`about.areasExploring.${index}.description` as const)} className={inputCls} placeholder="Building fundamentals in C..." />
                            </Field>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeArea(index)}
                            className="mt-8 p-2 text-text-muted hover:text-red-400 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
          
          <button
            type="button"
            onClick={() => addArea({ title: "", description: "", order: areaFields.length })}
            className="flex items-center gap-2 mt-4 px-4 py-2.5 bg-white/[0.03] border border-border/60 border-dashed rounded-lg text-sm text-text-secondary hover:text-primary hover:border-primary/40 hover:bg-primary/[0.03] transition-all w-full justify-center font-mono uppercase tracking-wider"
          >
            <Plus size={14} /> Add Area
          </button>
        </Section>
        
        <Section icon={<ImageIcon size={16} />} title="Timeline (Journey summary)">
          <DragDropContext onDragEnd={handleDragEndTimeline}>
            <Droppable droppableId="timeline-list">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                  {timelineFields.map((field, index) => (
                    <Draggable key={field.id} draggableId={field.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`flex gap-3 items-start bg-bg border border-border/40 p-4 rounded-xl ${
                            snapshot.isDragging ? "shadow-2xl border-primary/40 ring-1 ring-primary/20 bg-bg-elevated" : ""
                          }`}
                        >
                          <div {...provided.dragHandleProps} className="mt-2 text-text-muted hover:text-text-primary cursor-grab active:cursor-grabbing p-1">
                            <GripVertical size={16} />
                          </div>
                          <div className="flex-1 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-[120px_1fr] gap-4">
                              <Field label="Year">
                                <input {...register(`about.timeline.${index}.year` as const)} className={inputCls} placeholder="2026" />
                              </Field>
                              <Field label="Title">
                                <input {...register(`about.timeline.${index}.title` as const)} className={inputCls} placeholder="Started MCA" />
                              </Field>
                            </div>
                            <Field label="Description">
                              <textarea {...register(`about.timeline.${index}.description` as const)} rows={2} className={textareaCls} />
                            </Field>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeTimeline(index)}
                            className="mt-8 p-2 text-text-muted hover:text-red-400 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
          
          <button
            type="button"
            onClick={() => addTimeline({ year: "", title: "", description: "", order: timelineFields.length })}
            className="flex items-center gap-2 mt-4 px-4 py-2.5 bg-white/[0.03] border border-border/60 border-dashed rounded-lg text-sm text-text-secondary hover:text-primary hover:border-primary/40 hover:bg-primary/[0.03] transition-all w-full justify-center font-mono uppercase tracking-wider"
          >
            <Plus size={14} /> Add Timeline Item
          </button>
        </Section>
        
      </form>
    </div>
  );
}
