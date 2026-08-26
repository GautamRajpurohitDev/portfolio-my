"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { certificatesApi } from "@/lib/api";
import { Certificate } from "@/types";
import toast from "react-hot-toast";
import { Save, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { Composer } from "../composer/Composer";

const certificateSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  provider: z.string().min(1, "Provider is required").max(100),
  credentialId: z.string().optional().default(""),
  credentialUrl: z.string().url("Invalid URL").optional().or(z.literal("")).default(""),
  date: z.string().min(1, "Date is required"),
  media: z.array(z.object({
    url: z.string(),
    mimeType: z.string(),
    alt: z.string().optional().default(""),
    order: z.number().int().optional().default(0),
  })).optional().default([]),
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
          featured: certificate.featured,
          published: certificate.published,
          order: certificate.order,
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

  const onSubmit = async (data: CertificateFormData) => {
    setIsSubmitting(true);
    try {
      const submitData: any = { ...data, date: new Date(data.date).toISOString() };
      if (!submitData.credentialUrl) delete submitData.credentialUrl;

      if (certificate) {
        await certificatesApi.update(certificate._id, submitData);
        toast.success("Certificate updated");
      } else {
        await certificatesApi.create(submitData);
        toast.success("Certificate created");
      }
      
      router.push("/admin/certificates");
      router.refresh();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to save certificate");
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
            {certificate ? "Edit Certificate" : "New Certificate"}
          </h1>
          {isDirty && <p className="text-sm text-yellow-500 mt-1">Unsaved changes</p>}
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            type="button" 
            onClick={() => router.push("/admin/certificates")} 
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
            {isSubmitting ? "Saving..." : (isPublished ? "Publish Certificate" : "Save Draft")}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          
          <Section title="Certificate Information">
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-text-secondary">Title *</label>
                <input {...register("title")} className="w-full bg-white/5 border border-border rounded-lg px-4 py-2.5 text-text-primary focus:outline-none focus:border-primary transition-colors" />
                {errors.title && <p className="text-red-400 text-xs">{errors.title.message}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-text-secondary">Provider / Organization * (e.g. AWS, Coursera)</label>
                <input {...register("provider")} className="w-full bg-white/5 border border-border rounded-lg px-4 py-2.5 text-text-primary focus:outline-none focus:border-primary transition-colors" />
                {errors.provider && <p className="text-red-400 text-xs">{errors.provider.message}</p>}
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
            </div>
          </Section>

          <Section title="Credential Details">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-text-secondary">Credential ID</label>
                  <input {...register("credentialId")} className="w-full bg-white/5 border border-border rounded-lg px-4 py-2.5 text-text-primary focus:outline-none focus:border-primary transition-colors font-mono text-sm" />
                </div>
                
                <div className="space-y-1">
                  <label className="text-sm font-medium text-text-secondary">Issue Date *</label>
                  <input type="date" {...register("date")} className="w-full bg-white/5 border border-border rounded-lg px-4 py-2.5 text-text-primary focus:outline-none focus:border-primary [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert" />
                  {errors.date && <p className="text-red-400 text-xs">{errors.date.message}</p>}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-text-secondary">Credential URL (Link to verify)</label>
                <input {...register("credentialUrl")} className="w-full bg-white/5 border border-border rounded-lg px-4 py-2.5 text-text-primary focus:outline-none focus:border-primary transition-colors text-sm" />
                {errors.credentialUrl && <p className="text-red-400 text-xs">{errors.credentialUrl.message}</p>}
              </div>
            </div>
          </Section>
        </div>

        <div className="space-y-6">
          <Section title="Visibility & Status">
            <div className="space-y-6">
              <div className="flex flex-col gap-4">
                <label className="flex items-center justify-between cursor-pointer p-3 rounded-lg border border-border bg-white/5 hover:bg-white/10 transition-colors">
                  <span className="text-sm font-medium text-text-primary">Publish</span>
                  <input type="checkbox" {...register("published")} className="w-5 h-5 rounded border-border bg-black text-primary accent-primary" />
                </label>
                <label className="flex items-center justify-between cursor-pointer p-3 rounded-lg border border-border bg-white/5 hover:bg-white/10 transition-colors">
                  <span className="text-sm font-medium text-text-primary">Featured</span>
                  <input type="checkbox" {...register("featured")} className="w-5 h-5 rounded border-border bg-black text-primary accent-primary" />
                </label>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-text-secondary">Display Order (Lower is first)</label>
                <input type="number" {...register("order", { valueAsNumber: true })} className="w-full bg-white/5 border border-border rounded-lg px-4 py-2.5 text-text-primary focus:outline-none focus:border-primary" />
              </div>
            </div>
          </Section>

        </div>
      </div>
    </form>
  );
}
