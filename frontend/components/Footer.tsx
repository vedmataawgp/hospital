import Link from "next/link";

const quickLinks = [
  { href: "/", label: "Home" },
  { href: "/doctors", label: "Find Doctors" },
  { href: "/departments", label: "Departments" },
  { href: "/appointments", label: "Appointments" },
  { href: "/contact", label: "Contact Us" },
];

const services = [
  "Emergency Care",
  "Online Consultation",
  "Diagnostic Lab",
  "Surgical Center",
  "Cardiology",
  "Neurology",
];

const socials = [
  {
    label: "LinkedIn",
    href: "#",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z"/>
        <circle cx="4" cy="4" r="2"/>
      </svg>
    ),
  },
  {
    label: "Twitter",
    href: "#",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/>
      </svg>
    ),
  },
  {
    label: "Facebook",
    href: "#",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
      </svg>
    ),
  },
];

export default function Footer() {
  return (
    <footer className="bg-[#0A2647]">
      {/* Main footer grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2.5 mb-5 group">
              <div className="relative w-8 h-8">
                <div className="absolute inset-0 bg-[#2C74B3] rounded-lg rotate-45 group-hover:rotate-[60deg] transition-transform duration-300" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M7 1v12M1 7h12" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
                  </svg>
                </div>
              </div>
              <span className="text-white font-bold text-lg">Medi<span className="text-[#4A90D9]">Care</span></span>
            </Link>
            <p className="text-white/50 text-sm leading-relaxed mb-6 max-w-xs">
              Advanced healthcare solutions connecting patients with world-class specialists. Care that never stops.
            </p>
            <div className="flex items-center gap-3">
              {socials.map(s => (
                <a key={s.label} href={s.href} aria-label={s.label}
                  className="w-8 h-8 rounded-lg bg-white/8 border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/15 hover:border-white/20 transition-all duration-200">
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white text-sm font-semibold uppercase tracking-wider mb-5">Navigation</h4>
            <ul className="space-y-3">
              {quickLinks.map(l => (
                <li key={l.href}>
                  <Link href={l.href}
                    className="text-white/50 text-sm hover:text-white transition-colors flex items-center gap-2 group">
                    <span className="block w-3 h-px bg-white/30 group-hover:w-5 group-hover:bg-[#4A90D9] transition-all duration-200" />
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-white text-sm font-semibold uppercase tracking-wider mb-5">Services</h4>
            <ul className="space-y-3">
              {services.map(s => (
                <li key={s}>
                  <span className="text-white/50 text-sm flex items-center gap-2 group">
                    <span className="block w-3 h-px bg-white/20" />
                    {s}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white text-sm font-semibold uppercase tracking-wider mb-5">Contact</h4>
            <ul className="space-y-4">
              {[
                {
                  icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
                  text: "123 Medical Drive, Health City",
                },
                {
                  icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.62 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>,
                  text: "+1 (800) 555-2273",
                },
                {
                  icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
                  text: "info@medicare.com",
                },
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="text-[#4A90D9] mt-0.5 flex-shrink-0">{item.icon}</span>
                  <span className="text-white/50 text-sm">{item.text}</span>
                </li>
              ))}
            </ul>

            <div className="mt-6 flex items-center gap-2 bg-[#E63946]/15 border border-[#E63946]/30 rounded-xl px-4 py-3">
              <div className="w-2 h-2 rounded-full bg-[#E63946] animate-pulse-soft flex-shrink-0" />
              <span className="text-[#E63946] text-xs font-semibold">Emergency: 24/7</span>
              <a href="tel:911" className="ml-auto text-[#E63946] text-xs font-bold hover:underline">Call 911</a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-white/30 text-xs">
            © {new Date().getFullYear()} MediCare. All rights reserved.
          </p>
          <div className="flex items-center gap-5">
            {["Privacy Policy", "Terms of Service", "Accessibility"].map(l => (
              <a key={l} href="#" className="text-white/30 text-xs hover:text-white/60 transition-colors">{l}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
