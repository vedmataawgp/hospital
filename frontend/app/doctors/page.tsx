"use client";
import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const allDoctors = [
  { name: "Dr. Sarah Johnson", spec: "Cardiology", exp: 15, rating: 4.9, available: true },
  { name: "Dr. Michael Chen", spec: "Neurology", exp: 12, rating: 4.8, available: true },
  { name: "Dr. Aisha Patel", spec: "Pediatrics", exp: 10, rating: 4.9, available: false },
  { name: "Dr. James Wilson", spec: "Orthopedics", exp: 18, rating: 4.7, available: true },
  { name: "Dr. Emily Rodriguez", spec: "Cardiology", exp: 8, rating: 4.6, available: true },
  { name: "Dr. David Kim", spec: "Neurology", exp: 14, rating: 4.8, available: false },
  { name: "Dr. Lisa Thompson", spec: "Pediatrics", exp: 11, rating: 4.9, available: true },
  { name: "Dr. Robert Davis", spec: "Orthopedics", exp: 20, rating: 4.7, available: true },
];

const specializations = ["All", "Cardiology", "Neurology", "Pediatrics", "Orthopedics"];

export default function DoctorsPage() {
  const [spec, setSpec] = useState("All");
  const [minExp, setMinExp] = useState(0);

  const filtered = allDoctors.filter(d =>
    (spec === "All" || d.spec === spec) && d.exp >= minExp
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8 w-full">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#0A2647] mb-2">Our Doctors</h1>
          <p className="text-gray-500">Find and book an appointment with our expert specialists</p>
        </div>
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-bold text-[#0A2647] mb-4 text-lg">Filters</h3>
              <div className="mb-6">
                <h4 className="font-semibold text-gray-700 mb-3 text-sm uppercase tracking-wider">Specialization</h4>
                <div className="space-y-2">
                  {specializations.map(s => (
                    <button key={s} onClick={() => setSpec(s)}
                      className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${spec === s ? "bg-[#2C74B3] text-white" : "text-gray-600 hover:bg-gray-50"}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-gray-700 mb-3 text-sm uppercase tracking-wider">Min Experience</h4>
                <div className="space-y-2">
                  {[0, 5, 10, 15].map(y => (
                    <button key={y} onClick={() => setMinExp(y)}
                      className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${minExp === y ? "bg-[#2C74B3] text-white" : "text-gray-600 hover:bg-gray-50"}`}>
                      {y === 0 ? "Any" : `${y}+ years`}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Grid */}
          <div className="flex-1">
            <p className="text-gray-500 text-sm mb-4">{filtered.length} doctors found</p>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filtered.map(d => (
                <div key={d.name} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all">
                  <div className="bg-gradient-to-br from-[#144272] to-[#2C74B3] h-28 flex items-center justify-center text-5xl">
                    👨‍⚕️
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-[#0A2647] text-lg mb-1">{d.name}</h3>
                    <p className="text-[#2C74B3] text-sm font-medium mb-1">{d.spec}</p>
                    <p className="text-gray-400 text-sm mb-3">{d.exp} years experience</p>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[#2A9D8F] font-semibold text-sm">⭐ {d.rating}</span>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${d.available ? "bg-green-50 text-[#2A9D8F]" : "bg-red-50 text-[#E63946]"}`}>
                        {d.available ? "Available" : "Busy"}
                      </span>
                    </div>
                    <Link href="/appointments" className="w-full bg-[#2C74B3] text-white font-semibold py-2.5 rounded-xl hover:bg-[#0A2647] transition-all text-sm text-center block">
                      Book Appointment
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
