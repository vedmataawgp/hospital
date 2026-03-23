"use client";
import { useState, useCallback } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { api } from "@/lib/api";
import { useMutation } from "@/lib/useApi";

const steps = ["Department", "Doctor", "Date & Time", "Details", "Confirm"];

const departments = ["Cardiology", "Neurology", "Pediatrics", "Orthopedics", "Ophthalmology", "General Medicine"];
const doctorsByDept: Record<string, string[]> = {
  Cardiology:        ["Dr. Sarah Johnson", "Dr. Emily Rodriguez"],
  Neurology:         ["Dr. Michael Chen", "Dr. David Kim"],
  Pediatrics:        ["Dr. Aisha Patel", "Dr. Lisa Thompson"],
  Orthopedics:       ["Dr. James Wilson", "Dr. Robert Davis"],
  Ophthalmology:     ["Dr. Anna White"],
  "General Medicine":["Dr. Peter Brown", "Dr. Susan Lee"],
};
const timeSlots = ["09:00 AM","09:30 AM","10:00 AM","10:30 AM","11:00 AM","11:30 AM","02:00 PM","02:30 PM","03:00 PM","03:30 PM","04:00 PM"];

export default function AppointmentPage() {
  const [step, setStep] = useState(0);
  const [dept, setDept] = useState("");
  const [doctor, setDoctor] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [booked, setBooked] = useState(false);

  const mutator = useCallback(
    () => api.appointments.create({
      department: dept,
      doctor_name: doctor,
      date,
      time,
      patient_name: name,
      patient_email: email,
      patient_phone: phone,
      notes,
    }),
    [dept, doctor, date, time, name, email, phone, notes],
  );

  const [submit, { loading: submitting, error: submitError }] = useMutation(mutator);

  const next = () => setStep(s => Math.min(s + 1, steps.length - 1));
  const back = () => setStep(s => Math.max(s - 1, 0));

  const confirm = async () => {
    const result = await submit();
    if (result !== null) setBooked(true);
  };

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
              Your appointment with <strong>{doctor}</strong> in <strong>{dept}</strong> has been booked for{" "}
              <strong>{date}</strong> at <strong>{time}</strong>. A confirmation will be sent to{" "}
              <strong>{email}</strong>.
            </p>
            <button
              onClick={() => { setBooked(false); setStep(0); setDept(""); setDoctor(""); setDate(""); setTime(""); setName(""); setEmail(""); setPhone(""); setNotes(""); }}
              className="bg-[#2C74B3] text-white font-semibold px-8 py-3 rounded-xl hover:bg-[#0A2647] transition-all"
            >
              Book Another
            </button>
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
              <div className="grid grid-cols-2 gap-4">
                {departments.map(d => (
                  <button key={d} onClick={() => setDept(d)}
                    className={`p-4 rounded-xl border-2 text-left font-medium transition-all ${
                      dept === d
                        ? "border-[#2C74B3] bg-[#EFF6FF] text-[#2C74B3]"
                        : "border-gray-200 text-gray-700 hover:border-[#2C74B3]/50"
                    }`}>
                    {d}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Doctor */}
          {step === 1 && (
            <div>
              <h2 className="text-2xl font-bold text-[#0A2647] mb-6 flex items-center gap-2">
                <i className="bi bi-person-badge-fill text-[#2C74B3]" /> Select Doctor
              </h2>
              <div className="space-y-3">
                {(doctorsByDept[dept] || []).map(d => (
                  <button key={d} onClick={() => setDoctor(d)}
                    className={`w-full p-4 rounded-xl border-2 text-left font-medium transition-all flex items-center gap-4 ${
                      doctor === d ? "border-[#2C74B3] bg-[#EFF6FF]" : "border-gray-200 hover:border-[#2C74B3]/50"
                    }`}>
                    <div className="w-12 h-12 bg-gradient-to-br from-[#144272] to-[#2C74B3] rounded-full flex items-center justify-center">
                      <i className="bi bi-person-circle text-white text-2xl" />
                    </div>
                    <div>
                      <div className={`font-semibold ${doctor === d ? "text-[#2C74B3]" : "text-[#0A2647]"}`}>{d}</div>
                      <div className="text-sm text-gray-500">{dept} Specialist</div>
                    </div>
                  </button>
                ))}
              </div>
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
              <div>
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
            </div>
          )}

          {/* Step 4: Details */}
          {step === 3 && (
            <div>
              <h2 className="text-2xl font-bold text-[#0A2647] mb-6 flex items-center gap-2">
                <i className="bi bi-person-lines-fill text-[#2C74B3]" /> Your Details
              </h2>
              <div className="space-y-4">
                {[
                  { label: "Full Name", value: name, setter: setName, type: "text", placeholder: "John Doe" },
                  { label: "Email Address", value: email, setter: setEmail, type: "email", placeholder: "john@example.com" },
                  { label: "Phone Number", value: phone, setter: setPhone, type: "tel", placeholder: "+1 (555) 000-0000" },
                ].map(f => (
                  <div key={f.label}>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">{f.label}</label>
                    <input type={f.type} value={f.value} onChange={e => f.setter(e.target.value)}
                      placeholder={f.placeholder}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-[#0A2647] placeholder-gray-400 focus:border-[#2C74B3] focus:outline-none transition-colors" />
                  </div>
                ))}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Additional Notes</label>
                  <textarea value={notes} onChange={e => setNotes(e.target.value)}
                    placeholder="Describe your symptoms or concerns..." rows={3}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-[#0A2647] placeholder-gray-400 focus:border-[#2C74B3] focus:outline-none transition-colors resize-none" />
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Confirm */}
          {step === 4 && (
            <div>
              <h2 className="text-2xl font-bold text-[#0A2647] mb-6 flex items-center gap-2">
                <i className="bi bi-check-circle-fill text-[#2A9D8F]" /> Confirm Appointment
              </h2>
              <div className="bg-[#F8FAFC] rounded-xl p-6 space-y-3 mb-6 border border-gray-100">
                {[
                  ["Department", dept],
                  ["Doctor", doctor],
                  ["Date", date],
                  ["Time", time],
                  ["Patient", name],
                  ["Email", email],
                  ["Phone", phone],
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
              <button onClick={next}
                className="px-8 py-2.5 bg-[#2C74B3] text-white rounded-xl font-semibold hover:bg-[#0A2647] transition-all flex items-center gap-2">
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
