"use client";

import React, { useEffect, useState } from "react";
import SettingsForm from "@/components/admin/forms/SettingsForm";
import { settingsApi } from "@/lib/api";
import { Settings } from "@/types";
import toast from "react-hot-toast";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await settingsApi.getAdmin(true); // Pass true to request draft
        setSettings(res.data.data);
      } catch {
        toast.error("Failed to load settings");
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-[11px] font-mono text-text-muted uppercase tracking-widest">
          Loading settings…
        </p>
      </div>
    );
  }

  return (
    <div className="pb-12">
      <SettingsForm settings={settings} />
    </div>
  );
}
