"use client";
import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function RegisterPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Registration coming soon! (Backend integration in progress)");
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Navbar />
      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-[#0A2647] to-[#2C74B3] rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">
                👤
              </div>
              <h1 className="text-3xl font-bold text-[#0A2647]">Create Account</h1>
              <p className="text-gray-500 mt-2">Join MediCare for better healthcare</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {[
                { key: "name", label: "Full Name", type: "text", placeholder: "John Doe" },
                { key: "email", label: "Email Address", type: "email", placeholder: "john@example.com" },
                { key: "phone", label: "Phone Number", type: "tel", placeholder: "+1 (555) 000-0000" },
                { key: "password", label: "Password", type: "password", placeholder: "••••••••" },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">{f.label}</label>
                  <input type={f.type} required value={form[f.key as keyof typeof form]} onChange={set(f.key)}
                    placeholder={f.placeholder}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-[#0A2647] focus:border-[#2C74B3] focus:outline-none transition-colors" />
                </div>
              ))}

              <button type="submit"
                className="w-full bg-[#2C74B3] text-white font-bold py-3.5 rounded-xl hover:bg-[#0A2647] transition-all text-lg">
                Create Account
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-500 text-sm">
                Already have an account?{" "}
                <Link href="/auth/login" className="text-[#2C74B3] font-semibold hover:underline">Sign in</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
