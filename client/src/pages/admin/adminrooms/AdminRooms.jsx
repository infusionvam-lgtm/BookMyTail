import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { fetchRooms, deleteRoom } from "../../../redux/room/roomsSlice.js";
import { toast } from "react-toastify";
import AdminRoomForm from "./AdminRoomForm.jsx";
import { FaCheck } from "react-icons/fa";
import { MdClose } from "react-icons/md";

import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import { BASE_URL } from "../../../routes/utilites.jsx";

const AdminRooms = () => {
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  const dispatch = useDispatch();
  const { rooms, loading, error } = useSelector((state) => state.rooms);
  const [searchParams, setSearchParams] = useSearchParams();

  const [editingRoom, setEditingRoom] = useState(null);
  const [showForm, setShowForm] = useState(false);

  // Date filters synced with URL
  const [filterCheckIn, setFilterCheckIn] = useState(
    searchParams.get("checkIn") || today.toISOString().split("T")[0]
  );
  const [filterCheckOut, setFilterCheckOut] = useState(
    searchParams.get("checkOut") || tomorrow.toISOString().split("T")[0]
  );

  // Fetch rooms whenever filters change
  useEffect(() => {
    // Update URL
    setSearchParams({ checkIn: filterCheckIn, checkOut: filterCheckOut });
    dispatch(
      fetchRooms({
        checkIn: filterCheckIn,
        checkOut: filterCheckOut,
        guests: 1,
        adminView: true,
      })
    );
  }, [filterCheckIn, filterCheckOut, dispatch, setSearchParams]);

  const handleDelete = (id, totalRooms, availableRooms) => {
    const count = parseInt(
      prompt(`Enter number of rooms to delete (max ${availableRooms}):`, "1")
    );
    if (!count || count <= 0) return;
    if (!window.confirm(`Delete ${count} room(s) permanently?`)) return;

    dispatch(deleteRoom({ id, count }))
      .unwrap()
      .then(() => {
        toast.success("Room deleted successfully!");
        dispatch(
          fetchRooms({
            checkIn: filterCheckIn,
            checkOut: filterCheckOut,
            guests: 1,
            adminView: true,
          })
        );
      })
      .catch((err) => {
        toast.error(err?.message || "Failed to delete room!");
      });
  };

  const columns = useMemo(
    () => [
      { header: "Index", id: "index", cell: ({ row }) => row.index + 1 },
      {
        header: "Image",
        accessorKey: "images",
        cell: ({ getValue }) => {
          const imagesArray = getValue();
          if (!imagesArray || imagesArray.length === 0) return "No image";
          const imgName = imagesArray[0];
          const src = imgName.startsWith("http")
            ? imgName
            : `${BASE_URL}/upload/${imgName}`;
          return (
            <img
              src={src}
              className="w-16 h-16 object-cover rounded"
              alt="room"
            />
          );
        },
      },
      { header: "Type", accessorKey: "type" },
      {
        header: "Price",
        accessorKey: "price",
        cell: ({ getValue }) => `₹${getValue()}`,
      },
      { header: "Capacity", accessorKey: "capacity" },
      { header: "Total", accessorKey: "totalRooms" },
      { header: "Available", accessorKey: "availableRooms" },
      {
        header: "WiFi",
        accessorFn: (row) => row.services?.wifi,
        cell: ({ getValue }) =>
          getValue() ? (
            <FaCheck style={{ color: "#15c70c" }} />
          ) : (
            <MdClose size={20} style={{ color: "#f03c18", width: "10px" }} />
          ),
      },
      {
        header: "Breakfast",
        accessorFn: (row) => row.services?.breakfast,
        cell: ({ getValue }) =>
          getValue() ? (
            <FaCheck style={{ color: "#15c70c" }} />
          ) : (
            <MdClose size={20} style={{ color: "#f03c18" }} />
          ),
      },
      {
        header: "Lunch",
        accessorFn: (row) => row.services?.lunch,
        cell: ({ getValue }) =>
          getValue() ? (
            <p className="flex items-center gap-2" style={{ color: "#15c70c" }}>
              <FaCheck /> {getValue()}
            </p>
          ) : (
            <MdClose size={20} style={{ color: "#f03c18" }} />
          ),
      },
      {
        header: "Dinner",
        accessorFn: (row) => row.services?.dinner,
        cell: ({ getValue }) =>
          getValue() ? (
            <p className="flex items-center gap-2" style={{ color: "#15c70c" }}>
              <FaCheck /> {getValue()}
            </p>
          ) : (
            <MdClose size={20} style={{ color: "#f03c18" }} />
          ),
      },
      {
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => {
                setEditingRoom(row.original);
                setShowForm(true);
              }}
              className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Edit
            </button>
            <button
              onClick={() =>
                handleDelete(
                  row.original._id,
                  row.original.totalRooms,
                  row.original.availableRooms
                )
              }
              className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        ),
      },
    ],
    [filterCheckIn, filterCheckOut]
  );

  const table = useReactTable({
    data: rooms || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="pt-[80px] px-4 text-text-light container mx-auto max-w-7xl">
      <h2 className="text-2xl font-bold mb-4 text-white">Room Management</h2>

      <button
        onClick={() => {
          setEditingRoom(null);
          setShowForm(true);
        }}
        className="mb-4 px-4 py-2 btn-primary"
      >
        ➕ Add Room
      </button>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded shadow-lg p-4 w-full max-w-lg relative max-h-[90vh] overflow-auto">
            <button
              onClick={() => setShowForm(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl font-bold"
              aria-label="Close form"
            >
              ✖
            </button>
            <AdminRoomForm
              room={editingRoom}
              onClose={() => setShowForm(false)}
              refresh={() =>
                dispatch(
                  fetchRooms({
                    checkIn: filterCheckIn,
                    checkOut: filterCheckOut,
                    guests: 1,
                    adminView: true,
                  })
                )
              }
            />
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="mb-4 flex flex-wrap gap-2 items-center">
        <input
          type="date"
          value={filterCheckIn}
          onChange={(e) => setFilterCheckIn(e.target.value)}
          className="border border-gray-600 px-2 py-1 rounded bg-text-light/70 text-text-dark"
        />
        <input
          type="date"
          value={filterCheckOut}
          onChange={(e) => setFilterCheckOut(e.target.value)}
          className="border border-gray-600 px-2 py-1 rounded bg-text-light/70 text-text-dark"
        />
        <button
          onClick={() => {
            setFilterCheckIn(today.toISOString().split("T")[0]);
            setFilterCheckOut(tomorrow.toISOString().split("T")[0]);
          }}
          className="px-4 py-1 btn-secondary"
        >
          Reset
        </button>
      </div>

      {/* Table for md and larger screens */}
      <div className="hidden md:block overflow-x-auto rounded-lg border border-gray-700">
        {loading && (
          <p className="p-4 text-center text-white">Loading rooms...</p>
        )}
        {error && <p className="p-4 text-center text-red-500">{error}</p>}

        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-900 text-white">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-left text-sm font-semibold uppercase tracking-wider border-b border-gray-700"
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="bg-gray-800 divide-y divide-gray-700">
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className="hover:bg-gray-700 transition-colors duration-200"
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="px-4 py-2 text-sm border-b border-gray-700"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Card/List view for small screens */}
      <div className="md:hidden space-y-4">
        {loading && (
          <p className="p-4 text-center text-white">Loading rooms...</p>
        )}
        {error && <p className="p-4 text-center text-red-500">{error}</p>}
        {!loading && !error && rooms.length === 0 && (
          <p className="text-center text-text-light">No rooms found.</p>
        )}
        {!loading &&
          !error &&
          rooms.map((room) => {
            const imgName = room.images?.[0];
            const src = imgName
              ? imgName.startsWith("http")
                ? imgName
                : `${BASE_URL}/upload/${imgName}`
              : null;
            return (
              <div
                key={room._id}
                className="bg-gray-800 rounded-lg p-4 shadow flex flex-col gap-3"
              >
                {src ? (
                  <img
                    src={src}
                    alt={room.type}
                    className="w-full h-40 object-cover rounded"
                  />
                ) : (
                  <div className="w-full h-40 bg-gray-700 rounded flex items-center justify-center text-gray-400">
                    No Image
                  </div>
                )}

                <div className="flex flex-col gap-1">
                  <h3 className="text-xl font-semibold">{room.type}</h3>
                  <p>Price: ₹{room.price}</p>
                  <p>Capacity: {room.capacity}</p>
                  <p>Total Rooms: {room.totalRooms}</p>
                  <p>Available Rooms: {room.availableRooms}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-1">
                    WiFi:{" "}
                    {room.services?.wifi ? (
                      <FaCheck style={{ color: "#15c70c" }} />
                    ) : (
                      <MdClose size={20} style={{ color: "#f03c18" }} />
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    Breakfast:{" "}
                    {room.services?.breakfast ? (
                      <FaCheck style={{ color: "#15c70c" }} />
                    ) : (
                      <MdClose size={20} style={{ color: "#f03c18" }} />
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    Lunch:{" "}
                    {room.services?.lunch ? (
                      <FaCheck style={{ color: "#15c70c" }} />
                    ) : (
                      <MdClose size={20} style={{ color: "#f03c18" }} />
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    Dinner:{" "}
                    {room.services?.dinner ? (
                      <FaCheck style={{ color: "#15c70c" }} />
                    ) : (
                      <MdClose size={20} style={{ color: "#f03c18" }} />
                    )}
                  </div>
                </div>

                <div className="flex gap-2 flex-wrap mt-3">
                  <button
                    onClick={() => {
                      setEditingRoom(room);
                      setShowForm(true);
                    }}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() =>
                      handleDelete(
                        room._id,
                        room.totalRooms,
                        room.availableRooms
                      )
                    }
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default AdminRooms;
