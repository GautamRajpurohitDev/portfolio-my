"use client";

import React from "react";
import CertificateForm from "@/components/admin/forms/CertificateForm";

export default function NewCertificatePage() {
  return (
    <div className="pb-12">
      <CertificateForm certificate={null} />
    </div>
  );
}
