"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Eye, EyeOff, ArrowRight, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import axios from "axios";

function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (error.code === "ECONNABORTED" || error.message.includes("timeout"))
      return "Authentication request timed out. Check that the server is running.";
    if (!error.response)
      return "Unable to reach the authentication server. Check your connection.";
    const status = error.response.status;
    if (status === 401) return "Invalid email or password.";
    if (status === 429) return "Too many login attempts. Please wait and try again.";
    if (status >= 500) return "Something went wrong on the server. Try again shortly.";
    const msg = error.response.data?.message;
    if (msg) return msg;
  }
  if (error instanceof Error && error.message) return error.message;
  return "An unexpected error occurred. Please try again.";
}

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!email.trim()) { setErrorMsg("Please enter your admin email."); return; }
    if (!password)     { setErrorMsg("Please enter your password.");    return; }

    setIsSubmitting(true);
    try {
      const res = await authApi.login(email.trim(), password);
      if (!res?.data) throw new Error("No response from authentication server.");
      if (res.data.success) {
        login(res.data.user);
      } else {
        setErrorMsg(res.data.message || "Login failed. Please try again.");
      }
    } catch (err) {
      setErrorMsg(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex overflow-hidden admin-grain">

      {/* ── Left panel — identity statement ──────────────────── */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="hidden lg:flex flex-col justify-between w-[46%] xl:w-[42%] min-h-screen px-12 xl:px-16 py-14 border-r border-border/60 relative overflow-hidden"
      >
        {/* Ambient glow */}
        <div
          aria-hidden
          className="absolute bottom-0 left-0 w-[500px] h-[500px] opacity-[0.04] pointer-events-none"
          style={{ background: "radial-gradient(ellipse at bottom left, #e8c547 0%, transparent 65%)" }}
        />

        {/* Top — monogram */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-primary/10 border border-primary/20 rounded-lg flex items-center justify-center">
            <span className="text-sm font-clash font-bold text-primary">GR</span>
          </div>
          <div>
            <p className="text-sm font-clash font-semibold text-text-primary leading-tight">Gautam Rajpurohit</p>
            <p className="text-[11px] font-mono text-text-muted tracking-widest uppercase">Private Admin</p>
          </div>
        </div>

        {/* Middle — editorial statement */}
        <div className="relative z-10">
          <p className="text-[11px] font-mono text-text-muted tracking-widest uppercase mb-6">
            01 / Console
          </p>
          <h1 className="text-3xl xl:text-4xl font-clash font-bold text-text-primary leading-[1.15] mb-6">
            Manage the<br />
            journey.<br />
            Build in<br />
            public.
          </h1>
          <p className="text-text-secondary text-sm leading-relaxed max-w-xs">
            Document what you learn. Show the work. Every entry is a record of progress made.
          </p>

          {/* Subtle divider + tagline */}
          <div className="mt-10 flex items-center gap-4">
            <div className="h-px flex-1 bg-border/60" />
            <span className="text-[10px] font-mono text-text-muted tracking-widest uppercase">Private</span>
          </div>
        </div>

        {/* Bottom — thin accent line */}
        <div className="h-px bg-gradient-to-r from-primary/40 via-primary/10 to-transparent" />
      </motion.div>

      {/* ── Right panel — login form ──────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
        className="flex-1 flex flex-col items-center justify-center px-6 sm:px-10 py-14 min-h-screen"
      >
        {/* Mobile header (hidden on desktop) */}
        <div className="lg:hidden mb-10 text-center">
          <div className="w-10 h-10 bg-primary/10 border border-primary/20 rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-sm font-clash font-bold text-primary">GR</span>
          </div>
          <p className="text-[11px] font-mono text-text-muted tracking-widest uppercase">Admin Console</p>
        </div>

        <div className="w-full max-w-sm">
          {/* Section label */}
          <p className="text-[11px] font-mono text-text-muted tracking-widest uppercase mb-5">
            Sign in to continue
          </p>

          <form
            onSubmit={handleSubmit}
            className="space-y-4"
            autoComplete="off"
            noValidate
          >
            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="admin-email" className="block text-[11px] font-mono text-text-secondary uppercase tracking-wider">
                Admin Email
              </label>
              <input
                id="admin-email"
                name="admin-email"
                type="email"
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
                value={email}
                onChange={(e) => { setEmail(e.target.value); setErrorMsg(null); }}
                placeholder="admin@example.com"
                disabled={isSubmitting}
                className="w-full bg-white/[0.03] border border-border rounded-lg px-4 py-3 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary/60 transition-colors text-sm"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label htmlFor="admin-password" className="block text-[11px] font-mono text-text-secondary uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <input
                  id="admin-password"
                  name="admin-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setErrorMsg(null); }}
                  placeholder="Enter your password"
                  disabled={isSubmitting}
                  className="w-full bg-white/[0.03] border border-border rounded-lg px-4 py-3 pr-11 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary/60 transition-colors text-sm"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-text-muted hover:text-text-secondary transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Error */}
            <AnimateError show={!!errorMsg}>
              {errorMsg && (
                <div className="flex items-start gap-2.5 px-3 py-2.5 bg-red-500/[0.08] border border-red-500/20 rounded-lg">
                  <AlertCircle size={14} className="text-red-400 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-red-300 leading-snug">{errorMsg}</p>
                </div>
              )}
            </AnimateError>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 bg-primary text-bg font-semibold font-clash py-3 rounded-lg hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-2 text-sm tracking-wide"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-bg border-t-transparent rounded-full animate-spin" />
                  Signing in…
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </form>

          {/* Back link */}
          <div className="mt-8 pt-6 border-t border-border/40 text-center">
            <a href="/" className="text-[11px] font-mono text-text-muted hover:text-text-secondary transition-colors tracking-wider">
              ← Back to portfolio
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// Small helper for animated error reveal
function AnimateError({ show, children }: { show: boolean; children: React.ReactNode }) {
  return (
    <motion.div
      initial={false}
      animate={show ? { height: "auto", opacity: 1 } : { height: 0, opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="overflow-hidden"
    >
      {children}
    </motion.div>
  );
}
