"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { skillsApi } from "@/lib/api";
import { Skill, SkillStatus } from "@/types";
import { Plus, Filter, ChevronDown, Layers } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { AdminPageHeader } from "@/components/admin/ui/AdminPageHeader";
import { AdminButton } from "@/components/admin/ui/AdminButton";
import { AdminBadge } from "@/components/admin/ui/AdminBadge";
import { AdminDataTable } from "@/components/admin/ui/AdminDataTable";
import { AdminRowActions } from "@/components/admin/ui/AdminRowActions";

const CATEGORY_LABELS: Record<string, string> = {
  "programming":     "Programming Languages",
  "cs-fundamentals": "CS Fundamentals",
  "web":             "Web Development",
  "databases":       "Databases & Storage",
  "systems":         "Systems & Architecture",
  "cloud":           "Cloud & DevOps",
  "ai-ml":           "AI & Machine Learning",
  "mobile":          "Mobile Development",
  "tools":           "Tools & Workflow",
};

export default function AdminSkillsPage() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [pendingName, setPendingName] = useState("");

  const fetchSkills = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const res = await skillsApi.getAllAdmin();
      setSkills(res.data.data || []);
    } catch {
      toast.error("Failed to fetch skills");
    } finally {
      setIsLoading(false);
      if (isManualRefresh) setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchSkills();
  }, [fetchSkills]);

  const requestDelete = (id: string, name: string) => {
    setPendingId(id);
    setPendingName(name);
    setConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (!pendingId) return;
    setConfirmLoading(true);
    try {
      await skillsApi.delete(pendingId);
      toast.success("Skill deleted");
      fetchSkills();
    } catch {
      toast.error("Failed to delete skill");
    } finally {
      setConfirmLoading(false);
      setPendingId(null);
      setPendingName("");
    }
  };

  const handleTogglePublish = async (s: Skill) => {
    try {
      await skillsApi.update(s._id, { published: !s.published });
      toast.success(s.published ? "Skill hidden" : "Skill published");
      setSkills((prev) =>
        prev.map((item) =>
          item._id === s._id ? { ...item, published: !item.published } : item
        )
      );
    } catch {
      toast.error("Failed to update skill");
    }
  };

  const filteredData = useMemo(() => {
    return skills.filter((s) => {
      if (statusFilter !== "all" && s.status !== statusFilter) return false;
      if (categoryFilter !== "all" && s.category !== categoryFilter) return false;
      return true;
    });
  }, [skills, statusFilter, categoryFilter]);

  const columns = useMemo<ColumnDef<Skill>[]>(() => [
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
      accessorKey: "name",
      header: "Skill",
      cell: ({ row }) => {
        const s = row.original;
        return (
          <div className="flex items-center gap-2.5 min-w-[160px]">
            <div className="w-7 h-7 rounded-md bg-white/[0.04] border border-border/50 flex items-center justify-center flex-shrink-0 text-text-secondary font-mono text-xs">
              {s.icon ? <span>{s.icon}</span> : <Layers size={13} />}
            </div>
            <div className="min-w-0">
              <Link
                href={`/admin/skills/${s._id}/edit`}
                className="font-clash font-semibold text-text-primary hover:text-primary transition-colors text-[13px] truncate block"
              >
                {s.name}
              </Link>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => (
        <span className="text-text-secondary font-mono text-[11px]">
          {CATEGORY_LABELS[row.original.category] || row.original.category}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <AdminBadge variant={row.original.status as any} dot>
          {row.original.status}
        </AdminBadge>
      ),
    },
    {
      accessorKey: "progress",
      header: "Mastery Progress",
      cell: ({ row }) => {
        const progress = row.original.progress ?? 0;
        return (
          <div className="flex items-center gap-2.5 min-w-[120px]">
            <div className="flex-1 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all duration-300"
                style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
              />
            </div>
            <span className="font-mono text-[11px] text-text-secondary w-8 text-right">
              {progress}%
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "order",
      header: "Order",
      cell: ({ row }) => (
        <span className="font-mono text-[11px] text-text-muted">
          #{row.original.order}
        </span>
      ),
    },
    {
      accessorKey: "published",
      header: "Visibility",
      cell: ({ row }) => (
        <AdminBadge variant={row.original.published ? "published" : "draft"}>
          {row.original.published ? "Live" : "Hidden"}
        </AdminBadge>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const s = row.original;
        return (
          <div className="text-right">
            <AdminRowActions
              editHref={`/admin/skills/${s._id}/edit`}
              previewHref="/skills"
              isPublished={s.published}
              onTogglePublish={() => handleTogglePublish(s)}
              onDelete={() => requestDelete(s._id, s.name)}
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
          <option value="in-progress">In Progress</option>
          <option value="practicing">Practicing</option>
          <option value="review">Review</option>
          <option value="completed">Completed</option>
          <option value="not-started">Not Started</option>
          <option value="paused">Paused</option>
        </select>
        <ChevronDown
          size={12}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
        />
      </div>

      {/* Category Filter */}
      <div className="relative">
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="appearance-none h-9 bg-white/[0.03] border border-border/70 rounded-lg pl-3 pr-7 text-xs font-body text-text-secondary focus:outline-none focus:border-primary/50 [&>option]:bg-[#111] cursor-pointer"
        >
          <option value="all">All Categories</option>
          {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={12}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
        />
      </div>
    </>
  );

  return (
    <div className="space-y-6 pb-14">
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete skill?"
        description={`"${pendingName}" will be permanently deleted.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        isLoading={confirmLoading}
      />

      {/* ── Standardized Header ───────────────────────────────── */}
      <AdminPageHeader
        eyebrow="02 / CONTENT"
        title="Technical Capabilities"
        stats={`${skills.length} Capabilities · ${skills.filter((s) => s.published).length} Live · ${skills.filter((s) => !s.published).length} Drafts`}
        description="Organize programming languages, engineering tools, frameworks, and active learning priorities."
        actions={
          <Link href="/admin/skills/new">
            <AdminButton variant="primary" icon={<Plus size={15} />}>
              New Skill
            </AdminButton>
          </Link>
        }
      />

      {/* ── TanStack Admin Data Table ─────────────────────────── */}
      <AdminDataTable
        columns={columns}
        data={filteredData}
        isLoading={isLoading}
        searchPlaceholder="Search skills by name, category…"
        filterControls={filterControls}
        enableSelection={true}
        enableColumnVisibility={true}
        enablePagination={true}
        pageSize={25}
        onRefresh={() => fetchSkills(true)}
        isRefreshing={isRefreshing}
        emptyTitle="No skills found"
        emptyDescription="Organize your technical competencies and current learning priorities."
        emptyActionLabel="Add Skill"
        emptyActionIcon={<Plus size={14} />}
        onEmptyAction={() => {
          window.location.href = "/admin/skills/new";
        }}
        renderMobileCard={(s) => (
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 space-y-1.5 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <AdminBadge variant={s.status as any} dot>
                  {s.status}
                </AdminBadge>
                <span className="text-[10px] font-mono text-text-muted">
                  {CATEGORY_LABELS[s.category] || s.category}
                </span>
              </div>

              <Link
                href={`/admin/skills/${s._id}/edit`}
                className="font-clash font-semibold text-text-primary hover:text-primary transition-colors text-sm truncate block"
              >
                {s.name}
              </Link>

              <div className="flex items-center gap-2 max-w-xs pt-1">
                <div className="flex-1 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${Math.min(Math.max(s.progress ?? 0, 0), 100)}%` }}
                  />
                </div>
                <span className="font-mono text-[10px] text-text-muted">
                  {s.progress ?? 0}%
                </span>
              </div>
            </div>

            <AdminRowActions
              editHref={`/admin/skills/${s._id}/edit`}
              previewHref="/skills"
              isPublished={s.published}
              onTogglePublish={() => handleTogglePublish(s)}
              onDelete={() => requestDelete(s._id, s.name)}
            />
          </div>
        )}
      />
    </div>
  );
}
