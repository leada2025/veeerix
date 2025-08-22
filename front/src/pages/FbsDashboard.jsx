import React from "react";
import {
  CheckCircle,
  Clock,
  CreditCard,
  FileText,
} from "lucide-react";

const stats = [
  { title: "Active Requests", value: 5, icon: Clock },
  { title: "Completed", value: 12, icon: CheckCircle },
  { title: "Pending Payments", value: 3, icon: CreditCard },
  { title: "Documents Uploaded", value: 8, icon: FileText },
];

const requests = [
  {
    name: "Trademark Alpha",
    stage: 2,
    stages: ["Submitted", "Name Approved", "Payment Done", "Docs Prepared", "Registered"],
    updated: "Aug 20, 2025",
  },
  {
    name: "Trademark Beta",
    stage: 1,
    stages: ["Submitted", "Name Approved", "Payment Done", "Docs Prepared", "Registered"],
    updated: "Aug 18, 2025",
  },
];

const updates = [
  { message: "Trademark Alpha moved to Payment Done", date: "Aug 20, 2025" },
  { message: "Trademark Beta approved", date: "Aug 18, 2025" },
  { message: "Trademark Gamma submitted", date: "Aug 15, 2025" },
];

export default function TrademarkDashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f5f6] via-gray-50 to-[#ece9eb] text-gray-800">
    
      <main className="max-w-7xl mx-auto px-6 py-10 space-y-12">
        {/* Stats Section */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((item, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl shadow-md p-6 border-t-4 border-[#7b4159] hover:shadow-xl hover:scale-[1.02] transform transition duration-300"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-[#7b4159]/10">
                  <item.icon className="w-8 h-8 text-[#7b4159]" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">{item.title}</p>
                  <p className="text-3xl font-extrabold text-gray-800">{item.value}</p>
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* Active Requests */}
        <section>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-[#7b4159] to-[#9c5571] bg-clip-text text-transparent mb-6">
            Active Trademark Requests
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {requests.map((req, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl shadow-md p-6 space-y-5 hover:shadow-xl transition"
              >
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-lg text-gray-800">{req.name}</h3>
                  <span className="text-sm text-gray-500 italic">Updated {req.updated}</span>
                </div>

                {/* Progress Stages */}
                <div>
                  <div className="flex justify-between mb-3">
                    {req.stages.map((stage, sIdx) => (
                      <div
                        key={sIdx}
                        className={`text-xs font-semibold tracking-wide ${
                          sIdx <= req.stage ? "text-[#7b4159]" : "text-gray-400"
                        }`}
                      >
                        {stage}
                      </div>
                    ))}
                  </div>
                  <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="absolute top-0 left-0 h-3 bg-gradient-to-r from-[#7b4159] to-[#9c5571] rounded-full transition-all duration-700"
                      style={{ width: `${((req.stage + 1) / req.stages.length) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Recent Updates */}
        <section>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-[#7b4159] to-[#9c5571] bg-clip-text text-transparent mb-6">
            Recent Updates
          </h2>
          <div className="bg-white rounded-2xl shadow-md divide-y">
            {updates.map((u, idx) => (
              <div
                key={idx}
                className="p-5 flex items-center justify-between hover:bg-gray-50 transition"
              >
                <p className="text-gray-700 font-medium">{u.message}</p>
                <span className="text-xs text-gray-500">{u.date}</span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
