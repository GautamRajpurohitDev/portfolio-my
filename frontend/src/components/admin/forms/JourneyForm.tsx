"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { journeyApi } from "@/lib/api";
import { JourneyEntry } from "@/types";
import toast from "react-hot-toast";
import { Save, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { Composer } from "../composer/Composer";

const journeySchema = z.object({
  date: z.string().min(1, "Date is required"),
  title: z.string().min(1, "Title is required").max(200),
  topic: z.string().min(1, "Topic is required").max(100),
  summary: z.string().min(1, "Summary is required").max(500),
  content: z.string().optional().default(""),
  media: z.array(z.object({
    url: z.string(),
    mimeType: z.string(),
    alt: z.string().optional().default(""),
    order: z.number().int().optional().default(0),
  })).optional().default([]),
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
  const router = useRouter();

  const formatDateForInput = (dateString?: Date | string) => {
    if (!dateString) return new Date().toISOString().split('T')[0];
    try {
      return new Date(dateString).toISOString().split('T')[0];
    } catch {
      return new Date().toISOString().split('T')[0];
    }
  };

  const {
    register,
    handleSubmit,
    watch,
    control,
    setValue,
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
          featured: journey.featured,
          published: journey.published,
          order: journey.order,
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

  const onSubmit = async (data: JourneyFormData) => {
    setIsSubmitting(true);
    try {
      const submitData: any = { ...data, date: new Date(data.date).toISOString() };
      if (!submitData.githubUrl) delete submitData.githubUrl;

      if (journey) {
        await journeyApi.update(journey._id, submitData);
        toast.success("Journey entry updated");
      } else {
        await journeyApi.create(submitData);
        toast.success("Journey entry created");
      }
      
      router.push("/admin/journey");
      router.refresh();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to save journey entry");
    } finally {
      setIsSubmitting(false);
    }
  };

  const Section = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <div className="bg-bg-card border border-border rounded-xl p-6 space-y-6">
      <h3 className="text-sm font-semibold tracking-widest text-text-secondary uppercase border-b border-border pb-4 mb-4">
        {title}
      </h3>
      {children}
    </div>
  );

  return (
    <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold font-clash text-text-primary">
            {journey ? "Edit Journey Entry" : "New Journey Entry"}
          </h1>
          {isDirty && <p className="text-sm text-yellow-500 mt-1">Unsaved changes</p>}
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            type="button" 
            onClick={() => router.push("/admin/journey")} 
            className="px-4 py-2 text-text-secondary hover:text-text-primary transition-colors text-sm font-medium"
          >
            Cancel
          </button>

          <button 
            type="submit" 
            disabled={isSubmitting} 
            className={`px-6 py-2 ${isPublished ? 'bg-primary' : 'bg-white/10 border border-border hover:bg-white/20'} text-bg font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2 text-sm`}
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-bg border-t-transparent rounded-full animate-spin"></div>
            ) : (
              isPublished ? <Check size={16} /> : <Save size={16} />
            )}
            {isSubmitting ? "Saving..." : (isPublished ? "Publish Entry" : "Save Draft")}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          
          <Section title="Entry Information">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-sm font-medium text-text-secondary">Title *</label>
                <input {...register("title")} className="w-full bg-white/5 border border-border rounded-lg px-4 py-2.5 text-text-primary focus:outline-none focus:border-primary transition-colors" />
                {errors.title && <p className="text-red-400 text-xs">{errors.title.message}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-text-secondary">Topic * (e.g. Next.js, C++)</label>
                <input {...register("topic")} className="w-full bg-white/5 border border-border rounded-lg px-4 py-2.5 text-text-primary focus:outline-none focus:border-primary transition-colors" />
                {errors.topic && <p className="text-red-400 text-xs">{errors.topic.message}</p>}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-text-secondary">Summary *</label>
              <textarea {...register("summary")} rows={2} className="w-full bg-white/5 border border-border rounded-lg px-4 py-2.5 text-text-primary focus:outline-none focus:border-primary transition-colors resize-none" />
              {errors.summary && <p className="text-red-400 text-xs">{errors.summary.message}</p>}
            </div>
          </Section>

          <Section title="Full Content & Media">
            <div className="space-y-6">
              <Composer 
                contentField="content" 
                mediaField="media" 
                control={control} 
                watch={watch} 
                setValue={setValue} 
              />
              
              <div className="pt-6 border-t border-border/60">
                <h4 className="text-sm font-semibold text-text-primary mb-4">Specific Fields (Optional)</h4>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-text-secondary">What did you build?</label>
                    <textarea {...register("built")} rows={2} className="w-full bg-white/5 border border-border rounded-lg px-4 py-2 text-text-primary focus:outline-none focus:border-primary text-sm resize-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-text-secondary">What did you learn?</label>
                    <textarea {...register("learned")} rows={2} className="w-full bg-white/5 border border-border rounded-lg px-4 py-2 text-text-primary focus:outline-none focus:border-primary text-sm resize-none" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-text-secondary">Problems</label>
                      <textarea {...register("problems")} rows={2} className="w-full bg-white/5 border border-border rounded-lg px-4 py-2 text-text-primary focus:outline-none focus:border-primary text-sm resize-none" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-text-secondary">Solutions</label>
                      <textarea {...register("solved")} rows={2} className="w-full bg-white/5 border border-border rounded-lg px-4 py-2 text-text-primary focus:outline-none focus:border-primary text-sm resize-none" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-text-secondary">Next Steps</label>
                    <textarea {...register("nextStep")} rows={2} className="w-full bg-white/5 border border-border rounded-lg px-4 py-2 text-text-primary focus:outline-none focus:border-primary text-sm resize-none" />
                  </div>
                </div>
              </div>
            </div>
          </Section>
        </div>

        <div className="space-y-6">
          <Section title="Visibility & Status">
            <div className="space-y-6">
              <div className="space-y-1">
                <label className="text-sm font-medium text-text-secondary">Date *</label>
                <input type="date" {...register("date")} className="w-full bg-white/5 border border-border rounded-lg px-4 py-2.5 text-text-primary focus:outline-none focus:border-primary [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert" />
                {errors.date && <p className="text-red-400 text-xs">{errors.date.message}</p>}
              </div>

              <div className="flex flex-col gap-4">
                <label className="flex items-center justify-between cursor-pointer p-3 rounded-lg border border-border bg-white/5 hover:bg-white/10 transition-colors">
                  <span className="text-sm font-medium text-text-primary">Publish Entry</span>
                  <input type="checkbox" {...register("published")} className="w-5 h-5 rounded border-border bg-black text-primary accent-primary" />
                </label>
                <label className="flex items-center justify-between cursor-pointer p-3 rounded-lg border border-border bg-white/5 hover:bg-white/10 transition-colors">
                  <span className="text-sm font-medium text-text-primary">Featured Entry</span>
                  <input type="checkbox" {...register("featured")} className="w-5 h-5 rounded border-border bg-black text-primary accent-primary" />
                </label>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-text-secondary">Display Order (Lower is first)</label>
                <input type="number" {...register("order", { valueAsNumber: true })} className="w-full bg-white/5 border border-border rounded-lg px-4 py-2.5 text-text-primary focus:outline-none focus:border-primary" />
              </div>
            </div>
          </Section>

          <Section title="References">
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-text-secondary">GitHub URL</label>
                <input {...register("githubUrl")} className="w-full bg-white/5 border border-border rounded-lg px-4 py-2.5 text-text-primary focus:outline-none focus:border-primary text-sm" />
                {errors.githubUrl && <p className="text-red-400 text-xs">{errors.githubUrl.message}</p>}
              </div>
              
              <div className="space-y-1">
                <label className="text-sm font-medium text-text-secondary">Related Certificate ID (Optional)</label>
                <input {...register("relatedCertificate")} className="w-full bg-white/5 border border-border rounded-lg px-4 py-2.5 text-text-primary focus:outline-none focus:border-primary text-sm font-mono" />
              </div>
            </div>
          </Section>
        </div>
      </div>
    </form>
  );
}
