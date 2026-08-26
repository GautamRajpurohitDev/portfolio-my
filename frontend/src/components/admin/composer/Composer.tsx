"use client";

import React, { useState, useRef, useCallback } from "react";
import MDEditor from "@uiw/react-md-editor";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { useFormContext, Controller } from "react-hook-form";
import { 
  GripVertical, Trash2, Image as ImageIcon, Film, 
  UploadCloud, RefreshCw, X 
} from "lucide-react";
import { mediaApi } from "@/lib/api";
import toast from "react-hot-toast";
import Image from "next/image";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

interface MediaAttachment {
  url: string;
  mimeType: string;
  alt: string;
  order: number;
}

interface ComposerProps {
  contentField: string;
  mediaField: string;
  control: any;
  watch: any;
  setValue: any;
}

export function Composer({ contentField, mediaField, control, watch, setValue }: ComposerProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const attachments: MediaAttachment[] = watch(mediaField) || [];

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append("files", files[i]);
    }

    try {
      const res = await mediaApi.upload(formData);
      const newMedia = res.data.data.map((m: any, idx: number) => ({
        url: m.url,
        mimeType: m.mimeType,
        alt: m.alt,
        order: attachments.length + idx,
      }));

      setValue(mediaField, [...attachments, ...newMedia], { shouldDirty: true });
      toast.success("Media attached");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Upload failed");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeAttachment = (index: number) => {
    const newAttachments = [...attachments];
    newAttachments.splice(index, 1);
    // Re-order
    newAttachments.forEach((a, i) => (a.order = i));
    setValue(mediaField, newAttachments, { shouldDirty: true });
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    
    const newAttachments = Array.from(attachments);
    const [reorderedItem] = newAttachments.splice(result.source.index, 1);
    newAttachments.splice(result.destination.index, 0, reorderedItem);
    
    // Re-order
    newAttachments.forEach((a, i) => (a.order = i));
    setValue(mediaField, newAttachments, { shouldDirty: true });
  };

  return (
    <div className="space-y-6">
      
      {/* ── Markdown Editor ────────────────────────────────────── */}
      <div className="border border-border/60 rounded-xl overflow-hidden bg-bg" data-color-mode="dark">
        <Controller
          control={control}
          name={contentField}
          render={({ field }) => (
            <MDEditor
              value={field.value}
              onChange={(val) => field.onChange(val || "")}
              preview="live"
              height={500}
              visibleDragbar={false}
              className="!border-none !bg-transparent"
            />
          )}
        />
      </div>

      {/* ── Media Attachments Zone ───────────────────────────── */}
      <div className="border border-border/60 rounded-xl bg-[#0f0f0f] p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-text-primary text-sm flex items-center gap-2">
              <ImageIcon size={16} className="text-text-muted" />
              Media Attachments
            </h3>
            <p className="text-xs text-text-muted mt-1">
              Attach images or videos to display below the content. Drag to reorder.
            </p>
          </div>
          <div>
            <input
              type="file"
              multiple
              className="hidden"
              ref={fileInputRef}
              onChange={handleUpload}
              accept="image/*,video/mp4,video/webm"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="flex items-center gap-2 px-3 py-1.5 bg-white/[0.05] hover:bg-white/[0.1] text-text-primary text-xs font-semibold rounded-lg transition-all"
            >
              {isUploading ? <RefreshCw size={14} className="animate-spin" /> : <UploadCloud size={14} />}
              Upload Media
            </button>
          </div>
        </div>

        {attachments.length === 0 ? (
          <div className="py-8 text-center border border-border/40 border-dashed rounded-lg bg-white/[0.01]">
            <p className="text-xs text-text-muted">No media attached yet.</p>
          </div>
        ) : (
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="attachments" direction="horizontal">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar"
                >
                  {attachments.map((media, index) => {
                    const isVideo = media.mimeType.startsWith("video/");
                    const fullUrl = media.url.startsWith("http") ? media.url : `${API_BASE}${media.url}`;

                    return (
                      <Draggable key={`${media.url}-${index}`} draggableId={`${media.url}-${index}`} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`relative group w-32 h-32 flex-shrink-0 rounded-xl overflow-hidden border ${
                              snapshot.isDragging ? "border-primary shadow-lg" : "border-border/60"
                            }`}
                          >
                            <div
                              {...provided.dragHandleProps}
                              className="absolute top-1 left-1 z-20 p-1.5 bg-black/60 backdrop-blur-sm rounded-lg text-white/70 hover:text-white cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <GripVertical size={14} />
                            </div>

                            <button
                              type="button"
                              onClick={() => removeAttachment(index)}
                              className="absolute top-1 right-1 z-20 p-1.5 bg-red-500/80 backdrop-blur-sm rounded-lg text-white hover:bg-red-500 opacity-0 group-hover:opacity-100 transition-all"
                            >
                              <Trash2 size={14} />
                            </button>

                            {isVideo ? (
                              <>
                                <Film size={20} className="absolute inset-0 m-auto z-10 text-white/50" />
                                <video src={fullUrl} className="w-full h-full object-cover" />
                              </>
                            ) : (
                              <Image src={fullUrl} alt={media.alt || "Attachment"} fill className="object-cover" unoptimized />
                            )}
                          </div>
                        )}
                      </Draggable>
                    );
                  })}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}
      </div>
      
    </div>
  );
}
