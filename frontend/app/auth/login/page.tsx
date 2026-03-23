"use client";
import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    alert("Login feature coming soon! (Backend integration in progress)");
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Navbar />
      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-[#0A2647] to-[#2C74B3] rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">
                🔐
              </div>
              <h1 className="text-3xl font-bold text-[#0A2647]">Welcome Back</h1>
              <p className="text-gray-500 mt-2">Sign in to your MediCare account</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="john@example.com"
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-[#0A2647] focus:border-[#2C74B3] focus:outline-none transition-colors" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-[#0A2647] focus:border-[#2C74B3] focus:outline-none transition-colors" />
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)}
                    className="w-4 h-4 rounded accent-[#2C74B3]" />
                  <span className="text-sm text-gray-600">Remember me</span>
                </label>
                <a href="#" className="text-sm text-[#2C74B3] font-medium hover:underline">Forgot password?</a>
              </div>

              <button type="submit"
                className="w-full bg-[#2C74B3] text-white font-bold py-3.5 rounded-xl hover:bg-[#0A2647] transition-all text-lg">
                Sign In
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-500 text-sm">
                Don&apos;t have an account?{" "}
                <Link href="/auth/register" className="text-[#2C74B3] font-semibold hover:underline">Create account</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
