import React, { useEffect, useState } from "react";
import { BASE_URL } from "../../../routes/utilites";
import { toast } from "react-toastify";

const AdminPayment = () => {
  const [payments, setPayments] = useState([]);
  const [filters, setFilters] = useState({
    status: "all",
    paymentStatus: "all",
    startDate: "",
    endDate: "",
    amount: "",
  });

  const fetchPayments = async () => {
    try {
      const query = new URLSearchParams(filters).toString();
      const res = await fetch(`${BASE_URL}/api/admin/bookings?${query}`, {
        credentials: "include",
      });
      const data = await res.json();
      setPayments(data.bookings || []);
    } catch (err) {
      toast.error("Failed to fetch payments");
    }
  };

  const handleRefund = async (bookingId) => {
    if (!window.confirm("Are you sure you want to refund this payment?")) return;
    try {
      const res = await fetch(`${BASE_URL}/api/admin/bookings/${bookingId}/refund`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Refund processed");
        fetchPayments();
      } else {
        toast.error(data.message || "Refund failed");
      }
    } catch (err) {
      toast.error("Error refunding payment");
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [filters]);

  return (
    <div className="pt-[80px] p-5 text-text-light">
      <h2 className="text-2xl font-bold mb-4">Admin Payments</h2>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <select
          value={filters.paymentStatus}
          onChange={(e) => setFilters({ ...filters, paymentStatus: e.target.value })}
          className="p-2 border rounded"
        >
          <option value="all">All Payment Status</option>
          <option value="paid">Paid</option>
          <option value="unpaid">Unpaid</option>
          <option value="refunded">Refunded</option>
        </select>

        <input
          type="date"
          value={filters.startDate}
          onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
          className="p-2 border rounded"
        />
        <input
          type="date"
          value={filters.endDate}
          onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
          className="p-2 border rounded"
        />

        <input
          type="number"
          placeholder="Min Amount"
          value={filters.amount}
          onChange={(e) => setFilters({ ...filters, amount: e.target.value })}
          className="p-2 border rounded"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded shadow">
        <table className="min-w-full text-sm text-gray-700">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left">Booking ID</th>
              <th className="px-4 py-2 text-left">User</th>
              <th className="px-4 py-2 text-left">Amount</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Payment</th>
              <th className="px-4 py-2 text-left">Date</th>
              <th className="px-4 py-2 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {payments.length > 0 ? (
              payments.map((p) => (
                <tr key={p._id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2">{p._id}</td>
                  <td className="px-4 py-2">
                    {p.userId?.name} <br />
                    <span className="text-xs text-gray-500">{p.userId?.email}</span>
                  </td>
                  <td className="px-4 py-2">₹{p.grandTotal}</td>
                  <td className="px-4 py-2">{p.status}</td>
                  <td className="px-4 py-2">{p.paymentStatus}</td>
                  <td className="px-4 py-2">
                    {new Date(p.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2 text-center">
                    {p.paymentStatus === "paid" && !p.isRefunded ? (
                      <button
                        onClick={() => handleRefund(p._id)}
                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        Refund
                      </button>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="px-4 py-6 text-center text-gray-500">
                  No payments found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminPayment;
