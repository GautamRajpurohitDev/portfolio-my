"use client";

import React, { useEffect, useState } from "react";
import SkillForm from "@/components/admin/forms/SkillForm";
import { skillsApi } from "@/lib/api";
import { Skill } from "@/types";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function EditSkillPage() {
  const params = useParams();
  const router = useRouter();
  const skillId = params.id as string;
  
  const [skill, setSkill] = useState<Skill | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSkill = async () => {
      try {
        const res = await skillsApi.getAllAdmin();
        const found = res.data.data.find((s: Skill) => s._id === skillId);
        
        if (!found) {
          toast.error("Skill not found");
          router.push("/admin/skills");
          return;
        }
        
        setSkill(found);
      } catch (error) {
        toast.error("Failed to load skill details");
        router.push("/admin/skills");
      } finally {
        setIsLoading(false);
      }
    };
    
    if (skillId) {
      fetchSkill();
    }
  }, [skillId, router]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-text-muted text-sm uppercase tracking-widest font-medium">Loading skill...</p>
      </div>
    );
  }

  return (
    <div className="pb-12">
      <SkillForm skill={skill} />
    </div>
  );
}
