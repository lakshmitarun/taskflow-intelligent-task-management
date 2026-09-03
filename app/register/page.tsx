"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/auth-store";
import { useRouter } from "next/navigation";
import {
  Mail,
  Lock,
  User,
  Shield,
  AlertCircle,
  Loader2,
  Check,
  ArrowRight,
  UserCheck
} from "lucide-react";
import Link from "next/link";

interface PublicStats {
  totalUsers: number;
  totalTasks: number;
  avatars: string[];
  label: string;
}

export default function RegisterPage() {
  const { register, error: authError, loading } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<"ADMIN" | "EMPLOYEE">("ADMIN");
  const [validationError, setValidationError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const router = useRouter();

  // Real stats from MongoDB
  const [stats, setStats] = useState<PublicStats | null>(null);

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
    setValidationError("");

    if (!email.trim() || !password || !fullName.trim()) {
      setValidationError("All fields are required.");
      return;
    }

    if (password.length < 6) {
      setValidationError("Password must be at least 6 characters.");
      return;
    }

    const result = await register(email, password, fullName, role);
    if (result.success) {
      if (result.pendingApproval) {
        setSuccessMessage(
          "Your admin registration request has been submitted successfully. Please wait for approval from an existing administrator."
        );
      } else {
        router.push("/");
        router.refresh();
      }
    }
  }

  const error = validationError || authError;

  return (
    <div className="tf-auth-page">
      {/* Top Navigation Header */}
      <header className="tf-auth-header">
        <Link href="/" className="tf-auth-logo">
          <div className="tf-logo-icon">
            <Check size={22} strokeWidth={3} />
          </div>
          <span>TaskFlow</span>
        </Link>
        <div className="tf-auth-status">
          <span>Secure Workspace Registration</span>
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
                <Check size={20} strokeWidth={3} />
              </div>
              <span style={{ fontSize: "18px" }}>TaskFlow</span>
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
              <span>⚡</span> JOIN HIGH-VELOCITY TEAMS
            </div>
            <h1 className="tf-hero-title">
              Empower your
              <br />
              entire workforce.
            </h1>
            <p className="tf-hero-subtitle">
              Create an account to experience smart priority scoring and seamless task management.
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
                    <div className="tf-mock-bar w-90" style={{ background: "rgba(99,102,241,0.6)" }} />
                    <div className="tf-mock-bar w-75" />
                    <div className="tf-mock-bar w-50" />
                  </div>
                </div>
                <div className="tf-mock-card">
                  <div className="tf-mock-bar-list">
                    <div className="tf-mock-bar w-40" />
                    <div className="tf-mock-bar w-90" />
                  </div>
                </div>
              </div>

              <div className="tf-floating-badge">
                <div className="tf-floating-badge__icon">
                  <UserCheck size={14} strokeWidth={3} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: "12px" }}>Instant Onboarding</div>
                  <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.7)" }}>Smart Role Access</div>
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
          <div className="tf-form-header">
            <div className="tf-auth-logo" style={{ marginBottom: "16px" }}>
              <div className="tf-logo-icon">
                <Check size={20} strokeWidth={3} />
              </div>
              <span>TaskFlow</span>
            </div>
            <h2 className="tf-form-title">Create account</h2>
            <p className="tf-form-subtitle">Join the intelligent task network</p>
          </div>

          {successMessage ? (
            <div className="pending-admin-message" style={{ margin: "20px 0", textAlign: "center" }}>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px", color: "#4f46e5" }}>
                <Shield size={48} />
              </div>
              <h3 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "8px", color: "var(--text-primary)" }}>Request Submitted</h3>
              <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: "1.6", marginBottom: "24px" }}>
                {successMessage}
              </p>
              <Link href="/login" className="tf-submit-btn" style={{ textDecoration: "none" }}>
                Back to Sign In
              </Link>
            </div>
          ) : (
            <>
              {error && (
                <div className="tf-error-banner">
                  <AlertCircle size={18} />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="tf-form-group">
                  <label className="tf-form-label">Full Name</label>
                  <div className="tf-input-wrapper" style={{ marginTop: "6px" }}>
                    <User size={18} className="tf-input-icon" />
                    <input
                      className="tf-input-field"
                      placeholder="e.g. Sarah Connor"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="tf-form-group">
                  <label className="tf-form-label">Email Address</label>
                  <div className="tf-input-wrapper" style={{ marginTop: "6px" }}>
                    <Mail size={18} className="tf-input-icon" />
                    <input
                      type="email"
                      className="tf-input-field"
                      placeholder="sarah@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="tf-form-group">
                  <label className="tf-form-label">Password</label>
                  <div className="tf-input-wrapper" style={{ marginTop: "6px" }}>
                    <Lock size={18} className="tf-input-icon" />
                    <input
                      type="password"
                      className="tf-input-field"
                      placeholder="Min 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="tf-form-group">
                  <label className="tf-form-label">Account Role</label>
                  <div className="tf-input-wrapper" style={{ marginTop: "6px" }}>
                    <Shield size={18} className="tf-input-icon" />
                    <select
                      className="tf-input-field"
                      style={{ appearance: "none" }}
                      value={role}
                      onChange={(e) => setRole(e.target.value as "ADMIN" | "EMPLOYEE")}
                      disabled={loading}
                    >
                      <option value="ADMIN">Administrator (Full access)</option>
                      <option value="EMPLOYEE">Employee (Tasks only)</option>
                    </select>
                  </div>
                </div>

                <button type="submit" className="tf-submit-btn" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 size={18} className="spin" />
                      Creating Account…
                    </>
                  ) : (
                    <>
                      Create Workspace Account <ArrowRight size={16} />
                    </>
                  )}
                </button>

                {/* OR Divider */}
                <div className="tf-divider">
                  <span>OR</span>
                </div>

                {/* Already have an account link */}
                <p className="tf-form-signup-prompt">
                  Already have an account?{" "}
                  <Link href="/login" className="tf-signup-link">
                    Sign in
                  </Link>
                </p>
              </form>
            </>
          )}
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


