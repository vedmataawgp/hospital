"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Home" },
  { href: "/doctors", label: "Doctors" },
  { href: "/departments", label: "Departments" },
  { href: "/appointments", label: "Appointments" },
  { href: "/chat", label: "Consultation" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => { setOpen(false); }, [pathname]);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-[#0A2647]/96 backdrop-blur-md shadow-lg shadow-black/20"
            : "bg-[#0A2647]/60 backdrop-blur-sm"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="relative w-8 h-8">
                <div className="absolute inset-0 bg-[#2C74B3] rounded-lg rotate-45 group-hover:rotate-[60deg] transition-transform duration-300" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M7 1v12M1 7h12" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
                  </svg>
                </div>
              </div>
              <span className="text-white font-bold text-lg tracking-tight">
                Medi<span className="text-[#4A90D9]">Care</span>
              </span>
            </Link>

            {/* Desktop links */}
            <div className="hidden md:flex items-center gap-8">
              {links.map(l => (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`nav-link ${pathname === l.href ? "active" : ""}`}
                >
                  {l.label}
                </Link>
              ))}
            </div>

            {/* Desktop CTAs */}
            <div className="hidden md:flex items-center gap-3">
              <Link
                href="/auth/login"
                className="text-white/90 hover:text-white text-sm font-medium transition-colors px-3 py-1.5"
              >
                Sign In
              </Link>
              <Link
                href="/appointments"
                className="btn-shimmer text-white text-sm font-semibold px-5 py-2 rounded-lg"
              >
                Book Now
              </Link>
            </div>

            {/* Mobile toggle */}
            <button
              className="md:hidden p-2 text-white"
              onClick={() => setOpen(!open)}
              aria-label="Toggle menu"
              aria-expanded={open}
            >
              {open
                ? <i className="bi bi-x-lg text-xl" />
                : <i className="bi bi-list text-2xl" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ${
            open ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="bg-[#0A2647]/98 backdrop-blur-md border-t border-white/10 px-4 py-4 space-y-1">
            {links.map(l => (
              <Link
                key={l.href}
                href={l.href}
                className={`block px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  pathname === l.href
                    ? "bg-white/10 text-white"
                    : "text-white/80 hover:text-white hover:bg-white/5"
                }`}
              >
                {l.label}
              </Link>
            ))}
            <div className="flex gap-3 pt-3 border-t border-white/10 mt-2">
              <Link
                href="/auth/login"
                className="flex-1 text-center py-2.5 text-sm text-white/90 border border-white/25 rounded-xl hover:border-white/50 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/appointments"
                className="flex-1 text-center py-2.5 text-sm text-white font-semibold bg-[#2C74B3] rounded-xl hover:bg-[#144272] transition-colors"
              >
                Book Now
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Spacer for non-hero pages */}
      {pathname !== "/" && <div className="h-16" />}
    </>
  );
}
