import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loadMyBookings, cancelBooking } from "../../../redux/booking/bookingSlice.js";
import { formatDate } from "../../../utils/formatDate.jsx";
import { useReactTable, getCoreRowModel, flexRender } from "@tanstack/react-table";
import { toast } from "react-toastify";
import Loader from "../../../components/support/Loader.jsx";
import { fetchUserProfile } from "../../../redux/role/profileSlice.js";

const MyBookings = () => {
  const dispatch = useDispatch();
  const { myBookings, status, error } = useSelector((state) => state.bookings);

  const [isCancelling, setIsCancelling] = useState(false);

    const fetchData = async () => {
    try {
      await dispatch(loadMyBookings()).unwrap();
      await dispatch(fetchUserProfile()).unwrap();
    } catch (err) {
      toast.error("Something went wrong while loading your data");
    }
  };

  useEffect(() => {
    fetchData();
  }, [dispatch]);

  const handleCancel = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;

    try {
      setIsCancelling(true);
      await dispatch(cancelBooking(id)).unwrap();
      await dispatch(loadMyBookings());
      await dispatch(fetchUserProfile()); 
      toast.success(
        "Booking cancelled. If payment was completed, refund is pending admin approval."
      );
    } catch (err) {
      toast.error("Error cancelling booking: " + (err.message || err));
    } finally {
      setIsCancelling(false);
    }
  };

  const data = useMemo(
    () =>
      [...myBookings]
     .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)) //newest first
      .map((b) => ({
        id: b._id,
        bookingDate: `${formatDate(b.checkInDate)} → ${formatDate(b.checkOutDate)}`,
        guests: b.totalGuests,
        roomTypes: (b.rooms || []).map((r) =>
          r.roomType ? `${r.roomType.type} x ${r.count || 1}` : `Deleted Room x ${r.count || 1}`
        ),
        rooms: (b.rooms || []).map((r) => ({
          type: r.roomType ? `${r.roomType.type} x ${r.count || 1}` : `Deleted Room x ${r.count || 1}`,
          nights: r.nights || 0,
          basePrice: r.roomType?.price || 0,
          lunchCost: r.lunch || 0,
          dinnerCost: r.dinner || 0,
          roomTotal: r.roomTotal || 0,
        })),
        totalPrice: b.grandTotal,
        gst: b.gst,
        status: b.status,
        payment: b.paymentStatus,
        mobile: b.mobileNum,
        email: b.email,
        isRefunded: b.isRefunded ?? false,
      })),
    [myBookings]
  );

  const columns = useMemo(
    () => [
      { header: "Booking Date", accessorKey: "bookingDate" },
      {
        header: "Rooms",
        accessorKey: "roomTypes",
        cell: ({ row }) => (
          <div className="flex flex-col">
            {row.original.rooms.map((room, idx) => (
              <div key={idx}>
                {room.type}
                {room.lunchCost > 0 && ` | Lunch: ₹${room.lunchCost}`}
                {room.dinnerCost > 0 && ` | Dinner: ₹${room.dinnerCost}`}
              </div>
            ))}
          </div>
        ),
      },
      { header: "Guests", accessorKey: "guests" },
      { header: "Contact", accessorKey: "mobile" },
      {
        header: "Total Price (₹)",
        accessorKey: "totalPrice",
        cell: ({ row }) => (
          <div>
            <div>Before GST: ₹{row.original.totalPrice - row.original.gst}</div>
            <div>GST: ₹{row.original.gst}</div>
            <div className="font-bold">Grand: ₹{row.original.totalPrice}</div>
          </div>
        ),
      },
      {
        header: "grandTotal",
        accessorKey:"grandTotal",
                cell: ({ row }) => (
          <div>
            <div>Before GST: ₹{row.original.totalPrice - row.original.gst}</div>
            <div>GST: ₹{row.original.gst}</div>
            <div className="font-bold">Grand: ₹{row.original.totalPrice}</div>
          </div>
        ),
      },
      {
        header: "Status",
        accessorKey: "status",
        cell: ({ row }) => {
          const statusColor =
            row.original.status === "confirmed"
              ? "text-green-600"
              : row.original.status === "cancelled"
              ? "text-red-600"
              : "text-yellow-400";
          return <span className={statusColor}>{row.original.status}</span>;
        },
      },
      {
        header: "Payment",
        accessorKey: "payment",
        cell: ({ row }) => {
          const p = row.original.payment;
          const color =
            p === "paid"
              ? "text-green-600"
              : p === "refunded"
              ? "text-blue-600"
              : "text-yellow-500";
          return <span className={color}>{p}</span>;
        },
      },
      {
        header: "Action",
        accessorKey: "action",
        cell: ({ row }) => {
          if (row.original.status !== "cancelled" && row.original.status !== "pending") {
            return (
              <button
                onClick={() => handleCancel(row.original.id)}
                className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Cancel
              </button>
            );
          } else {
            if (row.original.payment === "paid") {
              return (
                <span
                  className={row.original.isRefunded ? "text-green-600" : "text-yellow-500"}
                >
                  {row.original.isRefunded ? "Refund Successful" : "Pending Refund"}
                </span>
              );
            } else {
              return <span className="text-gray-400">Cancelled</span>;
            }
          }
        },
      },
    ],
    []
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  // Show loader while fetching bookings
  if (status === "loading") return <Loader />;
  if (error) return <p className="pt-24 text-center text-red-500">Error: {error}</p>;
  if (!myBookings.length)
    return <p className="pt-24 text-center text-text-light">No bookings found.</p>;

  return (
    <div className="pt-30 container mx-auto px-4 relative">
      {isCancelling && (
        <div className="absolute inset-0 bg-black/50 flex justify-center items-center z-50">
          <Loader />
        </div>
      )}

      <h2 className="section-title text-center font-bold mb-4">My Bookings</h2>

      {/* Table for md and larger screens */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full bg-text-dark/60 text-text-light rounded-lg overflow-hidden">
          <thead className="bg-text-dark text-gold-primary ">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="py-2 px-4 text-left border-b border-gray-700"
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <React.Fragment key={row.id}>
                <tr className="hover:bg-text-light/20 transition-colors">
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="py-2 px-4 border-b border-gray-700 align-top"
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>

                {/* Expanded row */}
                {row.getIsExpanded() && (
                  <tr className="bg-gray-700">
                    <td colSpan={row.getVisibleCells().length} className="p-4 border-b border-gray-600">
                      {row.original.rooms.map((room, idx) => (
                        <div key={idx} className="p-3 border rounded bg-gray-800 mb-2">
                          <div className="font-semibold">{room.type}</div>
                          <div>Nights: {room.nights}</div>
                          <div>Base Price: ₹{room.basePrice} / night</div>
                          {room.lunchCost > 0 && <div>Lunch: ₹{room.lunchCost}</div>}
                          {room.dinnerCost > 0 && <div>Dinner: ₹{room.dinnerCost}</div>}
                          <div className="font-bold">Subtotal: ₹{room.roomTotal}</div>
                        </div>
                      ))}
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Card list for small screens */}
      <div className="md:hidden space-y-4">
        {data.map((booking) => {
          const statusColor =
            booking.status === "confirmed"
              ? "text-green-600"
              : booking.status === "cancelled"
              ? "text-red-600"
              : "text-yellow-400";

          const paymentColor =
            booking.payment === "paid"
              ? "text-green-600"
              : booking.payment === "refunded"
              ? "text-blue-600"
              : "text-yellow-500";

          return (
            <div
              key={booking.id}
              className="bg-gray-800 text-white rounded-lg p-4 shadow-md"
            >
              <div className="mb-2 font-semibold text-lg">{booking.bookingDate}</div>

              <div className="mb-2">
                <div className="font-semibold">Rooms:</div>
                {booking.rooms.map((room, idx) => (
                  <div key={idx} className="text-sm">
                    {room.type}
                    {room.lunchCost > 0 && ` | Lunch: ₹${room.lunchCost}`}
                    {room.dinnerCost > 0 && ` | Dinner: ₹${room.dinnerCost}`}
                  </div>
                ))}
              </div>

              <div className="mb-2">
                <span className="font-semibold">Guests:</span> {booking.guests}
              </div>

              <div className="mb-2">
                <span className="font-semibold">Contact:</span> {booking.mobile}
              </div>

              <div className="mb-2">
                <div className="font-semibold">Price:</div>
                <div>Before GST: ₹{booking.totalPrice - booking.gst}</div>
                <div>GST: ₹{booking.gst}</div>
                <div className="font-bold">Grand: ₹{booking.totalPrice}</div>
              </div>

              <div className="mb-2">
                <span className={`font-semibold ${statusColor}`}>Status: {booking.status}</span>
              </div>

              <div className="mb-2">
                <span className={`font-semibold ${paymentColor}`}>Payment: {booking.payment}</span>
              </div>

              <div>
                {booking.status !== "cancelled"  && booking.status !== "pending" ? (
                  <button
                    onClick={() => handleCancel(booking.id)}
                    className="px-3 py-1 bg-red-600 rounded hover:bg-red-700 w-full"
                    disabled={isCancelling}
                  >
                    Cancel
                  </button>
                ) : booking.payment === "paid" ? (
                  <span
                    className={booking.isRefunded ? "text-green-600" : "text-yellow-500"}
                  >
                    {booking.isRefunded ? "Refund Successful" : "Pending Refund"}
                  </span>
                ) : (
                  <span className="text-gray-400">Cancelled</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MyBookings;
