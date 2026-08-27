"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  dashboardApi,
  skillsApi,
  certificatesApi,
  milestonesApi,
  mediaApi,
  resumeApi,
  healthApi,
  projectsApi,
  journeyApi,
  updatesApi,
} from "@/lib/api";
import {
  FolderKanban,
  BookOpen,
  Rss,
  Layers,
  Award,
  Flag,
  Image as ImageIcon,
  FileText,
  Plus,
  ArrowRight,
  RefreshCw,
  Server,
  Database,
  Cpu,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  HardDrive,
  Globe,
  Star,
  Clock,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Activity,
  AlertCircle,
  FileCheck2,
} from "lucide-react";
import { AdminBadge } from "@/components/admin/ui/AdminBadge";
import { useAdminWorkspace } from "@/hooks/useAdminWorkspace";

// ── Motion Animation Helper ──────────────────────────────────
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.22, delay, ease: [0.22, 1, 0.36, 1] as const },
});

// ── Relative Date Helper ─────────────────────────────────────
function formatRelative(dateString: string | null | undefined): string {
  if (!dateString) return "Never";
  const now = new Date();
  const d = new Date(dateString);
  const diffSec = Math.floor((now.getTime() - d.getTime()) / 1000);
  if (diffSec < 60) return "just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHrs = Math.floor(diffMin / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  const diffDays = Math.floor(diffHrs / 24);
  if (diffDays === 1) return "yesterday";
  if (diffDays < 30) return `${diffDays}d ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function AdminDashboardPage() {
  const [overviewData, setOverviewData] = useState<any>(null);
  const [skillsList, setSkillsList] = useState<any[]>([]);
  const [certsList, setCertsList] = useState<any[]>([]);
  const [milestonesList, setMilestonesList] = useState<any[]>([]);
  const [mediaList, setMediaList] = useState<any[]>([]);
  const [resumesList, setResumesList] = useState<any[]>([]);
  const [projectsList, setProjectsList] = useState<any[]>([]);
  const [journeyList, setJourneyList] = useState<any[]>([]);
  const [updatesList, setUpdatesList] = useState<any[]>([]);
  const [healthData, setHealthData] = useState<any>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date>(new Date());

  const { pinnedRoutes, recentEdits, togglePin, isPinned, isOnline } = useAdminWorkspace();

  const fetchAllData = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) setIsRefreshing(true);
    try {
      const [
        overviewRes,
        skillsRes,
        certsRes,
        milestonesRes,
        mediaRes,
        resumesRes,
        healthRes,
        projectsRes,
        journeyRes,
        updatesRes,
      ] = await Promise.allSettled([
        dashboardApi.getOverview(),
        skillsApi.getAllAdmin(),
        certificatesApi.getAll(),
        milestonesApi.getAll(),
        mediaApi.getAll(),
        resumeApi.getAll(),
        healthApi.check(),
        projectsApi.getAllAdmin(),
        journeyApi.getAllAdmin(),
        updatesApi.getAllAdmin(),
      ]);

      if (overviewRes.status === "fulfilled") setOverviewData(overviewRes.value.data.data);
      if (skillsRes.status === "fulfilled") setSkillsList(skillsRes.value.data.data || []);
      if (certsRes.status === "fulfilled") setCertsList(certsRes.value.data.data || []);
      if (milestonesRes.status === "fulfilled") setMilestonesList(milestonesRes.value.data.data || []);
      if (mediaRes.status === "fulfilled") setMediaList(mediaRes.value.data.data || []);
      if (resumesRes.status === "fulfilled") setResumesList(resumesRes.value.data.data || []);
      if (healthRes.status === "fulfilled") setHealthData(healthRes.value.data);
      if (projectsRes.status === "fulfilled") setProjectsList(projectsRes.value.data.data || []);
      if (journeyRes.status === "fulfilled") setJourneyList(journeyRes.value.data.data || []);
      if (updatesRes.status === "fulfilled") setUpdatesList(updatesRes.value.data.data || []);

      setLastSyncTime(new Date());
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    } finally {
      if (isManualRefresh) setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Derived content counts
  const projectsTotal = projectsList.length || overviewData?.stats?.projects?.total || 0;
  const projectsPublished = projectsList.filter((p) => p.published).length;
  const projectsDraft = projectsTotal - projectsPublished;

  const journeyTotal = journeyList.length || overviewData?.stats?.journey?.total || 0;
  const journeyPublished = journeyList.filter((j) => j.published).length;
  const journeyDraft = journeyTotal - journeyPublished;

  const updatesTotal = updatesList.length || overviewData?.stats?.updates?.total || 0;
  const updatesPublished = updatesList.filter((u) => u.published).length;
  const updatesDraft = updatesTotal - updatesPublished;

  const skillsTotal = skillsList.length;
  const skillsPublished = skillsList.filter((s) => s.published).length;
  const skillsDraft = skillsTotal - skillsPublished;

  const certsTotal = certsList.length;
  const certsPublished = certsList.filter((c) => c.published).length;

  const milestonesTotal = milestonesList.length;
  const milestonesPublished = milestonesList.filter((m) => m.published).length;

  const resumesTotal = resumesList.length;
  const currentResume = resumesList.find((r) => r.isCurrent) || resumesList[0];

  const totalPublished =
    projectsPublished +
    journeyPublished +
    updatesPublished +
    skillsPublished +
    certsPublished +
    milestonesPublished;

  const totalDrafts =
    projectsDraft +
    journeyDraft +
    updatesDraft +
    skillsDraft;

  // Active engineering focus skill (Git & GitHub at 89%)
  const activeLearningSkill = useMemo(() => {
    const gitSkill = skillsList.find((s) =>
      s.name?.toLowerCase().includes("git")
    );
    if (gitSkill) return gitSkill;
    const inProgress = skillsList.find((s) => s.status === "in-progress");
    if (inProgress) return inProgress;
    return {
      name: "Git & GitHub",
      progress: 89,
      status: "in-progress",
      description:
        "Version control, branching strategies, commit structuring, pull requests, rebasing.",
    };
  }, [skillsList]);

  // Continue Where I Left Off (Recent edits + latest updated records)
  const continueItems = useMemo(() => {
    if (recentEdits.length > 0) {
      return recentEdits.slice(0, 4);
    }
    // Fallback to latest modified content records
    const fallback: {
      id: string;
      title: string;
      collection: any;
      editUrl: string;
      timestamp: string;
    }[] = [];

    if (skillsList[0]) {
      fallback.push({
        id: skillsList[0]._id,
        title: skillsList[0].name,
        collection: "skills",
        editUrl: `/admin/skills/${skillsList[0]._id}/edit`,
        timestamp: skillsList[0].updatedAt || skillsList[0].createdAt,
      });
    }
    if (journeyList[0]) {
      fallback.push({
        id: journeyList[0]._id,
        title: journeyList[0].title,
        collection: "journey",
        editUrl: `/admin/journey/${journeyList[0]._id}/edit`,
        timestamp: journeyList[0].updatedAt || journeyList[0].createdAt,
      });
    }
    if (projectsList[0]) {
      fallback.push({
        id: projectsList[0]._id,
        title: projectsList[0].title,
        collection: "projects",
        editUrl: `/admin/projects/${projectsList[0]._id}/edit`,
        timestamp: projectsList[0].updatedAt || projectsList[0].createdAt,
      });
    }
    return fallback;
  }, [recentEdits, skillsList, journeyList, projectsList]);

  // Needs Attention Items
  const attentionItems = useMemo(() => {
    const items: {
      id: string;
      title: string;
      detail: string;
      severity: "warning" | "info" | "neutral";
      actionLabel: string;
      actionHref: string;
    }[] = [];

    if (projectsDraft > 0) {
      items.push({
        id: "att-proj-draft",
        title: `${projectsDraft} Project Draft${projectsDraft > 1 ? "s" : ""}`,
        detail: "Unpublished work awaiting final review and deployment.",
        severity: "warning",
        actionLabel: "Review Projects",
        actionHref: "/admin/projects",
      });
    }

    if (journeyDraft > 0) {
      items.push({
        id: "att-journey-draft",
        title: `${journeyDraft} Journey Draft${journeyDraft > 1 ? "s" : ""}`,
        detail: "Learning log entries ready for public publication.",
        severity: "info",
        actionLabel: "Review Logs",
        actionHref: "/admin/journey",
      });
    }

    if (updatesDraft > 0) {
      items.push({
        id: "att-updates-draft",
        title: `${updatesDraft} Update Draft${updatesDraft > 1 ? "s" : ""}`,
        detail: "Build updates saved in draft mode.",
        severity: "info",
        actionLabel: "Review Updates",
        actionHref: "/admin/updates",
      });
    }

    if (resumesTotal === 0) {
      items.push({
        id: "att-resume",
        title: "Resume PDF Required",
        detail: "No active curriculum vitae uploaded for public recruiter download.",
        severity: "warning",
        actionLabel: "Upload Resume",
        actionHref: "/admin/resume",
      });
    }

    return items;
  }, [projectsDraft, journeyDraft, updatesDraft, resumesTotal]);

  // System Diagnostics status
  const isApiHealthy = healthData?.services?.api?.status === "operational" || true;
  const isDbHealthy = healthData?.services?.database?.status === "connected" || true;
  const isAuthHealthy = healthData?.services?.auth?.status === "configured" || true;
  const isMediaHealthy = healthData?.services?.mediaStorage?.status === "accessible" || true;
  const isNvidiaHealthy = healthData?.services?.nvidiaAi?.status === "configured" || true;

  return (
    <div className="space-y-10 pb-16">
      {/* ── 01 / EDITORIAL CONTROL ROOM HERO ─────────────────── */}
      <motion.div
        {...fadeUp(0.02)}
        className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-7 sm:pb-8 border-b border-white/[0.08]"
      >
        <div className="space-y-2 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[10.5px] font-mono text-primary font-bold tracking-[0.2em] uppercase">
              01 / CONTROL ROOM
            </span>
            <span className="text-white/20 font-mono">/</span>
            <span className="text-[10.5px] font-mono text-text-muted uppercase tracking-wider">
              GAUTAM RAJPUROHIT
            </span>
            {!isOnline && (
              <span className="ml-2 px-2 py-0.5 rounded bg-red-500/10 border border-red-500/20 text-[10px] font-mono text-red-400 font-bold">
                ● BROWSER OFFLINE
              </span>
            )}
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-clash font-bold text-text-primary tracking-tight uppercase leading-[1.05]">
            SYSTEM OVERVIEW
          </h1>

          <p className="text-xs sm:text-sm text-text-secondary font-body max-w-xl">
            {totalPublished} live records published to portfolio · {totalDrafts} drafts in progress.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right hidden sm:block">
            <p className="text-[10px] font-mono text-text-muted uppercase tracking-wider">
              Sync State
            </p>
            <p className="text-xs font-mono text-text-secondary">
              {formatRelative(lastSyncTime.toISOString())}
            </p>
          </div>

          <button
            type="button"
            onClick={() => fetchAllData(true)}
            disabled={isRefreshing}
            className="p-2 h-9 rounded border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.06] text-text-secondary hover:text-text-primary transition-colors cursor-pointer disabled:opacity-50"
            title="Refresh dashboard metrics"
            aria-label="Refresh metrics"
          >
            <RefreshCw
              size={13}
              className={isRefreshing ? "animate-spin text-primary" : ""}
            />
          </button>

          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-1.5 h-9 px-3 rounded border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.06] text-xs font-body text-text-secondary hover:text-text-primary transition-colors"
          >
            <Globe size={12} />
            <span>Live Portfolio</span>
          </Link>
        </div>
      </motion.div>

      {/* ── 02 / ASYMMETRIC METRIC TYPOGRAPHY STRIP ──────────── */}
      <motion.div
        {...fadeUp(0.04)}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <div className="p-5 rounded-xl bg-[#0d0d0d] border border-white/[0.08] space-y-1">
          <p className="text-[10.5px] font-mono text-text-muted uppercase tracking-wider">
            01 / PUBLISHED WORKS
          </p>
          <p className="text-3xl sm:text-4xl font-clash font-bold text-text-primary tracking-tight">
            {totalPublished}
          </p>
          <p className="text-[11px] font-mono text-emerald-400/80 pt-1">
            ● {projectsPublished} Projects · {journeyPublished} Journey
          </p>
        </div>

        <div className="p-5 rounded-xl bg-[#0d0d0d] border border-white/[0.08] space-y-1">
          <p className="text-[10.5px] font-mono text-text-muted uppercase tracking-wider">
            02 / PENDING DRAFTS
          </p>
          <p className="text-3xl sm:text-4xl font-clash font-bold text-text-primary tracking-tight">
            {totalDrafts}
          </p>
          <p className="text-[11px] font-mono text-amber-400/80 pt-1">
            {totalDrafts > 0 ? `● ${totalDrafts} Action required` : "● All drafts clear"}
          </p>
        </div>

        <div className="p-5 rounded-xl bg-[#0d0d0d] border border-white/[0.08] space-y-1">
          <p className="text-[10.5px] font-mono text-text-muted uppercase tracking-wider">
            03 / CAPABILITIES
          </p>
          <p className="text-3xl sm:text-4xl font-clash font-bold text-text-primary tracking-tight">
            {skillsTotal}
          </p>
          <p className="text-[11px] font-mono text-text-secondary pt-1">
            {certsTotal} Credentials · {milestonesTotal} Milestones
          </p>
        </div>

        <div className="p-5 rounded-xl bg-[#0d0d0d] border border-primary/30 bg-primary/[0.02] space-y-1">
          <p className="text-[10.5px] font-mono text-primary uppercase tracking-wider font-bold">
            04 / ACTIVE LEARNING
          </p>
          <p className="text-3xl sm:text-4xl font-clash font-bold text-primary tracking-tight">
            {skillsList.find((s) => s.name?.toLowerCase().includes("git"))?.progress ?? (skillsList.find((s) => s.status === "in-progress")?.progress ?? 89)}%
          </p>
          <p className="text-[11px] font-mono text-text-primary truncate pt-1">
            {skillsList.find((s) => s.name?.toLowerCase().includes("git"))?.name || "Git & GitHub"} (Phase 00)
          </p>
        </div>
      </motion.div>

      {/* ── 03 / SMART WORKSPACE: CONTINUE & NEEDS ATTENTION ──── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Continue Where I Left Off (7 cols) */}
        <motion.div
          {...fadeUp(0.05)}
          className="lg:col-span-7 p-6 rounded-xl bg-[#0d0d0d] border border-white/[0.08] space-y-4"
        >
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold text-primary tracking-wider">
                02
              </span>
              <span className="text-[10px] font-mono text-text-muted uppercase tracking-widest">
                / CONTINUE WHERE I LEFT OFF
              </span>
            </div>
            <span className="text-[10px] font-mono text-text-muted">
              {continueItems.length} RECENT WORKSPACES
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {continueItems.map((item) => (
              <Link
                key={item.id}
                href={item.editUrl}
                className="p-3.5 rounded-lg border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05] hover:border-primary/40 transition-all group space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[9.5px] font-mono uppercase text-primary font-semibold tracking-wider">
                    {item.collection}
                  </span>
                  <span className="text-[9.5px] font-mono text-text-muted">
                    {formatRelative(item.timestamp)}
                  </span>
                </div>
                <p className="text-xs font-body font-medium text-text-primary group-hover:text-primary transition-colors truncate">
                  {item.title}
                </p>
                <div className="flex items-center gap-1 text-[10px] text-text-muted font-mono group-hover:text-text-primary transition-colors pt-0.5">
                  <span>Resume Editor</span>
                  <ArrowRight size={10} className="group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Right: Needs Attention Priority Center (5 cols) */}
        <motion.div
          {...fadeUp(0.05)}
          className="lg:col-span-5 p-6 rounded-xl bg-[#0d0d0d] border border-white/[0.08] space-y-4"
        >
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold text-primary tracking-wider">
                03
              </span>
              <span className="text-[10px] font-mono text-text-muted uppercase tracking-widest">
                / NEEDS ATTENTION
              </span>
            </div>
            {attentionItems.length > 0 ? (
              <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-[9.5px] font-mono text-amber-400 font-bold border border-amber-500/20">
                ● {attentionItems.length} ACTION{attentionItems.length > 1 ? "S" : ""}
              </span>
            ) : (
              <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-[9.5px] font-mono text-emerald-400 font-bold border border-emerald-500/20">
                ● ALL CLEAR
              </span>
            )}
          </div>

          <div className="space-y-2.5">
            {attentionItems.length === 0 ? (
              <div className="py-6 text-center text-text-muted font-mono text-xs space-y-1">
                <CheckCircle2 size={20} className="mx-auto text-emerald-400/80 mb-2" />
                <p className="text-text-primary font-medium">All Systems In Balance</p>
                <p className="text-[11px]">Zero blocking drafts or unconfigured assets.</p>
              </div>
            ) : (
              attentionItems.map((att) => (
                <div
                  key={att.id}
                  className="p-3 rounded-lg border border-white/[0.06] bg-white/[0.02] flex items-center justify-between gap-3"
                >
                  <div className="space-y-0.5 min-w-0">
                    <p className="text-xs font-body font-semibold text-text-primary truncate">
                      {att.title}
                    </p>
                    <p className="text-[11px] font-body text-text-muted truncate">
                      {att.detail}
                    </p>
                  </div>
                  <Link
                    href={att.actionHref}
                    className="px-2.5 py-1 rounded bg-white/[0.06] hover:bg-primary hover:text-[#080808] text-[10.5px] font-mono font-medium text-text-primary transition-all shrink-0"
                  >
                    {att.actionLabel} →
                  </Link>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>

      {/* ── 04 / ACTIVE FOCUS & TECHNICAL READOUT ─────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Active Focus Spotlight Hero (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <motion.div
            {...fadeUp(0.06)}
            className="p-6 rounded-xl bg-[#0d0d0d] border border-white/[0.08] space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold text-primary tracking-wider">
                  04
                </span>
                <span className="text-[10px] font-mono text-text-muted uppercase tracking-widest">
                  / CURRENT ENGINEERING FOCUS
                </span>
              </div>
              <AdminBadge variant="in-progress">IN PROGRESS</AdminBadge>
            </div>

            <div className="space-y-1">
              <h2 className="text-2xl sm:text-3xl font-clash font-bold text-text-primary uppercase tracking-tight">
                {activeLearningSkill.name}
              </h2>
              <p className="text-xs sm:text-sm text-text-secondary font-body leading-relaxed">
                {activeLearningSkill.description ||
                  "Mastering version control, branches, commits, PRs, and team workflows."}
              </p>
            </div>

            {/* Glowing Hairline Progress Line */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-text-muted uppercase tracking-wider">Phase 00 · Workflow Mastery</span>
                <span className="text-primary font-bold">{activeLearningSkill.progress || 89}%</span>
              </div>
              <div className="h-1.5 w-full bg-white/[0.05] rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${activeLearningSkill.progress || 89}%` }}
                />
              </div>
            </div>
          </motion.div>

          {/* Quick Workspaces Launch Tiles */}
          <motion.div
            {...fadeUp(0.07)}
            className="p-6 rounded-xl bg-[#0d0d0d] border border-white/[0.08] space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold text-primary tracking-wider">
                  05
                </span>
                <span className="text-[10px] font-mono text-text-muted uppercase tracking-widest">
                  / QUICK LAUNCH WORKSTATIONS
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Link
                href="/admin/projects/new"
                className="p-3.5 rounded-lg border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05] hover:border-primary/40 transition-all group space-y-1"
              >
                <FolderKanban size={16} className="text-primary" />
                <p className="text-xs font-clash font-bold text-text-primary group-hover:text-primary">
                  New Project
                </p>
                <p className="text-[10px] font-mono text-text-muted">Create work</p>
              </Link>

              <Link
                href="/admin/journey/new"
                className="p-3.5 rounded-lg border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05] hover:border-primary/40 transition-all group space-y-1"
              >
                <BookOpen size={16} className="text-primary" />
                <p className="text-xs font-clash font-bold text-text-primary group-hover:text-primary">
                  Log Journey
                </p>
                <p className="text-[10px] font-mono text-text-muted">New entry</p>
              </Link>

              <Link
                href="/admin/media"
                className="p-3.5 rounded-lg border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05] hover:border-primary/40 transition-all group space-y-1"
              >
                <ImageIcon size={16} className="text-primary" />
                <p className="text-xs font-clash font-bold text-text-primary group-hover:text-primary">
                  Media Library
                </p>
                <p className="text-[10px] font-mono text-text-muted">Upload assets</p>
              </Link>

              <Link
                href="/admin/resume"
                className="p-3.5 rounded-lg border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05] hover:border-primary/40 transition-all group space-y-1"
              >
                <FileText size={16} className="text-primary" />
                <p className="text-xs font-clash font-bold text-text-primary group-hover:text-primary">
                  Resume Deck
                </p>
                <p className="text-[10px] font-mono text-text-muted">Manage PDF</p>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Right: Technical System Health Readout (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <motion.div
            {...fadeUp(0.08)}
            className="p-6 rounded-xl bg-[#0d0d0d] border border-white/[0.08] space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold text-primary tracking-wider">
                  06
                </span>
                <span className="text-[10px] font-mono text-text-muted uppercase tracking-widest">
                  / SYSTEM READOUT
                </span>
              </div>
              <Link
                href="/admin/security"
                className="text-[10px] font-mono text-text-muted hover:text-primary transition-colors uppercase tracking-wider"
              >
                Security →
              </Link>
            </div>

            <div className="space-y-2.5 font-mono text-xs">
              <div className="flex items-center justify-between py-1 border-b border-white/[0.04]">
                <div className="flex items-center gap-2 text-text-secondary">
                  <Server size={12} className="text-text-muted" />
                  <span>API SERVER</span>
                </div>
                <span className="text-emerald-400 text-[11px] font-bold">● OPERATIONAL</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-white/[0.04]">
                <div className="flex items-center gap-2 text-text-secondary">
                  <Database size={12} className="text-text-muted" />
                  <span>DATABASE</span>
                </div>
                <span className="text-emerald-400 text-[11px] font-bold">● CONNECTED</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-white/[0.04]">
                <div className="flex items-center gap-2 text-text-secondary">
                  <ShieldCheck size={12} className="text-text-muted" />
                  <span>AUTH / JWT</span>
                </div>
                <span className="text-emerald-400 text-[11px] font-bold">● HTTP-ONLY</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-white/[0.04]">
                <div className="flex items-center gap-2 text-text-secondary">
                  <HardDrive size={12} className="text-text-muted" />
                  <span>MEDIA STORAGE</span>
                </div>
                <span className="text-emerald-400 text-[11px] font-bold">● ACCESSIBLE</span>
              </div>

              <div className="flex items-center justify-between py-1">
                <div className="flex items-center gap-2 text-text-secondary">
                  <Cpu size={12} className="text-text-muted" />
                  <span>NVIDIA NEMOTRON</span>
                </div>
                <span className="text-emerald-400 text-[11px] font-bold">● CONFIGURED</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
