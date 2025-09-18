import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loadMetrics } from "../../../redux/booking/bookingSlice.js";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const AdminReport = () => {
  const dispatch = useDispatch();
  const { metrics } = useSelector((state) => state.bookings);

  useEffect(() => {
    dispatch(loadMetrics());
  }, [dispatch]);

  if (!metrics) return <p className="pt-[80px] text-white text-center">Loading...</p>;


  // Safe numeric values with defaults
  const totalBookings = metrics.totalBookings ?? 0;
  const confirmedBookings = metrics.confirmedBookings ?? 0;
  const pendingBookings = metrics.pendingBookings ?? 0;
  const totalUsers = metrics.totalUsers ?? 0;
  const totalRevenue = typeof metrics.totalRevenue === "number" ? metrics.totalRevenue : 0;
  const bookingChartData = Array.isArray(metrics.bookingChartData) ? metrics.bookingChartData : [];
  const revenueChartData = Array.isArray(metrics.revenueChartData) ? metrics.revenueChartData : [];

  return (
    <div className="pt-[80px] p-5 text-white">
      <h2 className="text-2xl font-bold mb-6">Admin Report</h2>

      {/* Top Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
        <div className="p-4 bg-gray-800 rounded-2xl text-center">
          <h3>Total Bookings</h3>
          <p className="text-xl font-bold">{totalBookings}</p>
        </div>
        <div className="p-4 bg-gray-800 rounded-2xl text-center">
          <h3>Confirmed</h3>
          <p className="text-xl font-bold">{confirmedBookings}</p>
        </div>
        <div className="p-4 bg-gray-800 rounded-2xl text-center">
          <h3>Pending</h3>
          <p className="text-xl font-bold">{pendingBookings}</p>
        </div>
        <div className="p-4 bg-gray-800 rounded-2xl text-center">
          <h3>Guests</h3>
          <p className="text-xl font-bold">{totalUsers}</p>
        </div>
        <div className="p-4 bg-gray-800 rounded-2xl text-center">
          <h3>Revenue</h3>
          <p className="text-xl font-bold">₹{totalRevenue.toFixed(2)}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-4 bg-gray-800 rounded-2xl">
          <h3 className="mb-2 font-semibold">Bookings per Day</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={bookingChartData}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#4f46e5" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="p-4 bg-gray-800 rounded-2xl">
          <h3 className="mb-2 font-semibold">Revenue Over Time</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={revenueChartData}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line dataKey="revenue" stroke="#10b981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pie Chart for status distribution */}
      <div className="p-4 bg-gray-800 rounded-2xl mt-6">
        <h3 className="mb-2 font-semibold">Booking Status Distribution</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={[
                { name: "Confirmed", value: confirmedBookings },
                { name: "Pending", value: pendingBookings },
                { name: "Cancelled", value: totalBookings - (confirmedBookings + pendingBookings) },
              ]}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              fill="#8884d8"
              label
            >
              {totalBookings > 0 &&
                [0, 1, 2].map((index) => (
                  <Cell key={index}/>
                ))}
            </Pie>
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AdminReport;
