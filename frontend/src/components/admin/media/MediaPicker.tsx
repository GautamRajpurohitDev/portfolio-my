"use client";

import React, { useState, useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Image as ImageIcon, Search, RefreshCw, UploadCloud, Film } from "lucide-react";
import { mediaApi } from "@/lib/api";
import Image from "next/image";
import toast from "react-hot-toast";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

interface MediaPickerProps {
  value: string;
  onChange: (url: string) => void;
  trigger?: React.ReactNode;
  accept?: string;
}

export function MediaPicker({ value, onChange, trigger, accept }: MediaPickerProps) {
  const [open, setOpen] = useState(false);
  const [media, setMedia] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchMedia = async () => {
    setIsLoading(true);
    try {
      const res = await mediaApi.getAll("", searchTerm);
      setMedia(res.data.data);
    } catch (err) {
      toast.error("Failed to load media");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchMedia();
    }
  }, [open, searchTerm]); // Debounce omitted for brevity

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
    }
  };

  const handleSelect = (url: string) => {
    const fullUrl = url.startsWith("http") ? url : `${API_BASE}${url}`;
    onChange(fullUrl);
    setOpen(false);
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        {trigger || (
          <button type="button" className="flex items-center justify-center gap-2 w-full h-32 border border-border/60 border-dashed rounded-xl bg-white/[0.01] hover:bg-white/[0.03] text-text-muted hover:text-text-primary transition-all">
            {value ? (
              <div className="relative w-full h-full p-2">
                <div className="absolute inset-2 rounded-lg overflow-hidden border border-border/40">
                  <Image src={value} alt="Selected" fill className="object-cover" unoptimized />
                </div>
                <div className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center text-white backdrop-blur-[2px] rounded-xl">
                  <span className="text-xs font-semibold uppercase tracking-wider">Change Image</span>
                </div>
              </div>
            ) : (
              <>
                <ImageIcon size={20} />
                <span className="text-sm font-medium">Select Media</span>
              </>
            )}
          </button>
        )}
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-4xl translate-x-[-50%] translate-y-[-50%] gap-4 border border-border/60 bg-bg p-6 shadow-2xl sm:rounded-2xl h-[85vh] flex flex-col data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
          
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <Dialog.Title className="text-xl font-clash font-semibold text-text-primary">
                Media Library
              </Dialog.Title>
              <Dialog.Description className="text-sm text-text-muted mt-1">
                Select an existing asset or upload a new one.
              </Dialog.Description>
            </div>
            <Dialog.Close className="p-2 text-text-muted hover:text-text-primary rounded-full hover:bg-white/5 transition-colors">
              <X size={20} />
            </Dialog.Close>
          </div>

          {/* Tools */}
          <div className="flex items-center justify-between gap-4 py-2">
            <div className="relative w-64">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/[0.03] border border-border/60 rounded-lg pl-9 pr-3 py-2 text-sm text-text-primary focus:outline-none focus:border-primary/50"
              />
            </div>
            
            <div>
              <input
                type="file"
                id="picker-upload"
                multiple
                className="hidden"
                onChange={handleUpload}
                accept={accept || "image/*,video/mp4,video/webm"}
              />
              <label
                htmlFor="picker-upload"
                className={`flex items-center gap-2 px-4 py-2 bg-primary text-bg text-sm font-semibold rounded-lg hover:bg-primary/90 transition-all cursor-pointer ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
              >
                {isUploading ? <RefreshCw size={14} className="animate-spin" /> : <UploadCloud size={14} />}
                Upload New
              </label>
            </div>
          </div>

          {/* Grid */}
          <div className="flex-1 overflow-y-auto min-h-0 pr-2 custom-scrollbar">
            {isLoading ? (
              <div className="flex h-full items-center justify-center">
                <RefreshCw size={24} className="text-primary animate-spin" />
              </div>
            ) : media.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-text-muted border border-border/40 border-dashed rounded-xl bg-white/[0.01]">
                <ImageIcon size={32} className="mb-4 opacity-50" />
                <p>No media found</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                {media.map((item) => {
                  const isVideo = item.mimeType.startsWith("video/");
                  const fullUrl = item.url.startsWith("http") ? item.url : `${API_BASE}${item.url}`;
                  const isSelected = value === fullUrl;

                  return (
                    <button
                      key={item._id}
                      onClick={() => handleSelect(item.url)}
                      className={`group relative aspect-square bg-[#050505] rounded-xl overflow-hidden border-2 transition-all text-left ${
                        isSelected ? 'border-primary shadow-[0_0_15px_rgba(232,197,71,0.3)]' : 'border-border/40 hover:border-text-muted/50'
                      }`}
                    >
                      {isVideo ? (
                        <>
                          <Film size={20} className="text-text-muted opacity-50 absolute inset-0 m-auto z-10" />
                          <video src={fullUrl} className="w-full h-full object-cover opacity-70" />
                        </>
                      ) : (
                        <Image src={fullUrl} alt={item.alt} fill className="object-cover transition-transform duration-500 group-hover:scale-105" unoptimized />
                      )}
                      
                      {/* Name overlay */}
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2 pt-6">
                        <p className="text-[10px] text-white/90 truncate font-medium">{item.originalName}</p>
                      </div>

                      {isSelected && (
                        <div className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center text-bg shadow-lg">
                          <CheckIcon size={12} strokeWidth={3} />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function CheckIcon({ size = 24, strokeWidth = 2, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
