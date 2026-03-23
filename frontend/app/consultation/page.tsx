"use client";
import { useState } from "react";
import Navbar from "@/components/Navbar";

const initialMessages = [
  { from: "doctor", text: "Hello! How are you feeling today?", time: "10:01 AM" },
  { from: "patient", text: "Hi Doctor, I've been having some chest pain since yesterday.", time: "10:02 AM" },
  { from: "doctor", text: "I see. Can you describe the pain? Is it sharp or dull?", time: "10:03 AM" },
];

export default function ConsultationPage() {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");

  const send = () => {
    if (!input.trim()) return;
    setMessages(m => [...m, { from: "patient", text: input, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }]);
    setInput("");
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Navbar />
      <div className="flex-1 flex max-w-7xl mx-auto w-full px-4 py-8 gap-6">
        {/* Chat */}
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col">
          <div className="p-5 border-b border-gray-100 flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#144272] to-[#2C74B3] rounded-full flex items-center justify-center text-2xl">👨‍⚕️</div>
            <div>
              <div className="font-bold text-[#0A2647]">Dr. Sarah Johnson</div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 bg-[#2A9D8F] rounded-full"></div>
                <span className="text-[#2A9D8F] text-xs font-medium">Online</span>
              </div>
            </div>
            <button className="ml-auto bg-[#E63946] text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-red-700 transition-all">
              End Consultation
            </button>
          </div>

          <div className="flex-1 p-6 overflow-y-auto space-y-4" style={{ maxHeight: "460px" }}>
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.from === "patient" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl text-sm ${m.from === "patient" ? "bg-[#2C74B3] text-white rounded-br-none" : "bg-[#F8FAFC] text-[#0A2647] rounded-bl-none border border-gray-100"}`}>
                  <p>{m.text}</p>
                  <p className={`text-xs mt-1 ${m.from === "patient" ? "text-blue-200" : "text-gray-400"}`}>{m.time}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-gray-100">
            <div className="flex gap-3">
              <button className="text-gray-400 hover:text-[#2C74B3] transition-colors text-xl px-2">📎</button>
              <input value={input} onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && send()}
                placeholder="Type your message..."
                className="flex-1 border-2 border-gray-200 rounded-xl px-4 py-2.5 text-[#0A2647] focus:border-[#2C74B3] focus:outline-none transition-colors text-sm" />
              <button onClick={send} className="bg-[#2C74B3] text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-[#0A2647] transition-all text-sm">
                Send →
              </button>
            </div>
          </div>
        </div>

        {/* Patient Details */}
        <div className="w-72 flex-shrink-0 hidden lg:block">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-bold text-[#0A2647] text-lg mb-4">Patient Details</h3>
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-[#144272] to-[#2C74B3] rounded-full flex items-center justify-center text-3xl mx-auto mb-3">👤</div>
              <div className="font-bold text-[#0A2647]">John Patient</div>
              <div className="text-gray-400 text-sm">ID: #PT-00123</div>
            </div>
            <div className="space-y-3">
              {[
                ["Age", "40 years"],
                ["Blood Group", "A+"],
                ["Allergies", "None"],
                ["Last Visit", "Mar 15, 2026"],
                ["Chief Complaint", "Chest pain"],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between text-sm">
                  <span className="text-gray-400">{k}</span>
                  <span className="text-[#0A2647] font-medium">{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
