"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { api } from "@/lib/api";
import type { Doctor, Department } from "@/lib/types";
import { SkeletonCard } from "@/components/Skeleton";

const fallbackDepartments: Department[] = [
  { id: 1, icon_key: "heart-pulse-fill",  name: "Cardiology",     description: "Heart & cardiovascular care",     doctors_count: 24 },
  { id: 2, icon_key: "activity",          name: "Neurology",      description: "Brain & nervous system",          doctors_count: 18 },
  { id: 3, icon_key: "person-circle",     name: "Pediatrics",     description: "Children's health",               doctors_count: 22 },
  { id: 4, icon_key: "bandaid-fill",      name: "Orthopedics",    description: "Bones & joints",                  doctors_count: 16 },
];

const fallbackDoctors: Doctor[] = [
  { id: 1, name: "Dr. Sarah Johnson",  specialization: "Cardiologist",  experience_years: 15, rating: 4.9, available: true },
  { id: 2, name: "Dr. Michael Chen",   specialization: "Neurologist",   experience_years: 12, rating: 4.8, available: true },
  { id: 3, name: "Dr. Aisha Patel",    specialization: "Pediatrician",  experience_years: 10, rating: 4.9, available: false },
];

const services = [
  { icon: "calendar-check-fill",      title: "Appointment",  desc: "Book with top doctors instantly",  href: "/appointments" },
  { icon: "person-badge-fill",        title: "Doctors",      desc: "500+ certified specialists",        href: "/doctors" },
  { icon: "exclamation-octagon-fill", title: "Emergency",    desc: "24/7 emergency care",               href: "/contact" },
  { icon: "flask-fill",              title: "Lab Tests",    desc: "Accurate diagnostics",              href: "/departments" },
];

const testimonials = [
  { name: "John D.",    text: "Exceptional care and professional staff. The booking process was seamless.", rating: 5 },
  { name: "Maria S.",   text: "World-class facilities and incredibly attentive doctors. Highly recommended!", rating: 5 },
  { name: "Robert K.",  text: "The online consultation saved me so much time. Brilliant service.", rating: 5 },
];

export default function Home() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loadingDepts, setLoadingDepts] = useState(true);
  const [loadingDocs, setLoadingDocs] = useState(true);

  useEffect(() => {
    api.departments.list()
      .then(data => setDepartments(data.slice(0, 4)))
      .catch(() => setDepartments(fallbackDepartments))
      .finally(() => setLoadingDepts(false));

    api.doctors.list()
      .then(res => setDoctors((res.data ?? []).slice(0, 3)))
      .catch(() => setDoctors(fallbackDoctors))
      .finally(() => setLoadingDocs(false));
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section className="hero-bg text-white py-28 px-4 relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="blob w-96 h-96 bg-[#2C74B3] top-[-80px] right-[-60px]" />
        <div className="blob w-72 h-72 bg-[#4A90D9] bottom-[-40px] left-[10%]" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-2 bg-white/15 text-blue-100 text-sm font-medium px-4 py-2 rounded-full mb-6 border border-white/20">
              <i className="bi bi-hospital-fill text-[#4A90D9]" />
              Trusted by 50,000+ Patients
            </span>
            <h1 className="text-5xl lg:text-6xl font-bold leading-tight mb-6 text-white">
              Advanced Healthcare<br />
              <span className="text-[#2C74B3] bg-white px-3 py-1 rounded-lg inline-block mt-2">for Everyone</span>
            </h1>
            <p className="text-slate-200 text-lg mb-8 max-w-md leading-relaxed">
              Experience world-class medical care with our network of expert doctors, advanced facilities, and seamless digital health services.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/appointments"
                className="bg-white text-[#0A2647] font-semibold px-8 py-3.5 rounded-xl hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 inline-flex items-center gap-2">
                <i className="bi bi-calendar-check-fill text-[#2C74B3]" />
                Book Appointment
              </Link>
              <Link href="/consultation"
                className="border-2 border-white text-white font-semibold px-8 py-3.5 rounded-xl hover:bg-white hover:text-[#0A2647] transition-all inline-flex items-center gap-2">
                <i className="bi bi-chat-dots-fill" />
                Consult Online
              </Link>
            </div>
            <div className="flex gap-8 mt-12 pt-8 border-t border-white/20">
              {[["50K+", "Patients"], ["500+", "Doctors"], ["25+", "Years Exp."]].map(([n, l]) => (
                <div key={l}>
                  <div className="text-3xl font-bold text-white">{n}</div>
                  {/* CONTRAST: slate-300 for sub-label */}
                  <div className="text-slate-300 text-sm mt-1">{l}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="hidden lg:flex justify-center">
            <div className="relative animate-float">
              <div className="w-80 h-80 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/20">
                <div className="w-64 h-64 bg-white/15 rounded-full flex items-center justify-center border border-white/30">
                  <i className="bi bi-person-circle text-white/90" style={{ fontSize: "8rem" }} />
                </div>
              </div>
              <div className="absolute -top-4 -right-4 bg-white rounded-2xl p-4 shadow-xl">
                <div className="text-[#2A9D8F] font-bold text-lg flex items-center gap-1">
                  <i className="bi bi-star-fill text-yellow-400" /> 4.9
                </div>
                <div className="text-[#0A2647] text-xs font-semibold mt-0.5">Top Rated</div>
              </div>
              <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl p-4 shadow-xl">
                <div className="text-[#0A2647] font-bold flex items-center gap-1.5">
                  <i className="bi bi-clock-fill text-[#2C74B3]" /> 24/7
                </div>
                <div className="text-gray-500 text-xs mt-0.5">Available</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Services ──────────────────────────────────────────────── */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <span className="section-tag">What We Offer</span>
            <h2 className="text-4xl font-bold text-[#0A2647] mb-4">Our Services</h2>
            <p className="text-gray-500 max-w-xl mx-auto">Comprehensive healthcare services designed around your needs</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map(s => (
              <Link key={s.title} href={s.href}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-1 transition-all text-center cursor-pointer group">
                <div className="w-14 h-14 bg-[#EFF6FF] rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-[#2C74B3]/10 transition-colors">
                  <i className={`bi bi-${s.icon} text-2xl text-[#2C74B3]`} />
                </div>
                <h3 className="font-bold text-[#0A2647] text-lg mb-2">{s.title}</h3>
                <p className="text-gray-500 text-sm">{s.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── About ─────────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-[#0A2647]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <span className="text-[#4A90D9] text-sm font-semibold uppercase tracking-wider">About Us</span>
            <h2 className="text-4xl font-bold text-white mt-2 mb-6">Leading Healthcare Excellence Since 1998</h2>
            {/* CONTRAST: text-slate-300 instead of text-blue-200 */}
            <p className="text-slate-300 leading-relaxed mb-6">
              MediCare has been at the forefront of medical innovation for over 25 years. Our dedicated professionals work tirelessly to provide the highest standard of care using the latest technology and evidence-based practices.
            </p>
            <Link href="/departments"
              className="bg-[#2C74B3] text-white font-semibold px-6 py-3 rounded-xl hover:bg-[#4A90D9] transition-all inline-flex items-center gap-2">
              Explore Departments
              <i className="bi bi-arrow-right" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-6">
            {[
              { num: "50,000+", label: "Patients Treated",      icon: "bi-hospital-fill" },
              { num: "500+",    label: "Expert Doctors",         icon: "bi-person-badge-fill" },
              { num: "25+",     label: "Years of Excellence",    icon: "bi-award-fill" },
              { num: "98%",     label: "Patient Satisfaction",   icon: "bi-heart-fill" },
            ].map(s => (
              <div key={s.label} className="glass rounded-2xl p-6">
                <i className={`bi ${s.icon} text-3xl text-[#4A90D9] mb-3 block`} />
                <div className="text-3xl font-bold text-white">{s.num}</div>
                {/* CONTRAST: text-slate-300 */}
                <div className="text-slate-300 text-sm mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Departments ───────────────────────────────────────────── */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <span className="section-tag">Specialties</span>
            <h2 className="text-4xl font-bold text-[#0A2647] mt-2 mb-4">Our Departments</h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {loadingDepts
              ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
              : departments.map(d => (
                <div key={d.id}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all group cursor-pointer">
                  <div className="w-14 h-14 bg-[#EFF6FF] rounded-2xl flex items-center justify-center mb-4 group-hover:bg-[#2C74B3]/10 transition-colors">
                    <i className={`bi bi-${d.icon_key} text-2xl text-[#2C74B3]`} />
                  </div>
                  <h3 className="font-bold text-[#0A2647] text-lg mb-2">{d.name}</h3>
                  <p className="text-gray-500 text-sm mb-4">{d.description}</p>
                  <Link href="/departments" className="text-[#2C74B3] text-sm font-medium hover:underline inline-flex items-center gap-1">
                    View Doctors <i className="bi bi-arrow-right" />
                  </Link>
                </div>
              ))}
          </div>
        </div>
      </section>

      {/* ── Doctors ───────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <span className="section-tag">Specialists</span>
            <h2 className="text-4xl font-bold text-[#0A2647] mt-2 mb-4">Meet Our Doctors</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {loadingDocs
              ? Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)
              : doctors.map(d => (
                <div key={d.id}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all card-hover">
                  <div className="bg-gradient-to-br from-[#144272] to-[#2C74B3] h-32 flex items-center justify-center">
                    <i className="bi bi-person-circle text-white/80" style={{ fontSize: "5rem" }} />
                  </div>
                  <div className="p-6">
                    <h3 className="font-bold text-[#0A2647] text-xl mb-1">{d.name}</h3>
                    <p className="text-[#2C74B3] text-sm font-medium mb-1">{d.specialization}</p>
                    <p className="text-gray-500 text-sm mb-3">{d.experience_years} years experience</p>
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-[#2A9D8F] font-semibold flex items-center gap-1">
                        <i className="bi bi-star-fill text-yellow-400" /> {d.rating}
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        d.available ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                      }`}>
                        {d.available ? "Available" : "Busy"}
                      </span>
                    </div>
                    <Link href="/appointments"
                      className="w-full bg-[#2C74B3] text-white font-semibold py-2.5 rounded-xl hover:bg-[#0A2647] transition-all text-sm text-center block">
                      Book Appointment
                    </Link>
                  </div>
                </div>
              ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/doctors"
              className="bg-white text-[#2C74B3] font-semibold px-8 py-3 rounded-xl border-2 border-[#2C74B3] hover:bg-[#2C74B3] hover:text-white transition-all inline-flex items-center gap-2">
              View All Doctors <i className="bi bi-arrow-right" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Testimonials ──────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-[#144272]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            {/* CONTRAST: text-sky-300 for section label */}
            <span className="text-sky-300 text-sm font-semibold uppercase tracking-wider">Testimonials</span>
            <h2 className="text-4xl font-bold text-white mt-2">What Patients Say</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map(t => (
              <div key={t.name} className="glass rounded-2xl p-6">
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <i key={i} className="bi bi-star-fill text-yellow-400" />
                  ))}
                </div>
                {/* CONTRAST: text-slate-200 for testimonial text */}
                <p className="text-slate-200 leading-relaxed mb-4">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#2C74B3] rounded-full flex items-center justify-center text-white font-bold">
                    {t.name[0]}
                  </div>
                  <div className="text-white font-semibold">{t.name}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Emergency Banner ──────────────────────────────────────── */}
      <section className="py-16 px-4 bg-[#E63946]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <i className="bi bi-exclamation-triangle-fill" />
              Emergency? We&apos;re Here 24/7
            </h2>
            <p className="text-red-100 font-medium">Our emergency team is always ready to provide immediate care</p>
          </div>
          <a href="tel:+18005550000"
            className="bg-white text-[#E63946] font-bold px-8 py-4 rounded-xl hover:bg-red-50 transition-all shadow-lg text-lg flex items-center gap-2 whitespace-nowrap">
            <i className="bi bi-telephone-fill" />
            Call Now
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
}
