"use client";

import { useState } from "react";
import { useAuthStore } from "@/store/auth-store";
import { useRouter } from "next/navigation";
import { Mail, Lock, User, Shield, AlertCircle, Loader2, Zap } from "lucide-react";
import Link from "next/link";

export default function RegisterPage() {
  const { register, error: authError, loading } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<"ADMIN" | "EMPLOYEE">("ADMIN");
  const [validationError, setValidationError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const router = useRouter();

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

  if (successMessage) {
    return (
      <div className="login-container">
        <div className="login-card">
          <div className="login-brand">
            <div className="brand-icon login-brand-icon">
              <Zap size={28} />
            </div>
            <span className="brand-name login-brand-name">TaskFlow</span>
          </div>

          <h2 className="login-title" style={{ textAlign: "center" }}>Request Submitted</h2>
          <div className="pending-admin-message" style={{ margin: "20px 0", textAlign: "center", color: "var(--text-muted)", lineHeight: "1.6" }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px", color: "var(--grad-start)" }}>
              <Shield size={48} />
            </div>
            <p style={{ fontSize: "14px" }}>{successMessage}</p>
          </div>

          <Link href="/login" className="btn btn--primary" style={{ display: "flex", justifyContent: "center", width: "100%", textAlign: "center" }}>
            Back to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="login-card">
        {/* Brand */}
        <div className="login-brand">
          <div className="brand-icon login-brand-icon">
            <Zap size={28} />
          </div>
          <span className="brand-name login-brand-name">TaskFlow</span>
        </div>

        <h2 className="login-title">Create Account</h2>
        <p className="login-subtitle">Join the intelligent task network</p>

        {error && (
          <div className="login-error-banner">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="task-form login-form">
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <div className="input-with-icon">
              <User size={16} className="input-icon-left" />
              <input
                className="form-input form-input-icon"
                placeholder="e.g. John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div className="input-with-icon">
              <Mail size={16} className="input-icon-left" />
              <input
                type="email"
                className="form-input form-input-icon"
                placeholder="john@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-with-icon">
              <Lock size={16} className="input-icon-left" />
              <input
                type="password"
                className="form-input form-input-icon"
                placeholder="Min 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Account Role</label>
            <div className="input-with-icon">
              <Shield size={16} className="input-icon-left" />
              <select
                className="form-input form-select form-input-icon"
                value={role}
                onChange={(e) => setRole(e.target.value as "ADMIN" | "EMPLOYEE")}
                disabled={loading}
              >
                <option value="ADMIN">Administrator (Full access)</option>
                <option value="EMPLOYEE">Employee (Tasks only)</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn--primary login-submit-btn"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 size={16} className="spin" />
                Creating Account…
              </>
            ) : (
              "Register"
            )}
          </button>
        </form>

        <p className="login-footer-text">
          Already have an account?{" "}
          <Link href="/login" className="login-link">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
