"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { projectsApi } from "@/lib/api";
import { Project } from "@/types";
import { Plus, Filter, ChevronDown, Sparkles } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { AdminPageHeader } from "@/components/admin/ui/AdminPageHeader";
import { AdminBadge } from "@/components/admin/ui/AdminBadge";
import { AdminButton } from "@/components/admin/ui/AdminButton";
import { AdminDataTable } from "@/components/admin/ui/AdminDataTable";
import { AdminRowActions } from "@/components/admin/ui/AdminRowActions";

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [pendingTitle, setPendingTitle] = useState("");

  const fetchProjects = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const res = await projectsApi.getAllAdmin();
      setProjects(res.data.data || []);
    } catch {
      toast.error("Failed to fetch projects");
    } finally {
      setIsLoading(false);
      if (isManualRefresh) setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const requestDelete = (id: string, title: string) => {
    setPendingId(id);
    setPendingTitle(title);
    setConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (!pendingId) return;
    setConfirmLoading(true);
    try {
      await projectsApi.delete(pendingId);
      toast.success("Project deleted");
      fetchProjects();
    } catch {
      toast.error("Failed to delete project");
    } finally {
      setConfirmLoading(false);
      setPendingId(null);
      setPendingTitle("");
    }
  };

  const handleTogglePublish = async (p: Project) => {
    try {
      await projectsApi.update(p._id, { published: !p.published });
      toast.success(p.published ? "Project unpublished" : "Project published");
      setProjects((prev) =>
        prev.map((item) =>
          item._id === p._id ? { ...item, published: !item.published } : item
        )
      );
    } catch {
      toast.error("Failed to update project status");
    }
  };

  // Derive unique categories for the filter dropdown
  const categories = useMemo(() => {
    const set = new Set<string>();
    projects.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [projects]);

  // Filter dataset based on selected status and category
  const filteredData = useMemo(() => {
    return projects.filter((p) => {
      if (statusFilter === "published" && !p.published) return false;
      if (statusFilter === "draft" && p.published) return false;
      if (statusFilter !== "all" && statusFilter !== "published" && statusFilter !== "draft") {
        if (p.status !== statusFilter) return false;
      }
      if (categoryFilter !== "all" && p.category !== categoryFilter) return false;
      return true;
    });
  }, [projects, statusFilter, categoryFilter]);

  // TanStack Table Column Definitions
  const columns = useMemo<ColumnDef<Project>[]>(() => [
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
      header: "Project",
      cell: ({ row }) => {
        const p = row.original;
        const thumbnail = p.media?.[0]?.url;

        return (
          <div className="flex items-center gap-3 min-w-[200px]">
            <div className="w-9 h-9 rounded-lg bg-white/[0.04] border border-border/50 flex-shrink-0 overflow-hidden flex items-center justify-center">
              {thumbnail ? (
                <img src={thumbnail} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="font-mono text-[9px] text-text-muted">GR</span>
              )}
            </div>
            <div className="min-w-0">
              <Link
                href={`/admin/projects/${p._id}/edit`}
                className="font-clash font-semibold text-text-primary hover:text-primary transition-colors truncate block text-[13px]"
              >
                {p.title}
              </Link>
              {p.shortDescription && (
                <p className="text-[11px] text-text-muted truncate max-w-xs leading-tight mt-0.5">
                  {p.shortDescription}
                </p>
              )}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const p = row.original;
        return (
          <div className="flex items-center gap-1.5 flex-wrap">
            <AdminBadge variant={p.status as any} dot>
              {p.status}
            </AdminBadge>
            <AdminBadge variant={p.published ? "published" : "draft"}>
              {p.published ? "Live" : "Draft"}
            </AdminBadge>
          </div>
        );
      },
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => (
        <span className="text-text-secondary font-mono text-[11px] capitalize">
          {row.original.category || "—"}
        </span>
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
      accessorKey: "updatedAt",
      header: "Updated",
      cell: ({ row }) => {
        const date = new Date(row.original.updatedAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
        return <span className="text-text-muted font-mono text-[11px]">{date}</span>;
      },
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const p = row.original;
        return (
          <div className="text-right">
            <AdminRowActions
              editHref={`/admin/projects/${p._id}/edit`}
              previewHref={p.slug ? `/projects/${p.slug}` : undefined}
              isPublished={p.published}
              onTogglePublish={() => handleTogglePublish(p)}
              onDelete={() => requestDelete(p._id, p.title)}
            />
          </div>
        );
      },
      enableSorting: false,
      enableHiding: false,
    },
  ], []);

  // Custom filter select controls to inject into AdminDataTable toolbar
  const filterControls = (
    <>
      {/* Status Filter */}
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
          <option value="draft">Draft</option>
          <option value="idea">Idea</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="archived">Archived</option>
        </select>
        <ChevronDown
          size={12}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
        />
      </div>

      {/* Category Filter */}
      {categories.length > 0 && (
        <div className="relative">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="appearance-none h-9 bg-white/[0.03] border border-border/70 rounded-lg pl-3 pr-7 text-xs font-body text-text-secondary focus:outline-none focus:border-primary/50 [&>option]:bg-[#111] cursor-pointer capitalize"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
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
        title="Delete project?"
        description={`"${pendingTitle}" will be permanently deleted.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        isLoading={confirmLoading}
      />

      {/* ── Standardized Header ───────────────────────────────── */}
      <AdminPageHeader
        eyebrow="02 / CONTENT"
        title="Projects"
        stats={`${projects.length} Works · ${projects.filter((p) => p.published).length} Live · ${projects.filter((p) => !p.published).length} Drafts`}
        description="Software systems, architecture case studies, and engineering prototypes."
        actions={
          <Link href="/admin/projects/new">
            <AdminButton variant="primary" icon={<Plus size={15} />}>
              New Project
            </AdminButton>
          </Link>
        }
      />

      {/* ── TanStack Admin Data Table ─────────────────────────── */}
      <AdminDataTable
        columns={columns}
        data={filteredData}
        isLoading={isLoading}
        searchPlaceholder="Search projects by title, category…"
        filterControls={filterControls}
        enableSelection={true}
        enableColumnVisibility={true}
        enablePagination={true}
        pageSize={25}
        onRefresh={() => fetchProjects(true)}
        isRefreshing={isRefreshing}
        emptyTitle="No projects found"
        emptyDescription="Create your first project to showcase it on your public portfolio."
        emptyActionLabel="Create Project"
        emptyActionIcon={<Plus size={14} />}
        onEmptyAction={() => {
          window.location.href = "/admin/projects/new";
        }}
        renderMobileCard={(p) => (
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <AdminBadge variant={p.status as any} dot>
                  {p.status}
                </AdminBadge>
                <AdminBadge variant={p.published ? "published" : "draft"}>
                  {p.published ? "Live" : "Draft"}
                </AdminBadge>
                {p.featured && <AdminBadge variant="featured">Featured</AdminBadge>}
              </div>

              <Link
                href={`/admin/projects/${p._id}/edit`}
                className="font-clash font-semibold text-text-primary hover:text-primary transition-colors text-sm truncate block pt-1"
              >
                {p.title}
              </Link>

              <div className="flex items-center gap-2 text-[11px] font-mono text-text-muted">
                <span className="capitalize">{p.category || "General"}</span>
                <span>·</span>
                <span>{new Date(p.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
              </div>
            </div>

            <AdminRowActions
              editHref={`/admin/projects/${p._id}/edit`}
              previewHref={p.slug ? `/projects/${p.slug}` : undefined}
              isPublished={p.published}
              onTogglePublish={() => handleTogglePublish(p)}
              onDelete={() => requestDelete(p._id, p.title)}
            />
          </div>
        )}
      />
    </div>
  );
}
