"use client";

import React, { useEffect, useState, useMemo } from "react";
import { dashboardApi } from "@/lib/api";
import {
  FolderKanban, BookOpen, Layers, Award,
  Flag, Rss, Plus, ArrowRight, BookText, Zap, Edit3, Globe, Clock, FileEdit, Layout, Paintbrush, Monitor,
  RefreshCw, CheckCircle2, AlertTriangle, Flame, Sparkles, Image as ImageIcon, Map, ExternalLink, ShieldCheck,
  TrendingUp, Check, ChevronRight, Server, Database, Lock, Terminal, Radio, Cpu
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

// ── Motion Helpers ───────────────────────────────────────────
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35, delay, ease: [0.22, 1, 0.36, 1] as const },
});

// ── Section Eyebrow Component ────────────────────────────────
function SectionHeading({ num, title, subtitle }: { num: string; title: string; subtitle?: string }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 mb-4 pb-2 border-b border-border/40 min-w-0">
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-mono text-primary font-bold uppercase tracking-widest">{num}</span>
        <span className="text-text-muted font-mono text-xs">/</span>
        <h2 className="text-sm font-clash font-semibold text-text-primary tracking-wide uppercase">{title}</h2>
      </div>
      {subtitle && (
        <span className="text-[11px] font-mono text-text-muted">{subtitle}</span>
      )}
    </div>
  );
}

// ── Relative Date Helper ─────────────────────────────────────
function formatRelative(dateString: string | null | undefined): string {
  if (!dateString) return "Never";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "Recently";
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) return "Just now";
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// ── Main Dashboard Component ──────────────────────────────────
export default function AdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeActivityTab, setActiveActivityTab] = useState<"All" | "Project" | "Journey" | "Update" | "Draft">("All");

  const fetchData = async (isManualRefresh = false) => {
    if (isManualRefresh) setIsRefreshing(true);
    try {
      const res = await dashboardApi.getOverview();
      if (res?.data?.success) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error("Dashboard fetch error", err);
    } finally {
      setIsLoading(false);
      if (isManualRefresh) setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric", year: "numeric" });

  const filteredActivity = useMemo(() => {
    if (!data?.recentActivity) return [];
    if (activeActivityTab === "All") return data.recentActivity;
    return data.recentActivity.filter((item: any) => item.type === activeActivityTab);
  }, [data?.recentActivity, activeActivityTab]);

  const totalPublished = (data?.stats?.projects?.published || 0) +
                         (data?.stats?.journey?.published || 0) +
                         (data?.stats?.updates?.published || 0);

  const totalDrafts = data?.stats?.drafts?.total || 0;

  // Fallback learning focus values
  const learningGoal = data?.currentlyLearning?.primary || "Git & GitHub Fundamentals";
  const learningRoadmap = data?.currentlyLearning?.roadmap?.length > 0
    ? data.currentlyLearning.roadmap
    : ["Pseudocode & Logic", "C Programming", "C++ Fundamentals", "Data Structures & Algorithms"];

  return (
    <div className="space-y-12 sm:space-y-14 min-w-0 max-w-[1360px] mx-auto pb-20">

      {/* ── 01 / CONTROL CENTER (WELCOME HERO) ───────────────── */}
      <motion.section {...fadeUp(0)} className="min-w-0">
        <div className="relative overflow-hidden rounded-xl bg-[#111111]/90 border border-border/70 p-6 sm:p-7 shadow-lg min-w-0">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5 min-w-0">
            <div className="space-y-1.5 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-primary font-bold uppercase tracking-widest">01</span>
                <span className="text-text-muted font-mono text-xs">/</span>
                <span className="text-[11px] font-mono text-text-muted uppercase tracking-wider">Control Center</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-clash font-bold text-text-primary tracking-tight">
                {greeting}, <span className="text-primary">Gautam.</span>
              </h1>
              <p className="text-xs sm:text-sm text-[#b5b1ab] max-w-xl leading-relaxed">
                Your portfolio is synchronized. Create, document, publish, and manage your engineering journey.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-shrink-0">
              <div className="px-3 py-1.5 rounded-lg bg-bg border border-border/70 text-xs font-mono text-[#c2beb6]">
                {today}
              </div>
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono ${
                data ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400" : "bg-yellow-500/10 border border-yellow-500/20 text-yellow-400"
              }`}>
                <span className={`w-2 h-2 rounded-full ${data ? "bg-emerald-400 animate-pulse" : "bg-yellow-400"}`} />
                <span>{data ? "System Online" : isLoading ? "Connecting…" : "Offline"}</span>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* ── 02 / SYSTEM METRICS (PRIMARY + SECONDARY) ────────── */}
      <motion.section {...fadeUp(0.04)} className="space-y-3 min-w-0">
        <SectionHeading num="02" title="System Metrics" subtitle="Real-time aggregation" />

        {/* Primary Metric Panel: Total Published */}
        <div className="bg-[#131313] border border-border/80 rounded-xl p-6 sm:p-7 flex flex-col justify-between overflow-hidden relative min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <div className="space-y-0.5">
              <span className="text-[11px] font-mono text-text-muted uppercase tracking-widest font-medium">Total Published Content</span>
              <div className="flex items-baseline gap-3">
                <span className="text-3xl sm:text-4xl font-clash font-bold text-text-primary tracking-tight">
                  {totalPublished}
                </span>
                <span className="text-xs sm:text-sm font-mono text-[#b5b1ab]">live entries in public showcase</span>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-border/60 text-xs font-mono text-[#c2beb6] self-start sm:self-auto">
              <span className="w-2 h-2 rounded-full bg-primary" />
              <span>Development Sync Active</span>
            </div>
          </div>

          <div className="pt-4 mt-1 border-t border-border/50 flex flex-wrap items-center gap-3 text-xs font-mono text-[#b5b1ab]">
            <span className="text-text-primary font-medium">Breakdown:</span>
            <span className="px-2.5 py-0.5 rounded bg-bg border border-border/60 text-[#c2beb6]">
              <strong className="text-primary font-semibold">{data?.stats?.projects?.published || 0}</strong> Projects
            </span>
            <span className="px-2.5 py-0.5 rounded bg-bg border border-border/60 text-[#c2beb6]">
              <strong className="text-sky-400 font-semibold">{data?.stats?.journey?.published || 0}</strong> Journey Entries
            </span>
            <span className="px-2.5 py-0.5 rounded bg-bg border border-border/60 text-[#c2beb6]">
              <strong className="text-emerald-400 font-semibold">{data?.stats?.updates?.published || 0}</strong> Updates
            </span>
          </div>
        </div>

        {/* Secondary Supporting Metrics (3 Columns) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 min-w-0 pt-0.5">
          {/* Drafts */}
          <div className="bg-[#0f0f0f] border border-border/70 rounded-xl p-4 sm:p-5 flex flex-col justify-between min-w-0">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-mono text-text-muted uppercase tracking-wider">Drafts & Revisions</span>
              <Edit3 size={14} className="text-amber-400" />
            </div>
            <div className="flex items-baseline gap-2 my-0.5">
              <span className="text-2xl font-clash font-bold text-amber-400">{totalDrafts}</span>
              <span className="text-xs font-mono text-[#b5b1ab]">pending publish</span>
            </div>
            <div className="mt-2.5 pt-2.5 border-t border-border/40 flex justify-between items-center text-xs font-mono text-[#b5b1ab]">
              <span>Working copies</span>
              <Link href="/admin/settings" className="text-amber-400 hover:underline inline-flex items-center gap-1">
                Manage <ChevronRight size={10} />
              </Link>
            </div>
          </div>

          {/* Streak */}
          <div className="bg-[#0f0f0f] border border-border/70 rounded-xl p-4 sm:p-5 flex flex-col justify-between min-w-0">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-mono text-text-muted uppercase tracking-wider">Learning Streak</span>
              <Flame size={14} className="text-primary" />
            </div>
            <div className="flex items-baseline gap-2 my-0.5">
              <span className="text-2xl font-clash font-bold text-text-primary">{data?.streak || 0}</span>
              <span className="text-xs font-mono text-[#b5b1ab]">days continuous</span>
            </div>
            <div className="mt-2.5 pt-2.5 border-t border-border/40 flex justify-between items-center text-xs font-mono text-[#b5b1ab]">
              <span>Documentation</span>
              <Link href="/admin/journey/new" className="text-primary hover:underline inline-flex items-center gap-1">
                + Add Today <ChevronRight size={10} />
              </Link>
            </div>
          </div>

          {/* Last Sync */}
          <div className="bg-[#0f0f0f] border border-border/70 rounded-xl p-4 sm:p-5 flex flex-col justify-between min-w-0">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-mono text-text-muted uppercase tracking-wider">Last Sync</span>
              <Clock size={14} className="text-sky-400" />
            </div>
            <div className="flex items-baseline gap-2 my-0.5">
              <span className="text-xl font-clash font-semibold text-text-primary">
                {formatRelative(data?.siteStatus?.lastUpdated)}
              </span>
            </div>
            <div className="mt-2.5 pt-2.5 border-t border-border/40 flex justify-between items-center text-xs font-mono text-[#b5b1ab]">
              <span>Database state</span>
              <span className="text-emerald-400 font-medium">Synchronized</span>
            </div>
          </div>
        </div>
      </motion.section>

      {/* ── 03 / STUDIO (COMPACT CREATION DESKS) ──────────────── */}
      <motion.section {...fadeUp(0.08)} className="space-y-3 min-w-0">
        <SectionHeading num="03" title="Studio" subtitle="Primary creation desks" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 min-w-0">
          {/* 1. New Project */}
          <Link
            href="/admin/projects/new"
            className="group flex flex-col justify-between p-5 rounded-xl bg-[#141414] border border-border/80 hover:border-amber-400/50 hover:bg-white/[0.02] transition-all min-w-0"
          >
            <div className="space-y-2 min-w-0">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-lg bg-amber-400/10 border border-amber-400/20 text-amber-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <FolderKanban size={16} />
                </div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-text-muted group-hover:text-amber-400 transition-colors px-2 py-0.5 rounded bg-white/[0.03] border border-border/50">
                  Portfolio
                </span>
              </div>
              <h3 className="text-base font-clash font-semibold text-text-primary group-hover:text-amber-400 transition-colors">
                New Project
              </h3>
              <p className="text-xs text-[#b5b1ab] leading-relaxed">
                Showcase a new technical build, architecture breakdown, or case study.
              </p>
            </div>
            <div className="mt-4 pt-2.5 border-t border-border/40 flex items-center justify-between text-xs font-mono text-text-muted group-hover:text-amber-400 transition-colors">
              <span>Create project</span>
              <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* 2. New Journey Entry */}
          <Link
            href="/admin/journey/new"
            className="group flex flex-col justify-between p-5 rounded-xl bg-[#141414] border border-border/80 hover:border-sky-400/50 hover:bg-white/[0.02] transition-all min-w-0"
          >
            <div className="space-y-2 min-w-0">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-lg bg-sky-400/10 border border-sky-400/20 text-sky-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <BookOpen size={16} />
                </div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-text-muted group-hover:text-sky-400 transition-colors px-2 py-0.5 rounded bg-white/[0.03] border border-border/50">
                  Milestones
                </span>
              </div>
              <h3 className="text-base font-clash font-semibold text-text-primary group-hover:text-sky-400 transition-colors">
                New Journey Entry
              </h3>
              <p className="text-xs text-[#b5b1ab] leading-relaxed">
                Document today&apos;s daily milestone, programming insight, or breakthrough.
              </p>
            </div>
            <div className="mt-4 pt-2.5 border-t border-border/40 flex items-center justify-between text-xs font-mono text-text-muted group-hover:text-sky-400 transition-colors">
              <span>Log milestone</span>
              <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* 3. New Update */}
          <Link
            href="/admin/updates/new"
            className="group flex flex-col justify-between p-5 rounded-xl bg-[#141414] border border-border/80 hover:border-emerald-400/50 hover:bg-white/[0.02] transition-all min-w-0"
          >
            <div className="space-y-2 min-w-0">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-lg bg-emerald-400/10 border border-emerald-400/20 text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Rss size={16} />
                </div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-text-muted group-hover:text-emerald-400 transition-colors px-2 py-0.5 rounded bg-white/[0.03] border border-border/50">
                  Broadcast
                </span>
              </div>
              <h3 className="text-base font-clash font-semibold text-text-primary group-hover:text-emerald-400 transition-colors">
                New Update
              </h3>
              <p className="text-xs text-[#b5b1ab] leading-relaxed">
                Post a quick changelog entry, feature announcement, or build log.
              </p>
            </div>
            <div className="mt-4 pt-2.5 border-t border-border/40 flex items-center justify-between text-xs font-mono text-text-muted group-hover:text-emerald-400 transition-colors">
              <span>Publish update</span>
              <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </motion.section>

      {/* ── 04 / MANAGEMENT & ORGANIZATION (COMPACT UTILITY TILES) ── */}
      <motion.section {...fadeUp(0.1)} className="space-y-3 min-w-0">
        <SectionHeading num="04" title="Management" subtitle="Structure & asset curation" />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 min-w-0">
          {/* Roadmap */}
          <Link
            href="/admin/roadmap"
            className="group flex flex-col justify-between p-4 rounded-xl bg-[#0e0e0e] border border-border/60 hover:border-purple-400/40 hover:bg-white/[0.015] transition-all min-w-0"
          >
            <div className="space-y-1.5 min-w-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-purple-400">
                  <Map size={15} />
                  <h4 className="text-sm font-clash font-semibold text-text-primary group-hover:text-purple-400 transition-colors">
                    Roadmap
                  </h4>
                </div>
                <span className="text-[10px] font-mono text-primary font-semibold">89%</span>
              </div>
              <p className="text-xs text-[#b5b1ab] leading-relaxed">
                Active: <strong className="text-text-primary font-medium">{learningGoal}</strong>
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-border/30 flex items-center justify-between text-[11px] font-mono text-text-muted group-hover:text-purple-400 transition-colors">
              <span>Manage tracks</span>
              <ChevronRight size={11} className="group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>

          {/* Media Library */}
          <Link
            href="/admin/media"
            className="group flex flex-col justify-between p-4 rounded-xl bg-[#0e0e0e] border border-border/60 hover:border-pink-400/40 hover:bg-white/[0.015] transition-all min-w-0"
          >
            <div className="space-y-1.5 min-w-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-pink-400">
                  <ImageIcon size={15} />
                  <h4 className="text-sm font-clash font-semibold text-text-primary group-hover:text-pink-400 transition-colors">
                    Media Library
                  </h4>
                </div>
                <span className="text-[10px] font-mono text-text-muted">{data?.recentMedia?.length || 0} Assets</span>
              </div>
              <p className="text-xs text-[#b5b1ab] leading-relaxed">
                Upload and organize diagrams, photos, and screenshots.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-border/30 flex items-center justify-between text-[11px] font-mono text-text-muted group-hover:text-pink-400 transition-colors">
              <span>Manage assets</span>
              <ChevronRight size={11} className="group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>

          {/* Section Manager */}
          <Link
            href="/admin/sections"
            className="group flex flex-col justify-between p-4 rounded-xl bg-[#0e0e0e] border border-border/60 hover:border-indigo-400/40 hover:bg-white/[0.015] transition-all min-w-0"
          >
            <div className="space-y-1.5 min-w-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-indigo-400">
                  <Layout size={15} />
                  <h4 className="text-sm font-clash font-semibold text-text-primary group-hover:text-indigo-400 transition-colors">
                    Page Sections
                  </h4>
                </div>
                <span className="text-[10px] font-mono text-emerald-400">Configured</span>
              </div>
              <p className="text-xs text-[#b5b1ab] leading-relaxed">
                Control section ordering and visibility on live site.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-border/30 flex items-center justify-between text-[11px] font-mono text-text-muted group-hover:text-indigo-400 transition-colors">
              <span>Configure layout</span>
              <ChevronRight size={11} className="group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>
        </div>
      </motion.section>

      {/* ── 05 / CURRENT JOURNEY (PRIMARY LEARNING & ROADMAP) ── */}
      <motion.section {...fadeUp(0.12)} className="space-y-3 min-w-0">
        <SectionHeading num="05" title="Current Journey" subtitle="Active focus & mastery" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 min-w-0">
          {/* Left: Active Goal (~60%) */}
          <div className="lg:col-span-7 bg-[#121212] border border-border/80 rounded-xl p-6 sm:p-7 flex flex-col justify-between min-w-0">
            <div className="space-y-3 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-primary uppercase tracking-widest font-semibold">
                  Currently Learning
                </span>
                <span className="text-xs font-mono text-primary font-bold px-2.5 py-0.5 rounded bg-primary/10 border border-primary/20">
                  89%
                </span>
              </div>

              <div className="space-y-1 min-w-0">
                <h3 className="text-2xl sm:text-3xl font-clash font-bold text-text-primary break-words">
                  {learningGoal}
                </h3>
                <p className="text-xs sm:text-sm text-[#b5b1ab] leading-relaxed">
                  Learning version control, branch management, and collaborative open-source workflows from first principles.
                </p>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5 pt-1">
                <div className="h-2.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                  <div className="h-full bg-gradient-to-r from-primary/80 to-primary rounded-full transition-all duration-700 w-[89%]" />
                </div>
                <div className="flex justify-between text-[10px] font-mono text-text-muted">
                  <span>Foundations</span>
                  <span>Mastery in progress (89%)</span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-border/50 flex justify-between items-center text-xs font-mono">
              <span className="text-[#b5b1ab]">Configured in Profile Settings</span>
              <Link href="/admin/settings" className="text-primary hover:underline inline-flex items-center gap-1">
                Update Focus <ChevronRight size={11} />
              </Link>
            </div>
          </div>

          {/* Right: Up Next (~40%) */}
          <div className="lg:col-span-5 bg-[#0f0f0f] border border-border/70 rounded-xl p-6 sm:p-7 flex flex-col justify-between min-w-0">
            <div className="space-y-3 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-text-muted uppercase tracking-wider font-medium">
                  Up Next / Roadmap
                </span>
                <Link href="/admin/roadmap" className="text-[11px] font-mono text-primary hover:underline">
                  Full Roadmap →
                </Link>
              </div>

              <ul className="space-y-2 min-w-0">
                {learningRoadmap.slice(0, 4).map((target: string, index: number) => (
                  <li
                    key={index}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-bg border border-border/50 text-xs min-w-0"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-primary font-mono text-xs font-bold">{index + 1}.</span>
                      <span className="text-[#c2beb6] font-medium truncate">{target}</span>
                    </div>
                    <span className="text-[10px] font-mono text-text-muted uppercase flex-shrink-0 ml-2">Queued</span>
                  </li>
                ))}
              </ul>
            </div>

            <p className="text-[11px] font-mono text-text-muted mt-3 pt-2.5 border-t border-border/40">
              Milestones update automatically when logged.
            </p>
          </div>
        </div>
      </motion.section>

      {/* ── 06 / ACTIVITY & ASSETS ────────────────────────────── */}
      <motion.section {...fadeUp(0.14)} className="space-y-3 min-w-0">
        <SectionHeading num="06" title="Recent Activity & Media" subtitle="Event stream & asset preview" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start min-w-0">
          {/* Left: Activity Timeline (~65%) */}
          <div className="lg:col-span-8 bg-[#121212] border border-border/80 rounded-xl p-5 sm:p-7 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-border/60">
              <div className="flex items-center gap-2">
                <Clock size={15} className="text-primary" />
                <h3 className="text-base font-clash font-semibold text-text-primary">Activity Timeline</h3>
              </div>

              {/* Filter Tabs */}
              <div className="flex flex-wrap items-center gap-1 p-1 rounded-lg bg-bg border border-border/60">
                {(["All", "Project", "Journey", "Update", "Draft"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveActivityTab(tab)}
                    className={`px-2.5 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider transition-all ${
                      activeActivityTab === tab
                        ? "bg-white/10 text-primary font-semibold shadow-sm"
                        : "text-text-muted hover:text-[#c2beb6]"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {isLoading ? (
              <div className="space-y-2.5">
                {[1, 2, 3].map(i => <div key={i} className="admin-skeleton h-14 rounded-lg" />)}
              </div>
            ) : filteredActivity.length > 0 ? (
              <div className="divide-y divide-border/50 min-w-0">
                {filteredActivity.map((item: any) => (
                  <Link
                    key={`${item.type}-${item.id}`}
                    href={item.url}
                    className="flex items-center justify-between py-3 px-2 hover:bg-white/[0.02] rounded-lg transition-colors group min-w-0"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="mt-1 w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                      <div className="min-w-0 space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-white/[0.04] border border-border text-[#b5b1ab]">
                            {item.type}
                          </span>
                          <span className="text-[11px] font-mono text-text-muted">{formatRelative(item.date)}</span>
                        </div>
                        <p className="text-sm font-medium text-text-primary group-hover:text-primary transition-colors truncate">
                          {item.title || "Untitled Record"}
                        </p>
                      </div>
                    </div>
                    <ArrowRight size={13} className="text-text-muted group-hover:text-primary group-hover:translate-x-1 transition-all ml-3 flex-shrink-0" />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="py-10 px-4 text-center border border-dashed border-border/60 rounded-xl bg-bg/40 flex flex-col items-center justify-center space-y-2">
                <Clock size={18} className="text-text-muted" />
                <h4 className="text-xs font-mono uppercase tracking-wider text-text-primary font-medium">No Activity Recorded Yet</h4>
                <p className="text-xs text-[#b5b1ab] max-w-xs">
                  Start documenting your work or publishing updates to build the activity timeline.
                </p>
                <Link
                  href="/admin/projects/new"
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary text-bg text-xs font-clash font-semibold hover:bg-primary/90 mt-1"
                >
                  <span>Get Started</span>
                  <ArrowRight size={11} />
                </Link>
              </div>
            )}
          </div>

          {/* Right: Media Deck Preview (~35%) */}
          <div className="lg:col-span-4 bg-[#101010] border border-border/70 rounded-xl p-5 sm:p-6 min-w-0">
            <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-border/50">
              <div className="flex items-center gap-2">
                <ImageIcon size={15} className="text-primary" />
                <h3 className="text-sm font-clash font-semibold text-text-primary">Recent Media</h3>
              </div>
              <Link href="/admin/media" className="text-[11px] font-mono text-primary hover:underline">
                View All
              </Link>
            </div>

            {isLoading ? (
              <div className="admin-skeleton h-32 rounded-lg" />
            ) : data?.recentMedia?.length > 0 ? (
              <div className="space-y-3 min-w-0">
                <div className="grid grid-cols-2 gap-2 min-w-0">
                  {data.recentMedia.slice(0, 4).map((media: any) => (
                    <div key={media._id} className="aspect-square rounded-lg bg-bg border border-border/60 overflow-hidden relative group">
                      {media.mimeType?.startsWith('image/') ? (
                        <img 
                          src={media.url} 
                          alt={media.alt || "Asset"} 
                          className="w-full h-full object-cover transition-transform group-hover:scale-105" 
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-[10px] text-text-muted font-mono p-1">
                          <FileEdit size={16} className="mb-1 text-[#b5b1ab]" />
                          <span>FILE</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <Link
                  href="/admin/media"
                  className="flex items-center justify-center gap-1.5 w-full py-2 rounded-lg bg-white/[0.03] hover:bg-white/[0.07] border border-border/60 text-xs font-mono text-[#b5b1ab] hover:text-text-primary transition-all"
                >
                  <Plus size={12} />
                  <span>Upload Asset</span>
                </Link>
              </div>
            ) : (
              <div className="py-8 px-3 text-center border border-dashed border-border/60 rounded-xl bg-bg/40 space-y-1.5">
                <p className="text-xs font-mono text-text-muted">No media uploaded yet.</p>
                <Link href="/admin/media" className="inline-block text-xs font-clash font-semibold text-primary hover:underline">
                  + Upload First Asset
                </Link>
              </div>
            )}
          </div>
        </div>
      </motion.section>

      {/* ── 07 / SYSTEM ENVIRONMENT (OPEN RUNTIME SPECIFICATION) ─ */}
      <motion.section {...fadeUp(0.16)} className="space-y-2 min-w-0">
        <SectionHeading num="07" title="Environment" subtitle="Technical runtime specifications" />

        <div className="border-t border-b border-border/50 py-3.5 px-2 bg-transparent min-w-0">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 text-xs font-mono min-w-0">
            <div className="space-y-0.5">
              <span className="text-[10px] text-text-muted uppercase tracking-wider">Frontend Engine</span>
              <p className="text-[#c2beb6] font-medium">Next.js App Router</p>
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] text-text-muted uppercase tracking-wider">Backend Service</span>
              <p className="text-[#c2beb6] font-medium">Express API (Node.js)</p>
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] text-text-muted uppercase tracking-wider">Database Engine</span>
              <p className="text-[#c2beb6] font-medium flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                MongoDB Atlas
              </p>
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] text-text-muted uppercase tracking-wider">Authentication</span>
              <p className="text-[#c2beb6] font-medium">JWT + HTTP-Only Cookie</p>
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] text-text-muted uppercase tracking-wider">Live Status</span>
              <p className="text-emerald-400 font-semibold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Connected
              </p>
            </div>
          </div>
        </div>
      </motion.section>

    </div>
  );
}
