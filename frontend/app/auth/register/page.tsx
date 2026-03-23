"use client";
import { useState, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import { api } from "@/lib/api";
import { useMutation } from "@/lib/useApi";

export default function RegisterPage() {
  const router = useRouter();
  const params = useSearchParams();
  const defaultRole = params.get("role") === "doctor" ? "doctor" : "patient";

  const [role, setRole] = useState<"patient" | "doctor">(defaultRole);
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [showPwd, setShowPwd] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const registerMutator = useCallback(
    () => api.auth.register({ ...form, role }),
    [form, role],
  );
  const [register, { loading, error }] = useMutation(registerMutator);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) return;
    const result = await register();
    if (result) {
      router.push(role === "doctor" ? "/dashboard/doctor" : "/dashboard/patient");
    }
  };

  const fields = [
    { key: "name",     label: "Full Name",     type: "text",     placeholder: "John Doe",          icon: "bi-person-fill" },
    { key: "email",    label: "Email Address", type: "email",    placeholder: "john@example.com",   icon: "bi-envelope-fill" },
    { key: "phone",    label: "Phone Number",  type: "tel",      placeholder: "+1 (555) 000-0000",  icon: "bi-telephone-fill" },
    { key: "password", label: "Password",      type: "password", placeholder: "Min. 8 characters",  icon: "bi-lock-fill" },
  ] as const;

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Navbar />
      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">

            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-[#0A2647] to-[#2C74B3] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <i className="bi bi-person-plus-fill text-white text-2xl" />
              </div>
              <h1 className="text-3xl font-bold text-[#0A2647]">Create Account</h1>
              <p className="text-gray-500 mt-2">Join MediCare for better healthcare</p>
            </div>

            {/* Role selector */}
            <div className="flex rounded-xl border-2 border-gray-200 overflow-hidden mb-6">
              <button
                type="button"
                onClick={() => setRole("patient")}
                className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                  role === "patient"
                    ? "bg-[#2C74B3] text-white"
                    : "bg-white text-gray-500 hover:bg-gray-50"
                }`}
              >
                <i className="bi bi-person-heart" />
                I&apos;m a Patient
              </button>
              <button
                type="button"
                onClick={() => setRole("doctor")}
                className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-2 transition-all border-l-2 border-gray-200 ${
                  role === "doctor"
                    ? "bg-[#0A2647] text-white"
                    : "bg-white text-gray-500 hover:bg-gray-50"
                }`}
              >
                <i className="bi bi-person-badge-fill" />
                I&apos;m a Doctor
              </button>
            </div>

            {error && (
              <div className="mb-5 p-4 bg-red-50 border border-red-100 rounded-xl text-red-700 text-sm flex items-center gap-2">
                <i className="bi bi-exclamation-circle-fill text-[#E63946]" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              {fields.map(f => (
                <div key={f.key}>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">{f.label}</label>
                  <div className="relative">
                    <i className={`bi ${f.icon} absolute left-3.5 top-3.5 text-gray-400`} />
                    <input
                      type={f.key === "password" && showPwd ? "text" : f.type}
                      required
                      value={form[f.key]}
                      onChange={set(f.key)}
                      placeholder={f.placeholder}
                      autoComplete={f.key === "password" ? "new-password" : f.key}
                      className="w-full border-2 border-gray-200 rounded-xl pl-10 pr-10 py-3 text-[#0A2647] placeholder-gray-400 focus:border-[#2C74B3] focus:outline-none transition-colors"
                    />
                    {f.key === "password" && (
                      <button type="button" onClick={() => setShowPwd(v => !v)}
                        className="absolute right-3.5 top-3.5 text-gray-400 hover:text-[#2C74B3] transition-colors">
                        <i className={`bi ${showPwd ? "bi-eye-slash" : "bi-eye"}`} />
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {role === "doctor" && (
                <div className="p-3 bg-blue-50 rounded-xl flex items-start gap-2 text-sm text-blue-700">
                  <i className="bi bi-info-circle-fill mt-0.5" />
                  <span>Doctor accounts are subject to verification by hospital administration before full access is granted.</span>
                </div>
              )}

              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)}
                  className="w-4 h-4 rounded accent-[#2C74B3] mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-600">
                  I agree to the{" "}
                  <a href="#" className="text-[#2C74B3] font-semibold hover:underline">Terms of Service</a>
                  {" "}and{" "}
                  <a href="#" className="text-[#2C74B3] font-semibold hover:underline">Privacy Policy</a>
                </span>
              </label>

              <button
                type="submit"
                disabled={loading || !agreed}
                className="w-full bg-[#2C74B3] text-white font-bold py-3.5 rounded-xl hover:bg-[#0A2647] transition-all text-lg flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading
                  ? <><i className="bi bi-arrow-repeat animate-spin" /> Creating account...</>
                  : <><i className="bi bi-person-check-fill" /> Create {role === "doctor" ? "Doctor" : "Patient"} Account</>}
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
