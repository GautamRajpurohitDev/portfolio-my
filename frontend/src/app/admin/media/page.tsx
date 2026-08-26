"use client";

import React, { useEffect, useState, useRef } from "react";
import { mediaApi } from "@/lib/api";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { 
  UploadCloud, Search, Trash2, Image as ImageIcon, Film, FileText, 
  Copy, ExternalLink, RefreshCw, X 
} from "lucide-react";
import Image from "next/image";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default function AdminMediaPage() {
  const [media, setMedia] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchMedia = async () => {
    setIsLoading(true);
    try {
      const res = await mediaApi.getAll(filterType, searchTerm);
      setMedia(res.data.data);
    } catch (err) {
      toast.error("Failed to load media");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, [filterType, searchTerm]); // Debounce omitted for brevity

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append("files", files[i]);
    }

    try {
      await mediaApi.upload(formData);
      toast.success("Media uploaded successfully");
      fetchMedia();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Upload failed");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this file?")) return;
    
    try {
      await mediaApi.delete(id);
      toast.success("File deleted");
      setMedia(m => m.filter(item => item._id !== id));
    } catch (err: any) {
      // 409 Conflict is returned if it's in use
      if (err.response?.status === 409) {
        toast.error(err.response.data.message, { duration: 6000 });
      } else {
        toast.error("Failed to delete file");
      }
    }
  };

  const copyToClipboard = (url: string) => {
    const fullUrl = url.startsWith("http") ? url : `${API_BASE}${url}`;
    navigator.clipboard.writeText(fullUrl);
    toast.success("URL copied to clipboard");
  };

  return (
    <div className="max-w-6xl pb-12">
      {/* Header & Upload */}
      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-mono text-text-muted tracking-[0.18em] uppercase mb-3">Media / Assets</p>
          <h1 className="text-3xl font-clash font-bold text-text-primary">Media Library</h1>
        </div>
        
        <div>
          <input
            type="file"
            multiple
            className="hidden"
            ref={fileInputRef}
            onChange={handleUpload}
            accept="image/*,video/mp4,video/webm,application/pdf"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-bg text-sm font-semibold font-clash rounded-lg hover:bg-primary/90 transition-all disabled:opacity-50 whitespace-nowrap"
          >
            {isUploading ? <RefreshCw size={16} className="animate-spin" /> : <UploadCloud size={16} />}
            {isUploading ? "Uploading..." : "Upload Media"}
          </button>
        </div>
      </motion.div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-4 mb-8 bg-[#0f0f0f] border border-border/60 rounded-xl p-2">
        <div className="relative flex-1 w-full">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search files..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent border-none pl-10 pr-4 py-2.5 text-sm text-text-primary focus:outline-none"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary">
              <X size={14} />
            </button>
          )}
        </div>
        
        <div className="h-8 w-px bg-border/60 hidden sm:block" />
        
        <div className="flex items-center gap-1 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0 hide-scrollbar">
          {[
            { id: "", label: "All" },
            { id: "image", label: "Images", icon: ImageIcon },
            { id: "video", label: "Videos", icon: Film },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilterType(f.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-[11px] font-mono uppercase tracking-wider transition-colors ${
                filterType === f.id ? "bg-white/[0.06] text-primary" : "text-text-muted hover:bg-white/[0.02] hover:text-text-secondary"
              }`}
            >
              {f.icon && <f.icon size={12} />}
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <RefreshCw size={24} className="text-primary animate-spin" />
        </div>
      ) : media.length === 0 ? (
        <div className="text-center py-20 bg-white/[0.01] border border-border/40 rounded-xl border-dashed">
          <div className="w-12 h-12 rounded-full bg-white/[0.03] flex items-center justify-center mx-auto mb-4 text-text-muted">
            <ImageIcon size={20} />
          </div>
          <p className="text-text-primary font-medium">No media found</p>
          <p className="text-sm text-text-muted mt-1">Upload files to populate your library.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {media.map((item, i) => {
            const isVideo = item.mimeType.startsWith("video/");
            const fullUrl = item.url.startsWith("http") ? item.url : `${API_BASE}${item.url}`;
            const sizeMb = (item.size / (1024 * 1024)).toFixed(2);

            return (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="group relative bg-[#0f0f0f] border border-border/60 rounded-xl overflow-hidden"
              >
                {/* Thumbnail */}
                <div className="aspect-square bg-[#050505] relative flex items-center justify-center overflow-hidden">
                  {isVideo ? (
                    <>
                      <Film size={24} className="text-text-muted opacity-50 absolute" />
                      <video src={fullUrl} className="w-full h-full object-cover opacity-80" />
                    </>
                  ) : (
                    <Image src={fullUrl} alt={item.alt} fill className="object-cover" unoptimized />
                  )}
                  
                  {/* Overlay Actions */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[2px]">
                    <button
                      onClick={() => copyToClipboard(item.url)}
                      className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors tooltip-trigger"
                      title="Copy internal URL"
                    >
                      <Copy size={14} />
                    </button>
                    <a
                      href={fullUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                      title="Open in new tab"
                    >
                      <ExternalLink size={14} />
                    </a>
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="w-8 h-8 rounded-full bg-red-500/20 hover:bg-red-500/40 flex items-center justify-center text-red-300 transition-colors"
                      title="Delete file"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Meta */}
                <div className="p-3">
                  <p className="text-xs text-text-primary font-medium truncate" title={item.originalName}>
                    {item.originalName}
                  </p>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-[10px] text-text-muted uppercase font-mono">{item.mimeType.split('/')[1]}</p>
                    <p className="text-[10px] text-text-muted">{sizeMb} MB</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
