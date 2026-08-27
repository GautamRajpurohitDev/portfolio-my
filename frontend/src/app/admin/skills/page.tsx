"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { skillsApi } from "@/lib/api";
import { Skill, SkillStatus } from "@/types";
import { Plus, Filter, ChevronDown, Layers } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";
import { ConfirmDialog } from "@/components/admin/ui/ConfirmDialog";
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

const STATUS_CONFIG: Record<
  SkillStatus,
  { label: string; dot: string; badgeBorder: string; badgeBg: string; text: string }
> = {
  "in-progress": {
    label: "IN PROGRESS",
    dot: "bg-amber-400",
    badgeBorder: "border-amber-500/30",
    badgeBg: "bg-amber-500/10",
    text: "text-amber-300",
  },
  "practicing": {
    label: "PRACTICING",
    dot: "bg-amber-400",
    badgeBorder: "border-amber-500/30",
    badgeBg: "bg-amber-500/10",
    text: "text-amber-300",
  },
  "review": {
    label: "REVIEW",
    dot: "bg-blue-400",
    badgeBorder: "border-blue-500/30",
    badgeBg: "bg-blue-500/10",
    text: "text-blue-300",
  },
  "completed": {
    label: "COMPLETED",
    dot: "bg-emerald-400",
    badgeBorder: "border-emerald-500/30",
    badgeBg: "bg-emerald-500/10",
    text: "text-emerald-300",
  },
  "not-started": {
    label: "NOT STARTED",
    dot: "bg-neutral-500",
    badgeBorder: "border-white/[0.12]",
    badgeBg: "bg-white/[0.04]",
    text: "text-text-secondary",
  },
  "paused": {
    label: "PAUSED",
    dot: "bg-neutral-500",
    badgeBorder: "border-white/[0.12]",
    badgeBg: "bg-white/[0.04]",
    text: "text-text-muted",
  },
  "learning": {
    label: "LEARNING",
    dot: "bg-amber-400",
    badgeBorder: "border-amber-500/30",
    badgeBg: "bg-amber-500/10",
    text: "text-amber-300",
  },
  "familiar": {
    label: "FAMILIAR",
    dot: "bg-blue-400",
    badgeBorder: "border-blue-500/30",
    badgeBg: "bg-blue-500/10",
    text: "text-blue-300",
  },
  "proficient": {
    label: "PROFICIENT",
    dot: "bg-emerald-400",
    badgeBorder: "border-emerald-500/30",
    badgeBg: "bg-emerald-500/10",
    text: "text-emerald-300",
  },
  "advanced": {
    label: "ADVANCED",
    dot: "bg-emerald-400",
    badgeBorder: "border-emerald-500/30",
    badgeBg: "bg-emerald-500/10",
    text: "text-emerald-300",
  },
  "optional": {
    label: "OPTIONAL",
    dot: "bg-neutral-500",
    badgeBorder: "border-white/[0.12]",
    badgeBg: "bg-white/[0.04]",
    text: "text-text-muted",
  },
  "planned": {
    label: "PLANNED",
    dot: "bg-neutral-500",
    badgeBorder: "border-white/[0.12]",
    badgeBg: "bg-white/[0.04]",
    text: "text-text-secondary",
  },
};

function InlineStatusSelector({
  skill,
  onStatusChange,
  isUpdating,
}: {
  skill: Skill;
  onStatusChange: (skill: Skill, newStatus: SkillStatus) => void;
  isUpdating?: boolean;
}) {
  const current = skill.status || "not-started";
  const conf = STATUS_CONFIG[current] || STATUS_CONFIG["not-started"];

  return (
    <div className="relative inline-flex items-center group">
      {/* Visible Pure Flex Badge */}
      <div
        className={`inline-flex items-center gap-1.5 font-mono text-[10.5px] font-semibold tracking-wider py-1 px-2.5 rounded-md border ${conf.badgeBorder} ${conf.badgeBg} ${conf.text} group-hover:border-white/[0.25] transition-all select-none whitespace-nowrap`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${conf.dot} shrink-0`} />
        <span className="min-w-0">{conf.label}</span>
        <ChevronDown
          size={11}
          className="shrink-0 opacity-70 ml-0.5 text-text-muted group-hover:text-text-primary transition-colors"
        />
      </div>

      {/* Interactive Invisible Select Overlay */}
      <select
        value={current}
        disabled={isUpdating}
        onChange={(e) => onStatusChange(skill, e.target.value as SkillStatus)}
        aria-label={`Change status for ${skill.name}`}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed disabled:opacity-0 [&>option]:bg-[#121212] [&>option]:text-text-primary"
      >
        <option value="in-progress">IN PROGRESS</option>
        <option value="practicing">PRACTICING</option>
        <option value="review">REVIEW</option>
        <option value="completed">COMPLETED</option>
        <option value="not-started">NOT STARTED</option>
        <option value="paused">PAUSED</option>
      </select>
    </div>
  );
}

export default function AdminSkillsPage() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [updatingSkillId, setUpdatingSkillId] = useState<string | null>(null);

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

  const handleStatusChange = async (skill: Skill, newStatus: SkillStatus) => {
    if (skill.status === newStatus) return;
    const previousStatus = skill.status;

    // Optimistic UI state update
    setSkills((prev) =>
      prev.map((item) =>
        item._id === skill._id ? { ...item, status: newStatus } : item
      )
    );
    setUpdatingSkillId(skill._id);
    const toastId = toast.loading(`Updating status for ${skill.name}...`);

    try {
      await skillsApi.update(skill._id, { status: newStatus });
      toast.success(`Updated ${skill.name} status to ${newStatus.toUpperCase()}`, {
        id: toastId,
      });
    } catch {
      // Rollback on server failure
      setSkills((prev) =>
        prev.map((item) =>
          item._id === skill._id ? { ...item, status: previousStatus } : item
        )
      );
      toast.error(`Failed to update status for ${skill.name}`, { id: toastId });
    } finally {
      setUpdatingSkillId(null);
    }
  };

  const handleTogglePublish = async (s: Skill) => {
    try {
      await skillsApi.update(s._id, { published: !s.published });
      toast.success(s.published ? "Skill set to draft" : "Skill published live");
      setSkills((prev) =>
        prev.map((item) =>
          item._id === s._id ? { ...item, published: !item.published } : item
        )
      );
    } catch {
      toast.error("Failed to update skill");
    }
  };

  const handleDuplicate = async (s: Skill) => {
    try {
      const copyPayload = {
        ...s,
        _id: undefined,
        name: `${s.name} (Copy)`,
        published: false,
      };
      await skillsApi.create(copyPayload);
      toast.success("Skill duplicated as draft");
      fetchSkills(true);
    } catch {
      toast.error("Failed to duplicate skill");
    }
  };

  const handleBulkPublish = async (selected: Skill[]) => {
    try {
      await Promise.all(selected.map((s) => skillsApi.update(s._id, { published: true })));
      toast.success(`Published ${selected.length} skills`);
      fetchSkills(true);
    } catch {
      toast.error("Failed to publish selected skills");
    }
  };

  const handleBulkUnpublish = async (selected: Skill[]) => {
    try {
      await Promise.all(selected.map((s) => skillsApi.update(s._id, { published: false })));
      toast.success(`Unpublished ${selected.length} skills`);
      fetchSkills(true);
    } catch {
      toast.error("Failed to unpublish selected skills");
    }
  };

  const handleBulkDelete = async (selected: Skill[]) => {
    if (!confirm(`Permanently delete ${selected.length} selected skills?`)) return;
    try {
      await Promise.all(selected.map((s) => skillsApi.delete(s._id)));
      toast.success(`Deleted ${selected.length} skills`);
      fetchSkills(true);
    } catch {
      toast.error("Failed to delete selected skills");
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
      accessorKey: "name",
      header: "Skill",
      cell: ({ row }) => {
        const s = row.original;
        return (
          <div className="flex items-center gap-2.5 min-w-[180px]">
            <div className="w-6 h-6 rounded bg-white/[0.04] border border-white/[0.08] flex items-center justify-center shrink-0">
              <Layers size={12} className="text-text-muted" />
            </div>
            <Link
              href={`/admin/skills/${s._id}/edit`}
              className="font-clash font-semibold text-text-primary hover:text-primary transition-colors text-[13px] block"
            >
              {s.name}
            </Link>
          </div>
        );
      },
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => (
        <span className="text-text-secondary text-[11px] font-mono whitespace-nowrap">
          {CATEGORY_LABELS[row.original.category] || row.original.category}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const s = row.original;
        return (
          <InlineStatusSelector
            skill={s}
            onStatusChange={handleStatusChange}
            isUpdating={updatingSkillId === s._id}
          />
        );
      },
    },
    {
      accessorKey: "progress",
      header: "Mastery Progress",
      cell: ({ row }) => {
        const prog = row.original.progress || 0;
        return (
          <div className="flex items-center gap-2.5 min-w-[120px]">
            <div className="flex-1 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  prog >= 80
                    ? "bg-primary shadow-sm shadow-primary/40"
                    : prog > 0
                    ? "bg-blue-400"
                    : "bg-transparent"
                }`}
                style={{ width: `${prog}%` }}
              />
            </div>
            <span className="text-[10.5px] font-mono text-text-muted w-7 text-right">
              {prog}%
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "order",
      header: "Order",
      cell: ({ row }) => (
        <span className="text-text-muted font-mono text-[11px]">
          #{row.original.order}
        </span>
      ),
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
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const s = row.original;
        return (
          <div className="text-right">
            <AdminRowActions
              editHref={`/admin/skills/${s._id}/edit`}
              previewHref="/skills"
              copyUrl={typeof window !== "undefined" ? `${window.location.origin}/skills` : undefined}
              isPublished={s.published}
              onTogglePublish={() => handleTogglePublish(s)}
              onDuplicate={() => handleDuplicate(s)}
              onDelete={() => requestDelete(s._id, s.name)}
            />
          </div>
        );
      },
      enableSorting: false,
      enableHiding: false,
    },
  ], [updatingSkillId]);

  const filterControls = (
    <>
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
          <option value="in-progress">In Progress</option>
          <option value="practicing">Practicing</option>
          <option value="review">Review</option>
          <option value="completed">Completed</option>
          <option value="not-started">Not Started</option>
          <option value="paused">Paused</option>
        </select>
        <ChevronDown
          size={11}
          className="text-text-muted shrink-0 pointer-events-none"
        />
      </div>

      <div className="flex items-center gap-2 h-9 px-3 bg-white/[0.02] border border-white/[0.08] rounded-lg hover:border-white/[0.15] focus-within:border-primary/50 transition-colors shrink-0">
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="bg-transparent border-0 p-0 pr-3 text-xs font-body text-text-secondary focus:outline-none appearance-none cursor-pointer [&>option]:bg-[#111] [&>option]:text-text-primary"
        >
          <option value="all">All Categories</option>
          {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
        <ChevronDown
          size={11}
          className="text-text-muted shrink-0 pointer-events-none"
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
        onBulkPublish={handleBulkPublish}
        onBulkUnpublish={handleBulkUnpublish}
        onBulkDelete={handleBulkDelete}
        enableColumnVisibility={true}
        enablePagination={true}
        pageSize={25}
        onRefresh={() => fetchSkills(true)}
        isRefreshing={isRefreshing}
        emptyTitle="No skills found"
        emptyDescription="Add skills to build your technical curriculum and show your progress."
        emptyActionLabel="Create Skill"
        emptyActionIcon={<Plus size={14} />}
        onEmptyAction={() => {
          window.location.href = "/admin/skills/new";
        }}
        renderMobileCard={(s) => (
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 space-y-2 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <InlineStatusSelector
                  skill={s}
                  onStatusChange={handleStatusChange}
                  isUpdating={updatingSkillId === s._id}
                />
                <span className="text-[10px] font-mono text-text-muted">
                  {CATEGORY_LABELS[s.category] || s.category}
                </span>
              </div>

              <Link
                href={`/admin/skills/${s._id}/edit`}
                className="font-clash font-semibold text-text-primary hover:text-primary transition-colors text-sm block"
              >
                {s.name}
              </Link>

              {/* Progress */}
              <div className="flex items-center gap-2 pt-0.5">
                <div className="flex-1 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      (s.progress || 0) >= 80 ? "bg-primary" : "bg-blue-400"
                    }`}
                    style={{ width: `${s.progress || 0}%` }}
                  />
                </div>
                <span className="text-[10px] font-mono text-text-muted">
                  {s.progress || 0}%
                </span>
              </div>
            </div>

            <AdminRowActions
              editHref={`/admin/skills/${s._id}/edit`}
              previewHref="/skills"
              copyUrl={typeof window !== "undefined" ? `${window.location.origin}/skills` : undefined}
              isPublished={s.published}
              onTogglePublish={() => handleTogglePublish(s)}
              onDuplicate={() => handleDuplicate(s)}
              onDelete={() => requestDelete(s._id, s.name)}
            />
          </div>
        )}
      />
    </div>
  );
}
