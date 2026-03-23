"use client";
import { useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { api } from "@/lib/api";
import { useMutation } from "@/lib/useApi";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);

  const loginMutator = useCallback(
    () => api.auth.login(email, password),
    [email, password],
  );
  const [login, { loading, error }] = useMutation(loginMutator);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await login();
    if (result) {
      const role = result.user?.role;
      if (role === "doctor") router.push("/dashboard/doctor");
      else if (role === "admin") router.push("/dashboard/admin");
      else router.push("/dashboard/patient");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Navbar />
      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">

            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-[#0A2647] to-[#2C74B3] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <i className="bi bi-shield-lock-fill text-white text-2xl" />
              </div>
              <h1 className="text-3xl font-bold text-[#0A2647]">Welcome Back</h1>
              <p className="text-gray-500 mt-2">Sign in to your MediCare account</p>
            </div>

            {error && (
              <div className="mb-5 p-4 bg-red-50 border border-red-100 rounded-xl text-red-700 text-sm flex items-center gap-2">
                <i className="bi bi-exclamation-circle-fill text-[#E63946]" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                <div className="relative">
                  <i className="bi bi-envelope absolute left-3.5 top-3.5 text-gray-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="john@example.com"
                    autoComplete="email"
                    className="w-full border-2 border-gray-200 rounded-xl pl-10 pr-4 py-3 text-[#0A2647] placeholder-gray-400 focus:border-[#2C74B3] focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                <div className="relative">
                  <i className="bi bi-lock-fill absolute left-3.5 top-3.5 text-gray-400" />
                  <input
                    type={showPwd ? "text" : "password"}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="w-full border-2 border-gray-200 rounded-xl pl-10 pr-10 py-3 text-[#0A2647] placeholder-gray-400 focus:border-[#2C74B3] focus:outline-none transition-colors"
                  />
                  <button type="button" onClick={() => setShowPwd(v => !v)}
                    className="absolute right-3.5 top-3.5 text-gray-400 hover:text-[#2C74B3] transition-colors">
                    <i className={`bi ${showPwd ? "bi-eye-slash" : "bi-eye"}`} />
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#2C74B3] text-white font-bold py-3.5 rounded-xl hover:bg-[#0A2647] transition-all text-lg flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading
                  ? <><i className="bi bi-arrow-repeat animate-spin" /> Signing in...</>
                  : <><i className="bi bi-box-arrow-in-right" /> Sign In</>}
              </button>
            </form>

            <div className="mt-6 text-center space-y-2">
              <p className="text-gray-500 text-sm">
                Don&apos;t have an account?{" "}
                <Link href="/auth/register" className="text-[#2C74B3] font-semibold hover:underline">Create account</Link>
              </p>
              <p className="text-gray-400 text-xs">
                Sign in as a doctor?{" "}
                <Link href="/auth/register?role=doctor" className="text-[#2C74B3] font-semibold hover:underline">Register as Doctor</Link>
              </p>
            </div>

            <div className="mt-4 p-3 bg-[#F8FAFC] rounded-xl flex items-center gap-2">
              <i className="bi bi-shield-check text-[#2A9D8F]" />
              <span className="text-gray-500 text-xs">Your data is secured with 256-bit encryption</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
