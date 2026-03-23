"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import Navbar from "@/components/Navbar";
import { api } from "@/lib/api";
import { useMutation } from "@/lib/useApi";
import type { Message } from "@/lib/types";

const seedMessages: Message[] = [
  { id: 1, from: "doctor",  text: "Hello! How are you feeling today?",                              time: "10:01 AM" },
  { id: 2, from: "patient", text: "Hi Doctor, I've been having some chest pain since yesterday.",   time: "10:02 AM" },
  { id: 3, from: "doctor",  text: "I see. Can you describe the pain? Is it sharp or dull?",         time: "10:03 AM" },
];

const CONSULTATION_ID = 1;

export default function ConsultationPage() {
  const [messages, setMessages] = useState<Message[]>(seedMessages);
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMutator = useCallback(
    () => api.consultation.send(CONSULTATION_ID, input),
    [input],
  );

  const [sendMessage, { loading: sending }] = useMutation(sendMutator);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || sending) return;

    const optimistic: Message = {
      id: Date.now(),
      from: "patient",
      text,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages(m => [...m, optimistic]);
    setInput("");

    await sendMessage();
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Navbar />
      <div className="flex-1 flex max-w-7xl mx-auto w-full px-4 py-8 gap-6">

        {/* Chat panel */}
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">

          {/* Header */}
          <div className="p-5 border-b border-gray-100 flex items-center gap-4 bg-white">
            <div className="w-12 h-12 bg-gradient-to-br from-[#144272] to-[#2C74B3] rounded-full flex items-center justify-center">
              <i className="bi bi-person-circle text-white text-2xl" />
            </div>
            <div>
              <div className="font-bold text-[#0A2647]">Dr. Sarah Johnson</div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 bg-[#2A9D8F] rounded-full" />
                <span className="text-[#2A9D8F] text-xs font-semibold">Online</span>
              </div>
            </div>
            <div className="ml-auto flex gap-2">
              <button className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:border-[#2C74B3] hover:text-[#2C74B3] transition-all" title="Video call">
                <i className="bi bi-camera-video-fill" />
              </button>
              <button className="bg-[#E63946] text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-red-700 transition-all flex items-center gap-1.5">
                <i className="bi bi-telephone-x-fill" />
                End
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4" style={{ maxHeight: "460px" }}>
            {messages.map(m => (
              <div key={m.id} className={`flex ${m.from === "patient" ? "justify-end" : "justify-start"}`}>
                {m.from === "doctor" && (
                  <div className="w-8 h-8 bg-gradient-to-br from-[#144272] to-[#2C74B3] rounded-full flex items-center justify-center mr-2 flex-shrink-0 self-end">
                    <i className="bi bi-person-circle text-white text-sm" />
                  </div>
                )}
                <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl text-sm shadow-sm ${
                  m.from === "patient"
                    ? "bg-[#2C74B3] text-white rounded-br-none"
                    : "bg-[#F1F5F9] text-[#0A2647] rounded-bl-none border border-gray-100"
                }`}>
                  <p className="leading-relaxed">{m.text}</p>
                  {/* CONTRAST: time text visible on both backgrounds */}
                  <p className={`text-xs mt-1.5 ${m.from === "patient" ? "text-blue-200" : "text-gray-400"}`}>
                    {m.time}
                  </p>
                </div>
              </div>
            ))}
            <div ref={endRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-100 bg-white">
            <div className="flex gap-3 items-center">
              <button className="text-gray-400 hover:text-[#2C74B3] transition-colors w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center hover:border-[#2C74B3]">
                <i className="bi bi-paperclip" />
              </button>
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSend()}
                placeholder="Type your message..."
                className="flex-1 border-2 border-gray-200 rounded-xl px-4 py-2.5 text-[#0A2647] placeholder-gray-400 focus:border-[#2C74B3] focus:outline-none transition-colors text-sm"
              />
              <button onClick={handleSend} disabled={sending || !input.trim()}
                className="bg-[#2C74B3] text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-[#0A2647] transition-all text-sm disabled:opacity-50 flex items-center gap-1.5">
                {sending
                  ? <i className="bi bi-arrow-repeat animate-spin" />
                  : <><i className="bi bi-send-fill" /> Send</>}
              </button>
            </div>
          </div>
        </div>

        {/* Patient Details */}
        <div className="w-72 flex-shrink-0 hidden lg:block">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
            <h3 className="font-bold text-[#0A2647] text-lg mb-4 flex items-center gap-2">
              <i className="bi bi-person-vcard-fill text-[#2C74B3]" />
              Patient Details
            </h3>
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-[#144272] to-[#2C74B3] rounded-full flex items-center justify-center mx-auto mb-3">
                <i className="bi bi-person-circle text-white text-3xl" />
              </div>
              <div className="font-bold text-[#0A2647]">John Patient</div>
              <div className="text-gray-500 text-sm">ID: #PT-00123</div>
            </div>
            <div className="space-y-3">
              {[
                ["Age",            "40 years"],
                ["Blood Group",    "A+"],
                ["Allergies",      "None"],
                ["Last Visit",     "Mar 15, 2026"],
                ["Chief Complaint","Chest pain"],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between text-sm py-2 border-b border-gray-50 last:border-0">
                  <span className="text-gray-500">{k}</span>
                  <span className="text-[#0A2647] font-semibold">{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
