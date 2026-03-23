import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const departments = [
  { icon: "❤️", name: "Cardiology", desc: "Heart & cardiovascular care" },
  { icon: "🧠", name: "Neurology", desc: "Brain & nervous system" },
  { icon: "👶", name: "Pediatrics", desc: "Children's health" },
  { icon: "🦴", name: "Orthopedics", desc: "Bones & joints" },
];

const services = [
  { icon: "📅", title: "Appointment", desc: "Book with top doctors instantly" },
  { icon: "👨‍⚕️", title: "Doctors", desc: "500+ certified specialists" },
  { icon: "🚨", title: "Emergency", desc: "24/7 emergency care" },
  { icon: "🔬", title: "Lab Tests", desc: "Accurate diagnostics" },
];

const doctors = [
  { name: "Dr. Sarah Johnson", spec: "Cardiologist", exp: "15 years", rating: 4.9 },
  { name: "Dr. Michael Chen", spec: "Neurologist", exp: "12 years", rating: 4.8 },
  { name: "Dr. Aisha Patel", spec: "Pediatrician", exp: "10 years", rating: 4.9 },
];

const testimonials = [
  { name: "John D.", text: "Exceptional care and professional staff. The booking process was seamless.", rating: 5 },
  { name: "Maria S.", text: "World-class facilities and incredibly attentive doctors. Highly recommended!", rating: 5 },
  { name: "Robert K.", text: "The online consultation saved me so much time. Brilliant service.", rating: 5 },
];

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="bg-gradient-to-br from-[#0A2647] via-[#144272] to-[#2C74B3] text-white py-24 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-block bg-white/10 text-blue-200 text-sm font-medium px-4 py-2 rounded-full mb-6">
              🏥 Trusted by 50,000+ Patients
            </span>
            <h1 className="text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Advanced Healthcare<br />
              <span className="text-[#2C74B3] bg-white px-3 py-1 rounded-lg inline-block mt-2">for Everyone</span>
            </h1>
            <p className="text-blue-100 text-lg mb-8 max-w-md leading-relaxed">
              Experience world-class medical care with our network of expert doctors, advanced facilities, and seamless digital health services.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/appointments" className="bg-white text-[#0A2647] font-semibold px-8 py-3.5 rounded-xl hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 inline-flex items-center gap-2">
                📅 Book Appointment
              </Link>
              <Link href="/consultation" className="border-2 border-white text-white font-semibold px-8 py-3.5 rounded-xl hover:bg-white hover:text-[#0A2647] transition-all inline-flex items-center gap-2">
                💬 Consult Online
              </Link>
            </div>
            <div className="flex gap-8 mt-12 pt-8 border-t border-white/20">
              {[["50K+", "Patients"], ["500+", "Doctors"], ["25+", "Years Exp."]].map(([n, l]) => (
                <div key={l}>
                  <div className="text-3xl font-bold">{n}</div>
                  <div className="text-blue-200 text-sm mt-1">{l}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="hidden lg:flex justify-center">
            <div className="relative">
              <div className="w-80 h-80 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/20">
                <div className="w-64 h-64 bg-white/15 rounded-full flex items-center justify-center border border-white/30">
                  <span className="text-9xl">👨‍⚕️</span>
                </div>
              </div>
              <div className="absolute -top-4 -right-4 bg-white rounded-2xl p-4 shadow-xl">
                <div className="text-[#2A9D8F] font-bold text-lg">4.9 ★</div>
                <div className="text-[#0A2647] text-xs font-medium">Top Rated</div>
              </div>
              <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl p-4 shadow-xl">
                <div className="text-[#0A2647] font-bold">24/7</div>
                <div className="text-gray-500 text-xs">Available</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Services */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-[#0A2647] mb-4">Our Services</h2>
            <p className="text-gray-500 max-w-xl mx-auto">Comprehensive healthcare services designed around your needs</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map(s => (
              <div key={s.title} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-1 transition-all text-center cursor-pointer">
                <div className="text-4xl mb-4">{s.icon}</div>
                <h3 className="font-bold text-[#0A2647] text-lg mb-2">{s.title}</h3>
                <p className="text-gray-500 text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section className="py-20 px-4 bg-[#0A2647]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <span className="text-[#2C74B3] text-sm font-semibold uppercase tracking-wider">About Us</span>
            <h2 className="text-4xl font-bold text-white mt-2 mb-6">Leading Healthcare Excellence Since 1998</h2>
            <p className="text-blue-200 leading-relaxed mb-6">
              MediCare has been at the forefront of medical innovation for over 25 years. Our team of dedicated professionals work tirelessly to provide the highest standard of care using the latest technology and evidence-based practices.
            </p>
            <Link href="/departments" className="bg-[#2C74B3] text-white font-semibold px-6 py-3 rounded-xl hover:bg-[#144272] transition-all inline-block">
              Explore Departments →
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-6">
            {[
              { num: "50,000+", label: "Patients Treated", icon: "🏥" },
              { num: "500+", label: "Expert Doctors", icon: "👨‍⚕️" },
              { num: "25+", label: "Years of Excellence", icon: "⭐" },
              { num: "98%", label: "Patient Satisfaction", icon: "❤️" },
            ].map(s => (
              <div key={s.label} className="bg-white/10 backdrop-blur rounded-2xl p-6 border border-white/20">
                <div className="text-3xl mb-2">{s.icon}</div>
                <div className="text-3xl font-bold text-white">{s.num}</div>
                <div className="text-blue-200 text-sm mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Departments */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-[#2C74B3] text-sm font-semibold uppercase tracking-wider">Specialties</span>
            <h2 className="text-4xl font-bold text-[#0A2647] mt-2 mb-4">Our Departments</h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {departments.map(d => (
              <div key={d.name} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all group cursor-pointer">
                <div className="w-14 h-14 bg-[#F8FAFC] rounded-2xl flex items-center justify-center text-3xl mb-4 group-hover:bg-[#2C74B3]/10 transition-colors">
                  {d.icon}
                </div>
                <h3 className="font-bold text-[#0A2647] text-lg mb-2">{d.name}</h3>
                <p className="text-gray-500 text-sm mb-4">{d.desc}</p>
                <Link href="/departments" className="text-[#2C74B3] text-sm font-medium hover:underline">View Doctors →</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Doctors */}
      <section className="py-20 px-4 bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-[#2C74B3] text-sm font-semibold uppercase tracking-wider">Specialists</span>
            <h2 className="text-4xl font-bold text-[#0A2647] mt-2 mb-4">Meet Our Doctors</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {doctors.map(d => (
              <div key={d.name} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all">
                <div className="bg-gradient-to-br from-[#144272] to-[#2C74B3] h-32 flex items-center justify-center text-6xl">
                  👨‍⚕️
                </div>
                <div className="p-6">
                  <h3 className="font-bold text-[#0A2647] text-xl mb-1">{d.name}</h3>
                  <p className="text-[#2C74B3] text-sm font-medium mb-1">{d.spec}</p>
                  <p className="text-gray-400 text-sm mb-3">{d.exp} experience</p>
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-[#2A9D8F] font-semibold">⭐ {d.rating}</div>
                    <span className="text-xs bg-green-50 text-[#2A9D8F] px-2 py-1 rounded-full">Available</span>
                  </div>
                  <Link href="/appointments" className="w-full bg-[#2C74B3] text-white font-semibold py-2.5 rounded-xl hover:bg-[#0A2647] transition-all text-sm text-center block">
                    Book Appointment
                  </Link>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/doctors" className="bg-white text-[#2C74B3] font-semibold px-8 py-3 rounded-xl border-2 border-[#2C74B3] hover:bg-[#2C74B3] hover:text-white transition-all inline-block">
              View All Doctors →
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 bg-[#144272]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-blue-300 text-sm font-semibold uppercase tracking-wider">Testimonials</span>
            <h2 className="text-4xl font-bold text-white mt-2">What Patients Say</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map(t => (
              <div key={t.name} className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-6">
                <div className="text-yellow-400 text-xl mb-3">{"★".repeat(t.rating)}</div>
                <p className="text-blue-100 leading-relaxed mb-4">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#2C74B3] rounded-full flex items-center justify-center text-white font-bold">
                    {t.name[0]}
                  </div>
                  <div className="text-white font-medium">{t.name}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Emergency Banner */}
      <section className="py-16 px-4 bg-[#E63946]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">🚨 Emergency? We&apos;re Here 24/7</h2>
            <p className="text-red-100">Our emergency team is always ready to provide immediate care</p>
          </div>
          <a href="tel:+18005550000" className="bg-white text-[#E63946] font-bold px-8 py-4 rounded-xl hover:bg-red-50 transition-all shadow-lg text-lg flex items-center gap-2 whitespace-nowrap">
            📞 Call Now
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
}
