import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllUsers,
  blockUser ,
  unblockUser ,
  deleteUser ,
} from "../../../redux/role/adminUserSlice.js";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
} from "@tanstack/react-table";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import defaultAvatar from "../../../assets/react.svg";
import { BASE_URL } from "../../../routes/utilites.jsx";

function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  React.useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debounced;
}

const AdminUsers = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { users, loading, error } = useSelector((state) => state.adminUsers);

  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    dispatch(fetchAllUsers());
  }, [dispatch]);

  // Filter users by name or email (case-insensitive)
  const filteredUsers = useMemo(() => {
    if (!users) return [];
    if (!debouncedSearchTerm.trim()) return users;
    const lower = debouncedSearchTerm.toLowerCase();
    return users.filter(
      (u) =>
        (u.name && u.name.toLowerCase().includes(lower)) ||
        (u.email && u.email.toLowerCase().includes(lower))
    );
  }, [users, debouncedSearchTerm]);

  const handleBlock = async (id) => {
    try {
      await dispatch(blockUser (id)).unwrap();
      toast.success("User  blocked");
    } catch (err) {
      toast.error(err.toString());
    }
  };

  const handleUnblock = async (id) => {
    try {
      await dispatch(unblockUser (id)).unwrap();
      toast.success("User  unblocked");
    } catch (err) {
      toast.error(err.toString());
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await dispatch(deleteUser (id)).unwrap();
      toast.success("User  deleted");
    } catch (err) {
      toast.error(err.toString());
    }
  };

  const columns = useMemo(
    () => [
      { header: "No.", id: "index", cell: ({ row }) => row.index + 1 },
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => {
          const user = row.original;
          const avatarUrl = user.avatar
            ? `${BASE_URL}/upload/${user.avatar}`
            : defaultAvatar;
          return (
            <div className="flex items-center gap-2">
              <img
                src={avatarUrl}
                alt={user.name}
                className="w-8 h-8 rounded-full object-cover border border-gray-300"
              />
              <span>{user.name}</span>
            </div>
          );
        },
      },
      { accessorKey: "email", header: "Email" },
      { accessorKey: "phone", header: "Phone No." },
      { accessorKey: "totalBookings", header: "Total Bookings" },
      { accessorKey: "confirmedBookings", header: "Confirmed" },
      { accessorKey: "cancelBookings", header: "Cancelled" },
      { accessorKey: "pendingBookings", header: "Pending" },
      {
        accessorKey: "isBlocked",
        header: "Status",
        cell: ({ getValue }) => (
          <span
            className={
              getValue()
                ? "text-red-500 font-semibold"
                : "text-green-500 font-semibold"
            }
          >
            {getValue() ? "Blocked" : "Active"}
          </span>
        ),
      },
      {
        accessorKey: "_id",
        header: "Actions",
        cell: ({ row }) => {
          const user = row.original;
          return (
            <div className="flex gap-2">
              {user.isBlocked ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUnblock(user._id);
                  }}
                  className="px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition text-xs"
                >
                  Unblock
                </button>
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleBlock(user._id);
                  }}
                  className="px-2 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition text-xs"
                >
                  Block
                </button>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(user._id);
                }}
                className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition text-xs"
              >
                Delete
              </button>
            </div>
          );
        },
      },
    ],
    []
  );

  const table = useReactTable({
    data: filteredUsers,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  if (loading) return <p className="p-5 text-center">Loading...</p>;
  if (error)
    return <p className="p-5 text-center text-red-500">{error.toString()}</p>;

  return (
    <div className="pt-[80px] px-4 container mx-auto max-w-7xl">
      <h2 className="text-2xl font-bold mb-4 text-text-light">Manage Users</h2>

      {/* Search Input */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:w-1/3 p-2 rounded border border-gray-300 text-text-light focus:outline-none focus:ring-2 focus:ring-gray-300"
        />
      </div>

      {/* Table for md and larger screens */}
      <div className="hidden md:block overflow-x-auto rounded-lg border border-gray-300 shadow-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-900 text-text-light">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-left text-sm font-semibold uppercase tracking-wider border-b border-gray-300"
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="bg-gray-800 text-text-light divide-y divide-gray-200">
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className="hover:bg-gray-700 transition-colors duration-200 cursor-pointer"
                onClick={() =>
                  navigate(`/admin-bookings?name=${encodeURIComponent(row.original.name)}`)
                }
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="px-4 py-2 text-sm border-b border-gray-200"
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
      <div className="md:hidden space-y-4 text-text-light">
        {filteredUsers.length === 0 && (
          <p className="text-center text-text-light">No users found.</p>
        )}
        {filteredUsers.map((user, idx) => {
          const avatarUrl = user.avatar
            ? `${BASE_URL}/upload/${user.avatar}`
            : defaultAvatar;
          return (
            <div
              key={user._id}
              className="bg-gray-800 rounded-lg p-4 shadow cursor-pointer"
              onClick={() =>
                navigate(`/admin-bookings?name=${encodeURIComponent(user.name)}`)
              }
            >
              <div className="flex items-center gap-3 mb-2">
                <img
                  src={avatarUrl}
                  alt={user.name}
                  className="w-10 h-10 rounded-full object-cover border border-gray-300"
                />
                <div>
                  <h3 className="text-lg font-semibold">{user.name}</h3>
                  <p className="text-sm text-gray-400">{user.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm mb-2">
                <div>
                  <span className="font-semibold">Phone:</span> {user.phone || "-"}
                </div>
                <div>
                  <span className="font-semibold">Status:</span>{" "}
                  <span
                    className={
                      user.isBlocked
                        ? "text-red-500 font-semibold"
                        : "text-green-500 font-semibold"
                    }
                  >
                    {user.isBlocked ? "Blocked" : "Active"}
                  </span>
                </div>
                <div>
                  <span className="font-semibold">Total Bookings:</span>{" "}
                  {user.totalBookings || 0}
                </div>
                <div>
                  <span className="font-semibold">Confirmed:</span>{" "}
                  {user.confirmedBookings || 0}
                </div>
                <div>
                  <span className="font-semibold">Cancelled:</span>{" "}
                  {user.cancelBookings || 0}
                </div>
                <div>
                  <span className="font-semibold">Pending:</span>{" "}
                  {user.pendingBookings || 0}
                </div>
              </div>

              <div className="flex gap-2">
                {user.isBlocked ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUnblock(user._id);
                    }}
                    className="flex-1 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition text-xs"
                  >
                    Unblock
                  </button>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBlock(user._id);
                    }}
                    className="flex-1 px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition text-xs"
                  >
                    Block
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(user._id);
                  }}
                  className="flex-1 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition text-xs"
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

export default AdminUsers;
