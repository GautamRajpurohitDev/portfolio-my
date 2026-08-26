"use client";

import React from "react";
import MilestoneForm from "@/components/admin/forms/MilestoneForm";

export default function NewMilestonePage() {
  return (
    <div className="pb-12">
      <MilestoneForm milestone={null} />
    </div>
  );
}
