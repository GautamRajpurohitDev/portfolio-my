"use client";

import React from "react";
import ProjectForm from "@/components/admin/forms/ProjectForm";

export default function NewProjectPage() {
  return (
    <div className="pb-12">
      <ProjectForm project={null} />
    </div>
  );
}
