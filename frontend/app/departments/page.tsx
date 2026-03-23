"use client";
import { useCallback } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { api } from "@/lib/api";
import { useApi } from "@/lib/useApi";
import ApiError from "@/components/ApiError";
import { SkeletonCard } from "@/components/Skeleton";
import type { Department } from "@/lib/types";

const iconMap: Record<string, string> = {
  Cardiology:        "heart-pulse-fill",
  Neurology:         "activity",
  Pediatrics:        "person-circle",
  Orthopedics:       "bandaid-fill",
  Ophthalmology:     "eye-fill",
  Dentistry:         "stars",
  Pulmonology:       "lungs",
  "General Medicine":"clipboard2-pulse",
};

const fallback: Department[] = [
  { id: 1, icon_key: "heart-pulse-fill",  name: "Cardiology",       description: "Comprehensive heart and cardiovascular care.", doctors_count: 24 },
  { id: 2, icon_key: "activity",          name: "Neurology",         description: "Expert care for stroke, epilepsy, Parkinson's.", doctors_count: 18 },
  { id: 3, icon_key: "person-circle",     name: "Pediatrics",        description: "Dedicated healthcare for children and adolescents.", doctors_count: 22 },
  { id: 4, icon_key: "bandaid-fill",      name: "Orthopedics",       description: "Advanced treatment for musculoskeletal conditions.", doctors_count: 16 },
  { id: 5, icon_key: "eye-fill",          name: "Ophthalmology",     description: "Complete eye care from routine exams to surgery.", doctors_count: 12 },
  { id: 6, icon_key: "stars",             name: "Dentistry",         description: "Preventive, restorative and cosmetic dentistry.", doctors_count: 20 },
  { id: 7, icon_key: "lungs",             name: "Pulmonology",       description: "Specialized care for asthma, COPD and lung disease.", doctors_count: 14 },
  { id: 8, icon_key: "clipboard2-pulse",  name: "General Medicine",  description: "Primary care for adults of all ages.", doctors_count: 30 },
];

export default function DepartmentsPage() {
  const fetcher = useCallback(() => api.departments.list(), []);
  const { data, loading, error, refetch } = useApi(fetcher);

  const departments: Department[] = (data ?? []).map(d => ({
    ...d,
    icon_key: iconMap[d.name] ?? d.icon_key ?? "grid-fill",
  }));

  const display = departments.length > 0 ? departments : fallback;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero */}
      <div className="bg-gradient-to-br from-[#0A2647] to-[#144272] py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 bg-white/15 text-sky-300 text-sm font-medium px-4 py-2 rounded-full mb-4 border border-white/20">
            <i className="bi bi-grid-fill" />
            All Specialties
          </span>
          <h1 className="text-5xl font-bold text-white mb-4">Our Departments</h1>
          {/* CONTRAST: text-slate-300 */}
          <p className="text-slate-300 text-lg max-w-2xl mx-auto">
            World-class specialists across all major medical fields, equipped with the latest technology
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-16 w-full">
        {error && <ApiError message={error} onRetry={refetch} />}

        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {display.map(d => (
              <div key={d.id}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all group card-hover">
                <div className="w-16 h-16 bg-[#EFF6FF] rounded-2xl flex items-center justify-center mb-4 group-hover:bg-[#2C74B3]/10 transition-colors">
                  <i className={`bi bi-${d.icon_key} text-3xl text-[#2C74B3]`} />
                </div>
                <h3 className="font-bold text-[#0A2647] text-xl mb-2">{d.name}</h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-4">{d.description}</p>
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <span className="text-[#2C74B3] text-sm font-semibold">
                    <i className="bi bi-people-fill mr-1" />
                    {d.doctors_count} Doctors
                  </span>
                  <Link href="/doctors"
                    className="text-[#2C74B3] text-sm font-semibold hover:underline inline-flex items-center gap-1">
                    View <i className="bi bi-arrow-right" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
