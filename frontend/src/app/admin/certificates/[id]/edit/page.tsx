"use client";

import React, { useEffect, useState } from "react";
import CertificateForm from "@/components/admin/forms/CertificateForm";
import { certificatesApi } from "@/lib/api";
import { Certificate } from "@/types";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function EditCertificatePage() {
  const params = useParams();
  const router = useRouter();
  const certificateId = params.id as string;
  
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCertificate = async () => {
      try {
        const res = await certificatesApi.getAllAdmin();
        const found = res.data.data.find((c: Certificate) => c._id === certificateId);
        
        if (!found) {
          toast.error("Certificate not found");
          router.push("/admin/certificates");
          return;
        }
        
        setCertificate(found);
      } catch (error) {
        toast.error("Failed to load certificate details");
        router.push("/admin/certificates");
      } finally {
        setIsLoading(false);
      }
    };
    
    if (certificateId) {
      fetchCertificate();
    }
  }, [certificateId, router]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-text-muted text-sm uppercase tracking-widest font-medium">Loading certificate...</p>
      </div>
    );
  }

  return (
    <div className="pb-12">
      <CertificateForm certificate={certificate} />
    </div>
  );
}
