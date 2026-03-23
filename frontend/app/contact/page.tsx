"use client";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Message sent! We'll get back to you shortly.");
    setForm({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="bg-gradient-to-br from-[#0A2647] to-[#144272] py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-white mb-4">Contact Us</h1>
          <p className="text-blue-200 text-lg">We&apos;re here to help. Reach out anytime.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-16 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div>
            <h2 className="text-3xl font-bold text-[#0A2647] mb-8">Get in Touch</h2>
            <div className="space-y-6">
              {[
                { icon: "📍", title: "Address", info: "123 Medical Center Drive, Health City, HC 45678" },
                { icon: "📞", title: "Phone", info: "+1 (800) 555-CARE (2273)" },
                { icon: "✉️", title: "Email", info: "info@medicare.com" },
                { icon: "🕐", title: "Hours", info: "Mon–Fri: 8am–8pm | Sat–Sun: 9am–5pm | Emergency: 24/7" },
              ].map(c => (
                <div key={c.title} className="flex gap-4">
                  <div className="w-12 h-12 bg-[#2C74B3]/10 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0">
                    {c.icon}
                  </div>
                  <div>
                    <div className="font-bold text-[#0A2647] mb-1">{c.title}</div>
                    <div className="text-gray-500 text-sm leading-relaxed">{c.info}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 bg-[#E63946] rounded-2xl p-6 text-white">
              <div className="text-2xl font-bold mb-2">🚨 Emergency</div>
              <p className="text-red-100 text-sm mb-4">For medical emergencies, call immediately</p>
              <a href="tel:911" className="bg-white text-[#E63946] font-bold px-6 py-3 rounded-xl hover:bg-red-50 transition-all inline-block">
                📞 Call 911
              </a>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-2xl font-bold text-[#0A2647] mb-6">Send a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Name</label>
                  <input type="text" required value={form.name} onChange={set("name")} placeholder="John Doe"
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-[#0A2647] focus:border-[#2C74B3] focus:outline-none transition-colors text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                  <input type="email" required value={form.email} onChange={set("email")} placeholder="john@example.com"
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-[#0A2647] focus:border-[#2C74B3] focus:outline-none transition-colors text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Subject</label>
                <input type="text" required value={form.subject} onChange={set("subject")} placeholder="How can we help?"
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-[#0A2647] focus:border-[#2C74B3] focus:outline-none transition-colors text-sm" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Message</label>
                <textarea required value={form.message} onChange={set("message")} rows={5} placeholder="Tell us more about your inquiry..."
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-[#0A2647] focus:border-[#2C74B3] focus:outline-none transition-colors text-sm resize-none" />
              </div>
              <button type="submit"
                className="w-full bg-[#2C74B3] text-white font-bold py-3.5 rounded-xl hover:bg-[#0A2647] transition-all">
                Send Message →
              </button>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
