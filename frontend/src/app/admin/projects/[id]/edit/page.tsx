"use client";

import React, { useEffect, useState } from "react";
import ProjectForm from "@/components/admin/forms/ProjectForm";
import { projectsApi } from "@/lib/api";
import { Project } from "@/types";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function EditProjectPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await projectsApi.getAdminById(projectId, true);
        setProject(res.data.data);
      } catch (error) {
        toast.error("Failed to load project details");
        router.push("/admin/projects");
      } finally {
        setIsLoading(false);
      }
    };
    
    if (projectId) {
      fetchProject();
    }
  }, [projectId, router]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-text-muted text-sm uppercase tracking-widest font-medium">Loading project...</p>
      </div>
    );
  }

  return (
    <div className="pb-12">
      <ProjectForm project={project} />
    </div>
  );
}
