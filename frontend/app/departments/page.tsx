import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const departments = [
  { icon: "❤️", name: "Cardiology", desc: "Comprehensive heart and cardiovascular care including diagnostics, treatment, and prevention of heart diseases.", doctors: 24 },
  { icon: "🧠", name: "Neurology", desc: "Expert care for neurological conditions including stroke, epilepsy, Parkinson's disease and more.", doctors: 18 },
  { icon: "👶", name: "Pediatrics", desc: "Dedicated healthcare for infants, children, and adolescents with compassionate family-centered care.", doctors: 22 },
  { icon: "🦴", name: "Orthopedics", desc: "Advanced treatment for musculoskeletal conditions, joint replacements and sports medicine.", doctors: 16 },
  { icon: "👁️", name: "Ophthalmology", desc: "Complete eye care services from routine exams to complex surgical interventions.", doctors: 12 },
  { icon: "🦷", name: "Dentistry", desc: "Full-service dental care including preventive, restorative and cosmetic dentistry.", doctors: 20 },
  { icon: "🫁", name: "Pulmonology", desc: "Specialized care for respiratory conditions including asthma, COPD and lung disease.", doctors: 14 },
  { icon: "🩺", name: "General Medicine", desc: "Primary care and general health services for adults of all ages.", doctors: 30 },
];

export default function DepartmentsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="bg-gradient-to-br from-[#0A2647] to-[#144272] py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-white mb-4">Our Departments</h1>
          <p className="text-blue-200 text-lg max-w-2xl mx-auto">World-class specialists across all major medical fields, equipped with the latest technology</p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-16 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {departments.map(d => (
            <div key={d.name} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all group">
              <div className="w-16 h-16 bg-[#F8FAFC] rounded-2xl flex items-center justify-center text-4xl mb-4 group-hover:bg-[#2C74B3]/10 transition-colors">
                {d.icon}
              </div>
              <h3 className="font-bold text-[#0A2647] text-xl mb-2">{d.name}</h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-4">{d.desc}</p>
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <span className="text-[#2C74B3] text-sm font-medium">{d.doctors} Doctors</span>
                <Link href="/doctors" className="text-[#2C74B3] text-sm font-semibold hover:underline">View Doctors →</Link>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}
