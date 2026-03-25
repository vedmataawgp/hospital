"use client";
import { useState, useCallback, useEffect, useMemo } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import AuthGuard from "@/components/AuthGuard";
import Footer from "@/components/Footer";
import { api, userStore } from "@/lib/api";
import { useApi } from "@/lib/useApi";
import { SkeletonCard } from "@/components/Skeleton";
import type { Doctor } from "@/lib/types";
import type { UserBrief } from "@/lib/api";

/* ── Patient card for doctor's view ─────────────────────────── */
interface PatientRow {
  id: number;
  name: string;
  age?: number;
  blood_group?: string;
  phone?: string;
  email?: string;
  next_appointment?: string;
  status?: string;
}

/* ─── Specializations ───────────────────────────────────────── */
const SPECS = [
  "All",
  "Cardiology",
  "Neurology",
  "Pediatrics",
  "Orthopedics",
  "Ophthalmology",
  "General Medicine",
  "Dermatology",
  "Psychiatry",
];

/* ─── Doctor avatar colours ─────────────────────────────────── */
const AVATAR_COLORS = [
  "from-[#0A2647] to-[#2C74B3]",
  "from-[#144272] to-[#38BDF8]",
  "from-[#2C74B3] to-[#7C3AED]",
  "from-[#0A2647] to-[#38BDF8]",
];

function avatarColor(id: number) {
  return AVATAR_COLORS[id % AVATAR_COLORS.length];
}

/* ═══════════════════════════════════════════════════════════════
   DOCTOR DISCOVERY (for patients)
═══════════════════════════════════════════════════════════════ */
function DoctorDiscovery() {
  const [search, setSearch]   = useState("");
  const [spec, setSpec]       = useState("All");
  const [available, setAvailable] = useState(false);
  const [query, setQuery]     = useState({ search: "", spec: "All", available: false });

  const fetcher = useCallback(
    () =>
      api.doctors.list({
        ...(query.spec !== "All" ? { specialization: query.spec } : {}),
        ...(query.search       ? { search: query.search }        : {}),
        ...(query.available    ? { available: true }             : {}),
      }),
    [query],
  );

  const { data, loading, error, refetch } = useApi(fetcher, [query]);
  const doctors: Doctor[] = data?.results ?? data?.data ?? (Array.isArray(data) ? (data as Doctor[]) : []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setQuery({ search, spec, available });
  };

  return (
    <div>
      {/* Hero strip */}
      <div className="bg-gradient-to-r from-[#0A2647] via-[#144272] to-[#2C74B3] rounded-2xl p-8 mb-8 text-white">
        <h2 className="text-3xl font-bold mb-1 flex items-center gap-3">
          <i className="bi bi-person-badge-fill text-[#38BDF8]" />
          Discover Doctors
        </h2>
        <p className="text-slate-300 text-sm mb-6">Find and connect with certified specialists</p>

        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <i className="bi bi-search absolute left-3.5 top-3.5 text-slate-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or specialization..."
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 focus:outline-none focus:border-[#38BDF8] text-sm"
            />
          </div>
          <select
            value={spec}
            onChange={e => setSpec(e.target.value)}
            className="px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:border-[#38BDF8] text-sm"
          >
            {SPECS.map(s => <option key={s} value={s} className="text-[#0A2647]">{s}</option>)}
          </select>
          <label className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-sm cursor-pointer select-none">
            <input
              type="checkbox"
              checked={available}
              onChange={e => setAvailable(e.target.checked)}
              className="accent-[#38BDF8]"
            />
            <span>Available only</span>
          </label>
          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-[#38BDF8] text-[#0A2647] font-bold hover:bg-white transition-all text-sm"
          >
            <i className="bi bi-search mr-2" />
            Search
          </button>
        </form>
      </div>

      {/* Results */}
      {error && (
        <div className="text-center py-12">
          <i className="bi bi-wifi-off text-4xl text-gray-300 mb-3 block" />
          <p className="text-gray-500 mb-4">{error}</p>
          <button onClick={refetch} className="text-[#2C74B3] font-medium hover:underline">Retry</button>
        </div>
      )}

      {!error && (
        <>
          {!loading && (
            <p className="text-gray-500 text-sm mb-5 flex items-center gap-2">
              <i className="bi bi-people-fill text-[#2C74B3]" />
              {doctors.length} doctor{doctors.length !== 1 ? "s" : ""} found
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {loading
              ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
              : doctors.map(d => (
                <div
                  key={d.id}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-200"
                >
                  {/* Avatar */}
                  <div className={`bg-gradient-to-br ${avatarColor(d.id)} h-28 flex items-center justify-center relative`}>
                    <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                      <i className="bi bi-person-fill text-white text-3xl" />
                    </div>
                    {d.available !== undefined && (
                      <span className={`absolute top-3 right-3 text-[11px] font-bold px-2.5 py-1 rounded-full ${
                        d.available ? "bg-green-400 text-green-900" : "bg-red-400 text-white"
                      }`}>
                        {d.available ? "Available" : "Busy"}
                      </span>
                    )}
                  </div>

                  <div className="p-5">
                    <h3 className="font-bold text-[#0A2647] text-lg mb-0.5">{d.name}</h3>
                    <p className="text-[#2C74B3] text-sm font-medium mb-1">{d.specialization}</p>
                    <p className="text-gray-400 text-xs mb-3">
                      <i className="bi bi-briefcase-fill mr-1" />
                      {d.experience_years} yrs experience
                    </p>

                    {d.rating !== undefined && (
                      <div className="flex items-center gap-1 mb-4">
                        {[1, 2, 3, 4, 5].map(i => (
                          <i
                            key={i}
                            className={`bi bi-star${i <= Math.round(d.rating ?? 0) ? "-fill" : ""} text-yellow-400 text-xs`}
                          />
                        ))}
                        <span className="text-gray-500 text-xs ml-1">{d.rating?.toFixed(1)}</span>
                      </div>
                    )}

                    <Link
                      href={`/appointments?doctorId=${d.id}`}
                      className="w-full bg-[#2C74B3] text-white font-semibold py-2.5 rounded-xl hover:bg-[#0A2647] transition-all text-sm text-center block"
                    >
                      <i className="bi bi-calendar2-heart-fill mr-2" />
                      Book Appointment
                    </Link>
                  </div>
                </div>
              ))
            }
          </div>

          {!loading && doctors.length === 0 && !error && (
            <div className="text-center py-20">
              <i className="bi bi-person-slash text-6xl text-gray-200 mb-4 block" />
              <h3 className="text-xl font-bold text-[#0A2647] mb-2">No doctors found</h3>
              <p className="text-gray-400 text-sm">Try adjusting your search or filters</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PATIENT DISCOVERY (for doctors)
═══════════════════════════════════════════════════════════════ */
function PatientDiscovery() {
  const [search, setSearch] = useState("");

  const fetcher = useCallback(() => api.doctor.patients(), []);
  const { data, loading, error, refetch } = useApi(fetcher);

  const patients: PatientRow[] = (data as PatientRow[] | null) ?? [];

  const filtered = useMemo(() => {
    if (!search.trim()) return patients;
    const q = search.toLowerCase();
    return patients.filter(
      p =>
        p.name?.toLowerCase().includes(q) ||
        p.email?.toLowerCase().includes(q) ||
        p.blood_group?.toLowerCase().includes(q) ||
        p.phone?.includes(q),
    );
  }, [patients, search]);

  return (
    <div>
      {/* Hero strip */}
      <div className="bg-gradient-to-r from-[#0A2647] via-[#144272] to-[#2C74B3] rounded-2xl p-8 mb-8 text-white">
        <h2 className="text-3xl font-bold mb-1 flex items-center gap-3">
          <i className="bi bi-people-fill text-[#38BDF8]" />
          Discover Patients
        </h2>
        <p className="text-slate-300 text-sm mb-6">Browse and search your assigned patients</p>

        <div className="relative max-w-xl">
          <i className="bi bi-search absolute left-3.5 top-3.5 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, email, blood group, phone..."
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 focus:outline-none focus:border-[#38BDF8] text-sm"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3.5 top-3.5 text-slate-400 hover:text-white"
            >
              <i className="bi bi-x-circle" />
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="text-center py-12">
          <i className="bi bi-wifi-off text-4xl text-gray-300 mb-3 block" />
          <p className="text-gray-500 mb-4">{error}</p>
          <button onClick={refetch} className="text-[#2C74B3] font-medium hover:underline">Retry</button>
        </div>
      )}

      {!error && (
        <>
          {!loading && (
            <p className="text-gray-500 text-sm mb-5 flex items-center gap-2">
              <i className="bi bi-person-lines-fill text-[#2C74B3]" />
              {filtered.length} patient{filtered.length !== 1 ? "s" : ""}
              {search ? ` matching "${search}"` : " assigned to you"}
            </p>
          )}

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <i className="bi bi-person-slash text-6xl text-gray-200 mb-4 block" />
              <h3 className="text-xl font-bold text-[#0A2647] mb-2">
                {search ? "No matching patients" : "No patients yet"}
              </h3>
              <p className="text-gray-400 text-sm">
                {search ? "Try a different search term" : "Patients will appear here once assigned"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {filtered.map((p, idx) => (
                <div
                  key={p.id ?? idx}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-200"
                >
                  {/* Avatar strip */}
                  <div className={`bg-gradient-to-br ${avatarColor(p.id ?? idx)} h-24 flex items-center justify-center`}>
                    <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center">
                      <span className="text-white text-2xl font-bold">
                        {p.name?.[0]?.toUpperCase() ?? "P"}
                      </span>
                    </div>
                  </div>

                  <div className="p-5">
                    <h3 className="font-bold text-[#0A2647] text-lg mb-1">{p.name}</h3>

                    <div className="space-y-1.5 mb-4">
                      {p.email && (
                        <p className="text-gray-500 text-xs flex items-center gap-2">
                          <i className="bi bi-envelope-fill text-[#2C74B3] w-4" />
                          {p.email}
                        </p>
                      )}
                      {p.phone && (
                        <p className="text-gray-500 text-xs flex items-center gap-2">
                          <i className="bi bi-telephone-fill text-[#2C74B3] w-4" />
                          {p.phone}
                        </p>
                      )}
                      {p.blood_group && (
                        <p className="text-gray-500 text-xs flex items-center gap-2">
                          <i className="bi bi-droplet-fill text-red-500 w-4" />
                          Blood group: <span className="font-semibold text-[#0A2647]">{p.blood_group}</span>
                        </p>
                      )}
                      {p.age !== undefined && (
                        <p className="text-gray-500 text-xs flex items-center gap-2">
                          <i className="bi bi-person-fill text-[#2C74B3] w-4" />
                          Age: <span className="font-semibold text-[#0A2647]">{p.age}</span>
                        </p>
                      )}
                    </div>

                    {p.next_appointment && (
                      <div className="mb-4 bg-blue-50 rounded-xl px-3 py-2 flex items-center gap-2">
                        <i className="bi bi-calendar2-check-fill text-[#2C74B3] text-sm" />
                        <span className="text-xs text-[#0A2647] font-medium">{p.next_appointment}</span>
                      </div>
                    )}

                    <Link
                      href="/dashboard/doctor"
                      className="w-full bg-[#2C74B3] text-white font-semibold py-2.5 rounded-xl hover:bg-[#0A2647] transition-all text-sm text-center block"
                    >
                      <i className="bi bi-clipboard2-pulse-fill mr-2" />
                      View Record
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE  (role-aware)
═══════════════════════════════════════════════════════════════ */
export default function DiscoverPage() {
  const [user, setUser] = useState<UserBrief | null>(null);

  useEffect(() => {
    setUser(userStore.get());
  }, []);

  const isDoctor  = user?.role === "doctor";
  const isAdmin   = user?.role === "admin";

  return (
    <AuthGuard>
      <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
        <Navbar />
        <main className="flex-1 max-w-7xl mx-auto px-4 py-10 w-full">

          {/* Page header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-[#0A2647] mb-2">
              {isDoctor ? "Discover Patients" : isAdmin ? "Discover Users" : "Discover Doctors"}
            </h1>
            <p className="text-gray-500">
              {isDoctor
                ? "Browse and search patients assigned to you"
                : "Find and book appointments with certified specialists"}
            </p>
          </div>

          {/* Role-based content */}
          {user === null ? (
            <div className="flex justify-center py-20">
              <div className="w-10 h-10 border-4 border-[#2C74B3] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : isDoctor ? (
            <PatientDiscovery />
          ) : (
            <DoctorDiscovery />
          )}
        </main>
        <Footer />
      </div>
    </AuthGuard>
  );
}
