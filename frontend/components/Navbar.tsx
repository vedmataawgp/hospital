"use client";
import { useState } from "react";
import Link from "next/link";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-[#0A2647] shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#2C74B3] rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">M</span>
            </div>
            <span className="text-white font-bold text-xl">MediCare</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-blue-200 hover:text-white transition-colors text-sm font-medium">Home</Link>
            <Link href="/doctors" className="text-blue-200 hover:text-white transition-colors text-sm font-medium">Doctors</Link>
            <Link href="/departments" className="text-blue-200 hover:text-white transition-colors text-sm font-medium">Departments</Link>
            <Link href="/appointments" className="text-blue-200 hover:text-white transition-colors text-sm font-medium">Appointments</Link>
            <Link href="/contact" className="text-blue-200 hover:text-white transition-colors text-sm font-medium">Contact</Link>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link href="/auth/login" className="text-white text-sm font-medium px-4 py-2 rounded-xl border border-white/30 hover:border-white transition-all">
              Login
            </Link>
            <Link href="/auth/register" className="bg-[#2C74B3] text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-[#144272] transition-all">
              Register
            </Link>
          </div>

          <button onClick={() => setOpen(!open)} className="md:hidden text-white p-2">
            <div className="w-6 h-0.5 bg-white mb-1.5"></div>
            <div className="w-6 h-0.5 bg-white mb-1.5"></div>
            <div className="w-6 h-0.5 bg-white"></div>
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden bg-[#144272] px-4 py-4 flex flex-col gap-4">
          <Link href="/" className="text-white text-sm font-medium" onClick={() => setOpen(false)}>Home</Link>
          <Link href="/doctors" className="text-white text-sm font-medium" onClick={() => setOpen(false)}>Doctors</Link>
          <Link href="/departments" className="text-white text-sm font-medium" onClick={() => setOpen(false)}>Departments</Link>
          <Link href="/appointments" className="text-white text-sm font-medium" onClick={() => setOpen(false)}>Appointments</Link>
          <Link href="/contact" className="text-white text-sm font-medium" onClick={() => setOpen(false)}>Contact</Link>
          <div className="flex gap-3 pt-2">
            <Link href="/auth/login" className="text-white text-sm font-medium px-4 py-2 rounded-xl border border-white/30 flex-1 text-center" onClick={() => setOpen(false)}>Login</Link>
            <Link href="/auth/register" className="bg-[#2C74B3] text-white text-sm font-semibold px-4 py-2 rounded-xl flex-1 text-center" onClick={() => setOpen(false)}>Register</Link>
          </div>
        </div>
      )}
    </nav>
  );
}
