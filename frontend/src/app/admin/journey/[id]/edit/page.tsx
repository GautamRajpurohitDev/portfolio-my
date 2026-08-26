"use client";

import React, { useEffect, useState } from "react";
import JourneyForm from "@/components/admin/forms/JourneyForm";
import { journeyApi } from "@/lib/api";
import { JourneyEntry } from "@/types";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function EditJourneyPage() {
  const params = useParams();
  const router = useRouter();
  const journeyId = params.id as string;
  
  const [journey, setJourney] = useState<JourneyEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchJourney = async () => {
      try {
        const res = await journeyApi.getAllAdmin();
        const found = res.data.data.find((j: JourneyEntry) => j._id === journeyId);
        
        if (!found) {
          toast.error("Journey entry not found");
          router.push("/admin/journey");
          return;
        }
        
        setJourney(found);
      } catch (error) {
        toast.error("Failed to load journey details");
        router.push("/admin/journey");
      } finally {
        setIsLoading(false);
      }
    };
    
    if (journeyId) {
      fetchJourney();
    }
  }, [journeyId, router]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-text-muted text-sm uppercase tracking-widest font-medium">Loading entry...</p>
      </div>
    );
  }

  return (
    <div className="pb-12">
      <JourneyForm journey={journey} />
    </div>
  );
}
