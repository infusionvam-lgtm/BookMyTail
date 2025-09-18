import React, { useState, useEffect, useRef } from "react";
import { FaUserCircle, FaBars, FaBell } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { loadAllBookings, loadMetrics } from "../../redux/booking/bookingSlice";
import { Toaster, toast  } from "react-hot-toast";

export default function AdminNavbar({ toggleSidebar, loggedIn, role, handleLogout }) {
  const dispatch = useDispatch();
  const { allBookings, metrics } = useSelector(state => state.bookings);

  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Refs for dropdowns
  const notifRef = useRef();
  const profileRef = useRef();
  const seenIdsRef = useRef(new Set(JSON.parse(localStorage.getItem("seenBookings") || "[]")));

useEffect(() => {
  if (allBookings && allBookings.length > 0) {
    const newOnes = allBookings.filter(b => !seenIdsRef.current.has(b._id));

    newOnes.forEach((b) => {
      if (b.status === "confirmed") {
        toast.success(`Booking confirmed for ${b.userId?.name || "Unknown User"}`);
      } else if (b.refundPending) {
        toast(`Refund pending for ${b.userId?.name || "Unknown User"}`, { icon: "⚠️" });
      }

      // Add this booking ID to seen set
      seenIdsRef.current.add(b._id);
    });

    // Save updated seen IDs to localStorage (persists across refresh)
    if (newOnes.length > 0) {
      localStorage.setItem("seenBookings", JSON.stringify([...seenIdsRef.current]));
    }
  }
}, [allBookings]);


  // Load admin bookings & metrics
  useEffect(() => {
    if (role === "admin") {
      dispatch(loadAllBookings({ page: 1, perPage: 10 }));
      dispatch(loadMetrics());
    }
  }, [dispatch, role]);

  // Auto-refresh every 10 sec
  useEffect(() => {
    const interval = setInterval(() => {
      if (role === "admin") {
        dispatch(loadAllBookings({ page: 1, perPage: 10 }));
        dispatch(loadMetrics());
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [dispatch, role]);

  // Update unread count
  useEffect(() => {
    if (metrics) {
      setUnreadCount((metrics.pendingBookings || 0) + (metrics.confirmedBookings || 0));
    }
  }, [metrics]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleBellClick = () => {
    setNotifOpen(!notifOpen);
    setUnreadCount(0);
  };

  // Notifications: only confirmed & refund pending
  const notifications = allBookings.filter(
    b => b.status === "confirmed" || b.refundPending
  );

  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
      <nav className="fixed top-0 left-0 w-full bg-gray-800 text-white p-4 z-50 flex justify-between items-center">
        {/* Sidebar Toggle */}
        <div className="flex items-center gap-4">
          <button className="p-2 bg-gray-700 rounded" onClick={toggleSidebar}>
            <FaBars size={20} />
          </button>
          <h1 className="text-xl font-bold">Opulent Hotel</h1>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-4">
          {/* Notification Bell */}
          <div className="relative" ref={notifRef}>
            <button
              className="relative p-2 rounded hover:bg-gray-700"
              onClick={handleBellClick}
            >
              <FaBell size={20} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {notifOpen && (
              <div className="absolute right-0 mt-2 w-96 bg-gray-800 text-white rounded shadow-lg max-h-96 overflow-y-auto z-50">
                {notifications.length === 0 ? (
                  <p className="p-4 text-center text-gray-300">No notifications</p>
                ) : (
                  notifications.map((b) => (
                    <div key={b._id} className="p-4 border-b border-gray-700">
                      <p className={`font-semibold ${
                        b.status === "confirmed" ? "text-green-400" :
                        b.refundPending ? "text-yellow-400" : "text-gray-400"
                      }`}>
                        {b.status === "confirmed" ? "Booking Confirmed" : "Refund Pending"}
                      </p>
                      <p className="text-sm text-gray-300">
                        {b.userId?.name || b.email || "Unknown User"} -{" "}
                        {(b.rooms || []).map(r => r.roomType?.type || "Unknown Room").join(", ")}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(b.createdAt).toLocaleString()}
                      </p>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Profile Dropdown */}
          <div className="relative" ref={profileRef}>
            <button onClick={() => setMenuOpen(!menuOpen)}>
              <FaUserCircle size={24} />
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white text-black rounded-lg shadow-lg overflow-hidden">
                {!loggedIn ? null : (
                  <>
                    {role === "admin" ? (
                      <a href="/admin-dashboard" className="block px-4 py-2 hover:bg-gray-200">Admin Dashboard</a>
                    ) : (
                      <a href="/user-dashboard" className="block px-4 py-2 hover:bg-gray-200">My Profile</a>
                    )}
                    <button
                      onClick={() => { handleLogout(); setMenuOpen(false); }}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-200"
                    >
                      Logout
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}
