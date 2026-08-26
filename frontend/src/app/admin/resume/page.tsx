"use client";

import React, { useState, useEffect, useCallback } from "react";
import { resumeApi, uploadApi, settingsApi } from "@/lib/api";
import { Resume } from "@/types";
import {
  FileText, UploadCloud, CheckCircle2, AlertCircle, Eye, EyeOff,
  Trash2, ExternalLink, Download, Clock, Star, History, ArrowUpRight, Plus, RefreshCw
} from "lucide-react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import ConfirmDialog from "@/components/admin/ConfirmDialog";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

function formatBytes(bytes: number, decimals = 1) {
  if (!bytes) return "0 B";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

export default function AdminResumePage() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [version, setVersion] = useState("1.0");
  const [label, setLabel] = useState("View Resume");
  const [notes, setNotes] = useState("");
  const [isCurrent, setIsCurrent] = useState(true);
  const [published, setPublished] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [pendingName, setPendingName] = useState("");

  const fetchResumes = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await resumeApi.getAll();
      setResumes(res.data.data || []);
    } catch {
      toast.error("Failed to load resume documents");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchResumes();
  }, [fetchResumes]);

  const currentResume = resumes.find((r) => r.isCurrent) || resumes[0];

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type !== "application/pdf" && !file.name.endsWith(".pdf")) {
        toast.error("Please select a valid PDF document");
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type !== "application/pdf" && !file.name.endsWith(".pdf")) {
        toast.error("Please select a valid PDF document");
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUploadNewVersion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error("Please choose a PDF file to upload");
      return;
    }

    setIsUploading(true);
    try {
      // 1. Upload PDF binary to server storage
      const uploadRes = await uploadApi.upload(selectedFile);
      const fileUrl = uploadRes.data.url;

      // 2. Create versioned resume record
      await resumeApi.create({
        fileUrl,
        fileName: selectedFile.name,
        version: version.trim() || "1.0",
        fileSize: selectedFile.size,
        label: label.trim() || "View Resume",
        notes: notes.trim(),
        isCurrent,
        published,
      });

      toast.success(`Resume ${version} uploaded successfully!`);
      setSelectedFile(null);
      setNotes("");
      // increment default next version suggestion
      const parts = version.split(".");
      if (parts.length === 2 && !isNaN(Number(parts[1]))) {
        setVersion(`${parts[0]}.${Number(parts[1]) + 1}`);
      }
      fetchResumes();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to upload resume");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSetCurrent = async (resume: Resume) => {
    try {
      await resumeApi.update(resume._id, { isCurrent: true, published: true });
      toast.success(`Version ${resume.version} is now the active public resume`);
      fetchResumes();
    } catch {
      toast.error("Failed to update active resume");
    }
  };

  const handleTogglePublish = async (resume: Resume) => {
    try {
      await resumeApi.update(resume._id, { published: !resume.published });
      toast.success(resume.published ? "Resume hidden from public" : "Resume published");
      fetchResumes();
    } catch {
      toast.error("Failed to update visibility");
    }
  };

  const requestDelete = (id: string, name: string) => {
    setPendingId(id);
    setPendingName(name);
    setConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (!pendingId) return;
    setConfirmLoading(true);
    try {
      await resumeApi.delete(pendingId);
      toast.success("Resume deleted");
      fetchResumes();
    } catch {
      toast.error("Failed to delete resume");
    } finally {
      setConfirmLoading(false);
      setPendingId(null);
      setPendingName("");
    }
  };

  const resolveFullUrl = (url: string) => {
    if (!url) return "";
    return url.startsWith("http") ? url : `${API_BASE}${url}`;
  };

  return (
    <div className="space-y-8 pb-16 max-w-5xl">
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete Resume Version?"
        description={`"${pendingName}" will be permanently removed.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        isLoading={confirmLoading}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-mono text-text-muted tracking-widest uppercase mb-2">Profile / Credentials</p>
          <h1 className="text-2xl font-clash font-bold text-text-primary">Resume Management</h1>
          <p className="text-sm text-text-secondary mt-1">
            Upload, version, and manage your official curriculum vitae. Public links in Navbar and Hero automatically sync to the current published version.
          </p>
        </div>

        {currentResume?.published && currentResume?.fileUrl && (
          <a
            href={resolveFullUrl(currentResume.fileUrl)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-4 py-2.5 bg-primary text-bg font-semibold font-clash text-sm rounded-lg hover:bg-primary/90 active:scale-[0.98] transition-all w-fit"
          >
            <ExternalLink size={14} /> Open Live Resume ↗
          </a>
        )}
      </div>

      {/* ── CURRENT RESUME STATUS CARD ────────────────────────── */}
      {isLoading ? (
        <div className="admin-skeleton rounded-2xl h-44" />
      ) : currentResume ? (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-2xl bg-[#0f0f0f] border border-border/80 relative overflow-hidden"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary flex-shrink-0">
                <FileText size={24} />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider bg-primary/10 border border-primary/30 text-primary">
                    <Star size={10} /> Active Version {currentResume.version}
                  </span>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider border ${
                    currentResume.published ? "bg-emerald-400/10 border-emerald-400/30 text-emerald-400" : "bg-yellow-400/10 border-yellow-400/30 text-yellow-400"
                  }`}>
                    {currentResume.published ? "Publicly Visible" : "Hidden"}
                  </span>
                </div>
                <h2 className="text-xl font-bold font-clash text-text-primary">{currentResume.fileName}</h2>
                <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-text-muted mt-2">
                  <span>Size: {formatBytes(currentResume.fileSize)}</span>
                  <span>Uploaded: {new Date(currentResume.uploadedAt || currentResume.createdAt).toLocaleDateString()}</span>
                  <span>Button Label: "{currentResume.label || 'View Resume'}"</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={resolveFullUrl(currentResume.fileUrl)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white/[0.04] border border-border/60 text-xs font-mono text-text-primary hover:border-primary/40 hover:text-primary transition-colors"
              >
                <Eye size={13} /> Preview
              </a>
              <a
                href={resolveFullUrl(currentResume.fileUrl)}
                download={currentResume.fileName}
                className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white/[0.04] border border-border/60 text-xs font-mono text-text-primary hover:border-primary/40 hover:text-primary transition-colors"
              >
                <Download size={13} /> Download
              </a>
              <button
                onClick={() => handleTogglePublish(currentResume)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg border text-xs font-mono transition-colors ${
                  currentResume.published
                    ? "border-yellow-400/30 text-yellow-400 hover:bg-yellow-400/10"
                    : "border-emerald-400/30 text-emerald-400 hover:bg-emerald-400/10"
                }`}
              >
                {currentResume.published ? <EyeOff size={13} /> : <Eye size={13} />}
                {currentResume.published ? "Hide Resume" : "Publish Resume"}
              </button>
            </div>
          </div>
        </motion.div>
      ) : (
        <div className="p-8 rounded-2xl bg-[#0f0f0f] border border-border/60 text-center space-y-3">
          <p className="text-xs font-mono text-text-muted uppercase tracking-widest">No Resume Uploaded Yet</p>
          <p className="text-sm text-text-secondary">Upload your first resume PDF below to enable the public resume link.</p>
        </div>
      )}

      {/* ── UPLOAD NEW VERSION FORM ───────────────────────────── */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#0f0f0f] border border-border/60 space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-border/40">
          <UploadCloud size={18} className="text-primary" />
          <h3 className="text-sm font-semibold font-clash text-text-primary uppercase tracking-wider">
            Upload New Resume Version
          </h3>
        </div>

        <form onSubmit={handleUploadNewVersion} className="space-y-6">
          {/* Dropzone */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleFileDrop}
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
              selectedFile ? "border-primary/60 bg-primary/[0.02]" : "border-border/60 hover:border-primary/40 bg-white/[0.01]"
            }`}
          >
            <input
              type="file"
              id="resume-file-input"
              accept=".pdf,application/pdf"
              onChange={handleFileChange}
              className="hidden"
            />
            {selectedFile ? (
              <div className="space-y-2">
                <FileText size={36} className="mx-auto text-primary" />
                <p className="text-base font-semibold text-text-primary font-clash">{selectedFile.name}</p>
                <p className="text-xs font-mono text-text-muted">{formatBytes(selectedFile.size)} • PDF Ready for Upload</p>
                <button
                  type="button"
                  onClick={() => setSelectedFile(null)}
                  className="text-xs font-mono text-red-400 hover:underline pt-2"
                >
                  Choose different file
                </button>
              </div>
            ) : (
              <label htmlFor="resume-file-input" className="cursor-pointer block space-y-3">
                <UploadCloud size={36} className="mx-auto text-text-muted hover:text-primary transition-colors" />
                <p className="text-sm font-medium text-text-primary">
                  Drag and drop your PDF resume here, or <span className="text-primary underline">browse files</span>
                </p>
                <p className="text-xs font-mono text-text-muted uppercase tracking-wider">PDF format only • Max 10MB</p>
              </label>
            )}
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <div className="space-y-1.5">
              <label className="block text-[11px] font-mono text-text-secondary uppercase tracking-wider">Version Number</label>
              <input
                type="text"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                placeholder="e.g. 1.0, 2026.1"
                className="w-full bg-white/[0.03] border border-border/60 rounded-lg px-4 py-2.5 text-text-primary text-sm font-mono focus:outline-none focus:border-primary/50"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-mono text-text-secondary uppercase tracking-wider">Public Button Text</label>
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="e.g. View Resume, Download CV"
                className="w-full bg-white/[0.03] border border-border/60 rounded-lg px-4 py-2.5 text-text-primary text-sm focus:outline-none focus:border-primary/50"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-mono text-text-secondary uppercase tracking-wider">Version Notes / Changelog</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Added Git & GitHub milestones"
                className="w-full bg-white/[0.03] border border-border/60 rounded-lg px-4 py-2.5 text-text-primary text-sm focus:outline-none focus:border-primary/50"
              />
            </div>
          </div>

          {/* Options */}
          <div className="flex flex-wrap items-center gap-6 pt-2">
            <label className="flex items-center gap-2.5 cursor-pointer text-xs font-medium text-text-secondary">
              <input
                type="checkbox"
                checked={isCurrent}
                onChange={(e) => setIsCurrent(e.target.checked)}
                className="w-4 h-4 rounded border-border bg-black text-primary accent-primary"
              />
              <span>Set as current active version (archives previous versions)</span>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer text-xs font-medium text-text-secondary">
              <input
                type="checkbox"
                checked={published}
                onChange={(e) => setPublished(e.target.checked)}
                className="w-4 h-4 rounded border-border bg-black text-primary accent-primary"
              />
              <span>Publish immediately to public portfolio</span>
            </label>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isUploading || !selectedFile}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-bg font-semibold font-clash text-sm rounded-lg hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-40"
          >
            {isUploading ? (
              <div className="w-4 h-4 border-2 border-bg border-t-transparent rounded-full animate-spin" />
            ) : (
              <UploadCloud size={16} />
            )}
            {isUploading ? "Uploading Resume..." : "Upload & Save Version"}
          </button>
        </form>
      </div>

      {/* ── VERSION HISTORY TABLE ─────────────────────────────── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-border/40">
          <div className="flex items-center gap-2">
            <History size={16} className="text-text-muted" />
            <h3 className="text-xs font-mono font-semibold uppercase tracking-widest text-text-primary">
              Version History ({resumes.length})
            </h3>
          </div>
          <button onClick={fetchResumes} className="text-text-muted hover:text-primary p-1 rounded transition-colors" title="Refresh">
            <RefreshCw size={13} />
          </button>
        </div>

        {resumes.length === 0 ? (
          <p className="text-xs font-mono text-text-muted py-4">No historical versions.</p>
        ) : (
          <div className="space-y-3">
            {resumes.map((resume) => (
              <div
                key={resume._id}
                className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
                  resume.isCurrent
                    ? "bg-primary/[0.02] border-primary/40 shadow-sm"
                    : "bg-[#0f0f0f] border-border/60 hover:border-border"
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div className={`p-2.5 rounded-lg border ${
                    resume.isCurrent ? "bg-primary/10 border-primary/30 text-primary" : "bg-white/[0.03] border-border/60 text-text-muted"
                  }`}>
                    <FileText size={18} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold font-clash text-text-primary">
                        v{resume.version} — {resume.fileName}
                      </p>
                      {resume.isCurrent && (
                        <span className="px-2 py-0.5 rounded text-[9px] font-mono uppercase bg-primary text-bg font-bold">
                          CURRENT
                        </span>
                      )}
                      <span className={`px-2 py-0.5 rounded text-[9px] font-mono uppercase border ${
                        resume.published ? "bg-emerald-400/10 text-emerald-400 border-emerald-400/30" : "bg-white/[0.03] text-text-muted border-border/40"
                      }`}>
                        {resume.published ? "Published" : "Hidden"}
                      </span>
                    </div>
                    <p className="text-xs text-text-muted font-mono mt-1">
                      {formatBytes(resume.fileSize)} • Uploaded {new Date(resume.uploadedAt || resume.createdAt).toLocaleDateString()}
                      {resume.notes ? ` • Note: ${resume.notes}` : ""}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  {!resume.isCurrent && (
                    <button
                      onClick={() => handleSetCurrent(resume)}
                      className="px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-primary/20 text-text-secondary hover:text-primary text-xs font-mono uppercase tracking-wider transition-colors border border-border/60"
                    >
                      Make Current
                    </button>
                  )}
                  <a
                    href={resolveFullUrl(resume.fileUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-text-muted hover:text-primary rounded hover:bg-white/[0.04] transition-colors"
                    title="Preview"
                  >
                    <Eye size={14} />
                  </a>
                  <button
                    onClick={() => requestDelete(resume._id, `v${resume.version} (${resume.fileName})`)}
                    className="p-2 text-text-muted hover:text-red-400 rounded hover:bg-red-500/10 transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
