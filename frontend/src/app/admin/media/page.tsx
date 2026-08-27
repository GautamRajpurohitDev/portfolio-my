"use client";

import React, { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { mediaApi } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import {
  UploadCloud,
  Search,
  Trash2,
  Image as ImageIcon,
  Film,
  FileText,
  Copy,
  ExternalLink,
  RefreshCw,
  X,
  LayoutGrid,
  List,
  Filter,
  ArrowUpDown,
  Plus,
  Check,
  CheckSquare,
  Square,
  HardDrive,
} from "lucide-react";
import Image from "next/image";
import { AdminPageHeader } from "@/components/admin/ui/AdminPageHeader";
import { AdminBadge } from "@/components/admin/ui/AdminBadge";
import { AdminDataTable } from "@/components/admin/ui/AdminDataTable";
import { AdminButton } from "@/components/admin/ui/AdminButton";
import { AdminEmptyState } from "@/components/admin/ui/AdminEmptyState";
import { AssetDetailModal } from "@/components/admin/media/AssetDetailModal";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

function formatBytes(bytes: number, decimals = 1) {
  if (!bytes) return "0 B";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

type SortOption =
  | "newest"
  | "oldest"
  | "name-asc"
  | "name-desc"
  | "size-desc"
  | "size-asc";

export default function AdminMediaPage() {
  const [media, setMedia] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadStats, setUploadStats] = useState<{ current: number; total: number } | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [sortOption, setSortOption] = useState<SortOption>("newest");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  const [selectedAsset, setSelectedAsset] = useState<any | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isDragOver, setIsDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load view mode from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("admin_media_view_mode");
      if (saved === "grid" || saved === "table") {
        setViewMode(saved);
      }
    } catch {}
  }, []);

  const handleViewModeChange = (mode: "grid" | "table") => {
    setViewMode(mode);
    try {
      localStorage.setItem("admin_media_view_mode", mode);
    } catch {}
  };

  const fetchMedia = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const typeParam = filterType === "all" ? "" : filterType;
      const res = await mediaApi.getAll(typeParam, searchQuery);
      setMedia(res.data.data || []);
    } catch {
      toast.error("Failed to load media");
    } finally {
      setIsLoading(false);
      if (isManualRefresh) setIsRefreshing(false);
    }
  }, [filterType, searchQuery]);

  useEffect(() => {
    fetchMedia();
  }, [fetchMedia]);

  // Upload handler with progress simulation & multi-file support
  const handleUploadFiles = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadStats({ current: 0, total: files.length });
    setUploadProgress(15);

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append("files", files[i]);
    }

    try {
      setUploadProgress(60);
      const res = await mediaApi.upload(formData);
      setUploadProgress(100);
      toast.success(`${files.length} file${files.length > 1 ? "s" : ""} uploaded successfully`);

      // Inject new assets directly into state
      if (res.data.data) {
        setMedia((prev) => [...res.data.data, ...prev]);
      } else {
        fetchMedia();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Upload failed");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      setUploadStats(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleUploadFiles(e.dataTransfer.files);
    }
  };

  const copyToClipboard = (url: string) => {
    const fullUrl = url.startsWith("http") ? url : `${API_BASE}${url}`;
    navigator.clipboard.writeText(fullUrl);
    toast.success("URL copied to clipboard");
  };

  // Filter & sort assets in memory
  const processedMedia = useMemo(() => {
    let result = [...media];

    // Filter by type
    if (filterType === "image") {
      result = result.filter((m) => m.mimeType?.startsWith("image/"));
    } else if (filterType === "video") {
      result = result.filter((m) => m.mimeType?.startsWith("video/"));
    } else if (filterType === "document") {
      result = result.filter((m) => m.mimeType === "application/pdf");
    } else if (filterType === "gif") {
      result = result.filter((m) => m.mimeType === "image/gif");
    }

    // Filter by search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (m) =>
          m.originalName?.toLowerCase().includes(q) ||
          m.alt?.toLowerCase().includes(q) ||
          m.mimeType?.toLowerCase().includes(q)
      );
    }

    // Sort
    result.sort((a, b) => {
      if (sortOption === "newest") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortOption === "oldest") {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      if (sortOption === "name-asc") {
        return (a.originalName || "").localeCompare(b.originalName || "");
      }
      if (sortOption === "name-desc") {
        return (b.originalName || "").localeCompare(a.originalName || "");
      }
      if (sortOption === "size-desc") {
        return (b.size || 0) - (a.size || 0);
      }
      if (sortOption === "size-asc") {
        return (a.size || 0) - (b.size || 0);
      }
      return 0;
    });

    return result;
  }, [media, filterType, searchQuery, sortOption]);

  // Multi-select batch copy
  const handleBatchCopyUrls = () => {
    const selectedUrls = media
      .filter((m) => selectedIds.has(m._id))
      .map((m) => (m.url.startsWith("http") ? m.url : `${API_BASE}${m.url}`))
      .join("\n");

    if (selectedUrls) {
      navigator.clipboard.writeText(selectedUrls);
      toast.success(`${selectedIds.size} URL(s) copied`);
      setSelectedIds(new Set());
    }
  };

  const toggleSelectAsset = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // TanStack Table columns for List View
  const columns: ColumnDef<any>[] = useMemo(
    () => [
      {
        id: "select",
        header: () => (
          <button
            type="button"
            onClick={() => {
              if (selectedIds.size === processedMedia.length) {
                setSelectedIds(new Set());
              } else {
                setSelectedIds(new Set(processedMedia.map((m) => m._id)));
              }
            }}
            className="p-1 text-text-muted hover:text-text-primary"
          >
            {selectedIds.size > 0 && selectedIds.size === processedMedia.length ? (
              <CheckSquare size={14} className="text-primary" />
            ) : (
              <Square size={14} />
            )}
          </button>
        ),
        cell: ({ row }) => (
          <button
            type="button"
            onClick={(e) => toggleSelectAsset(row.original._id, e)}
            className="p-1 text-text-muted hover:text-text-primary"
          >
            {selectedIds.has(row.original._id) ? (
              <CheckSquare size={14} className="text-primary" />
            ) : (
              <Square size={14} />
            )}
          </button>
        ),
        enableSorting: false,
        size: 40,
      },
      {
        accessorKey: "preview",
        header: "Preview",
        cell: ({ row }) => {
          const item = row.original;
          const fullUrl = item.url.startsWith("http") ? item.url : `${API_BASE}${item.url}`;
          const isImg = item.mimeType?.startsWith("image/");
          return (
            <div
              onClick={() => setSelectedAsset(item)}
              className="w-10 h-10 rounded-lg bg-[#090909] border border-border/70 overflow-hidden relative flex items-center justify-center cursor-pointer"
            >
              {isImg ? (
                <Image
                  src={fullUrl}
                  alt={item.alt || item.originalName}
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : item.mimeType?.startsWith("video/") ? (
                <Film size={16} className="text-primary" />
              ) : (
                <FileText size={16} className="text-text-muted" />
              )}
            </div>
          );
        },
        size: 60,
      },
      {
        accessorKey: "originalName",
        header: "Filename",
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div
              onClick={() => setSelectedAsset(item)}
              className="space-y-0.5 cursor-pointer group"
            >
              <p className="font-mono text-xs font-semibold text-text-primary group-hover:text-primary transition-colors truncate max-w-xs">
                {item.originalName}
              </p>
              {item.alt && (
                <p className="text-[10px] text-text-muted truncate max-w-xs">
                  Alt: {item.alt}
                </p>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "mimeType",
        header: "Type",
        cell: ({ row }) => (
          <span className="font-mono text-[10.5px] text-text-muted uppercase">
            {row.original.mimeType}
          </span>
        ),
      },
      {
        accessorKey: "size",
        header: "Size",
        cell: ({ row }) => (
          <span className="font-mono text-[11px] text-text-secondary">
            {formatBytes(row.original.size)}
          </span>
        ),
      },
      {
        accessorKey: "createdAt",
        header: "Uploaded",
        cell: ({ row }) => (
          <span className="font-mono text-[11px] text-text-muted">
            {new Date(row.original.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => copyToClipboard(item.url)}
                className="p-1.5 rounded-md hover:bg-white/[0.05] text-text-muted hover:text-text-primary transition-colors cursor-pointer"
                title="Copy URL"
              >
                <Copy size={13} />
              </button>
              <button
                type="button"
                onClick={() => setSelectedAsset(item)}
                className="p-1.5 rounded-md hover:bg-white/[0.05] text-text-muted hover:text-text-primary transition-colors cursor-pointer"
                title="Inspect Details"
              >
                <ExternalLink size={13} />
              </button>
            </div>
          );
        },
        size: 80,
      },
    ],
    [selectedIds, processedMedia]
  );

  return (
    <div className="space-y-6 pb-20">
      {/* ── Page Header ─────────────────────────────────────────── */}
      <AdminPageHeader
        eyebrow="02 / CONTENT"
        title="Media Library"
        stats={`${media.length} Total Asset${media.length === 1 ? "" : "s"} · Images, GIFs, Videos, PDFs`}
        description="Centralized asset repository for case studies, portfolio graphics, and editorial attachments."
        actions={
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => fetchMedia(true)}
              disabled={isRefreshing}
              className="p-2 h-9 rounded border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.06] text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
              title="Refresh media"
            >
              <RefreshCw size={13} className={isRefreshing ? "animate-spin text-primary" : ""} />
            </button>

            <label className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded bg-primary text-[#080808] text-xs font-clash font-bold hover:bg-primary/90 transition-all cursor-pointer">
              <Plus size={14} strokeWidth={2.5} />
              <span>Upload Asset</span>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={(e) => e.target.files && handleUploadFiles(e.target.files)}
                accept="image/*,video/mp4,video/webm,application/pdf"
              />
            </label>
          </div>
        }
      />

      {/* ── Upload Drag Zone (Interactive) ────────────────────── */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`p-6 rounded-2xl border-2 border-dashed transition-all text-center flex flex-col items-center justify-center gap-2 cursor-pointer ${
          isDragOver
            ? "border-primary bg-primary/[0.05]"
            : "border-border/60 bg-[#101010] hover:border-border"
        }`}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-border/60 flex items-center justify-center text-primary">
          <UploadCloud size={20} />
        </div>
        <div>
          <p className="text-xs font-semibold text-text-primary font-clash">
            Drag and drop assets here, or click to browse
          </p>
          <p className="text-[11px] font-mono text-text-muted mt-0.5">
            PNG, JPG, WebP, GIF, MP4, WebM, PDF up to 50MB
          </p>
        </div>

        {/* Upload Progress Bar */}
        {isUploading && (
          <div className="w-full max-w-md mt-3 space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-mono text-text-muted">
              <span>Uploading {uploadStats?.total || 1} file(s)…</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* ── Search, Filters, Sort & View Toggle Toolbar ────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-[#101010] border border-border/70">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by filename or alt text…"
            className="w-full h-9 bg-white/[0.02] border border-border/70 rounded-lg pl-8 pr-3 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary/50 font-body"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-[11px] font-mono">
          {[
            { id: "all", label: "All" },
            { id: "image", label: "Images" },
            { id: "gif", label: "GIFs" },
            { id: "video", label: "Videos" },
            { id: "document", label: "Documents" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterType(tab.id)}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                filterType === tab.id
                  ? "bg-primary text-[#090909] font-bold"
                  : "bg-white/[0.02] border border-border/50 text-text-muted hover:text-text-primary"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Sort & View Toggle */}
        <div className="flex items-center gap-2 shrink-0">
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value as SortOption)}
            className="h-9 bg-white/[0.02] border border-border/70 rounded-lg px-2.5 text-xs font-mono text-text-secondary focus:outline-none focus:border-primary/50 [&>option]:bg-[#111] cursor-pointer"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="name-asc">Filename A–Z</option>
            <option value="name-desc">Filename Z–A</option>
            <option value="size-desc">Largest Size</option>
            <option value="size-asc">Smallest Size</option>
          </select>

          <div className="flex items-center bg-white/[0.02] border border-border/70 rounded-lg p-0.5">
            <button
              type="button"
              onClick={() => handleViewModeChange("grid")}
              className={`p-1.5 rounded cursor-pointer transition-colors ${
                viewMode === "grid" ? "bg-primary text-[#090909]" : "text-text-muted hover:text-text-primary"
              }`}
              title="Grid View"
            >
              <LayoutGrid size={14} />
            </button>
            <button
              type="button"
              onClick={() => handleViewModeChange("table")}
              className={`p-1.5 rounded cursor-pointer transition-colors ${
                viewMode === "table" ? "bg-primary text-[#090909]" : "text-text-muted hover:text-text-primary"
              }`}
              title="List View"
            >
              <List size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Multi-Select Batch Actions Bar ────────────────────── */}
      {selectedIds.size > 0 && (
        <div className="p-3 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-between gap-3 text-xs animate-fadeIn">
          <span className="font-mono text-primary font-semibold">
            {selectedIds.size} asset{selectedIds.size > 1 ? "s" : ""} selected
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleBatchCopyUrls}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-[#090909] font-clash font-bold hover:bg-primary/90 transition-all cursor-pointer"
            >
              <Copy size={12} />
              <span>Copy Selected URLs</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedIds(new Set())}
              className="px-3 py-1.5 rounded-lg border border-border/70 bg-white/[0.03] text-text-muted hover:text-text-primary transition-colors cursor-pointer"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* ── Main Content: Grid vs Table View ──────────────────── */}
      {isLoading ? (
        <div className="p-12 text-center text-text-muted font-mono text-xs">
          Loading media library…
        </div>
      ) : processedMedia.length === 0 ? (
        <AdminEmptyState
          title="No media assets found"
          description="Upload images, GIFs, videos, or documents to use throughout your portfolio."
          actionLabel="Upload Media"
          actionIcon={<Plus size={13} />}
          onAction={() => fileInputRef.current?.click()}
        />
      ) : viewMode === "grid" ? (
        /* ── Grid View ───────────────────────────────────────── */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {processedMedia.map((item) => {
            const fullUrl = item.url.startsWith("http") ? item.url : `${API_BASE}${item.url}`;
            const isImg = item.mimeType?.startsWith("image/");
            const isVid = item.mimeType?.startsWith("video/");
            const isSelected = selectedIds.has(item._id);

            return (
              <div
                key={item._id}
                onClick={() => setSelectedAsset(item)}
                className={`group relative rounded-xl bg-[#101010] border transition-all overflow-hidden flex flex-col justify-between cursor-pointer ${
                  isSelected
                    ? "border-primary ring-1 ring-primary"
                    : "border-border/70 hover:border-border hover:bg-white/[0.02]"
                }`}
              >
                {/* Checkbox */}
                <button
                  type="button"
                  onClick={(e) => toggleSelectAsset(item._id, e)}
                  className="absolute top-2 left-2 z-10 p-1 rounded-md bg-black/60 backdrop-blur-sm text-text-muted hover:text-primary transition-colors"
                >
                  {isSelected ? (
                    <CheckSquare size={13} className="text-primary" />
                  ) : (
                    <Square size={13} />
                  )}
                </button>

                {/* Thumbnail Container */}
                <div className="relative w-full aspect-square bg-[#090909] flex items-center justify-center overflow-hidden">
                  {isImg ? (
                    <Image
                      src={fullUrl}
                      alt={item.alt || item.originalName}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 768px) 50vw, 200px"
                      unoptimized
                    />
                  ) : isVid ? (
                    <div className="flex flex-col items-center gap-1.5 text-primary">
                      <Film size={24} />
                      <span className="text-[9.5px] font-mono uppercase">Video</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1.5 text-text-muted">
                      <FileText size={24} />
                      <span className="text-[9.5px] font-mono uppercase">Document</span>
                    </div>
                  )}
                </div>

                {/* Footer Metadata */}
                <div className="p-2.5 border-t border-border/50 space-y-0.5">
                  <p className="font-mono text-[11px] font-semibold text-text-primary truncate group-hover:text-primary transition-colors">
                    {item.originalName}
                  </p>
                  <div className="flex items-center justify-between text-[10px] font-mono text-text-muted">
                    <span>{formatBytes(item.size)}</span>
                    <span className="uppercase">{item.mimeType?.split("/")[1] || "file"}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ── List / Table View ───────────────────────────────── */
        <AdminDataTable
          columns={columns}
          data={processedMedia}
          searchPlaceholder="Filter listed assets…"
        />
      )}

      {/* ── Asset Detail Modal ───────────────────────────────── */}
      {selectedAsset && (
        <AssetDetailModal
          asset={selectedAsset}
          isOpen={Boolean(selectedAsset)}
          onClose={() => setSelectedAsset(null)}
          onAssetUpdated={(updated) => {
            setMedia((prev) =>
              prev.map((m) => (m._id === updated._id ? updated : m))
            );
            setSelectedAsset(updated);
          }}
          onAssetDeleted={(deletedId) => {
            setMedia((prev) => prev.filter((m) => m._id !== deletedId));
            setSelectedAsset(null);
          }}
        />
      )}
    </div>
  );
}
