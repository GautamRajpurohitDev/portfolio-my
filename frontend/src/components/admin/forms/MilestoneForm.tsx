"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { milestonesApi } from "@/lib/api";
import { Milestone } from "@/types";
import toast from "react-hot-toast";
import { Save, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { Composer } from "../composer/Composer";

const milestoneSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().optional().default(""),
  date: z.string().min(1, "Date is required"),
  status: z.enum(["planned","in-progress","completed"]).default("planned"),
  category: z.string().optional().default("general"),
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

type MilestoneFormData = z.infer<typeof milestoneSchema>;

interface MilestoneFormProps {
  milestone: Milestone | null;
}

export default function MilestoneForm({ milestone }: MilestoneFormProps) {
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
          featured: milestone.featured,
          order: milestone.order,
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

  const onSubmit = async (data: MilestoneFormData) => {
    setIsSubmitting(true);
    try {
      const submitData = { ...data, date: new Date(data.date).toISOString() };

      if (milestone) {
        await milestonesApi.update(milestone._id, submitData);
        toast.success("Milestone updated");
      } else {
        await milestonesApi.create(submitData);
        toast.success("Milestone created");
      }
      
      router.push("/admin/milestones");
      router.refresh();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to save milestone");
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
            {milestone ? "Edit Milestone" : "New Milestone"}
          </h1>
          {isDirty && <p className="text-sm text-yellow-500 mt-1">Unsaved changes</p>}
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            type="button" 
            onClick={() => router.push("/admin/milestones")} 
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
            {isSubmitting ? "Saving..." : (isPublished ? "Publish Milestone" : "Save Draft")}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          
          <Section title="Milestone Information">
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-text-secondary">Title *</label>
                <input {...register("title")} className="w-full bg-white/5 border border-border rounded-lg px-4 py-2.5 text-text-primary focus:outline-none focus:border-primary transition-colors" />
                {errors.title && <p className="text-red-400 text-xs">{errors.title.message}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-text-secondary">Description & Media</label>
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
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-text-secondary">Date *</label>
                  <input type="date" {...register("date")} className="w-full bg-white/5 border border-border rounded-lg px-4 py-2.5 text-text-primary focus:outline-none focus:border-primary [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert" />
                  {errors.date && <p className="text-red-400 text-xs">{errors.date.message}</p>}
                </div>
                
                <div className="space-y-1">
                  <label className="text-sm font-medium text-text-secondary">Category</label>
                  <input {...register("category")} className="w-full bg-white/5 border border-border rounded-lg px-4 py-2.5 text-text-primary focus:outline-none focus:border-primary transition-colors" />
                </div>
              </div>
            </div>
          </Section>
        </div>

        <div className="space-y-6">
          <Section title="Visibility & Status">
            <div className="space-y-6">
              <div className="space-y-1">
                <label className="text-sm font-medium text-text-secondary">Status</label>
                <select {...register("status")} className="w-full bg-white/5 border border-border rounded-lg px-4 py-2.5 text-text-primary focus:outline-none focus:border-primary [&>option]:bg-[#0a0a0a]">
                  <option value="planned">Planned</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div className="flex flex-col gap-4">
                <label className="flex items-center justify-between cursor-pointer p-3 rounded-lg border border-border bg-white/5 hover:bg-white/10 transition-colors">
                  <span className="text-sm font-medium text-text-primary">Publish Milestone</span>
                  <input type="checkbox" {...register("published")} className="w-5 h-5 rounded border-border bg-black text-primary accent-primary" />
                </label>
                <label className="flex items-center justify-between cursor-pointer p-3 rounded-lg border border-border bg-white/5 hover:bg-white/10 transition-colors">
                  <span className="text-sm font-medium text-text-primary">Featured Milestone</span>
                  <input type="checkbox" {...register("featured")} className="w-5 h-5 rounded border-border bg-black text-primary accent-primary" />
                </label>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-text-secondary">Display Order (Lower is first)</label>
                <input type="number" {...register("order", { valueAsNumber: true })} className="w-full bg-white/5 border border-border rounded-lg px-4 py-2.5 text-text-primary focus:outline-none focus:border-primary" />
              </div>
              
              <div className="space-y-1">
                <label className="text-sm font-medium text-text-secondary">Icon (SVG or class)</label>
                <input {...register("icon")} className="w-full bg-white/5 border border-border rounded-lg px-4 py-2.5 text-text-primary focus:outline-none focus:border-primary transition-colors font-mono text-sm" />
              </div>
            </div>
          </Section>
        </div>
      </div>
    </form>
  );
}
