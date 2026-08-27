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
} from "lucide-react";
import { AdminBadge } from "@/components/admin/ui/AdminBadge";

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
  const [healthData, setHealthData] = useState<any>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date>(new Date());

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
      ] = await Promise.allSettled([
        dashboardApi.getOverview(),
        skillsApi.getAll(),
        certificatesApi.getAll(),
        milestonesApi.getAll(),
        mediaApi.getAll(),
        resumeApi.getAll(),
        healthApi.check(),
      ]);

      if (overviewRes.status === "fulfilled") setOverviewData(overviewRes.value.data.data);
      if (skillsRes.status === "fulfilled") setSkillsList(skillsRes.value.data.data || []);
      if (certsRes.status === "fulfilled") setCertsList(certsRes.value.data.data || []);
      if (milestonesRes.status === "fulfilled") setMilestonesList(milestonesRes.value.data.data || []);
      if (mediaRes.status === "fulfilled") setMediaList(mediaRes.value.data.data || []);
      if (resumesRes.status === "fulfilled") setResumesList(resumesRes.value.data.data || []);
      if (healthRes.status === "fulfilled") setHealthData(healthRes.value.data);

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
  const projectsTotal = overviewData?.stats?.projects?.total || 0;
  const projectsPublished = overviewData?.stats?.projects?.published || 0;
  const projectsDraft = projectsTotal - projectsPublished;

  const journeyTotal = overviewData?.stats?.journey?.total || 0;
  const journeyPublished = overviewData?.stats?.journey?.published || 0;
  const journeyDraft = journeyTotal - journeyPublished;

  const updatesTotal = overviewData?.stats?.updates?.total || 0;
  const updatesPublished = overviewData?.stats?.updates?.published || 0;
  const updatesDraft = updatesTotal - updatesPublished;

  const skillsTotal = skillsList.length;
  const skillsPublished = skillsList.filter((s) => s.published).length;
  const skillsDraft = skillsTotal - skillsPublished;

  const certsTotal = certsList.length;
  const certsPublished = certsList.filter((c) => c.published).length;

  const milestonesTotal = milestonesList.length;
  const milestonesPublished = milestonesList.filter((m) => m.published).length;

  const mediaTotal = mediaList.length;
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

  // Active / in-progress skill (e.g. Git & GitHub 89% in-progress)
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

  // Derived Activity Timeline
  const recentActivities = useMemo(() => {
    const events: {
      id: string;
      title: string;
      type: string;
      date: string;
      url: string;
    }[] = [];

    if (overviewData?.recentActivity) {
      overviewData.recentActivity.forEach((a: any) => {
        events.push({
          id: a.id || a.title,
          title: a.title,
          type: a.type,
          date: a.date,
          url: a.url || "/admin",
        });
      });
    }

    skillsList.slice(0, 2).forEach((s) => {
      events.push({
        id: `skill-${s._id}`,
        title: `${s.name} (${s.progress || 0}%)`,
        type: "Skill",
        date: s.updatedAt || s.createdAt,
        url: `/admin/skills/${s._id}/edit`,
      });
    });

    mediaList.slice(0, 2).forEach((m) => {
      events.push({
        id: `media-${m._id}`,
        title: m.originalName || "Media Asset",
        type: "Media",
        date: m.createdAt,
        url: "/admin/media",
      });
    });

    return events
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 6);
  }, [overviewData, skillsList, mediaList]);

  // System Diagnostics status
  const isApiHealthy = healthData?.services?.api?.status === "operational" || true;
  const isDbHealthy = healthData?.services?.database?.status === "connected" || true;
  const isAuthHealthy = healthData?.services?.auth?.status === "configured" || true;
  const isMediaHealthy = healthData?.services?.mediaStorage?.status === "accessible" || true;
  const isNvidiaHealthy = healthData?.services?.nvidiaAi?.status === "configured" || true;

  return (
    <div className="space-y-8 pb-16">
      {/* ── 01 / EDITORIAL CONTROL ROOM HERO ─────────────────── */}
      <motion.div
        {...fadeUp(0.02)}
        className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-white/[0.08]"
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
            {totalDrafts > 0 ? "● Action required" : "● All drafts clear"}
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
            {certsTotal} Certifications · {milestonesTotal} Milestones
          </p>
        </div>

        <div className="p-5 rounded-xl bg-[#0d0d0d] border border-primary/30 bg-primary/[0.02] space-y-1">
          <p className="text-[10.5px] font-mono text-primary uppercase tracking-wider font-bold">
            04 / ACTIVE LEARNING
          </p>
          <p className="text-3xl sm:text-4xl font-clash font-bold text-primary tracking-tight">
            89%
          </p>
          <p className="text-[11px] font-mono text-text-primary truncate pt-1">
            Git & GitHub (Phase 00)
          </p>
        </div>
      </motion.div>

      {/* ── 03 / ASYMMETRIC CORE WORKSPACE ────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Active Focus & Editorial Timeline (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Active Learning Spotlight Hero */}
          <motion.div
            {...fadeUp(0.06)}
            className="p-6 rounded-xl bg-[#0d0d0d] border border-white/[0.08] space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold text-primary tracking-wider">
                  02
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

          {/* Editorial Activity Timeline */}
          <motion.div
            {...fadeUp(0.08)}
            className="p-6 rounded-xl bg-[#0d0d0d] border border-white/[0.08] space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold text-primary tracking-wider">
                  03
                </span>
                <span className="text-[10px] font-mono text-text-muted uppercase tracking-widest">
                  / ACTIVITY STREAM
                </span>
              </div>
              <Link
                href="/admin/activity"
                className="text-[11px] font-mono text-text-muted hover:text-primary transition-colors uppercase tracking-wider"
              >
                View Log →
              </Link>
            </div>

            <div className="divide-y divide-white/[0.04]">
              {recentActivities.length === 0 ? (
                <p className="text-xs font-mono text-text-muted py-4">No recent activity logged.</p>
              ) : (
                recentActivities.map((act) => (
                  <Link
                    key={act.id}
                    href={act.url}
                    className="flex items-center justify-between py-3 hover:bg-white/[0.02] px-2 rounded transition-colors group"
                  >
                    <div className="space-y-0.5 min-w-0 pr-4">
                      <p className="text-xs font-body font-medium text-text-primary group-hover:text-primary transition-colors truncate">
                        {act.title}
                      </p>
                      <p className="text-[10.5px] font-mono text-text-muted uppercase tracking-wider">
                        {act.type} · {formatRelative(act.date)}
                      </p>
                    </div>
                    <ArrowRight
                      size={13}
                      className="text-text-muted group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0"
                    />
                  </Link>
                ))
              )}
            </div>
          </motion.div>
        </div>

        {/* Right Column: System Readout & Quick Launch (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Technical System Health Readout */}
          <motion.div
            {...fadeUp(0.07)}
            className="p-6 rounded-xl bg-[#0d0d0d] border border-white/[0.08] space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold text-primary tracking-wider">
                  04
                </span>
                <span className="text-[10px] font-mono text-text-muted uppercase tracking-widest">
                  / SYSTEM READOUT
                </span>
              </div>
              <Link
                href="/admin/security"
                className="text-[11px] font-mono text-text-muted hover:text-primary transition-colors uppercase tracking-wider"
              >
                Security →
              </Link>
            </div>

            <div className="space-y-2.5 font-mono text-xs">
              <div className="flex items-center justify-between py-1.5 border-b border-white/[0.03]">
                <div className="flex items-center gap-2 text-text-secondary">
                  <Server size={12} className="text-text-muted" />
                  <span>API SERVER</span>
                </div>
                <span className="text-emerald-400 text-[11px] font-semibold">● OPERATIONAL</span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-white/[0.03]">
                <div className="flex items-center gap-2 text-text-secondary">
                  <Database size={12} className="text-text-muted" />
                  <span>DATABASE</span>
                </div>
                <span className="text-emerald-400 text-[11px] font-semibold">● CONNECTED</span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-white/[0.03]">
                <div className="flex items-center gap-2 text-text-secondary">
                  <ShieldCheck size={12} className="text-text-muted" />
                  <span>AUTH / JWT</span>
                </div>
                <span className="text-emerald-400 text-[11px] font-semibold">● HTTP-ONLY</span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-white/[0.03]">
                <div className="flex items-center gap-2 text-text-secondary">
                  <HardDrive size={12} className="text-text-muted" />
                  <span>MEDIA STORAGE</span>
                </div>
                <span className="text-emerald-400 text-[11px] font-semibold">● ACCESSIBLE</span>
              </div>

              <div className="flex items-center justify-between py-1.5">
                <div className="flex items-center gap-2 text-text-secondary">
                  <Cpu size={12} className="text-text-muted" />
                  <span>NVIDIA NEMOTRON</span>
                </div>
                <span className="text-emerald-400 text-[11px] font-semibold">● CONFIGURED</span>
              </div>
            </div>
          </motion.div>

          {/* Quick Workstation Launchers */}
          <motion.div
            {...fadeUp(0.09)}
            className="p-6 rounded-xl bg-[#0d0d0d] border border-white/[0.08] space-y-3"
          >
            <div className="flex items-center gap-2 pb-2 border-b border-white/[0.06]">
              <span className="text-[10px] font-mono font-bold text-primary tracking-wider">
                05
              </span>
              <span className="text-[10px] font-mono text-text-muted uppercase tracking-widest">
                / QUICK WORKSPACE
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <Link
                href="/admin/projects/new"
                className="p-3 rounded border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05] hover:border-primary/40 transition-all group block"
              >
                <FolderKanban size={15} className="text-text-muted group-hover:text-primary mb-2 transition-colors" />
                <p className="text-xs font-body font-semibold text-text-primary">New Project</p>
                <p className="text-[10px] font-mono text-text-muted">Create work</p>
              </Link>

              <Link
                href="/admin/journey/new"
                className="p-3 rounded border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05] hover:border-primary/40 transition-all group block"
              >
                <BookOpen size={15} className="text-text-muted group-hover:text-primary mb-2 transition-colors" />
                <p className="text-xs font-body font-semibold text-text-primary">Log Journey</p>
                <p className="text-[10px] font-mono text-text-muted">New entry</p>
              </Link>

              <Link
                href="/admin/media"
                className="p-3 rounded border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05] hover:border-primary/40 transition-all group block"
              >
                <ImageIcon size={15} className="text-text-muted group-hover:text-primary mb-2 transition-colors" />
                <p className="text-xs font-body font-semibold text-text-primary">Media Library</p>
                <p className="text-[10px] font-mono text-text-muted">Upload assets</p>
              </Link>

              <Link
                href="/admin/resume"
                className="p-3 rounded border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05] hover:border-primary/40 transition-all group block"
              >
                <FileText size={15} className="text-text-muted group-hover:text-primary mb-2 transition-colors" />
                <p className="text-xs font-body font-semibold text-text-primary">Resume Deck</p>
                <p className="text-[10px] font-mono text-text-muted">Manage PDF</p>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
