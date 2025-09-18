import React, { useEffect, useMemo, useRef } from "react";
import { useDispatch } from "react-redux";
import { FiX, FiCheck, FiDollarSign, FiTrash } from "react-icons/fi";
import {
  deleteBookingAdmin,
  adminCancelBooking,
  markBookingPaid,
  approveRefund,
} from "../../../redux/booking/bookingSlice.js";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";

const BookingTable = ({ bookings }) => {
  const dispatch = useDispatch();
   const tableContainerRef = useRef(null);

     useEffect(() => {
    const slider = tableContainerRef.current;
    let isDown = false;
    let startX;
    let scrollLeft;

    const mouseDown = (e) => {
      isDown = true;
      slider.classList.add("cursor-grabbing");
      startX = e.pageX - slider.offsetLeft;
      scrollLeft = slider.scrollLeft;
    };

    const mouseLeave = () => {
      isDown = false;
      slider.classList.remove("cursor-grabbing");
    };

    const mouseUp = () => {
      isDown = false;
      slider.classList.remove("cursor-grabbing");
    };

    const mouseMove = (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - slider.offsetLeft;
      const walk = (x - startX) * 2; // scroll-fast
      slider.scrollLeft = scrollLeft - walk;
    };

    slider.addEventListener("mousedown", mouseDown);
    slider.addEventListener("mouseleave", mouseLeave);
    slider.addEventListener("mouseup", mouseUp);
    slider.addEventListener("mousemove", mouseMove);

    return () => {
      slider.removeEventListener("mousedown", mouseDown);
      slider.removeEventListener("mouseleave", mouseLeave);
      slider.removeEventListener("mouseup", mouseUp);
      slider.removeEventListener("mousemove", mouseMove);
    };
  }, []);


  const columns = useMemo(
    () => [
      {
        header: "Guest Name",
        accessorKey: "userId.name",
        cell: (info) => info.getValue() || "N/A",
      },
      {
        header: "Contact",
        accessorKey: "mobileNum",
        cell: (info) => info.getValue() || "-",
        // Hide on xs screens
        meta: { className: "hidden sm:table-cell" },
      },
      {
        header: "Email",
        accessorKey: "email",
        cell: (info) => info.getValue() || info.row.original.userId?.email || "-",
        meta: { className: "hidden md:table-cell" },
      },
      {
        header: "Guests",
        accessorKey: "totalGuests",
        cell: (info) => info.getValue() || 0,
        meta: { className: "hidden sm:table-cell" },
      },
      {
        header: "Rooms",
        accessorFn: (row) =>
          row.rooms
            ?.map((r) => {
              const roomName = r.roomType?.type || "Deleted Room";
              const qty = r.count || 1;
              let details = `${roomName} x ${qty}`;
              if (r.lunch > 0)
                details += `, Lunch: ₹${r.lunch * r.nights * row.totalGuests}`;
              if (r.dinner > 0)
                details += `, Dinner: ₹${r.dinner * r.nights * row.totalGuests}`;
              return details;
            })
            .join(" | "),
        meta: { className: "max-w-xs truncate" },
      },
      {
        header: "Total Price (₹)",
        accessorKey: "grandTotal",
        cell: (info) => `₹${info.getValue()?.toLocaleString()}`,
        meta: { className: "hidden sm:table-cell" },
      },
      {
        header: "Check-In",
        accessorKey: "checkInDate",
        cell: (info) => new Date(info.getValue()).toLocaleDateString(),
        meta: { className: "hidden md:table-cell" },
      },
      {
        header: "Check-Out",
        accessorKey: "checkOutDate",
        cell: (info) => new Date(info.getValue()).toLocaleDateString(),
        meta: { className: "hidden md:table-cell" },
      },
      {
        header: "Status",
        accessorKey: "status",
        cell: (info) => {
          const val = info.getValue();
          const color =
            val === "confirmed"
              ? "text-green-500"
              : val === "cancelled"
              ? "text-red-500"
              : "text-yellow-400";
          return <span className={color}>{val}</span>;
        },
      },
      {
        header: "Payment",
        accessorKey: "paymentStatus",
        cell: (info) => {
          const val = info.getValue();
          const color =
            val === "paid"
              ? "text-green-500"
              : val === "refunded"
              ? "text-blue-500"
              : "text-red-500";
          return <span className={color}>{val}</span>;
        },
        meta: { className: "hidden sm:table-cell" },
      },
{
  header: "Actions",
  cell: (info) => {
    const b = info.row.original;

    return (
      <div className="flex gap-2">
        {/* Cancel button: only if booking is confirmed and not cancelled */}
        {b.status === "confirmed" && (
          <button
            onClick={() => dispatch(adminCancelBooking(b._id))}
            title="Cancel"
            aria-label="Cancel Booking"
            className="p-1 bg-red-600 rounded hover:bg-red-700"
          >
            <FiX />
          </button>
        )}

        {/* Mark Paid button: only if booking is unpaid */}
        {b.status !== "paid" && (
          <button
            onClick={() =>
              dispatch(markBookingPaid({ id: b._id, status: "paid" }))
            }
            title="Mark Paid"
            aria-label="Mark Booking Paid"
            className="p-1 bg-green-600 rounded hover:bg-green-700"
          >
            <FiCheck />
          </button>
        )}

        {/* Refund button: only if refund is pending */}
        {b.refundPending && (
          <button
            onClick={() => dispatch(approveRefund(b._id))}
            title="Refund"
            aria-label="Approve Refund"
            className="p-1 bg-blue-600 rounded hover:bg-blue-700"
          >
            <FiDollarSign />
          </button>
        )}

        {/* Delete button: only if booking is paid or cancelled */}
        {(b.status === "paid" || b.status === "cancelled") && (
          <button
            onClick={() => dispatch(deleteBookingAdmin(b._id))}
            title="Delete"
            aria-label="Delete Booking"
            className="p-1 bg-gray-600 rounded hover:bg-gray-700"
          >
            <FiTrash />
          </button>
        )}
      </div>
    );
  },
}

    ],
    [dispatch]
  );

  const table = useReactTable({
    data: bookings,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    
    <div ref={tableContainerRef} className="overflow-x-auto bg-gray-800 rounded-lg cursor-grab">
      <table className="min-w-full text-left border-collapse">
        <thead className="bg-gray-700">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const className = header.column.columnDef.meta?.className || "";
                return (
                  <th
                    key={header.id}
                    className={`px-4 py-2 whitespace-nowrap ${className}`}
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr
              key={row.id}
              className="border-b border-gray-600 hover:bg-gray-700 transition-colors"
            >
              {row.getVisibleCells().map((cell) => {
                const className = cell.column.columnDef.meta?.className || "";
                return (
                  <td
                    key={cell.id}
                    className={`px-4 py-2 whitespace-nowrap ${className}`}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BookingTable;
