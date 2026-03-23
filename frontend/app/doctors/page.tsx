"use client";
import { useState, useCallback } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { api } from "@/lib/api";
import { useApi } from "@/lib/useApi";
import ApiError from "@/components/ApiError";
import { SkeletonCard } from "@/components/Skeleton";
import type { Doctor, DoctorFilter } from "@/lib/types";

const specializations = ["All", "Cardiology", "Neurology", "Pediatrics", "Orthopedics", "Ophthalmology", "General Medicine"];
const expOptions = [
  { label: "Any", value: 0 },
  { label: "5+ years", value: 5 },
  { label: "10+ years", value: 10 },
  { label: "15+ years", value: 15 },
];

export default function DoctorsPage() {
  const [spec, setSpec] = useState("All");
  const [minExp, setMinExp] = useState(0);

  const filters: DoctorFilter = {
    ...(spec !== "All" ? { specialization: spec } : {}),
    ...(minExp > 0 ? { min_experience: minExp } : {}),
  };

  const fetcher = useCallback(() => api.doctors.list(filters), [spec, minExp]);
  const { data, loading, error, refetch } = useApi(fetcher, [spec, minExp]);

  const doctors: Doctor[] = data?.results ?? [];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-10 w-full">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#0A2647] mb-2">Our Doctors</h1>
          <p className="text-gray-500">Find and book an appointment with our expert specialists</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar filters */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-20">
              <h3 className="font-bold text-[#0A2647] mb-5 text-lg flex items-center gap-2">
                <i className="bi bi-funnel-fill text-[#2C74B3]" />
                Filters
              </h3>

              <div className="mb-6">
                <h4 className="font-semibold text-gray-700 mb-3 text-xs uppercase tracking-wider">Specialization</h4>
                <div className="space-y-1">
                  {specializations.map(s => (
                    <button key={s} onClick={() => setSpec(s)}
                      className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        spec === s
                          ? "bg-[#2C74B3] text-white"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-700 mb-3 text-xs uppercase tracking-wider">Min Experience</h4>
                <div className="space-y-1">
                  {expOptions.map(o => (
                    <button key={o.value} onClick={() => setMinExp(o.value)}
                      className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        minExp === o.value
                          ? "bg-[#2C74B3] text-white"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}>
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Doctor grid */}
          <div className="flex-1">
            {error && <ApiError message={error} onRetry={refetch} />}

            {!error && (
              <>
                {!loading && (
                  <p className="text-gray-500 text-sm mb-4 flex items-center gap-2">
                    <i className="bi bi-people-fill text-[#2C74B3]" />
                    {doctors.length} doctors found
                  </p>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {loading
                    ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
                    : doctors.map(d => (
                      <div key={d.id}
                        className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all card-hover">
                        <div className="bg-gradient-to-br from-[#144272] to-[#2C74B3] h-28 flex items-center justify-center">
                          <i className="bi bi-person-circle text-white/80" style={{ fontSize: "4rem" }} />
                        </div>
                        <div className="p-5">
                          <h3 className="font-bold text-[#0A2647] text-lg mb-1">{d.name}</h3>
                          <p className="text-[#2C74B3] text-sm font-medium mb-1">{d.specialization}</p>
                          <p className="text-gray-500 text-sm mb-3">{d.experience_years} years experience</p>
                          <div className="flex items-center justify-between mb-4">
                            <span className="font-semibold text-sm flex items-center gap-1">
                              <i className="bi bi-star-fill text-yellow-400" />
                              <span className="text-[#0A2647]">{d.rating}</span>
                            </span>
                            <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                              d.available
                                ? "bg-green-50 text-green-700"
                                : "bg-red-50 text-red-700"
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
                    ))
                  }
                </div>

                {!loading && doctors.length === 0 && !error && (
                  <div className="text-center py-16">
                    <i className="bi bi-search text-5xl text-gray-300 mb-4 block" />
                    <h3 className="text-lg font-bold text-[#0A2647] mb-2">No doctors found</h3>
                    <p className="text-gray-500 text-sm">Try adjusting your filters</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
