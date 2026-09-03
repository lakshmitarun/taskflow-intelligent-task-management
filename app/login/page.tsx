"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/auth-store";
import { useRouter } from "next/navigation";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  Check,
  ArrowRight,
  ShieldCheck
} from "lucide-react";
import Link from "next/link";

interface PublicStats {
  totalUsers: number;
  totalTasks: number;
  avatars: string[];
  label: string;
}

export default function LoginPage() {
  const { login, error: authError, loading: isAuthStoreLoading } = useAuthStore();
  const router = useRouter();

  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Real stats from MongoDB
  const [stats, setStats] = useState<PublicStats | null>(null);

  // Validation & status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customValidationError, setCustomValidationError] = useState("");
  const [forgotMsg, setForgotMsg] = useState("");

  useEffect(() => {
    fetch("/api/public-stats")
      .then((res) => res.json())
      .then((data) => {
        if (data && Array.isArray(data.avatars)) {
          setStats(data);
        }
      })
      .catch((err) => console.error("Failed to load stats:", err));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setCustomValidationError("");
    setForgotMsg("");

    if (!email.trim() || !email.includes("@")) {
      setCustomValidationError("Please enter a valid email address.");
      return;
    }

    if (!password) {
      setCustomValidationError("Please enter your password.");
      return;
    }

    setIsSubmitting(true);
    const success = await login(email, password);
    setIsSubmitting(false);

    if (success) {
      router.push("/");
      router.refresh();
    }
  }

  const isLoading = isSubmitting || isAuthStoreLoading;
  const displayError = customValidationError || authError;

  return (
    <div className="tf-auth-page">
      {/* Top Navigation Header */}
      <header className="tf-auth-header">
        <Link href="/" className="tf-auth-logo">
          <div className="tf-logo-icon">
            <Check size={20} strokeWidth={3} />
          </div>
          <span>TaskFlow</span>
        </Link>
        <div className="tf-auth-status">
          <span>Secure Workspace Authentication</span>
          <span className="tf-status-dot"></span>
        </div>
      </header>

      {/* Main Split Layout Container */}
      <div className="tf-auth-split-container">
        {/* Left Column: Visual Showcase Hero */}
        <div className="tf-auth-hero">
          <div className="tf-auth-hero-pattern" />

          {/* Top Logo & Release Badge */}
          <div className="tf-hero-top-bar">
            <div className="tf-auth-logo" style={{ color: "#ffffff" }}>
              <div
                className="tf-logo-icon"
                style={{
                  background: "rgba(255,255,255,0.2)",
                  backdropFilter: "blur(8px)",
                  boxShadow: "none"
                }}
              >
                <Check size={18} strokeWidth={3} />
              </div>
              <span style={{ fontSize: "16px" }}>TaskFlow</span>
            </div>

            <div className="tf-hero-release-badge">
              <span
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  background: "#22d3ee"
                }}
              />
              v3.4 Release
            </div>
          </div>

          {/* Center Copy & Typography */}
          <div className="tf-hero-content">
            <div className="tf-hero-tag">
              <span>⚡</span> NEXT-GEN SPRINT EXECUTION
            </div>
            <h1 className="tf-hero-title">
              Manage work.
              <br />
              Move faster.
            </h1>
            <p className="tf-hero-subtitle">
              Plan, prioritize, and track your team&apos;s work in one intelligent workspace.
            </p>

            {/* Dashboard Visual Mockup Graphic */}
            <div className="tf-hero-graphic-card">
              <div className="tf-mock-window-header">
                <div className="tf-mock-dots">
                  <div className="tf-mock-dot red" />
                  <div className="tf-mock-dot yellow" />
                  <div className="tf-mock-dot green" />
                </div>
                <div className="tf-mock-search" />
              </div>

              <div className="tf-mock-body">
                <div className="tf-mock-card">
                  <div className="tf-mock-bar-list">
                    <div className="tf-mock-bar w-75" />
                    <div className="tf-mock-bar w-50" />
                    <div className="tf-mock-bar w-90" />
                  </div>
                </div>
                <div className="tf-mock-card">
                  <div className="tf-mock-bar-list">
                    <div className="tf-mock-bar w-90" style={{ background: "rgba(99,102,241,0.5)" }} />
                    <div className="tf-mock-bar w-40" />
                    <div
                      style={{
                        height: "28px",
                        borderRadius: "6px",
                        background: "linear-gradient(90deg, rgba(99,102,241,0.3), rgba(168,85,247,0.3))",
                        marginTop: "6px"
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Floating Speed Badge */}
              <div className="tf-floating-badge">
                <div className="tf-floating-badge__icon">
                  <Check size={12} strokeWidth={3} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: "11px" }}>+38% Speed</div>
                  <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.7)" }}>Automated sprints</div>
                </div>
              </div>
            </div>
          </div>

          {/* Hero Bottom Bar */}
          <div className="tf-hero-footer">
            <div className="tf-hero-social-proof" style={{ width: "100%", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                {stats?.avatars && stats.avatars.length > 0 && (
                  <div className="tf-avatar-stack">
                    {stats.avatars.map((av, idx) => (
                      <div key={idx} className={`tf-avatar bg-${(idx % 3) + 1}`}>
                        {av}
                      </div>
                    ))}
                  </div>
                )}
                <span style={{ fontSize: "11.5px", color: "rgba(255,255,255,0.85)" }}>
                  {stats?.label ?? "Active TaskFlow Workspace"}
                </span>
              </div>
              {stats?.totalTasks !== undefined && (
                <span className="tf-hero-rating">
                  {stats.totalTasks} {stats.totalTasks === 1 ? "Task" : "Tasks"}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Auth Form Section */}
        <div className="tf-auth-form-column">
          {/* Form Header */}
          <div className="tf-form-header">
            <div className="tf-auth-logo" style={{ marginBottom: "14px" }}>
              <div className="tf-logo-icon">
                <Check size={18} strokeWidth={3} />
              </div>
              <span>TaskFlow</span>
            </div>
            <h2 className="tf-form-title">Welcome back</h2>
            <p className="tf-form-subtitle">Sign in to continue to TaskFlow</p>
          </div>

          {/* Error Banner */}
          {displayError && (
            <div className="tf-error-banner">
              <AlertCircle size={16} />
              <span>{displayError}</span>
            </div>
          )}

          {forgotMsg && (
            <div
              className="tf-error-banner"
              style={{
                background: "rgba(99,102,241,0.1)",
                borderColor: "rgba(99,102,241,0.3)",
                color: "#4f46e5"
              }}
            >
              <ShieldCheck size={16} />
              <span>{forgotMsg}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit}>
            {/* Email Field */}
            <div className="tf-form-group">
              <div className="tf-form-label-row">
                <label className="tf-form-label">Email address</label>
              </div>
              <div className="tf-input-wrapper">
                <Mail size={16} className="tf-input-icon" />
                <input
                  type="email"
                  className={`tf-input-field ${customValidationError ? "error" : ""}`}
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="tf-form-group">
              <div className="tf-form-label-row">
                <label className="tf-form-label">Password</label>
                <button
                  type="button"
                  className="tf-forgot-link"
                  onClick={() =>
                    setForgotMsg("Password reset link sent! Check your inbox.")
                  }
                >
                  Forgot password?
                </button>
              </div>
              <div className="tf-input-wrapper">
                <Lock size={16} className="tf-input-icon" />
                <input
                  type={showPassword ? "text" : "password"}
                  className="tf-input-field"
                  placeholder="••••••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="tf-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Remember Me & SSL Row */}
            <div className="tf-form-options">
              <label className="tf-remember-me">
                <input
                  type="checkbox"
                  className="tf-checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>Remember me</span>
              </label>

              <span className="tf-ssl-badge">256-bit SSL</span>
            </div>

            {/* Submit Button */}
            <button type="submit" className="tf-submit-btn" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 size={16} className="spin" />
                  Signing in to Workspace…
                </>
              ) : (
                <>
                  Sign in to Workspace <ArrowRight size={15} />
                </>
              )}
            </button>

            {/* OR Divider */}
            <div className="tf-divider">
              <span>OR</span>
            </div>

            {/* Don't have an account link */}
            <p className="tf-form-signup-prompt">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="tf-signup-link">
                Create account
              </Link>
            </p>
          </form>
        </div>
      </div>

      {/* Footer */}
      <footer className="tf-auth-footer">
        <div>© 2026 TaskFlow Inc. Built for high-velocity teams.</div>
        <div className="tf-footer-links">
          <a href="#">Privacy Policy</a>
          <span>•</span>
          <a href="#">Terms of Service</a>
          <span>•</span>
          <a href="#">System Status</a>
        </div>
      </footer>
    </div>
  );
}


