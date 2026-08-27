"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { certificatesApi } from "@/lib/api";
import { Certificate } from "@/types";
import { Plus, Filter, ChevronDown, Award, Sparkles, ExternalLink } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { AdminPageHeader } from "@/components/admin/ui/AdminPageHeader";
import { AdminButton } from "@/components/admin/ui/AdminButton";
import { AdminBadge } from "@/components/admin/ui/AdminBadge";
import { AdminDataTable } from "@/components/admin/ui/AdminDataTable";
import { AdminRowActions } from "@/components/admin/ui/AdminRowActions";

export default function AdminCertificatesPage() {
  const [certs, setCerts] = useState<Certificate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [providerFilter, setProviderFilter] = useState<string>("all");

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [pendingTitle, setPendingTitle] = useState("");

  const fetchCerts = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const res = await certificatesApi.getAllAdmin();
      setCerts(res.data.data || []);
    } catch {
      toast.error("Failed to fetch certificates");
    } finally {
      setIsLoading(false);
      if (isManualRefresh) setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchCerts();
  }, [fetchCerts]);

  const requestDelete = (id: string, title: string) => {
    setPendingId(id);
    setPendingTitle(title);
    setConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (!pendingId) return;
    setConfirmLoading(true);
    try {
      await certificatesApi.delete(pendingId);
      toast.success("Certificate deleted");
      fetchCerts();
    } catch {
      toast.error("Failed to delete certificate");
    } finally {
      setConfirmLoading(false);
      setPendingId(null);
      setPendingTitle("");
    }
  };

  const handleTogglePublish = async (c: Certificate) => {
    try {
      await certificatesApi.update(c._id, { published: !c.published });
      toast.success(c.published ? "Certificate hidden" : "Certificate published");
      setCerts((prev) =>
        prev.map((item) =>
          item._id === c._id ? { ...item, published: !item.published } : item
        )
      );
    } catch {
      toast.error("Failed to update certificate");
    }
  };

  // Derive unique providers
  const providers = useMemo(() => {
    const set = new Set<string>();
    certs.forEach((c) => {
      if (c.provider) set.add(c.provider);
    });
    return Array.from(set);
  }, [certs]);

  const filteredData = useMemo(() => {
    return certs.filter((c) => {
      if (statusFilter === "published" && !c.published) return false;
      if (statusFilter === "draft" && c.published) return false;
      if (providerFilter !== "all" && c.provider !== providerFilter) return false;
      return true;
    });
  }, [certs, statusFilter, providerFilter]);

  const columns = useMemo<ColumnDef<Certificate>[]>(() => [
    {
      id: "select",
      header: ({ table }) => (
        <input
          type="checkbox"
          checked={table.getIsAllPageRowsSelected()}
          onChange={table.getToggleAllPageRowsSelectedHandler()}
          aria-label="Select all"
          className="rounded border-border/70 bg-white/5 text-primary accent-primary w-3.5 h-3.5 cursor-pointer"
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={row.getIsSelected()}
          onChange={row.getToggleSelectedHandler()}
          aria-label="Select row"
          className="rounded border-border/70 bg-white/5 text-primary accent-primary w-3.5 h-3.5 cursor-pointer"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "title",
      header: "Certificate",
      cell: ({ row }) => {
        const c = row.original;
        return (
          <div className="min-w-[200px] space-y-0.5">
            <Link
              href={`/admin/certificates/${c._id}/edit`}
              className="font-clash font-semibold text-text-primary hover:text-primary transition-colors text-[13px] truncate block"
            >
              {c.title}
            </Link>
            {c.credentialId && (
              <p className="text-[10.5px] font-mono text-text-muted truncate">
                ID: {c.credentialId}
              </p>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "provider",
      header: "Provider",
      cell: ({ row }) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded bg-white/[0.04] text-[10.5px] font-mono text-text-secondary uppercase tracking-wider">
          {row.original.provider}
        </span>
      ),
    },
    {
      accessorKey: "date",
      header: "Issue Date",
      cell: ({ row }) => {
        const date = new Date(row.original.date).toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        });
        return <span className="text-text-muted font-mono text-[11px]">{date}</span>;
      },
    },
    {
      accessorKey: "published",
      header: "Status",
      cell: ({ row }) => (
        <AdminBadge variant={row.original.published ? "published" : "draft"} dot>
          {row.original.published ? "Live" : "Draft"}
        </AdminBadge>
      ),
    },
    {
      accessorKey: "featured",
      header: "Featured",
      cell: ({ row }) =>
        row.original.featured ? (
          <AdminBadge variant="featured">
            <Sparkles size={10} className="inline mr-1" />
            Featured
          </AdminBadge>
        ) : (
          <span className="text-text-muted text-[11px] font-mono">—</span>
        ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const c = row.original;
        return (
          <div className="text-right">
            <AdminRowActions
              editHref={`/admin/certificates/${c._id}/edit`}
              previewHref={c.credentialUrl || undefined}
              isPublished={c.published}
              onTogglePublish={() => handleTogglePublish(c)}
              onDelete={() => requestDelete(c._id, c.title)}
            />
          </div>
        );
      },
      enableSorting: false,
      enableHiding: false,
    },
  ], []);

  const filterControls = (
    <>
      <div className="relative">
        <Filter
          size={12}
          className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="appearance-none h-9 bg-white/[0.03] border border-border/70 rounded-lg pl-7.5 pr-7 text-xs font-body text-text-secondary focus:outline-none focus:border-primary/50 [&>option]:bg-[#111] cursor-pointer"
        >
          <option value="all">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Drafts</option>
        </select>
        <ChevronDown
          size={12}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
        />
      </div>

      {providers.length > 0 && (
        <div className="relative">
          <select
            value={providerFilter}
            onChange={(e) => setProviderFilter(e.target.value)}
            className="appearance-none h-9 bg-white/[0.03] border border-border/70 rounded-lg pl-3 pr-7 text-xs font-body text-text-secondary focus:outline-none focus:border-primary/50 [&>option]:bg-[#111] cursor-pointer"
          >
            <option value="all">All Providers</option>
            {providers.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          <ChevronDown
            size={12}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
          />
        </div>
      )}
    </>
  );

  return (
    <div className="space-y-6 pb-14">
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete certificate?"
        description={`"${pendingTitle}" will be permanently deleted.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        isLoading={confirmLoading}
      />

      {/* ── Standardized Header ───────────────────────────────── */}
      <AdminPageHeader
        eyebrow="02 / CONTENT"
        title="Certifications"
        stats={`${certs.length} Credentials · ${certs.filter((c) => c.published).length} Live · ${certs.filter((c) => !c.published).length} Drafts`}
        description="Verified course completions, certifications, and technical accreditations."
        actions={
          <Link href="/admin/certificates/new">
            <AdminButton variant="primary" icon={<Plus size={15} />}>
              New Certificate
            </AdminButton>
          </Link>
        }
      />

      {/* ── TanStack Admin Data Table ─────────────────────────── */}
      <AdminDataTable
        columns={columns}
        data={filteredData}
        isLoading={isLoading}
        searchPlaceholder="Search certificates by title, provider…"
        filterControls={filterControls}
        enableSelection={true}
        enableColumnVisibility={true}
        enablePagination={true}
        pageSize={25}
        onRefresh={() => fetchCerts(true)}
        isRefreshing={isRefreshing}
        emptyTitle="No certificates found"
        emptyDescription="Add your verified learning credentials and certification achievements."
        emptyActionLabel="Add Certificate"
        emptyActionIcon={<Plus size={14} />}
        onEmptyAction={() => {
          window.location.href = "/admin/certificates/new";
        }}
        renderMobileCard={(c) => (
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-1.5 py-0.2 rounded bg-white/[0.04] text-[9.5px] font-mono text-primary uppercase">
                  {c.provider}
                </span>
                <AdminBadge variant={c.published ? "published" : "draft"} dot>
                  {c.published ? "Live" : "Draft"}
                </AdminBadge>
                {c.featured && <AdminBadge variant="featured">Featured</AdminBadge>}
              </div>

              <Link
                href={`/admin/certificates/${c._id}/edit`}
                className="font-clash font-semibold text-text-primary hover:text-primary transition-colors text-sm truncate block pt-0.5"
              >
                {c.title}
              </Link>

              {c.credentialId && (
                <p className="text-[10.5px] font-mono text-text-muted truncate">
                  ID: {c.credentialId}
                </p>
              )}
            </div>

            <AdminRowActions
              editHref={`/admin/certificates/${c._id}/edit`}
              previewHref={c.credentialUrl || undefined}
              isPublished={c.published}
              onTogglePublish={() => handleTogglePublish(c)}
              onDelete={() => requestDelete(c._id, c.title)}
            />
          </div>
        )}
      />
    </div>
  );
}
