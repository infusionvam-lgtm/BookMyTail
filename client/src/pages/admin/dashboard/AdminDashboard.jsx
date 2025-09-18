import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loadAllBookings, loadMetrics } from "../../../redux/booking/bookingSlice.js";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const { metrics } = useSelector((state) => state.bookings);

  useEffect(() => {
    dispatch(loadMetrics());
    dispatch(loadAllBookings());
  }, [dispatch]);

  const bookingChartData = metrics?.bookingChartData || [];
  const revenueChartData = metrics?.revenueChartData || [];

  return (
    <div className="p-4 sm:p-6 lg:pt-[80px] min-h-screen bg-cover bg-center">
      <div className="p-4 sm:p-6 space-y-6 shadow-xl">
        {/* Heading */}

        {/* Top Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
          <div className="rounded-2xl shadow-md p-4  bg-text-light/90 text-center">
            <h3 className="text-base sm:text-lg font-semibold">
              Total Bookings
            </h3>
            <p className="text-xl sm:text-2xl font-bold">
              {metrics?.totalBookings || 0}
            </p>
          </div>
          <div className="rounded-2xl shadow-md p-4  bg-text-light/90 text-center">
            <h3 className="text-base sm:text-lg font-semibold">Confirmed</h3>
            <p className="text-xl sm:text-2xl font-bold text-green-600">
              {metrics?.confirmedBookings || 0}
            </p>
          </div>
          <div className="rounded-2xl shadow-md p-4  bg-text-light/90 text-center">
            <h3 className="text-base sm:text-lg font-semibold">Pending</h3>
            <p className="text-xl sm:text-2xl font-bold text-yellow-500">
              {metrics?.pendingBookings || 0}
            </p>
          </div>
          <div className="rounded-2xl shadow-md p-4  bg-text-light/90 text-center">
            <h3 className="text-base sm:text-lg font-semibold">Guests</h3>
            <p className="text-xl sm:text-2xl font-bold">
              {metrics?.totalUsers || 0}
            </p>
          </div>
          <div className="rounded-2xl shadow-md p-4  bg-text-light/90 text-center">
            <h3 className="text-base sm:text-lg font-semibold">Revenue</h3>
            <p className="text-xl sm:text-2xl font-bold text-blue-600">
              ₹{metrics?.totalRevenue || 0}
            </p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-2xl shadow-md p-4 bg-text-light/70">
            <h3 className="text-lg font-semibold mb-2 text-text-dark">Bookings per Day</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={bookingChartData}>
                <XAxis dataKey="date" />
                <YAxis/>
                <Tooltip />
                <Bar dataKey="count" fill="#4f46e5" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="rounded-2xl shadow-md p-4 bg-text-light/70">
            <h3 className="text-lg font-semibold mb-2 text-text-dark">Revenue Over Time</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={revenueChartData}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10b981"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <button className="rounded-2xl shadow-md p-4 sm:p-6 w-full bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition">
            ➕ Add Room
          </button>
          <button className="rounded-2xl shadow-md p-4 sm:p-6 w-full border font-semibold hover:bg-gray-100 transition">
            💳 View Pending Payments
          </button>
          <button className="rounded-2xl shadow-md p-4 sm:p-6 w-full bg-red-600 text-white font-semibold hover:bg-red-700 transition">
            ❌ Cancel Bookings
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
