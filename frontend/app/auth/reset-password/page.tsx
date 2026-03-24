"use client";
import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/api";

function ResetPasswordForm() {
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const email = params.get("email") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token || !email) setError("Invalid or expired reset link. Please request a new one.");
  }, [token, email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (password !== confirm) { setError("Passwords do not match."); return; }
    setLoading(true);
    setError("");
    try {
      await api.auth.resetPassword(email, token, password);
      setSuccess(true);
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
              <i className="bi bi-shield-lock text-3xl text-[#2C74B3]" />
            </div>
            <h1 className="text-2xl font-bold text-[#0A2647]">Set New Password</h1>
            <p className="text-gray-500 mt-2 text-sm">Create a strong password for your account.</p>
          </div>

          {success ? (
            <div className="text-center">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="bi bi-check-circle text-3xl text-green-600" />
              </div>
              <h2 className="text-lg font-semibold text-[#0A2647] mb-2">Password Reset!</h2>
              <p className="text-gray-500 text-sm mb-6">Your password has been changed successfully. You can now sign in.</p>
              <Link href="/auth/login" className="block w-full bg-[#2C74B3] text-white font-semibold py-3 rounded-xl text-center hover:bg-[#0A2647] transition-colors">
                Sign In
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
                <label className="block text-sm font-medium text-[#0A2647] mb-1">New Password</label>
                <div className="relative">
                  <input
                    type={show ? "text" : "password"}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    required
                    minLength={8}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-[#2C74B3] focus:border-transparent"
                  />
                  <button type="button" onClick={() => setShow(v => !v)}
                    className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600">
                    <i className={`bi ${show ? 'bi-eye-slash' : 'bi-eye'}`} />
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#0A2647] mb-1">Confirm Password</label>
                <input
                  type={show ? "text" : "password"}
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  placeholder="Repeat your password"
                  required
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2C74B3] focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                {[
                  { label: '8+ characters', ok: password.length >= 8 },
                  { label: 'Uppercase letter', ok: /[A-Z]/.test(password) },
                  { label: 'Number', ok: /\d/.test(password) },
                  { label: 'Passwords match', ok: !!password && password === confirm },
                ].map(r => (
                  <div key={r.label} className={`flex items-center gap-1 ${r.ok ? 'text-green-600' : 'text-gray-400'}`}>
                    <i className={`bi ${r.ok ? 'bi-check-circle-fill' : 'bi-circle'} text-xs`} />
                    {r.label}
                  </div>
                ))}
              </div>

              <button
                type="submit"
                disabled={loading || !token || !email}
                className="w-full bg-[#2C74B3] text-white font-semibold py-3 rounded-xl hover:bg-[#0A2647] transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? <><i className="bi bi-arrow-repeat animate-spin" /> Resetting…</> : 'Reset Password'}
              </button>
              <p className="text-center text-sm text-gray-500">
                <Link href="/auth/forgot-password" className="text-[#2C74B3] hover:underline">Request a new link</Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><i className="bi bi-arrow-repeat animate-spin text-3xl text-white" /></div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
