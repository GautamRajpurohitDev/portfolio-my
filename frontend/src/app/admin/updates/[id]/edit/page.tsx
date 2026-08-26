"use client";

import React, { useEffect, useState } from "react";
import UpdateForm from "@/components/admin/forms/UpdateForm";
import { updatesApi } from "@/lib/api";
import { Update } from "@/types";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function EditUpdatePage() {
  const params = useParams();
  const router = useRouter();
  const updateId = params.id as string;
  
  const [update, setUpdate] = useState<Update | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUpdate = async () => {
      try {
        const res = await updatesApi.getAllAdmin();
        const found = res.data.data.find((u: Update) => u._id === updateId);
        
        if (!found) {
          toast.error("Update not found");
          router.push("/admin/updates");
          return;
        }
        
        setUpdate(found);
      } catch (error) {
        toast.error("Failed to load update details");
        router.push("/admin/updates");
      } finally {
        setIsLoading(false);
      }
    };
    
    if (updateId) {
      fetchUpdate();
    }
  }, [updateId, router]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-text-muted text-sm uppercase tracking-widest font-medium">Loading update...</p>
      </div>
    );
  }

  return (
    <div className="pb-12">
      <UpdateForm update={update} />
    </div>
  );
}
