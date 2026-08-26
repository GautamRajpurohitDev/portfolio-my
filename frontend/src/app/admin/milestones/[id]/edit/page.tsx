"use client";

import React, { useEffect, useState } from "react";
import MilestoneForm from "@/components/admin/forms/MilestoneForm";
import { milestonesApi } from "@/lib/api";
import { Milestone } from "@/types";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function EditMilestonePage() {
  const params = useParams();
  const router = useRouter();
  const milestoneId = params.id as string;
  
  const [milestone, setMilestone] = useState<Milestone | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMilestone = async () => {
      try {
        const res = await milestonesApi.getAllAdmin();
        const found = res.data.data.find((m: Milestone) => m._id === milestoneId);
        
        if (!found) {
          toast.error("Milestone not found");
          router.push("/admin/milestones");
          return;
        }
        
        setMilestone(found);
      } catch (error) {
        toast.error("Failed to load milestone details");
        router.push("/admin/milestones");
      } finally {
        setIsLoading(false);
      }
    };
    
    if (milestoneId) {
      fetchMilestone();
    }
  }, [milestoneId, router]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-text-muted text-sm uppercase tracking-widest font-medium">Loading milestone...</p>
      </div>
    );
  }

  return (
    <div className="pb-12">
      <MilestoneForm milestone={milestone} />
    </div>
  );
}
