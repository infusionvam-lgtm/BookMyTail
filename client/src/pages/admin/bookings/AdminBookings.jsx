  import React, { useEffect, useMemo, useState, useCallback } from "react";
  import { useDispatch, useSelector } from "react-redux";
  import { useSearchParams } from "react-router-dom";
  import {
    loadAllBookings,
    loadMetrics,
  } from "../../../redux/booking/bookingSlice.js";
  import BookingTable from "./BookingTable.jsx";

  const AdminBookings = () => {
    const dispatch = useDispatch();
    const { allBookings, status, error, metrics } = useSelector(
      (state) => state.bookings
    );

    const [searchParams, setSearchParams] = useSearchParams();
    const [statusFilter, setStatusFilter] = useState(
      searchParams.get("status") || "all"
    );
    const [paymentFilter, setPaymentFilter] = useState(
      searchParams.get("payment") || "all"
    );
    const [startDate, setStartDate] = useState(searchParams.get("startDate") || "");
    const [endDate, setEndDate] = useState(searchParams.get("endDate") || "");
    const [nameFilter, setNameFilter] = useState(searchParams.get("name") || "");
    const [emailFilter, setEmailFilter] = useState(searchParams.get("email") || "");
    const [guestsFilter, setGuestsFilter] = useState(
      searchParams.get("guests") || ""
    );
    const [page, setPage] = useState(parseInt(searchParams.get("page")) || 1);
    const perPage = 15;

    // 🔹 helper: current filters निकालो
    const getCurrentFilters = useCallback(
      () => ({
        name: searchParams.get("name") || "",
        email: searchParams.get("email") || "",
        guests: searchParams.get("guests") || "",
        status: searchParams.get("status") || "all",
        paymentStatus: searchParams.get("payment") || "all",
        startDate: searchParams.get("startDate") || "",
        endDate: searchParams.get("endDate") || "",
        page,
        perPage,
      }),
      [searchParams, page]
    );

    // 🔹 helper: data refresh
    const refreshData = useCallback(() => {
      const filters = getCurrentFilters();
      dispatch(loadAllBookings(filters));
      dispatch(loadMetrics(filters));
    }, [dispatch, getCurrentFilters]);

    // Update URL when filters change
    useEffect(() => {
      const params = {};
      if (statusFilter !== "all") params.status = statusFilter;
      if (paymentFilter !== "all") params.payment = paymentFilter;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (nameFilter) params.name = nameFilter;
      if (emailFilter) params.email = emailFilter;
      if (guestsFilter) params.guests = guestsFilter;
      if (page !== 1) params.page = page;
      setSearchParams(params);
    }, [
      statusFilter,
      paymentFilter,
      startDate,
      endDate,
      nameFilter,
      emailFilter,
      guestsFilter,
      page,
      setSearchParams,
    ]);

    // Fetch bookings & metrics whenever filters change
    useEffect(() => {
      refreshData();
    }, [refreshData]);

    const clearFilters = () => {
      setStatusFilter("all");
      setPaymentFilter("all");
      setStartDate("");
      setEndDate("");
      setNameFilter("");
      setEmailFilter("");
      setGuestsFilter("");
      setPage(1);
    };

    // 🔹 Metrics calculation
    const totalRooms = useMemo(
      () =>
        allBookings.reduce(
          (acc, b) =>
            acc +
            (b.rooms?.reduce((rAcc, r) => rAcc + (r.count || 1), 0) || 0),
          0
        ),
      [allBookings]
    );

    const occupiedRooms = useMemo(
      () =>
        allBookings
          .filter((b) => b.status === "confirmed")
          .reduce(
            (acc, b) =>
              acc +
              (b.rooms?.reduce((rAcc, r) => rAcc + (r.count || 1), 0) || 0),
            0
          ),
      [allBookings]
    );

    const availableRooms = totalRooms - occupiedRooms;

    const bookingsToday = metrics?.todayBookings || 0;
    const revenueToday = metrics?.todayRevenue || 0;

    if (status === "loading")
      return (
        <p className="pt-24 text-center text-white">Loading bookings...</p>
      );
    if (error)
      return (
        <p className="pt-24 text-center text-red-500">Error: {error}</p>
      );

    return (
      <div className="pt-24 container mx-auto px-4 text-white">
        <h2 className="text-2xl font-bold mb-4">Admin Bookings</h2>

        {/* Filters */}
        <div className="grid grid-cols-3  lg:grid-cols-7 gap-6 mb-4 p-4 bg-gray-800 rounded-lg">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter bg-gray-400 p-2 rounded-sm w-full sm:w-auto"
          >
            <option value="all">All Status</option>
            <option value="confirmed">Confirmed</option>
            <option value="pending">Pending</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="filter bg-gray-400 p-2 rounded-sm w-full sm:w-auto"
          >
            <option value="all">All Payment</option>
            <option value="paid">Paid</option>
            <option value="unpaid">Unpaid</option>
            <option value="refunded">Refunded</option>
          </select>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="filter w-full sm:w-auto bg-gray-400 p-2 rounded-sm"
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="filter w-full sm:w-auto bg-gray-400 p-2 rounded-sm"
          />
          <input
            type="text"
            placeholder="Guest Name"
            value={nameFilter}
            onChange={(e) => setNameFilter(e.target.value)}
            className="filter w-full sm:w-auto bg-gray-400 p-2 rounded-sm"
          />
          <input
            type="email"
            placeholder="Email"
            value={emailFilter}
            onChange={(e) => setEmailFilter(e.target.value)}
            className="filter w-full sm:w-auto bg-gray-400 p-2 rounded-sm"
          />
          <input
            type="number"
            placeholder="Guests"
            value={guestsFilter}
            onChange={(e) => setGuestsFilter(e.target.value)}
            className="filter w-full sm:w-auto bg-gray-400 p-2 rounded-sm"
            min={1}
          />
          <button
            onClick={clearFilters}
            className="w-full sm:w-auto px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Clear Filters
          </button>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
          <div className="p-4 bg-gray-700 rounded-lg text-center">
            <h3 className="text-lg font-semibold">Total Rooms</h3>
            <p className="text-2xl">{totalRooms}</p>
          </div>
          <div className="p-4 bg-gray-700 rounded-lg text-center">
            <h3 className="text-lg font-semibold">Occupied</h3>
            <p className="text-2xl text-red-500">{occupiedRooms}</p>
          </div>
          <div className="p-4 bg-gray-700 rounded-lg text-center">
            <h3 className="text-lg font-semibold">Available</h3>
            <p className="text-2xl text-green-500">{availableRooms}</p>
          </div>
          <div className="p-4 bg-gray-700 rounded-lg text-center">
            <h3 className="text-lg font-semibold">Revenue</h3>
            <p className="text-2xl">₹{Number(revenueToday).toLocaleString()}</p>
          </div>
          <div className="p-4 bg-gray-700 rounded-lg text-center">
            <h3 className="text-lg font-semibold">Bookings</h3>
            <p className="text-2xl">{bookingsToday}</p>
          </div>
        </div>

        {/* Booking Table */}
        <BookingTable bookings={allBookings} onActionComplete={refreshData} />

        {/* Pagination */}
        <div className="flex justify-center mt-4 gap-2 overflow-x-auto">
          {Array.from(
            { length: Math.ceil((metrics?.totalBookings || 0) / perPage) },
            (_, i) => (
              <button
                key={i + 1}
                onClick={() => setPage(i + 1)}
                className={`px-3 py-1 rounded whitespace-nowrap ${
                  page === i + 1 ? "bg-blue-600" : "bg-gray-600"
                }`}
              >
                {i + 1}
              </button>
            )
          )}
        </div>
      </div>
    );
  };

  export default AdminBookings;
