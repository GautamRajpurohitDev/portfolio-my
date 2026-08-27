"use client";

import { useState, useEffect, useCallback } from "react";

export interface RecentEditItem {
  id: string;
  title: string;
  collection: "projects" | "journey" | "updates" | "skills" | "certificates" | "milestones" | "media" | "resume" | "settings";
  editUrl: string;
  previewUrl?: string;
  timestamp: string;
}

export type TableDensity = "comfortable" | "compact";

const PINNED_STORAGE_KEY = "admin_pinned_workspaces";
const RECENT_EDITS_STORAGE_KEY = "admin_recent_edits";
const TABLE_DENSITY_STORAGE_KEY = "admin_table_density";

const DEFAULT_PINNED = ["/admin/projects", "/admin/journey", "/admin/skills", "/admin/media"];

export function useAdminWorkspace() {
  const [pinnedRoutes, setPinnedRoutes] = useState<string[]>([]);
  const [recentEdits, setRecentEdits] = useState<RecentEditItem[]>([]);
  const [tableDensity, setTableDensityState] = useState<TableDensity>("comfortable");
  const [isOnline, setIsOnline] = useState<boolean>(true);

  // Initialize from localStorage on client
  useEffect(() => {
    try {
      const savedPinned = localStorage.getItem(PINNED_STORAGE_KEY);
      if (savedPinned) {
        setPinnedRoutes(JSON.parse(savedPinned));
      } else {
        setPinnedRoutes(DEFAULT_PINNED);
      }

      const savedEdits = localStorage.getItem(RECENT_EDITS_STORAGE_KEY);
      if (savedEdits) {
        setRecentEdits(JSON.parse(savedEdits));
      }

      const savedDensity = localStorage.getItem(TABLE_DENSITY_STORAGE_KEY) as TableDensity;
      if (savedDensity === "comfortable" || savedDensity === "compact") {
        setTableDensityState(savedDensity);
      }
    } catch {
      // Fallback
    }

    // Online / Offline browser detection
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    setIsOnline(typeof navigator !== "undefined" ? navigator.onLine : true);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Toggle Pinned
  const togglePin = useCallback((route: string) => {
    setPinnedRoutes((prev) => {
      const exists = prev.includes(route);
      const next = exists ? prev.filter((r) => r !== route) : [...prev, route];
      try {
        localStorage.setItem(PINNED_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Safe catch
      }
      return next;
    });
  }, []);

  const isPinned = useCallback(
    (route: string) => pinnedRoutes.includes(route),
    [pinnedRoutes]
  );

  // Track Recent Content Edit
  const trackRecentEdit = useCallback((item: Omit<RecentEditItem, "timestamp">) => {
    setRecentEdits((prev) => {
      const filtered = prev.filter((e) => !(e.id === item.id && e.collection === item.collection));
      const next: RecentEditItem[] = [
        { ...item, timestamp: new Date().toISOString() },
        ...filtered,
      ].slice(0, 8); // Store up to 8 recent edits

      try {
        localStorage.setItem(RECENT_EDITS_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Safe catch
      }
      return next;
    });
  }, []);

  // Set Table Density
  const setTableDensity = useCallback((density: TableDensity) => {
    setTableDensityState(density);
    try {
      localStorage.setItem(TABLE_DENSITY_STORAGE_KEY, density);
    } catch {
      // Safe catch
    }
  }, []);

  return {
    pinnedRoutes,
    togglePin,
    isPinned,
    recentEdits,
    trackRecentEdit,
    tableDensity,
    setTableDensity,
    isOnline,
  };
}
