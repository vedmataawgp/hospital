"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/",             label: "Home",         icon: "bi-house-heart-fill" },
  { href: "/doctors",      label: "Doctors",       icon: "bi-person-badge-fill" },
  { href: "/departments",  label: "Departments",   icon: "bi-hospital-fill" },
  { href: "/appointments", label: "Appointments",  icon: "bi-calendar2-check-fill" },
  { href: "/chat",         label: "Consultation",  icon: "bi-chat-heart-fill" },
  { href: "/contact",      label: "Contact",       icon: "bi-envelope-heart-fill" },
];

export default function Navbar() {
  const [open, setOpen]       = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname              = usePathname();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => { setOpen(false); }, [pathname]);

  return (
    <>
      <style>{`
        .nav-gradient {
          background: linear-gradient(135deg, #020B18 0%, #061A35 40%, #0A2647 70%, #061A35 100%);
          border-bottom: 1px solid rgba(56,189,248,0.12);
        }
        .nav-gradient.scrolled {
          background: linear-gradient(135deg, #010912 0%, #041428 40%, #071E3D 70%, #041428 100%);
          box-shadow: 0 4px 30px rgba(0,0,0,0.5), 0 1px 0 rgba(56,189,248,0.15);
        }
        .logo-ring {
          background: linear-gradient(135deg, #38BDF8, #2C74B3, #7C3AED);
          padding: 2px;
          border-radius: 12px;
          animation: ringPulse 3s ease-in-out infinite;
        }
        @keyframes ringPulse {
          0%,100% { box-shadow: 0 0 0 0 rgba(56,189,248,0.3); }
          50%      { box-shadow: 0 0 0 8px rgba(56,189,248,0); }
        }
        .logo-inner {
          background: linear-gradient(135deg, #0D2137, #144272);
          border-radius: 10px;
          width: 36px; height: 36px;
          display: flex; align-items: center; justify-content: center;
        }
        .nav-item {
          position: relative;
          display: flex; align-items: center; gap: 6px;
          padding: 6px 14px;
          border-radius: 10px;
          font-size: 13.5px; font-weight: 500;
          color: rgba(148,163,184,1);
          transition: all 0.2s ease;
          letter-spacing: 0.01em;
        }
        .nav-item:hover {
          color: #fff;
          background: rgba(56,189,248,0.08);
        }
        .nav-item.active {
          color: #fff;
          background: linear-gradient(135deg, rgba(44,116,179,0.5), rgba(56,189,248,0.2));
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.1), 0 0 12px rgba(56,189,248,0.15);
        }
        .nav-item.active::after {
          content: '';
          position: absolute;
          bottom: -1px; left: 50%; transform: translateX(-50%);
          width: 60%; height: 2px;
          background: linear-gradient(90deg, transparent, #38BDF8, transparent);
          border-radius: 2px;
        }
        .nav-item i { font-size: 14px; transition: transform 0.2s ease; }
        .nav-item:hover i { transform: scale(1.2); }
        .nav-item.active i { color: #38BDF8; }

        .btn-signin {
          display: flex; align-items: center; gap: 6px;
          padding: 7px 16px;
          border-radius: 10px;
          font-size: 13px; font-weight: 500;
          color: #94A3B8;
          border: 1px solid rgba(148,163,184,0.2);
          transition: all 0.2s ease;
          background: rgba(255,255,255,0.03);
        }
        .btn-signin:hover {
          color: #fff;
          border-color: rgba(56,189,248,0.4);
          background: rgba(56,189,248,0.07);
          box-shadow: 0 0 14px rgba(56,189,248,0.12);
        }

        .btn-book {
          display: flex; align-items: center; gap: 7px;
          padding: 8px 20px;
          border-radius: 10px;
          font-size: 13px; font-weight: 600;
          color: #fff;
          background: linear-gradient(135deg, #2C74B3 0%, #38BDF8 50%, #2C74B3 100%);
          background-size: 200% auto;
          transition: background-position 0.4s ease, box-shadow 0.2s ease, transform 0.15s ease;
          box-shadow: 0 4px 15px rgba(56,189,248,0.3);
          letter-spacing: 0.01em;
        }
        .btn-book:hover {
          background-position: right center;
          box-shadow: 0 6px 22px rgba(56,189,248,0.45);
          transform: translateY(-1px);
        }
        .btn-book:active { transform: translateY(0); }

        .mobile-item {
          display: flex; align-items: center; gap: 12px;
          padding: 12px 16px;
          border-radius: 12px;
          font-size: 14px; font-weight: 500;
          color: rgba(148,163,184,1);
          transition: all 0.18s ease;
        }
        .mobile-item:hover {
          color: #fff;
          background: rgba(56,189,248,0.08);
        }
        .mobile-item.active {
          color: #fff;
          background: linear-gradient(135deg, rgba(44,116,179,0.45), rgba(56,189,248,0.2));
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.1);
        }
        .mobile-item.active i { color: #38BDF8; }
        .mobile-item i { font-size: 18px; width: 24px; text-align: center; }

        .mobile-icon-wrap {
          width: 38px; height: 38px;
          background: linear-gradient(135deg, rgba(44,116,179,0.3), rgba(56,189,248,0.15));
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          border: 1px solid rgba(56,189,248,0.2);
          flex-shrink: 0;
        }

        .mobile-panel {
          background: linear-gradient(180deg, #050F20 0%, #071B38 100%);
          border-top: 1px solid rgba(56,189,248,0.12);
        }

        .notification-dot {
          width: 7px; height: 7px;
          background: #38BDF8;
          border-radius: 50%;
          position: absolute;
          top: 4px; right: 6px;
          box-shadow: 0 0 6px #38BDF8;
        }
      `}</style>

      <nav className={`nav-gradient fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "scrolled" : ""}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-[62px]">

            {/* ── Logo ─────────────────────────────────────────── */}
            <Link href="/" className="flex items-center gap-3 group flex-shrink-0">
              <div className="logo-ring">
                <div className="logo-inner">
                  <i className="bi bi-hospital-fill text-[#38BDF8] text-base" />
                </div>
              </div>
              <div className="leading-none">
                <span className="text-white font-bold text-lg tracking-tight">
                  Medi<span style={{ background: "linear-gradient(90deg,#38BDF8,#7C3AED)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Care</span>
                </span>
                <div className="text-[10px] text-slate-500 font-medium tracking-widest uppercase">Hospital</div>
              </div>
            </Link>

            {/* ── Desktop nav links ─────────────────────────────── */}
            <div className="hidden lg:flex items-center gap-1">
              {links.map(l => (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`nav-item ${pathname === l.href ? "active" : ""}`}
                >
                  <i className={`bi ${l.icon}`} />
                  {l.label}
                </Link>
              ))}
            </div>

            {/* ── Desktop CTAs ──────────────────────────────────── */}
            <div className="hidden lg:flex items-center gap-2 flex-shrink-0">
              <Link href="/auth/login" className="btn-signin">
                <i className="bi bi-box-arrow-in-right text-sm" />
                Sign In
              </Link>
              <Link href="/appointments" className="btn-book">
                <i className="bi bi-calendar2-heart-fill text-sm" />
                Book Now
              </Link>
            </div>

            {/* ── Tablet nav (md, not lg) ───────────────────────── */}
            <div className="hidden md:flex lg:hidden items-center gap-0.5">
              {links.slice(0, 4).map(l => (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`nav-item ${pathname === l.href ? "active" : ""}`}
                >
                  <i className={`bi ${l.icon}`} />
                  <span className="hidden xl:inline">{l.label}</span>
                </Link>
              ))}
              <div className="flex items-center gap-2 ml-2">
                <Link href="/auth/login" className="btn-signin">
                  <i className="bi bi-box-arrow-in-right" />
                </Link>
                <Link href="/appointments" className="btn-book">
                  <i className="bi bi-calendar2-heart-fill" />
                  <span>Book</span>
                </Link>
              </div>
            </div>

            {/* ── Mobile hamburger ─────────────────────────────── */}
            <button
              className="md:hidden relative w-10 h-10 rounded-xl flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 transition-all"
              onClick={() => setOpen(!open)}
              aria-label="Toggle menu"
              aria-expanded={open}
            >
              <i className={`bi ${open ? "bi-x-lg text-xl" : "bi-layout-sidebar-reverse text-xl"}`} />
            </button>
          </div>
        </div>

        {/* ── Mobile drawer ──────────────────────────────────────── */}
        <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${open ? "max-h-[520px] opacity-100" : "max-h-0 opacity-0"}`}>
          <div className="mobile-panel px-4 py-3 space-y-1">
            {/* User greeting strip */}
            <div className="flex items-center gap-3 px-4 py-3 mb-2 rounded-xl bg-white/[0.04] border border-white/10">
              <div className="w-9 h-9 bg-gradient-to-br from-[#2C74B3] to-[#38BDF8] rounded-full flex items-center justify-center flex-shrink-0">
                <i className="bi bi-person-fill text-white text-base" />
              </div>
              <div>
                <div className="text-white text-sm font-semibold">Welcome back</div>
                <div className="text-slate-500 text-xs">MediCare Patient Portal</div>
              </div>
            </div>

            {links.map(l => (
              <Link
                key={l.href}
                href={l.href}
                className={`mobile-item ${pathname === l.href ? "active" : ""}`}
              >
                <div className="mobile-icon-wrap">
                  <i className={`bi ${l.icon} text-[#38BDF8]`} />
                </div>
                <span className="flex-1">{l.label}</span>
                {pathname === l.href
                  ? <i className="bi bi-check-circle-fill text-[#38BDF8] text-sm" />
                  : <i className="bi bi-chevron-right text-slate-600 text-xs" />}
              </Link>
            ))}

            {/* Mobile CTA pair */}
            <div className="flex gap-3 pt-3 mt-2 border-t border-white/[0.07]">
              <Link
                href="/auth/login"
                className="flex-1 flex items-center justify-center gap-2 py-3 text-sm text-slate-300 font-medium border border-slate-600 rounded-xl hover:border-[#38BDF8]/50 hover:text-white transition-all"
              >
                <i className="bi bi-box-arrow-in-right" />
                Sign In
              </Link>
              <Link
                href="/appointments"
                className="btn-book flex-1 justify-center rounded-xl py-3"
              >
                <i className="bi bi-calendar2-heart-fill" />
                Book Now
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Page spacer (non-hero pages) */}
      {pathname !== "/" && <div className="h-[62px]" />}
    </>
  );
}
