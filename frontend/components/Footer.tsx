import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#0A2647] text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-[#2C74B3] rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">M</span>
              </div>
              <span className="font-bold text-xl">MediCare</span>
            </div>
            <p className="text-blue-200 text-sm leading-relaxed">
              Advanced healthcare solutions for everyone. Quality care, expert doctors, modern facilities.
            </p>
            <div className="flex gap-4 mt-4">
              <a href="#" className="w-8 h-8 bg-[#2C74B3] rounded-full flex items-center justify-center hover:bg-[#144272] transition-colors text-xs font-bold">f</a>
              <a href="#" className="w-8 h-8 bg-[#2C74B3] rounded-full flex items-center justify-center hover:bg-[#144272] transition-colors text-xs font-bold">in</a>
              <a href="#" className="w-8 h-8 bg-[#2C74B3] rounded-full flex items-center justify-center hover:bg-[#144272] transition-colors text-xs font-bold">tw</a>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {["Home", "Doctors", "Departments", "Appointments", "Contact"].map(l => (
                <li key={l}>
                  <Link href={l === "Home" ? "/" : `/${l.toLowerCase()}`} className="text-blue-200 hover:text-white text-sm transition-colors">
                    {l}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4">Services</h3>
            <ul className="space-y-2">
              {["Emergency Care", "Online Consultation", "Lab Tests", "Surgery", "Cardiology", "Neurology"].map(s => (
                <li key={s}><span className="text-blue-200 text-sm">{s}</span></li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-blue-200 text-sm">
                <span className="mt-0.5">📍</span>
                <span>123 Medical Center Drive, Health City, HC 45678</span>
              </li>
              <li className="flex items-center gap-2 text-blue-200 text-sm">
                <span>📞</span>
                <span>+1 (800) 555-CARE</span>
              </li>
              <li className="flex items-center gap-2 text-blue-200 text-sm">
                <span>✉️</span>
                <span>info@medicare.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 text-center text-blue-200 text-sm">
          <p>© {new Date().getFullYear()} MediCare. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
