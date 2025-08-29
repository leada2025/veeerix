import React from "react";
import {
  PackageCheck,
  FlaskConical,
  ClipboardList,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  ResponsiveContainer,
} from "recharts";

// ✅ Card Component
const DashboardCard = ({ icon: Icon, title, count, color }) => (
  <div className="bg-white shadow-md hover:shadow-2xl transition-transform transform hover:-translate-y-1 rounded-2xl overflow-hidden">
    {/* Gradient top bar */}
    <div
      className="h-2"
      style={{ background: `linear-gradient(90deg, ${color}, #111827)` }}
    ></div>

    <div className="p-6 flex items-center space-x-4">
      <div
        className="p-3 rounded-xl flex items-center justify-center shadow-inner"
        style={{ backgroundColor: color }}
      >
        <Icon className="text-white w-7 h-7" />
      </div>
      <div>
        <h3 className="text-gray-500 text-sm font-semibold">{title}</h3>
        <p className="text-3xl font-extrabold text-gray-800">{count}</p>
      </div>
    </div>
  </div>
);

const AdminDashboard = () => {
  const data = {
    orders: 42,
    molecules: 18,
    packingDesigns: 12,
  };

  const chartData = [
    { name: "Orders", value: data.orders },
    { name: "Molecules", value: data.molecules },
    { name: "Packing", value: data.packingDesigns },
  ];

  const COLORS = ["#ef4444", "#3b82f6", "#10b981"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-gray-200 to-gray-100 p-8">
      {/* Header */}
      <div className="mb-10">
        
        <p className="text-gray-500">Overview of activities & reports</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        <DashboardCard
          icon={ClipboardList}
          title="Orders"
          count={data.orders}
          color="#ef4444"
        />
        <DashboardCard
          icon={FlaskConical}
          title="Molecule Quotes"
          count={data.molecules}
          color="#3b82f6"
        />
        <DashboardCard
          icon={PackageCheck}
          title="Packing Designs"
          count={data.packingDesigns}
          color="#10b981"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Bar Chart */}
        <div className="bg-white p-6 shadow-lg rounded-2xl">
          <h2 className="text-lg font-bold mb-2 text-[#ef4444] flex items-center">
            📈 Activity Overview
          </h2>
          <hr className="mb-4 border-gray-200" />
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData} barSize={40}>
              <XAxis dataKey="name" tick={{ fill: "#6b7280" }} />
              <YAxis allowDecimals={false} tick={{ fill: "#6b7280" }} />
              <Tooltip
                contentStyle={{
                  borderRadius: "12px",
                  backgroundColor: "#f9fafb",
                  border: "1px solid #e5e7eb",
                }}
              />
              <Bar
                dataKey="value"
                radius={[8, 8, 0, 0]}
                fill="#ef4444"
                label={{ position: "top", fill: "#374151" }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="bg-white p-6 shadow-lg rounded-2xl">
          <h2 className="text-lg font-bold mb-2 text-[#ef4444] flex items-center">
            🥧 Data Distribution
          </h2>
          <hr className="mb-4 border-gray-200" />
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={95}
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  borderRadius: "12px",
                  backgroundColor: "#f9fafb",
                  border: "1px solid #e5e7eb",
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
