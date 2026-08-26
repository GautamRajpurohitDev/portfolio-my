"use client";

import React from "react";
import JourneyForm from "@/components/admin/forms/JourneyForm";

export default function NewJourneyPage() {
  return (
    <div className="pb-12">
      <JourneyForm journey={null} />
    </div>
  );
}
