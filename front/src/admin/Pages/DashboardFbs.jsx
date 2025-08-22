import React from "react";
import {
  FileText,
  CheckCircle,
  Clock,
  Upload,
  DollarSign,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const StatCard = ({ icon: Icon, title, value, color, trend }) => (
  <div className="bg-white shadow-xl hover:shadow-2xl transition rounded-2xl p-6 flex items-center space-x-4 border border-gray-100">
    <div
      className="p-3 rounded-xl flex items-center justify-center"
      style={{ backgroundColor: color }}
    >
      <Icon className="text-white w-6 h-6" />
    </div>
    <div className="flex-1">
      <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
    {trend && (
      <span
        className={`flex items-center text-sm font-semibold ${
          trend > 0 ? "text-green-600" : "text-red-600"
        }`}
      >
        {trend > 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
        {Math.abs(trend)}%
      </span>
    )}
  </div>
);

const TrademarkDashboard = () => {
  const stats = {
    total: 85,
    approved: 60,
    pending: 18,
    documents: 40,
    payments: 25,
  };

  const chartData = [
    { name: "Approved", value: stats.approved },
    { name: "Pending", value: stats.pending },
    { name: "Documents", value: stats.documents },
  ];

  const COLORS = ["#10b981", "#fbbf24", "#3b82f6"];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <h1 className="text-3xl font-bold mb-8 text-gray-800">
        Trademark Admin Dashboard
      </h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <StatCard
          icon={FileText}
          title="Total Trademarks"
          value={stats.total}
          color="#7b4159"
          trend={5}
        />
        <StatCard
          icon={CheckCircle}
          title="Approved"
          value={stats.approved}
          color="#10b981"
          trend={3}
        />
        <StatCard
          icon={Clock}
          title="Pending"
          value={stats.pending}
          color="#f59e0b"
          trend={-2}
        />
        <StatCard
          icon={Upload}
          title="Documents Uploaded"
          value={stats.documents}
          color="#3b82f6"
          trend={4}
        />
        <StatCard
          icon={DollarSign}
          title="Payments Completed"
          value={stats.payments}
          color="#8b5cf6"
          trend={7}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-12">
        {/* Bar Chart */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h2 className="text-lg font-bold mb-4 text-gray-700">
            Trademark Overview
          </h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData} barSize={40}>
              <XAxis dataKey="name" tick={{ fill: "#6b7280" }} />
              <YAxis allowDecimals={false} tick={{ fill: "#6b7280" }} />
              <Tooltip />
              <Bar
                dataKey="value"
                radius={[6, 6, 0, 0]}
                fill="#7b4159"
                label={{ position: "top", fill: "#374151" }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h2 className="text-lg font-bold mb-4 text-gray-700">
            Status Distribution
          </h2>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={90}
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
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

      {/* Recent Table */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <h2 className="text-lg font-bold mb-4 text-gray-700">
          Recent Trademark Submissions
        </h2>
        <table className="w-full text-left border-separate border-spacing-y-3">
          <thead>
            <tr className="text-gray-600 text-sm">
              <th className="p-2">Trademark</th>
              <th className="p-2">Customer</th>
              <th className="p-2">Status</th>
              <th className="p-2">Date</th>
            </tr>
          </thead>
          <tbody>
            {[
              { name: "Verixa", customer: "ABC Pharma", status: "Approved", date: "2025-08-01" },
              { name: "Healix", customer: "MediLife", status: "Pending", date: "2025-08-05" },
              { name: "BioCure", customer: "PharmaPlus", status: "Docs Uploaded", date: "2025-08-10" },
            ].map((row, idx) => (
              <tr
                key={idx}
                className="bg-gray-50 hover:bg-gray-100 shadow-sm rounded-lg transition"
              >
                <td className="p-3 font-semibold">{row.name}</td>
                <td className="p-3 text-gray-700">{row.customer}</td>
                <td className="p-3">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      row.status === "Approved"
                        ? "bg-green-100 text-green-700"
                        : row.status === "Pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {row.status}
                  </span>
                </td>
                <td className="p-3 text-gray-500">{row.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TrademarkDashboard;
