"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Role } from "@/data/mockData";
import { LogIn, User, ShieldCheck, stethoscope, Lock, Mail, ArrowLeft, ChevronRight, Activity } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function LoginPage() {
  const [role, setRole] = useState<Role>('patient');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('password123');
  const { login, isLoading } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(email || (role === 'patient' ? 'patient@example.com' : role === 'doctor' ? 'doctor@example.com' : 'admin@example.com'), role);
  };

  const roleConfigs = {
    patient: {
      title: "Patient Portal",
      desc: "Access your health records and book appointments.",
      icon: <User className="w-8 h-8" />,
      color: "bg-blue-600",
      lightColor: "bg-blue-50",
      textColor: "text-blue-600",
      borderColor: "border-blue-200"
    },
    doctor: {
      title: "Doctor Portal",
      desc: "Manage your consultations and patient records.",
      icon: <Activity className="w-8 h-8" />,
      color: "bg-indigo-600",
      lightColor: "bg-indigo-50",
      textColor: "text-indigo-600",
      borderColor: "border-indigo-200"
    },
    admin: {
      title: "Admin Control",
      desc: "Complete overview of hospital management systems.",
      icon: <ShieldCheck className="w-8 h-8" />,
      color: "bg-emerald-600",
      lightColor: "bg-emerald-50",
      textColor: "text-emerald-600",
      borderColor: "border-emerald-200"
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 selection:bg-blue-100 italic selection:text-blue-700">
      {/* Left side: Branding & Hero */}
      <div className="hidden md:flex md:w-1/2 bg-blue-600 text-white p-12 lg:p-24 flex-col justify-between relative overflow-hidden">
        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-2 mb-20 group">
             <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-600 font-bold text-xl shadow-lg">M+</div>
             <span className="text-2xl font-bold tracking-tight">MediCare+</span>
          </Link>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-5xl lg:text-7xl font-extrabold leading-tight mb-8">Empowering <br/> <span className="opacity-60 italic">Next-Gen</span> <br/> Healthcare</h2>
            <p className="text-xl text-blue-100 max-w-md leading-relaxed">
               Secure, efficient, and user-friendly management platform for patients, doctors, and healthcare administrators.
            </p>
          </motion.div>
        </div>
        
        <div className="relative z-10 flex gap-12 mt-20">
           <div className="flex flex-col gap-2">
              <span className="text-4xl font-extrabold">99%</span>
              <span className="text-sm font-medium opacity-60 uppercase tracking-widest leading-none">Security Score</span>
           </div>
           <div className="flex flex-col gap-2">
              <span className="text-4xl font-extrabold">24/7</span>
              <span className="text-sm font-medium opacity-60 uppercase tracking-widest leading-none">Support</span>
           </div>
        </div>

        {/* Abstract shapes */}
        <div className="absolute top-0 right-0 w-[80%] h-[80%] bg-white/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-[60%] h-[60%] bg-black/10 rounded-full blur-3xl -translate-x-1/3 translate-y-1/3"></div>
      </div>

      {/* Right side: Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 md:p-12 lg:p-24 bg-white md:bg-transparent">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white p-10 md:p-12 rounded-[2.5rem] shadow-2xl md:shadow-xl border border-slate-100"
        >
          <div className="mb-10 text-center md:text-left">
            <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Welcome Back</h1>
            <p className="text-slate-500 font-medium tracking-tight">Select your role to access the dashboard</p>
          </div>

          <div className="flex gap-4 mb-10">
            {(['patient', 'doctor', 'admin'] as Role[]).map((r) => (
              <button
                key={r}
                onClick={() => setRole(r)}
                className={`flex-1 py-4 px-2 rounded-2xl flex flex-col items-center gap-3 transition-all border-2 ${
                  role === r 
                  ? `${roleConfigs[r].borderColor} ${roleConfigs[r].lightColor} ${roleConfigs[r].textColor}` 
                  : 'bg-white border-transparent text-slate-400 hover:bg-slate-50'
                }`}
              >
                <div className={`p-2.5 rounded-xl ${role === r ? roleConfigs[r].color + ' text-white shadow-lg' : 'bg-slate-100'}`}>
                  {roleConfigs[r].icon}
                </div>
                <span className="text-xs font-extrabold uppercase tracking-tighter">{r}</span>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Work Email</label>
              <div className="relative group">
                 <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                    <Mail className="w-5 h-5" />
                 </div>
                 <input
                   type="email"
                   value={email}
                   onChange={(e) => setEmail(e.target.value)}
                   placeholder={role === 'patient' ? "patient@example.com" : role === 'doctor' ? "doctor@example.com" : "admin@example.com"}
                   className="block w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-600 transition-all font-medium text-slate-800"
                 />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Password</label>
              <div className="relative group">
                 <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                    <Lock className="w-5 h-5" />
                 </div>
                 <input
                   type="password"
                   value={password}
                   onChange={(e) => setPassword(e.target.value)}
                   className="block w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-600 transition-all font-medium text-slate-800"
                 />
              </div>
            </div>

            <div className="flex items-center justify-between text-sm py-2">
              <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-500 hover:text-blue-600 group transition-colors">
                 <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600"/>
                 Remember me
              </label>
              <a href="#" className="font-bold text-blue-600 hover:text-blue-700 hover:underline">Forgot password?</a>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-5 rounded-2xl text-white font-extrabold text-lg shadow-xl transition-all flex items-center justify-center gap-2 active:scale-95 ${roleConfigs[role].color} hover:brightness-110 shadow-${roleConfigs[role].textColor.split('-')[1]}-200`}
            >
              Sign In to Dashboard <ChevronRight className="w-6 h-6" />
            </button>
          </form>

          <p className="mt-10 text-center text-slate-500 font-medium text-sm">
            Don't have an account yet? <a href="#" className="text-blue-600 font-bold hover:underline">Start free trial</a>
          </p>
        </motion.div>
      </div>
      
      {/* Floating Back Button */}
      <Link href="/" className="absolute top-8 left-8 md:text-white flex items-center gap-2 font-bold hover:opacity-80 transition-opacity">
         <ArrowLeft className="w-5 h-5" /> Back to Home
      </Link>
    </div>
  );
}
