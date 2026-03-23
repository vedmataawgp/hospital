"use client";
import { useState, useCallback } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { api } from "@/lib/api";
import { useMutation } from "@/lib/useApi";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sent, setSent] = useState(false);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const sendMutator = useCallback(
    () => api.contact.send(form),
    [form],
  );
  const [submit, { loading, error }] = useMutation(sendMutator);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await submit();
    if (result !== null) {
      setSent(true);
      setForm({ name: "", email: "", subject: "", message: "" });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero */}
      <div className="bg-gradient-to-br from-[#0A2647] to-[#144272] py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 bg-white/15 text-sky-300 text-sm font-medium px-4 py-2 rounded-full mb-4 border border-white/20">
            <i className="bi bi-chat-dots-fill" />
            We&apos;re here to help
          </span>
          <h1 className="text-5xl font-bold text-white mb-4">Contact Us</h1>
          {/* CONTRAST: text-slate-300 */}
          <p className="text-slate-300 text-lg">Reach out anytime — our team responds within 24 hours</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-16 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

          {/* Info */}
          <div>
            <h2 className="text-3xl font-bold text-[#0A2647] mb-8">Get in Touch</h2>
            <div className="space-y-6">
              {[
                { icon: "bi-geo-alt-fill",    title: "Address", info: "123 Medical Center Drive, Health City, HC 45678" },
                { icon: "bi-telephone-fill",  title: "Phone",   info: "+1 (800) 555-CARE (2273)" },
                { icon: "bi-envelope-fill",   title: "Email",   info: "info@medicare.com" },
                { icon: "bi-clock-fill",      title: "Hours",   info: "Mon–Fri: 8am–8pm · Sat–Sun: 9am–5pm · Emergency: 24/7" },
              ].map(c => (
                <div key={c.title} className="flex gap-4">
                  <div className="w-12 h-12 bg-[#EFF6FF] rounded-2xl flex items-center justify-center flex-shrink-0">
                    <i className={`bi ${c.icon} text-xl text-[#2C74B3]`} />
                  </div>
                  <div>
                    <div className="font-bold text-[#0A2647] mb-1">{c.title}</div>
                    <div className="text-gray-600 text-sm leading-relaxed">{c.info}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Emergency */}
            <div className="mt-10 bg-[#E63946] rounded-2xl p-6 text-white">
              <h3 className="text-2xl font-bold mb-2 flex items-center gap-2">
                <i className="bi bi-exclamation-triangle-fill" />
                Emergency
              </h3>
              <p className="text-red-100 text-sm mb-4 font-medium">For medical emergencies, call immediately</p>
              <a href="tel:911"
                className="bg-white text-[#E63946] font-bold px-6 py-3 rounded-xl hover:bg-red-50 transition-all inline-flex items-center gap-2">
                <i className="bi bi-telephone-fill" />
                Call 911
              </a>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            {sent ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="bi bi-check-circle-fill text-4xl text-[#2A9D8F]" />
                </div>
                <h3 className="text-2xl font-bold text-[#0A2647] mb-2">Message Sent!</h3>
                <p className="text-gray-500 mb-6">We&apos;ll get back to you within 24 hours.</p>
                <button onClick={() => setSent(false)}
                  className="bg-[#2C74B3] text-white font-semibold px-6 py-2.5 rounded-xl hover:bg-[#0A2647] transition-all">
                  Send Another
                </button>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-[#0A2647] mb-6 flex items-center gap-2">
                  <i className="bi bi-envelope-fill text-[#2C74B3]" />
                  Send a Message
                </h2>

                {error && (
                  <div className="mb-5 p-4 bg-red-50 border border-red-100 rounded-xl text-red-700 text-sm flex items-center gap-2">
                    <i className="bi bi-exclamation-circle-fill" />
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Name</label>
                      <input type="text" required value={form.name} onChange={set("name")} placeholder="John Doe"
                        className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-[#0A2647] placeholder-gray-400 focus:border-[#2C74B3] focus:outline-none transition-colors text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                      <input type="email" required value={form.email} onChange={set("email")} placeholder="john@example.com"
                        className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-[#0A2647] placeholder-gray-400 focus:border-[#2C74B3] focus:outline-none transition-colors text-sm" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Subject</label>
                    <input type="text" required value={form.subject} onChange={set("subject")} placeholder="How can we help?"
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-[#0A2647] placeholder-gray-400 focus:border-[#2C74B3] focus:outline-none transition-colors text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Message</label>
                    <textarea required value={form.message} onChange={set("message")} rows={5}
                      placeholder="Tell us more about your inquiry..."
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-[#0A2647] placeholder-gray-400 focus:border-[#2C74B3] focus:outline-none transition-colors text-sm resize-none" />
                  </div>
                  <button type="submit" disabled={loading}
                    className="w-full bg-[#2C74B3] text-white font-bold py-3.5 rounded-xl hover:bg-[#0A2647] transition-all flex items-center justify-center gap-2 disabled:opacity-60">
                    {loading
                      ? <><i className="bi bi-arrow-repeat animate-spin" /> Sending...</>
                      : <><i className="bi bi-send-fill" /> Send Message</>}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
