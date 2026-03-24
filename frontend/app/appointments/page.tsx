"use client";
import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { api, tokenStore } from "@/lib/api";
import { useMutation } from "@/lib/useApi";
import type { Doctor, Department } from "@/lib/types";

const steps = ["Department", "Doctor", "Date & Time", "Confirm"];

const timeSlots = [
  "09:00 AM","09:30 AM","10:00 AM","10:30 AM","11:00 AM","11:30 AM",
  "02:00 PM","02:30 PM","03:00 PM","03:30 PM","04:00 PM","04:30 PM",
];

function toApiTime(display: string): string {
  const [time, period] = display.split(" ");
  const [h, m] = time.split(":");
  let hour = parseInt(h, 10);
  if (period === "PM" && hour !== 12) hour += 12;
  if (period === "AM" && hour === 12) hour = 0;
  return `${String(hour).padStart(2, "0")}:${m}`;
}

export default function AppointmentPage() {
  const router = useRouter();
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [step, setStep] = useState(0);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loadingDepts, setLoadingDepts] = useState(true);
  const [loadingDocs, setLoadingDocs] = useState(false);

  const [deptId, setDeptId] = useState<number | null>(null);
  const [deptName, setDeptName] = useState("");
  const [doctorId, setDoctorId] = useState<number | null>(null);
  const [doctorName, setDoctorName] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");
  const [booked, setBooked] = useState(false);

  useEffect(() => {
    setAuthed(!!tokenStore.get());
    api.departments.list().then(setDepartments).finally(() => setLoadingDepts(false));
  }, []);

  useEffect(() => {
    if (deptName) {
      setLoadingDocs(true);
      api.doctors.list({ specialization: deptName })
        .then(res => setDoctors(res.data ?? []))
        .finally(() => setLoadingDocs(false));
    }
  }, [deptName]);

  const mutator = useCallback(
    () => api.appointments.create({ doctorId: doctorId!, date, time: toApiTime(time), notes }),
    [doctorId, date, time, notes],
  );
  const [submit, { loading: submitting, error: submitError }] = useMutation(mutator);

  const next = () => setStep(s => Math.min(s + 1, steps.length - 1));
  const back = () => setStep(s => Math.max(s - 1, 0));

  const confirm = async () => {
    const result = await submit();
    if (result !== null) setBooked(true);
  };

  const canNext = [
    deptId !== null,
    doctorId !== null,
    date !== "" && time !== "",
    true,
  ][step];

  if (authed === false) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="bi bi-lock-fill text-4xl text-[#2C74B3]" />
            </div>
            <h2 className="text-3xl font-bold text-[#0A2647] mb-3">Sign In Required</h2>
            <p className="text-gray-500 mb-6">Please sign in to your patient account to book an appointment with our doctors.</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => router.push("/auth/login")}
                className="bg-[#2C74B3] text-white font-semibold px-8 py-3 rounded-xl hover:bg-[#0A2647] transition-all">
                Sign In
              </button>
              <button onClick={() => router.push("/auth/register")}
                className="border-2 border-[#2C74B3] text-[#2C74B3] font-semibold px-8 py-3 rounded-xl hover:bg-[#EFF6FF] transition-all">
                Register
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (booked) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="bi bi-check-circle-fill text-5xl text-[#2A9D8F]" />
            </div>
            <h2 className="text-3xl font-bold text-[#0A2647] mb-3">Appointment Confirmed!</h2>
            <p className="text-gray-500 mb-6">
              Your appointment with <strong>{doctorName}</strong> has been booked for{" "}
              <strong>{date}</strong> at <strong>{time}</strong>.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => { setBooked(false); setStep(0); setDeptId(null); setDeptName(""); setDoctorId(null); setDoctorName(""); setDate(""); setTime(""); setNotes(""); }}
                className="bg-[#2C74B3] text-white font-semibold px-8 py-3 rounded-xl hover:bg-[#0A2647] transition-all">
                Book Another
              </button>
              <button onClick={() => router.push("/dashboard/patient")}
                className="border-2 border-[#2C74B3] text-[#2C74B3] font-semibold px-8 py-3 rounded-xl hover:bg-[#EFF6FF] transition-all">
                View Dashboard
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-12 w-full">
        <h1 className="text-4xl font-bold text-[#0A2647] mb-2">Book Appointment</h1>
        <p className="text-gray-500 mb-8">Complete the steps below to schedule your appointment</p>

        {/* Progress */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-3">
            {steps.map((s, i) => (
              <div key={s} className="flex items-center flex-1">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all border-2 ${
                  i < step  ? "border-[#2C74B3] bg-[#2C74B3] text-white"
                  : i === step ? "border-[#2C74B3] bg-white text-[#2C74B3]"
                  :               "border-gray-200 bg-white text-gray-400"
                }`}>
                  {i < step ? <i className="bi bi-check-lg" /> : i + 1}
                </div>
                {i < steps.length - 1 && (
                  <div className={`flex-1 h-1 mx-2 rounded transition-all ${i < step ? "bg-[#2C74B3]" : "bg-gray-200"}`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between px-0.5">
            {steps.map((s, i) => (
              <span key={s} className={`text-xs font-medium ${i === step ? "text-[#2C74B3]" : "text-gray-400"}`}>{s}</span>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">

          {/* Step 1: Department */}
          {step === 0 && (
            <div>
              <h2 className="text-2xl font-bold text-[#0A2647] mb-6 flex items-center gap-2">
                <i className="bi bi-grid-fill text-[#2C74B3]" /> Select Department
              </h2>
              {loadingDepts ? (
                <div className="grid grid-cols-2 gap-4">
                  {Array.from({length:6}).map((_,i)=>(
                    <div key={i} className="p-4 rounded-xl border-2 border-gray-100 bg-gray-50 h-16 animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {departments.map(d => (
                    <button key={d.id} onClick={() => { setDeptId(d.id); setDeptName(d.name); setDoctorId(null); setDoctorName(""); }}
                      className={`p-4 rounded-xl border-2 text-left font-medium transition-all ${
                        deptId === d.id
                          ? "border-[#2C74B3] bg-[#EFF6FF] text-[#2C74B3]"
                          : "border-gray-200 text-gray-700 hover:border-[#2C74B3]/50"
                      }`}>
                      <div className="font-semibold">{d.name}</div>
                      {d.description && <div className="text-xs text-gray-500 mt-0.5">{d.description}</div>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 2: Doctor */}
          {step === 1 && (
            <div>
              <h2 className="text-2xl font-bold text-[#0A2647] mb-6 flex items-center gap-2">
                <i className="bi bi-person-badge-fill text-[#2C74B3]" /> Select Doctor
              </h2>
              {loadingDocs ? (
                <div className="space-y-3">
                  {Array.from({length:3}).map((_,i)=>(
                    <div key={i} className="p-4 rounded-xl border-2 border-gray-100 bg-gray-50 h-20 animate-pulse" />
                  ))}
                </div>
              ) : doctors.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <i className="bi bi-person-x text-4xl block mb-2" />
                  No doctors available in {deptName}
                </div>
              ) : (
                <div className="space-y-3">
                  {doctors.map(d => (
                    <button key={d.id} onClick={() => { setDoctorId(d.id); setDoctorName(d.name); }}
                      className={`w-full p-4 rounded-xl border-2 text-left font-medium transition-all flex items-center gap-4 ${
                        doctorId === d.id ? "border-[#2C74B3] bg-[#EFF6FF]" : "border-gray-200 hover:border-[#2C74B3]/50"
                      }`}>
                      <div className="w-12 h-12 bg-gradient-to-br from-[#144272] to-[#2C74B3] rounded-full flex items-center justify-center flex-shrink-0">
                        <i className="bi bi-person-circle text-white text-2xl" />
                      </div>
                      <div className="flex-1">
                        <div className={`font-semibold ${doctorId === d.id ? "text-[#2C74B3]" : "text-[#0A2647]"}`}>{d.name}</div>
                        <div className="text-sm text-gray-500">{d.specialization} · {d.experience_years ?? d.experience} yrs exp</div>
                      </div>
                      {d.rating !== undefined && (
                        <div className="text-sm font-semibold text-amber-500 flex items-center gap-1">
                          <i className="bi bi-star-fill" /> {d.rating.toFixed(1)}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 3: Date & Time */}
          {step === 2 && (
            <div>
              <h2 className="text-2xl font-bold text-[#0A2647] mb-6 flex items-center gap-2">
                <i className="bi bi-calendar-check-fill text-[#2C74B3]" /> Select Date & Time
              </h2>
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Date</label>
                <input type="date" value={date} onChange={e => setDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-[#0A2647] focus:border-[#2C74B3] focus:outline-none transition-colors" />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">Time Slot</label>
                <div className="grid grid-cols-3 gap-3">
                  {timeSlots.map(t => (
                    <button key={t} onClick={() => setTime(t)}
                      className={`py-2.5 px-3 rounded-xl border-2 text-sm font-medium transition-all ${
                        time === t
                          ? "border-[#2C74B3] bg-[#2C74B3] text-white"
                          : "border-gray-200 text-gray-700 hover:border-[#2C74B3]/50"
                      }`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Additional Notes (optional)</label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)}
                  placeholder="Describe your symptoms or concerns..." rows={3}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-[#0A2647] placeholder-gray-400 focus:border-[#2C74B3] focus:outline-none transition-colors resize-none" />
              </div>
            </div>
          )}

          {/* Step 4: Confirm */}
          {step === 3 && (
            <div>
              <h2 className="text-2xl font-bold text-[#0A2647] mb-6 flex items-center gap-2">
                <i className="bi bi-check-circle-fill text-[#2A9D8F]" /> Confirm Appointment
              </h2>
              <div className="bg-[#F8FAFC] rounded-xl p-6 space-y-3 mb-6 border border-gray-100">
                {[
                  ["Department", deptName],
                  ["Doctor", doctorName],
                  ["Date", date],
                  ["Time", time],
                  ...(notes ? [["Notes", notes]] : []),
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between py-1">
                    <span className="text-gray-500 text-sm">{k}</span>
                    <span className="text-[#0A2647] font-semibold text-sm">{v || <span className="text-gray-300">—</span>}</span>
                  </div>
                ))}
              </div>

              {submitError && (
                <div className="mb-4 p-4 bg-red-50 border border-red-100 rounded-xl text-red-700 text-sm flex items-center gap-2">
                  <i className="bi bi-exclamation-circle-fill text-[#E63946]" />
                  {submitError}
                </div>
              )}

              <button onClick={confirm} disabled={submitting}
                className="w-full bg-[#2A9D8F] text-white font-bold py-4 rounded-xl hover:bg-[#21867a] transition-all text-lg flex items-center justify-center gap-2 disabled:opacity-60">
                {submitting
                  ? <><i className="bi bi-arrow-repeat animate-spin" /> Booking...</>
                  : <><i className="bi bi-check-circle-fill" /> Confirm Appointment</>}
              </button>
            </div>
          )}

          {/* Nav buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
            <button onClick={back} disabled={step === 0}
              className="px-6 py-2.5 border-2 border-gray-200 rounded-xl text-gray-700 font-medium hover:border-[#2C74B3] hover:text-[#2C74B3] disabled:opacity-30 transition-all flex items-center gap-2">
              <i className="bi bi-arrow-left" /> Back
            </button>
            {step < steps.length - 1 && (
              <button onClick={next} disabled={!canNext}
                className="px-8 py-2.5 bg-[#2C74B3] text-white rounded-xl font-semibold hover:bg-[#0A2647] transition-all flex items-center gap-2 disabled:opacity-50">
                Next <i className="bi bi-arrow-right" />
              </button>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
