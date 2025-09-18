import React, { useMemo } from "react";
import { useReactTable, getCoreRowModel, flexRender } from "@tanstack/react-table";
import { useSelector } from "react-redux";

// Stat card
const StatCard = ({ title, value }) => (
  <div className="bg-text-dark/90 p-4 rounded shadow text-center hover:scale-105 transition">
    <h3 className="font-bold text-lg">{title}</h3>
    <p className="text-2xl">{value}</p>
  </div>
);

const BookingsSection = () => {
  const { profile } = useSelector((state) => state.profile);

  // Use bookings directly
  const data = useMemo(() => profile?.recentBookings || [], [profile]);

  // Columns definition for React Table
  const columns = useMemo(
    () => [
      {
        header: "Booking Date",
        accessorKey: "checkInDate",
        cell: (info) => {
          const b = info.row.original;
          return `${new Date(b.checkInDate).toLocaleDateString()} → ${new Date(
            b.checkOutDate
          ).toLocaleDateString()}`;
        },
      },
      {
        header: "Rooms",
        accessorKey: "rooms",
        cell: (info) => (
          <div className="flex flex-col gap-2">
            {(info.getValue() || []).map((r, idx) => (
              <div key={idx} className="text-sm">
                <div className="font-semibold">
                  {r.roomType
                    ? `${r.roomType.type} x ${r.count || 1}`
                    : `Deleted Room x ${r.count || 1}`}
                </div>
                <div className="text-gray-300 text-xs">
                  {r.lunchCost > 0 && `Lunch: ₹${r.lunchCost}`}{" "}
                  {r.dinnerCost > 0 && `| Dinner: ₹${r.dinnerCost}`}
                </div>
                <div className="text-gray-400 text-xs">
                  Nights: {r.nights || 0} | Price/night: ₹{r.roomType?.price || 0} | Subtotal: ₹
                  {r.roomTotal || 0}
                </div>
              </div>
            ))}
          </div>
        ),
      },
      { header: "Guests", accessorKey: "guests" },
      {
        header: "Grand Total",
        accessorKey: "grandTotal",
        cell: (info) => `₹${info.getValue() || 0}`,
      },
      {
        header: "Status",
        accessorKey: "status",
        cell: (info) => {
          const val = info.getValue();
          const color =
            val === "confirmed"
              ? "text-green-500"
              : val === "pending"
              ? "text-yellow-400"
              : "text-red-500";
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
              : "text-yellow-400";
          return <span className={color}>{val.replace("_", " ")}</span>;
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

  return (
    <div className="md:w-3/4 flex flex-col gap-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Total Bookings" value={profile?.totalBookings || 0} />
        <StatCard title="Confirmed" value={profile?.confirmedBookings || 0} />
        <StatCard title="Pending" value={profile?.pendingBookings || 0} />
        <StatCard title="Cancelled/Refund" value={profile?.cancelBookings || 0} />
      </div>

      {/* Table */}
      <div className="bg-text-dark/90 p-4 rounded shadow overflow-x-auto">
        <h3 className="font-bold text-lg mb-2">Recent Bookings</h3>
        <table className="min-w-full text-left border-collapse">
          <thead className="bg-text-light/50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="p-2 border-b border-gray-600">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="hover:bg-text-light/20 transition">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="p-2 border-b border-gray-600 align-top">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BookingsSection;
