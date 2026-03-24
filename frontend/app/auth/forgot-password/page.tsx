"use client";
import { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) { setError("Please enter your email address."); return; }
    setLoading(true);
    setError("");
    try {
      await api.auth.forgotPassword(email.trim().toLowerCase());
      setSent(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A2647] to-[#144272] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[#EFF6FF] rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="bi bi-envelope-open text-3xl text-[#2C74B3]" />
            </div>
            <h1 className="text-2xl font-bold text-[#0A2647]">Forgot Password?</h1>
            <p className="text-gray-500 mt-2 text-sm">
              Enter your email and we&apos;ll send you a reset link.
            </p>
          </div>

          {sent ? (
            <div className="text-center">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="bi bi-check-circle text-3xl text-green-600" />
              </div>
              <h2 className="text-lg font-semibold text-[#0A2647] mb-2">Check your inbox</h2>
              <p className="text-gray-500 text-sm mb-6">
                If an account with <strong>{email}</strong> exists, we&apos;ve sent a password reset link. Check your spam folder if you don&apos;t see it.
              </p>
              <Link href="/auth/login" className="block w-full bg-[#2C74B3] text-white font-semibold py-3 rounded-xl text-center hover:bg-[#0A2647] transition-colors">
                Back to Sign In
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
                  <i className="bi bi-exclamation-circle me-2" />{error}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-[#0A2647] mb-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2C74B3] focus:border-transparent"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#2C74B3] text-white font-semibold py-3 rounded-xl hover:bg-[#0A2647] transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? <><i className="bi bi-arrow-repeat animate-spin" /> Sending…</> : 'Send Reset Link'}
              </button>
              <p className="text-center text-sm text-gray-500">
                Remember your password?{" "}
                <Link href="/auth/login" className="text-[#2C74B3] font-semibold hover:underline">Sign In</Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
