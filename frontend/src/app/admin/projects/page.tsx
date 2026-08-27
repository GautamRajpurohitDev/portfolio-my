"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";
import { projectsApi } from "@/lib/api";
import { Project } from "@/types";
import toast from "react-hot-toast";
import {
  Plus,
  Filter,
  ExternalLink,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import { AdminPageHeader } from "@/components/admin/ui/AdminPageHeader";
import { AdminDataTable } from "@/components/admin/ui/AdminDataTable";
import { AdminBadge } from "@/components/admin/ui/AdminBadge";
import { AdminButton } from "@/components/admin/ui/AdminButton";
import { AdminRowActions } from "@/components/admin/ui/AdminRowActions";
import { ConfirmDialog } from "@/components/admin/ui/ConfirmDialog";

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  // Delete modal state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [pendingTitle, setPendingTitle] = useState("");
  const [confirmLoading, setConfirmLoading] = useState(false);

  const fetchProjects = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) setIsRefreshing(true);
    try {
      const res = await projectsApi.getAllAdmin();
      setProjects(res.data.data || []);
    } catch {
      toast.error("Failed to load projects");
    } finally {
      setIsLoading(false);
      if (isManualRefresh) setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const requestDelete = (id: string, title: string) => {
    setPendingDeleteId(id);
    setPendingTitle(title);
    setConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (!pendingDeleteId) return;
    setConfirmLoading(true);
    try {
      await projectsApi.delete(pendingDeleteId);
      toast.success("Project deleted successfully");
      setProjects((prev) => prev.filter((p) => p._id !== pendingDeleteId));
      setConfirmOpen(false);
    } catch {
      toast.error("Failed to delete project");
    } finally {
      setConfirmLoading(false);
      setPendingDeleteId(null);
    }
  };

  const handleTogglePublish = async (project: Project) => {
    const nextState = !project.published;
    try {
      await projectsApi.update(project._id, { published: nextState });
      setProjects((prev) =>
        prev.map((p) => (p._id === project._id ? { ...p, published: nextState } : p))
      );
      toast.success(nextState ? "Project published live" : "Project converted to draft");
    } catch {
      toast.error("Failed to update project status");
    }
  };

  const handleDuplicate = async (project: Project) => {
    try {
      const copyPayload = {
        ...project,
        _id: undefined,
        title: `${project.title} (Copy)`,
        slug: `${project.slug || "project"}-copy-${Date.now().toString().slice(-4)}`,
        published: false,
      };
      await projectsApi.create(copyPayload);
      toast.success("Project duplicated as draft");
      fetchProjects(true);
    } catch {
      toast.error("Failed to duplicate project");
    }
  };

  const handleBulkPublish = async (selected: Project[]) => {
    try {
      await Promise.all(selected.map((p) => projectsApi.update(p._id, { published: true })));
      toast.success(`Published ${selected.length} projects`);
      fetchProjects(true);
    } catch {
      toast.error("Failed to publish selected projects");
    }
  };

  const handleBulkUnpublish = async (selected: Project[]) => {
    try {
      await Promise.all(selected.map((p) => projectsApi.update(p._id, { published: false })));
      toast.success(`Unpublished ${selected.length} projects`);
      fetchProjects(true);
    } catch {
      toast.error("Failed to unpublish selected projects");
    }
  };

  const handleBulkDelete = async (selected: Project[]) => {
    if (!confirm(`Permanently delete ${selected.length} selected projects?`)) return;
    try {
      await Promise.all(selected.map((p) => projectsApi.delete(p._id)));
      toast.success(`Deleted ${selected.length} projects`);
      fetchProjects(true);
    } catch {
      toast.error("Failed to delete selected projects");
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
          className="rounded border-white/[0.2] bg-white/5 text-primary accent-primary w-3.5 h-3.5 cursor-pointer"
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={row.getIsSelected()}
          onChange={row.getToggleSelectedHandler()}
          aria-label="Select row"
          className="rounded border-white/[0.2] bg-white/5 text-primary accent-primary w-3.5 h-3.5 cursor-pointer"
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
            <div className="w-9 h-9 rounded-lg bg-white/[0.04] border border-white/[0.08] flex-shrink-0 overflow-hidden flex items-center justify-center">
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
                <p className="text-[11px] text-text-muted truncate max-w-xs leading-tight mt-0.5 font-body">
                  {p.shortDescription}
                </p>
              )}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => (
        <span className="text-text-secondary capitalize text-[11px] font-mono">
          {row.original.category || "General"}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status || "idea";
        return (
          <AdminBadge variant={status as any} dot>
            {status}
          </AdminBadge>
        );
      },
    },
    {
      accessorKey: "published",
      header: "Visibility",
      cell: ({ row }) => (
        <AdminBadge variant={row.original.published ? "published" : "draft"}>
          {row.original.published ? "LIVE" : "DRAFT"}
        </AdminBadge>
      ),
    },
    {
      accessorKey: "featured",
      header: "Featured",
      cell: ({ row }) =>
        row.original.featured ? (
          <AdminBadge variant="featured">
            <Sparkles size={10} className="mr-1" />
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
        const publicUrl = typeof window !== "undefined" && p.slug ? `${window.location.origin}/projects/${p.slug}` : undefined;

        return (
          <div className="text-right">
            <AdminRowActions
              editHref={`/admin/projects/${p._id}/edit`}
              previewHref={p.slug ? `/projects/${p.slug}` : undefined}
              copyUrl={publicUrl}
              isPublished={p.published}
              onTogglePublish={() => handleTogglePublish(p)}
              onDuplicate={() => handleDuplicate(p)}
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
      <div className="flex items-center gap-2 h-9 px-3 bg-white/[0.02] border border-white/[0.08] rounded-lg hover:border-white/[0.15] focus-within:border-primary/50 transition-colors shrink-0">
        <Filter
          size={12}
          className="text-text-muted shrink-0 pointer-events-none"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-transparent border-0 p-0 pr-3 text-xs font-body text-text-secondary focus:outline-none appearance-none cursor-pointer [&>option]:bg-[#111] [&>option]:text-text-primary"
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
          size={11}
          className="text-text-muted shrink-0 pointer-events-none"
        />
      </div>

      {/* Category Filter */}
      {categories.length > 0 && (
        <div className="flex items-center gap-2 h-9 px-3 bg-white/[0.02] border border-white/[0.08] rounded-lg hover:border-white/[0.15] focus-within:border-primary/50 transition-colors shrink-0">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-transparent border-0 p-0 pr-3 text-xs font-body text-text-secondary focus:outline-none appearance-none cursor-pointer capitalize [&>option]:bg-[#111] [&>option]:text-text-primary"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <ChevronDown
            size={11}
            className="text-text-muted shrink-0 pointer-events-none"
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
        onBulkPublish={handleBulkPublish}
        onBulkUnpublish={handleBulkUnpublish}
        onBulkDelete={handleBulkDelete}
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
              copyUrl={typeof window !== "undefined" && p.slug ? `${window.location.origin}/projects/${p.slug}` : undefined}
              isPublished={p.published}
              onTogglePublish={() => handleTogglePublish(p)}
              onDuplicate={() => handleDuplicate(p)}
              onDelete={() => requestDelete(p._id, p.title)}
            />
          </div>
        )}
      />
    </div>
  );
}
