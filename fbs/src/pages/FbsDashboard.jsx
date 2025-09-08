import React, { useEffect, useState } from "react";
import axios from "../api/Axios";
import { CheckCircle, Clock, CreditCard, FileText } from "lucide-react";

export default function TrademarkDashboard({ customerId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

useEffect(() => {
  const storedUser = JSON.parse(localStorage.getItem("user"));
  if (!storedUser?.id) {
    setLoading(false);
    return;
  }

  axios
    .get(`/api/trademark/customer-dashboard?customerId=${storedUser.id}`)
    .then((res) => {
      setData(res.data);
      setLoading(false);
    })
    .catch((err) => {
      console.error("Dashboard fetch error:", err);
      setLoading(false);
    });
}, []);



  if (loading) {
    return <p className="p-10 text-center">Loading dashboard...</p>;
  }

  if (!data) {
    return <p className="p-10 text-center text-red-500">Failed to load dashboard</p>;
  }

  const stats = [
    { title: "Active Requests", value: data.stats.active, icon: Clock },
    { title: "Completed", value: data.stats.completed, icon: CheckCircle },
    { title: "Pending Payments", value: data.stats.pendingPayments, icon: CreditCard },
    { title: "Documents Uploaded", value: data.stats.docsUploaded, icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f5f6] via-gray-50 to-[#ece9eb] text-gray-800">
      <main className="max-w-7xl mx-auto px-6 py-10 space-y-12">
        {/* Stats Section */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((item, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl shadow-md p-6 border-t-4 border-[#7b4159]"
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
            {data.activeRequests.map((req, idx) => {
           const stages = data.stageOrder || [];
              const stageIndex = stages.indexOf(req.trackingStatus);

              return (
                <div key={idx} className="bg-white rounded-2xl shadow-md p-6 space-y-5">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-lg text-gray-800">{req.selectedName || req.brandName}</h3>
                    <span className="text-sm text-gray-500 italic">
                      Updated {new Date(req.updatedAt).toDateString()}
                    </span>
                  </div>
                  <div>
                    <div className="flex justify-between mb-3">
                      {stages.map((stage, sIdx) => (
                        <div
                          key={sIdx}
                          className={`text-xs font-semibold ${
                            sIdx <= stageIndex ? "text-[#7b4159]" : "text-gray-400"
                          }`}
                        >
                          {stage}
                        </div>
                      ))}
                    </div>
                    <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="absolute top-0 left-0 h-3 bg-gradient-to-r from-[#7b4159] to-[#9c5571] rounded-full"
                        style={{ width: `${((stageIndex + 1) / stages.length) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Recent Updates */}
        <section>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-[#7b4159] to-[#9c5571] bg-clip-text text-transparent mb-6">
            Recent Updates
          </h2>
          <div className="bg-white rounded-2xl shadow-md divide-y">
            {data.recentUpdates.map((u, idx) => (
              <div key={idx} className="p-5 flex items-center justify-between hover:bg-gray-50 transition">
                <p className="text-gray-700 font-medium">
                  {u.selectedName || u.brandName} moved to {u.trackingStatus}
                </p>
                <span className="text-xs text-gray-500">
                  {new Date(u.updatedAt).toDateString()}
                </span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
