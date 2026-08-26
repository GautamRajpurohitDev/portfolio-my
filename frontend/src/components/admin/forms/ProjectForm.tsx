"use client";

import React, { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { projectsApi } from "@/lib/api";
import { Project } from "@/types";
import toast from "react-hot-toast";
import { X, Plus, Trash2, Save, Eye, Upload, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Composer } from "@/components/admin/composer/Composer";

const projectSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  slug: z.string().regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, hyphens only").optional().or(z.literal("")),
  shortDescription: z.string().min(1, "Short description is required").max(300),
  content: z.string().optional().default(""),
  media: z.array(z.object({
    url: z.string(),
    mimeType: z.string(),
    alt: z.string().optional().default(""),
    order: z.number().int().optional().default(0),
  })).optional().default([]),
  problem: z.string().optional().default(""),
  solution: z.string().optional().default(""),
  architecture: z.string().optional().default(""),
  features: z.string().optional().default(""),
  challenges: z.string().optional().default(""),
  lessonsLearned: z.string().optional().default(""),
  status: z.enum(["idea", "in-progress", "completed", "archived"]).default("idea"),
  category: z.string().optional().default("other"),
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
  const router = useRouter();

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
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
          category: project.category,
          technologies: project.technologies,
          featured: project.featured,
          published: project.published,
          order: project.order,
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
          status: "idea",
          category: "other",
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
  const [submitAction, setSubmitAction] = useState<"draft" | "publish">("draft");
  const isDraft = (project as any)?._isDraft === true;

  const onSubmit = async (data: ProjectFormData) => {
    if (submitAction === "publish" && project) {
      if (!window.confirm("Publish these changes to the live site?")) {
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const submitData: any = { ...data };
      if (!submitData.githubUrl) delete submitData.githubUrl;
      if (!submitData.liveUrl) delete submitData.liveUrl;
      if (!submitData.slug) delete submitData.slug;
      
      submitData.technologies = submitData.technologies.filter((t: string) => t.trim() !== "");

      const currentProject = project;

      if (currentProject) {
        if ((currentProject as any)._isDraft) {
          await projectsApi.update(project!._id, submitData, submitAction);
          toast.success(submitAction === "publish" ? "Project published" : "Draft saved");
        } else {
          await projectsApi.update(project!._id, submitData, submitAction);
          toast.success("Project updated successfully");
        }
      } else {
        await projectsApi.create(submitData);
        toast.success("Project created successfully");
      }
      
      // Redirect back to list
      router.push("/admin/projects");
      router.refresh();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to save project");
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold font-clash text-text-primary">
              {project ? "Edit Project" : "New Project"}
            </h1>
            {isDraft && <span className="px-2 py-0.5 rounded text-xs font-mono bg-primary/10 text-primary">DRAFT</span>}
          </div>
          {isDirty && <p className="text-sm text-yellow-500 mt-1">Unsaved changes</p>}
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            type="button" 
            onClick={() => router.push("/admin/projects")} 
            className="px-4 py-2 text-text-secondary hover:text-text-primary transition-colors text-sm font-medium"
          >
            Cancel
          </button>
          
          {project && (
            <Link 
              href={`/projects/${project.slug}?preview=true`} 
              target="_blank"
              className="px-4 py-2 bg-white/5 border border-border text-text-primary hover:bg-white/10 rounded-lg transition-colors text-sm font-medium flex items-center gap-2"
            >
              <Eye size={16} /> Preview
            </Link>
          )}

          <button
            type="submit"
            onClick={() => setSubmitAction("draft")}
            disabled={isSubmitting || (!isDirty && !isDraft)}
            className="px-4 py-2 bg-white/5 border border-border/60 text-text-primary text-sm font-medium rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50"
          >
            Save Draft
          </button>

          <button 
            type="submit"
            onClick={() => setSubmitAction("publish")}
            disabled={isSubmitting || !isDirty} 
            className="px-6 py-2 bg-primary text-bg font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2 text-sm hover:bg-primary/90"
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-bg border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Save size={16} />
            )}
            Publish
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          
          {/* Basic Information */}
          <Section title="Basic Information">
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-text-secondary">Project Title *</label>
                <input {...register("title")} className="w-full bg-white/5 border border-border rounded-lg px-4 py-2.5 text-text-primary focus:outline-none focus:border-primary transition-colors" />
                {errors.title && <p className="text-red-400 text-xs">{errors.title.message}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-text-secondary">Short Description *</label>
                <textarea {...register("shortDescription")} rows={2} className="w-full bg-white/5 border border-border rounded-lg px-4 py-2.5 text-text-primary focus:outline-none focus:border-primary transition-colors resize-none" />
                {errors.shortDescription && <p className="text-red-400 text-xs">{errors.shortDescription.message}</p>}
              </div>
            </div>
          </Section>

          {/* Case Study */}
          <Section title="Case Study & Content">
            <Composer 
              contentField="content" 
              mediaField="media"
              control={control}
              watch={watch}
              setValue={setValue as any}
            />
            {/* Legacy Fields Toggle (Optional if you want to keep them visible) */}
          </Section>
        </div>

        <div className="space-y-6">
          {/* Visibility & Organization */}
          <Section title="Visibility & Status">
            <div className="space-y-6">
              <div className="flex flex-col gap-4">
                <label className="flex items-center justify-between cursor-pointer p-3 rounded-lg border border-border bg-white/5 hover:bg-white/10 transition-colors">
                  <span className="text-sm font-medium text-text-primary">Publish Project</span>
                  <input type="checkbox" {...register("published")} className="w-5 h-5 rounded border-border bg-black text-primary accent-primary" />
                </label>
                <label className="flex items-center justify-between cursor-pointer p-3 rounded-lg border border-border bg-white/5 hover:bg-white/10 transition-colors">
                  <span className="text-sm font-medium text-text-primary">Featured Project</span>
                  <input type="checkbox" {...register("featured")} className="w-5 h-5 rounded border-border bg-black text-primary accent-primary" />
                </label>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-text-secondary">Project Status</label>
                <select {...register("status")} className="w-full bg-white/5 border border-border rounded-lg px-4 py-2.5 text-text-primary focus:outline-none focus:border-primary [&>option]:bg-[#0a0a0a]">
                  <option value="idea">Idea</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-text-secondary">Display Order (Lower is first)</label>
                <input type="number" {...register("order", { valueAsNumber: true })} className="w-full bg-white/5 border border-border rounded-lg px-4 py-2.5 text-text-primary focus:outline-none focus:border-primary" />
              </div>
              
              <div className="space-y-1">
                <label className="text-sm font-medium text-text-secondary">Category</label>
                <input {...register("category")} className="w-full bg-white/5 border border-border rounded-lg px-4 py-2.5 text-text-primary focus:outline-none focus:border-primary" />
              </div>
              
              <div className="space-y-1">
                <label className="text-sm font-medium text-text-secondary">Slug Override (Optional)</label>
                <input {...register("slug")} placeholder="Auto-generated if empty" className="w-full bg-white/5 border border-border rounded-lg px-4 py-2.5 text-text-primary focus:outline-none focus:border-primary text-sm font-mono" />
                {errors.slug && <p className="text-red-400 text-xs">{errors.slug.message}</p>}
              </div>
            </div>
          </Section>

          {/* Technical */}
          <Section title="Technical Details">
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-text-secondary">GitHub URL</label>
                <input {...register("githubUrl")} className="w-full bg-white/5 border border-border rounded-lg px-4 py-2.5 text-text-primary focus:outline-none focus:border-primary" />
                {errors.githubUrl && <p className="text-red-400 text-xs">{errors.githubUrl.message}</p>}
              </div>
              
              <div className="space-y-1">
                <label className="text-sm font-medium text-text-secondary">Live URL</label>
                <input {...register("liveUrl")} className="w-full bg-white/5 border border-border rounded-lg px-4 py-2.5 text-text-primary focus:outline-none focus:border-primary" />
                {errors.liveUrl && <p className="text-red-400 text-xs">{errors.liveUrl.message}</p>}
              </div>
              
              <div className="space-y-2 pt-2">
                <label className="text-sm font-medium text-text-secondary">Tech Stack</label>
                <div className="space-y-2">
                  {techFields.map((field, index) => (
                    <div key={field.id} className="flex gap-2">
                      <input {...register(`technologies.${index}`)} className="flex-1 bg-white/5 border border-border rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:border-primary text-sm" placeholder="e.g. Next.js" />
                      <button type="button" onClick={() => removeTech(index)} className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
                <button type="button" onClick={() => appendTech("")} className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-colors mt-2">
                  <Plus size={16} /> Add Tech
                </button>
              </div>
            </div>
          </Section>
        </div>
      </div>
    </form>
  );
}
