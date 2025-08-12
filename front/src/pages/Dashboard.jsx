import React from "react";
import {
  FolderKanban,
  Clock,
  Factory,
  Truck,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";

const Dashboard = () => {
  const stats = [
    {
      label: "Active Projects",
      value: 8,
      change: "+12% from last month",
      icon: <FolderKanban className="w-6 h-6 text-white" />,
      bgFrom: "#d1383a",
      bgTo: "#ef4444",
    },
    {
      label: "Pending Approvals",
      value: 3,
      change: "-2 awaiting action",
      icon: <Clock className="w-6 h-6 text-white" />,
      bgFrom: "#f59e0b",
      bgTo: "#f97316",
    },
    {
      label: "In Production",
      value: 5,
      change: "On track for delivery",
      icon: <Factory className="w-6 h-6 text-white" />,
      bgFrom: "#10b981",
      bgTo: "#34d399",
    },
    {
      label: "Ready to Dispatch",
      value: 2,
      change: "Ready for shipment",
      icon: <Truck className="w-6 h-6 text-white" />,
      bgFrom: "#7c3aed",
      bgTo: "#6366f1",
    },
  ];

  const projects = [
    {
      name: "Omega 3 Softgel (Private Label)",
      steps: ["Design", "Production", "QC", "Dispatch"],
      currentStep: 3,
      status: "In Production",
      statusColor: "bg-green-100 text-green-700",
    },
    {
      name: "Vitamin D3 Tablets",
      steps: ["Design", "Production", "QC", "Dispatch"],
      currentStep: 2,
      status: "Awaiting Approval",
      statusColor: "bg-yellow-100 text-yellow-700",
    },
    {
      name: "Protein Powder (Custom Formula)",
      steps: ["Design", "Production", "QC", "Dispatch"],
      currentStep: 4,
      status: "Ready to Dispatch",
      statusColor: "bg-purple-100 text-purple-700",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 text-gray-800">
      <main className="max-w-7xl mx-auto p-6 space-y-6">
        
        {/* Stats Section */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((s, i) => (
            <div
              key={i}
              className="rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-200"
              role="region"
              aria-labelledby={`stat-${i}-title`}
            >
              <div
                className="p-5"
                style={{
                  background: `linear-gradient(120deg, ${s.bgFrom}, ${s.bgTo})`,
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center gap-3">
                    <div className="bg-white/25 p-2 rounded-lg shadow-sm">
                      {s.icon}
                    </div>
                    <div>
                      <p
                        id={`stat-${i}-title`}
                        className="text-sm text-white/90 tracking-wide"
                      >
                        {s.label}
                      </p>
                      <p className="text-3xl font-bold text-white mt-1">
                        {s.value}
                      </p>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-white/80 mt-3">{s.change}</p>
              </div>
            </div>
          ))}
        </section>

        {/* Projects + Sidebar */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Recent Projects */}
          <div className="col-span-2 bg-white rounded-2xl shadow-md p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800">
                Recent Projects
              </h2>
              <button
                className="flex items-center gap-2 text-[#d1383a] font-medium hover:underline"
                aria-label="View all projects"
              >
                View All <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-5">
              {projects.map((p, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-gray-200 p-5 bg-gray-50 hover:bg-gray-100 transition-colors duration-150"
                  aria-labelledby={`proj-${idx}-title`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3
                        id={`proj-${idx}-title`}
                        className="font-semibold text-gray-800"
                      >
                        {p.name}
                      </h3>
                      <div className="mt-2">
                        <span
                          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${p.statusColor}`}
                        >
                          {p.status}
                        </span>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      Step {p.currentStep} of {p.steps.length}
                    </div>
                  </div>

                  <div className="mt-4">
                    <StepIndicator steps={p.steps} currentStep={p.currentStep} />
                  </div>

                  <div className="mt-4 text-sm text-gray-600">
                    <strong>Stage:</strong> {p.steps[p.currentStep - 1] || "-"}
                    <span className="mx-3">·</span>
                    <strong>Progress:</strong>{" "}
                    {Math.round(
                      ((p.currentStep - 1) / (p.steps.length - 1)) * 100
                    )}
                    %
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <aside className="col-span-1 space-y-4">
            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-md p-5 border border-gray-100">
              <h4 className="text-sm font-semibold mb-4">Quick Actions</h4>
              <ul className="space-y-4 text-sm">
                <QuickAction
                  icon={<FolderKanban className="w-4 h-4" />}
                  bgColor="bg-[#d1383a]"
                  textColor="text-white"
                  title="New Project"
                  subtitle="Create a new project"
                />
                <QuickAction
                  icon={<CheckCircle2 className="w-4 h-4" />}
                  bgColor="bg-green-100"
                  textColor="text-green-700"
                  title="Approve Requests"
                  subtitle="Review pending approvals"
                />
                <QuickAction
                  icon={<Clock className="w-4 h-4" />}
                  bgColor="bg-yellow-100"
                  textColor="text-yellow-700"
                  title="Schedule"
                  subtitle="Add delivery schedule"
                />
              </ul>
            </div>

            {/* Notifications */}
            <div className="bg-white rounded-2xl shadow-md p-5 border border-gray-100">
              <h4 className="text-sm font-semibold mb-3">Notifications</h4>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>📄 QC report uploaded for Omega 3 Softgel</li>
                <li>📝 New trademark request submitted</li>
                <li>📦 Packaging draft ready for review</li>
              </ul>
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
};

function StepIndicator({ steps, currentStep }) {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      {steps.map((label, i) => {
        const stepIndex = i + 1;
        const completed = stepIndex < currentStep;
        const active = stepIndex === currentStep;

        return (
          <div key={i} className="flex items-center gap-3">
            <div
              aria-hidden
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors duration-200 ${
                completed
                  ? "bg-[#d1383a] text-white shadow"
                  : active
                  ? "border-2 border-[#d1383a] text-[#d1383a] bg-white shadow-sm"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              {completed ? <CheckCircle2 className="w-4 h-4" /> : stepIndex}
            </div>
            <div className="min-w-[90px]">
              <div
                className={`text-xs ${
                  completed
                    ? "text-gray-700"
                    : active
                    ? "text-[#d1383a] font-semibold"
                    : "text-gray-500"
                }`}
              >
                {label}
              </div>
              <div className="text-[10px] text-gray-400">Step {stepIndex}</div>
            </div>
            {i < steps.length - 1 && (
              <div
                aria-hidden
                className={`flex-1 h-px ${
                  completed ? "bg-[#d1383a]" : "bg-gray-300"
                }`}
                style={{ width: "40px" }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function QuickAction({ icon, bgColor, textColor, title, subtitle }) {
  return (
    <li className="flex items-center gap-3 hover:bg-gray-50 p-2 rounded-lg cursor-pointer transition-colors duration-150">
      <div className={`w-9 h-9 rounded-lg ${bgColor} flex items-center justify-center ${textColor}`}>
        {icon}
      </div>
      <div>
        <div className="font-medium">{title}</div>
        <div className="text-gray-500 text-xs">{subtitle}</div>
      </div>
    </li>
  );
}

export default Dashboard;
