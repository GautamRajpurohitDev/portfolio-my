"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import toast from "react-hot-toast";

interface UseDraftRecoveryOptions<T> {
  storageKey: string;
  isDirty: boolean;
  getValues: () => T;
  resetForm: (values: T) => void;
  serverUpdatedAt?: string | Date | null;
  onSaveShortcut?: () => void;
}

export function useDraftRecovery<T extends Record<string, any>>({
  storageKey,
  isDirty,
  getValues,
  resetForm,
  serverUpdatedAt,
  onSaveShortcut,
}: UseDraftRecoveryOptions<T>) {
  const [hasRecoverableDraft, setHasRecoverableDraft] = useState(false);
  const [recoveredValues, setRecoveredValues] = useState<T | null>(null);
  const key = `draft_recovery_${storageKey}`;

  // Check for local draft on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.data && parsed.timestamp) {
          const draftTime = new Date(parsed.timestamp).getTime();
          const serverTime = serverUpdatedAt
            ? new Date(serverUpdatedAt).getTime()
            : 0;

          // If draft is newer than server data by > 2 seconds
          if (draftTime > serverTime + 2000) {
            setHasRecoverableDraft(true);
            setRecoveredValues(parsed.data);
          }
        }
      }
    } catch {}
  }, [key, serverUpdatedAt]);

  // Persist dirty form state to local backup every 3 seconds
  useEffect(() => {
    if (!isDirty) return;

    const timer = setInterval(() => {
      try {
        const currentData = getValues();
        if (currentData) {
          localStorage.setItem(
            key,
            JSON.stringify({
              data: currentData,
              timestamp: new Date().toISOString(),
            })
          );
        }
      } catch {}
    }, 3000);

    return () => clearInterval(timer);
  }, [isDirty, getValues, key]);

  // Prevent accidental tab/window close when dirty
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  // Ctrl+S / Cmd+S shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        if (onSaveShortcut) {
          onSaveShortcut();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onSaveShortcut]);

  // Restore local draft
  const restoreDraft = useCallback(() => {
    if (recoveredValues) {
      resetForm(recoveredValues);
      setHasRecoverableDraft(false);
      toast.success("Local draft restored");
    }
  }, [recoveredValues, resetForm]);

  // Discard local draft
  const discardDraft = useCallback(() => {
    try {
      localStorage.removeItem(key);
    } catch {}
    setHasRecoverableDraft(false);
    setRecoveredValues(null);
    toast("Local draft discarded", { icon: "🗑️" });
  }, [key]);

  // Clear backup upon successful authoritative server save
  const clearDraftBackup = useCallback(() => {
    try {
      localStorage.removeItem(key);
    } catch {}
    setHasRecoverableDraft(false);
    setRecoveredValues(null);
  }, [key]);

  return {
    hasRecoverableDraft,
    restoreDraft,
    discardDraft,
    clearDraftBackup,
  };
}

export default useDraftRecovery;
