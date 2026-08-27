"use client";

import React, { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import {
  X,
  Copy,
  Check,
  ExternalLink,
  Trash2,
  Upload,
  Film,
  FileText,
  Image as ImageIcon,
  Save,
  Clock,
  HardDrive,
  Edit3,
} from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";
import { mediaApi } from "@/lib/api";
import { AdminBadge } from "@/components/admin/ui/AdminBadge";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

function formatBytes(bytes: number, decimals = 1) {
  if (!bytes) return "0 B";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

interface AssetDetailModalProps {
  asset: any | null;
  isOpen: boolean;
  onClose: () => void;
  onAssetUpdated: (updated: any) => void;
  onAssetDeleted: (id: string) => void;
  onUseAsset?: (url: string) => void;
}

export function AssetDetailModal({
  asset,
  isOpen,
  onClose,
  onAssetUpdated,
  onAssetDeleted,
  onUseAsset,
}: AssetDetailModalProps) {
  const [altText, setAltText] = useState(asset?.alt || "");
  const [isSavingAlt, setIsSavingAlt] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isReplacing, setIsReplacing] = useState(false);

  // Sync alt when asset changes
  React.useEffect(() => {
    if (asset) {
      setAltText(asset.alt || "");
    }
  }, [asset]);

  if (!asset) return null;

  const fullUrl = asset.url.startsWith("http")
    ? asset.url
    : `${API_BASE}${asset.url}`;

  const isImage = asset.mimeType?.startsWith("image/");
  const isVideo = asset.mimeType?.startsWith("video/");
  const isPdf = asset.mimeType === "application/pdf";

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    toast.success("Public URL copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveAlt = async () => {
    setIsSavingAlt(true);
    try {
      const res = await mediaApi.update(asset._id, { alt: altText });
      onAssetUpdated(res.data.data);
      toast.success("Alt text updated");
    } catch {
      toast.error("Failed to update alt text");
    } finally {
      setIsSavingAlt(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${asset.originalName}"?`)) {
      return;
    }

    setIsDeleting(true);
    try {
      await mediaApi.delete(asset._id);
      toast.success("Asset deleted");
      onAssetDeleted(asset._id);
      onClose();
    } catch (err: any) {
      if (err.response?.status === 409) {
        toast.error(err.response.data.message, { duration: 6000 });
      } else {
        toast.error("Failed to delete asset");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const handleReplaceFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsReplacing(true);
    const formData = new FormData();
    formData.append("files", file);

    try {
      const res = await mediaApi.upload(formData);
      const newAsset = res.data.data[0];
      if (newAsset) {
        toast.success("New asset uploaded successfully");
        onAssetUpdated(newAsset);
        onClose();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Replacement upload failed");
    } finally {
      setIsReplacing(false);
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm animate-fadeIn" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-[#101010] border border-border/80 rounded-2xl p-6 sm:p-8 shadow-2xl focus:outline-none animate-scaleIn">
          <div className="flex items-start justify-between gap-4 border-b border-border/50 pb-4 mb-6">
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-primary font-bold uppercase tracking-widest">
                  Asset Details
                </span>
                <span className="text-border/60">·</span>
                <span className="text-[11px] font-mono text-text-muted uppercase">
                  {asset.mimeType}
                </span>
              </div>
              <Dialog.Title className="text-lg sm:text-xl font-clash font-bold text-text-primary truncate">
                {asset.originalName}
              </Dialog.Title>
            </div>

            <Dialog.Close asChild>
              <button
                type="button"
                className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/[0.05] transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </Dialog.Close>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            {/* Left: Preview Frame (7 cols) */}
            <div className="md:col-span-7 space-y-4">
              <div className="relative w-full aspect-video sm:aspect-square md:aspect-4/3 rounded-xl bg-[#090909] border border-border/70 overflow-hidden flex items-center justify-center">
                {isImage ? (
                  <Image
                    src={fullUrl}
                    alt={asset.alt || asset.originalName}
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 100vw, 500px"
                    unoptimized
                  />
                ) : isVideo ? (
                  <video
                    src={fullUrl}
                    controls
                    className="max-h-full max-w-full"
                  />
                ) : isPdf ? (
                  <div className="flex flex-col items-center gap-2 text-text-muted p-6 text-center">
                    <FileText size={48} className="text-primary" />
                    <span className="text-xs font-mono">PDF Document</span>
                    <a
                      href={fullUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 text-xs font-mono text-primary underline"
                    >
                      Open PDF in Viewer ↗
                    </a>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-text-muted">
                    <FileText size={48} />
                    <span className="text-xs font-mono">{asset.mimeType}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons Cluster */}
              <div className="flex items-center gap-2 flex-wrap">
                {onUseAsset && (
                  <button
                    type="button"
                    onClick={() => {
                      onUseAsset(asset.url);
                      onClose();
                    }}
                    className="px-4 py-2 bg-primary text-[#090909] rounded-lg text-xs font-clash font-bold hover:bg-primary/90 transition-all cursor-pointer shadow-xs"
                  >
                    Use Asset in Editor
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleCopyUrl}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border/70 bg-white/[0.03] hover:bg-white/[0.07] text-xs font-medium text-text-primary transition-colors cursor-pointer"
                >
                  {copied ? <Check size={13} className="text-success" /> : <Copy size={13} />}
                  <span>{copied ? "Copied!" : "Copy URL"}</span>
                </button>

                <a
                  href={fullUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border/70 bg-white/[0.03] hover:bg-white/[0.07] text-xs font-medium text-text-primary transition-colors"
                >
                  <ExternalLink size={13} />
                  <span>Open ↗</span>
                </a>

                {/* Replace File Button */}
                <label className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border/70 bg-white/[0.03] hover:bg-white/[0.07] text-xs font-medium text-text-primary transition-colors cursor-pointer">
                  <Upload size={13} className="text-text-muted" />
                  <span>{isReplacing ? "Uploading…" : "Replace"}</span>
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleReplaceFile}
                    disabled={isReplacing}
                  />
                </label>

                {/* Delete Button */}
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-red-500/30 bg-red-500/5 hover:bg-red-500/10 text-xs font-medium text-red-400 transition-colors ml-auto cursor-pointer"
                >
                  <Trash2 size={13} />
                  <span>Delete</span>
                </button>
              </div>
            </div>

            {/* Right: Metadata & Alt Text (5 cols) */}
            <div className="md:col-span-5 space-y-6">
              {/* Metadata Table */}
              <div className="p-4 rounded-xl bg-white/[0.02] border border-border/50 space-y-3 text-xs">
                <h4 className="text-[10px] font-mono font-semibold uppercase tracking-wider text-text-muted border-b border-border/30 pb-1.5">
                  File Properties
                </h4>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-text-muted font-mono text-[11px]">File Size:</span>
                    <span className="font-mono text-text-primary">{formatBytes(asset.size)}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-text-muted font-mono text-[11px]">MIME Type:</span>
                    <span className="font-mono text-text-primary">{asset.mimeType}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-text-muted font-mono text-[11px]">Uploaded:</span>
                    <span className="font-mono text-text-secondary">
                      {new Date(asset.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Alt Text Form */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-text-secondary">
                    Alt Text (Accessibility)
                  </label>
                  <button
                    type="button"
                    onClick={handleSaveAlt}
                    disabled={isSavingAlt}
                    className="text-[11px] font-mono text-primary hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-50"
                  >
                    <Save size={11} />
                    <span>Save Alt</span>
                  </button>
                </div>
                <textarea
                  rows={3}
                  value={altText}
                  onChange={(e) => setAltText(e.target.value)}
                  placeholder="Describe this image for screen readers and SEO..."
                  className="w-full bg-white/[0.03] border border-border/70 rounded-lg p-3 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary/50 leading-relaxed font-body"
                />
              </div>

              {/* Public URL Box */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-text-secondary">
                  Relative Asset Path
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={asset.url}
                    className="flex-1 h-9 bg-white/[0.02] border border-border/70 rounded-lg px-3 text-[11px] font-mono text-text-muted select-all"
                  />
                  <button
                    type="button"
                    onClick={handleCopyUrl}
                    className="h-9 px-3 rounded-lg border border-border/70 bg-white/[0.03] hover:bg-white/[0.07] text-text-primary text-xs cursor-pointer"
                  >
                    <Copy size={12} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export default AssetDetailModal;
