import React from "react";
import {
  PackageCheck,
  FileText,
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

const DashboardCard = ({ icon: Icon, title, count, color }) => (
  <div className="bg-white shadow rounded-2xl p-6 flex items-center space-x-4">
    <div className="p-3 rounded-full" style={{ backgroundColor: color }}>
      <Icon className="text-white w-6 h-6" />
    </div>
    <div>
      <h3 className="text-gray-600 text-sm font-semibold">{title}</h3>
      <p className="text-xl font-bold">{count}</p>
    </div>
  </div>
);

const AdminDashboard = () => {
  const data = {
    orders: 24,
    trademarks: 12,
    molecules: 8,
    packingDesigns: 6,
  };

  const chartData = [
    { name: "Orders", value: data.orders },
    { name: "Trademarks", value: data.trademarks },
    { name: "Molecules", value: data.molecules },
    { name: "Packing", value: data.packingDesigns },
  ];

  const COLORS = ["#d1383a", "#f97316", "#3b82f6", "#10b981"];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl font-bold mb-6 text-[#d1383a]">Admin Dashboard</h1>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <DashboardCard
          icon={ClipboardList}
          title="Orders"
          count={data.orders}
          color="#d1383a"
        />
        <DashboardCard
          icon={FileText}
          title="Trademark Requests"
          count={data.trademarks}
          color="#f97316"
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
        <div className="bg-white p-6 shadow rounded-2xl">
          <h2 className="text-lg font-semibold mb-4 text-[#d1383a]">Overview</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" fill="#d1383a" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="bg-white p-6 shadow rounded-2xl">
          <h2 className="text-lg font-semibold mb-4 text-[#d1383a]">Distribution</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
