"use client";

import React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle } from "lucide-react";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void | Promise<void>;
  destructive?: boolean;
  isLoading?: boolean;
}

export default function ConfirmDialog({
  open,
  onOpenChange,
  title = "Are you sure?",
  description = "This action cannot be undone.",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  destructive = true,
  isLoading = false,
}: ConfirmDialogProps) {
  const handleConfirm = async () => {
    await onConfirm();
    onOpenChange(false);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <AnimatePresence>
          {open && (
            <>
              {/* Backdrop */}
              <Dialog.Overlay asChild>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[300]"
                />
              </Dialog.Overlay>

              {/* Dialog */}
              <Dialog.Content asChild>
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 8 }}
                  transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                  className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[301] w-full max-w-sm"
                >
                  <div className="bg-bg-card border border-border rounded-xl shadow-2xl p-6 mx-4">
                    {/* Icon + Title */}
                    <div className="flex items-start gap-4 mb-4">
                      {destructive && (
                        <div className="flex-shrink-0 w-10 h-10 bg-red-500/10 rounded-lg flex items-center justify-center mt-0.5">
                          <AlertTriangle size={18} className="text-red-400" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <Dialog.Title className="text-base font-semibold text-text-primary font-clash">
                          {title}
                        </Dialog.Title>
                        <Dialog.Description className="text-sm text-text-secondary mt-1 leading-relaxed">
                          {description}
                        </Dialog.Description>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 mt-6">
                      <Dialog.Close asChild>
                        <button
                          className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary bg-white/5 hover:bg-white/10 border border-border rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                          disabled={isLoading}
                        >
                          {cancelLabel}
                        </button>
                      </Dialog.Close>
                      <button
                        onClick={handleConfirm}
                        disabled={isLoading}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ${
                          destructive
                            ? "bg-red-500/90 hover:bg-red-500 text-white focus-visible:ring-red-500"
                            : "bg-primary hover:bg-primary/90 text-bg focus-visible:ring-primary"
                        }`}
                      >
                        {isLoading && (
                          <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        )}
                        {confirmLabel}
                      </button>
                    </div>
                  </div>
                </motion.div>
              </Dialog.Content>
            </>
          )}
        </AnimatePresence>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
