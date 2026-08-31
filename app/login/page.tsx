"use client";

import { useState } from "react";
import { useAuthStore } from "@/store/auth-store";
import { useRouter } from "next/navigation";
import { Mail, Lock, AlertCircle, Loader2, ClipboardCheck } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const { login, error: authError, loading } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [validationError, setValidationError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setValidationError("");

    if (!email.trim() || !password) {
      setValidationError("Please enter both email and password.");
      return;
    }

    const success = await login(email, password);
    if (success) {
      router.push("/");
      router.refresh();
    }
  }

  const error = validationError || authError;

  return (
    <div className="login-container">
      <div className="login-card">
        {/* Brand */}
        <div className="login-brand">
          <div className="brand-icon login-brand-icon">
            <ClipboardCheck size={26} />
          </div>
          <span className="brand-name login-brand-name">TaskFlow</span>
        </div>

        <h2 className="login-title">Sign In</h2>
        <p className="login-subtitle">Access your smart prioritization board</p>

        {error && (
          <div className="login-error-banner">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="task-form login-form">
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div className="input-with-icon">
              <Mail size={16} className="input-icon-left" />
              <input
                type="email"
                className="form-input form-input-icon"
                placeholder="you@company.com"
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
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
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
                Signing In…
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <p className="login-footer-text">
          Don't have an account?{" "}
          <Link href="/register" className="login-link">
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
}
