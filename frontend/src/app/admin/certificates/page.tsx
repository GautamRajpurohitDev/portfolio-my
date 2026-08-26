"use client";

import React, { useEffect, useState, useCallback } from "react";
import { certificatesApi } from "@/lib/api";
import { Certificate } from "@/types";
import { Plus, Search, Edit2, Trash2, Eye, EyeOff, ExternalLink, Award } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";
import { motion } from "framer-motion";
import ConfirmDialog from "@/components/admin/ConfirmDialog";

function Badge({ text, cls }: { text: string; cls: string }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider border ${cls}`}>
      {text}
    </span>
  );
}

export default function AdminCertificatesPage() {
  const [certs, setCerts]             = useState<Certificate[]>([]);
  const [isLoading, setIsLoading]     = useState(true);
  const [search, setSearch]           = useState("");
  const [togglingId, setTogglingId]   = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [pendingId, setPendingId]     = useState<string | null>(null);
  const [pendingTitle, setPendingTitle] = useState("");

  const fetch = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await certificatesApi.getAllAdmin();
      setCerts(res.data.data);
    } catch { toast.error("Failed to fetch certificates"); }
    finally  { setIsLoading(false); }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const requestDelete = (id: string, title: string) => {
    setPendingId(id); setPendingTitle(title); setConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (!pendingId) return;
    setConfirmLoading(true);
    try {
      await certificatesApi.delete(pendingId);
      toast.success("Certificate deleted");
      fetch();
    } catch { toast.error("Failed to delete certificate"); }
    finally  { setConfirmLoading(false); setPendingId(null); setPendingTitle(""); }
  };

  const handleToggle = async (c: Certificate) => {
    setTogglingId(c._id);
    try {
      await certificatesApi.update(c._id, { published: !c.published });
      toast.success(c.published ? "Certificate hidden" : "Certificate published");
      fetch();
    } catch { toast.error("Failed to update certificate"); }
    finally  { setTogglingId(null); }
  };

  const filtered = certs
    .filter(c => !search || c.title.toLowerCase().includes(search.toLowerCase()) || c.provider.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-7 pb-14">
      <ConfirmDialog
        open={confirmOpen} onOpenChange={setConfirmOpen}
        title="Delete certificate?" description={`"${pendingTitle}" will be permanently deleted.`}
        confirmLabel="Delete" onConfirm={handleDelete} isLoading={confirmLoading}
      />

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-mono text-text-muted tracking-widest uppercase mb-2">05 / Certificates</p>
          <h1 className="text-2xl font-clash font-bold text-text-primary">Certificates</h1>
          <p className="text-sm text-text-secondary mt-1">Verified learning credentials and achievements.</p>
        </div>
        <Link href="/admin/certificates/new"
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-bg text-sm font-semibold font-clash rounded-lg hover:bg-primary/90 active:scale-[0.98] transition-all w-fit">
          <Plus size={15} /> New Certificate
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 min-w-48 max-w-72">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input type="text" placeholder="Search certificates…" value={search} onChange={e => setSearch(e.target.value)}
            className="w-full bg-white/[0.03] border border-border/60 rounded-lg pl-9 pr-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary/40 transition-colors"
          />
        </div>
        {!isLoading && <span className="ml-auto text-[11px] font-mono text-text-muted">{filtered.length} certificates</span>}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3].map(i => <div key={i} className="admin-skeleton rounded-xl h-48" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-[#0f0f0f] border border-border/60 rounded-xl p-12 text-center space-y-4">
          <p className="text-[11px] font-mono text-text-muted uppercase tracking-widest">
            {search ? "No results" : "No certificates yet"}
          </p>
          <p className="text-sm text-text-secondary max-w-xs mx-auto leading-relaxed">
            {search ? "Try a different search term." : "Add your first certification to showcase verified learning."}
          </p>
          {search ? (
            <button onClick={() => setSearch("")} className="text-xs font-mono text-primary uppercase tracking-wider">Clear search</button>
          ) : (
            <Link href="/admin/certificates/new" className="inline-flex items-center gap-1.5 text-xs font-mono text-primary uppercase tracking-wider">
              <Plus size={11} /> Add certificate
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((cert, idx) => {
            const date = new Date(cert.date).toLocaleDateString("en-US", { month: "short", year: "numeric" });
            return (
              <motion.div
                key={cert._id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                className="group bg-[#0f0f0f] border border-border/60 rounded-xl overflow-hidden card-hover-glow flex flex-col"
              >
                {/* Preview area */}
                <div className="relative h-32 bg-white/[0.02] flex items-center justify-center overflow-hidden border-b border-border/40">
                  {cert.media && cert.media.length > 0 ? (
                    <img src={cert.media[0].url} alt={cert.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <Award size={28} className="text-text-muted/30" />
                      <span className="text-[10px] font-mono text-text-muted/40 uppercase tracking-widest">{cert.provider}</span>
                    </div>
                  )}
                  {cert.featured && (
                    <div className="absolute top-2 left-2">
                      <Badge text="Featured" cls="status-featured" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <Badge text={cert.published ? "Published" : "Draft"} cls={cert.published ? "status-published" : "status-draft"} />
                  </div>
                </div>

                {/* Body */}
                <div className="flex-1 p-4 space-y-1.5">
                  <p className="text-[11px] font-mono text-text-muted uppercase tracking-wider">{cert.provider}</p>
                  <h3 className="text-sm font-clash font-semibold text-text-primary group-hover:text-primary transition-colors leading-tight">
                    {cert.title}
                  </h3>
                  <p className="text-[11px] font-mono text-text-muted">{date}</p>
                  {cert.credentialId && (
                    <p className="text-[10px] font-mono text-text-muted/60 truncate">ID: {cert.credentialId}</p>
                  )}
                </div>

                {/* Actions */}
                <div className="px-4 pb-4 flex items-center gap-1.5">
                  <Link href={`/admin/certificates/${cert._id}/edit`}
                    className="flex-1 text-center py-2 text-xs font-mono uppercase tracking-wider text-text-secondary border border-border/60 rounded-lg hover:border-primary/30 hover:text-primary transition-all">
                    Edit
                  </Link>
                  {cert.credentialUrl && (
                    <a href={cert.credentialUrl} target="_blank" rel="noopener noreferrer"
                      className="p-2 text-text-muted border border-border/60 rounded-lg hover:text-blue-400 hover:border-blue-400/30 transition-all">
                      <ExternalLink size={14} />
                    </a>
                  )}
                  <button onClick={() => handleToggle(cert)} disabled={togglingId === cert._id}
                    className={`p-2 border border-border/60 rounded-lg transition-all disabled:opacity-50 ${
                      cert.published ? "text-success hover:text-yellow-400 hover:border-yellow-400/30" : "text-text-muted hover:text-success hover:border-success/30"
                    }`}>
                    {togglingId === cert._id ? <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" /> : cert.published ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                  <button onClick={() => requestDelete(cert._id, cert.title)}
                    className="p-2 text-text-muted border border-border/60 rounded-lg hover:text-red-400 hover:border-red-400/30 transition-all">
                    <Trash2 size={14} />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
