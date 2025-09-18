import { Routes, Route, Navigate } from "react-router-dom";
import MainContent from "../layouts/MainContent";
import Home from "../pages/Home";
import Rooms from "../pages/Rooms";

//================= MAIN ROUTES ==================
import Register from "../pages/entry/Register";
import Login from "../pages/entry/Login";
import ProtectedRouter from "./ProtectedRouter";

//================= USER ROUTES ==================
import UserDashboard from "../pages/users/profile/UserDashboard";
import Cart from "../pages/users/cart/Cart";
import MyBookings from "../pages/users/booking/MyBookings";
import Booking from "../pages/users/booking/Booking";

//================= ADMIN ROUTES ==================
import AdminDashboard from "../pages/admin/dashboard/AdminDashboard";
import AdminBookings from "../pages/admin/bookings/AdminBookings";
import AdminRooms from "../pages/admin/adminrooms/AdminRooms";
import AdminUsers from "../pages/admin/userdata/AdminUsers";
import AdminReport from "../pages/admin/reports/AdminReport";

export const AppRoutes = () => {
  return (
    <Routes>
      <Route element={<MainContent />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />


        {/* Admin Router */}
        <Route element={<ProtectedRouter role="admin" />}>
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/admin-bookings" element={<AdminBookings />} />
          <Route path="/admin-rooms" element={<AdminRooms />} />
          <Route path="/admin-users" element={<AdminUsers />} />
          <Route path="/admin-report" element={<AdminReport />} />
        </Route>

        {/* User Router */}
        <Route element={<ProtectedRouter role="user" />}>
            <Route path="/" element={<Home />} />
            <Route path="/rooms" element={<Rooms />} />
          <Route path="/user-dashboard" element={<UserDashboard />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/bookings" element={<Booking />} />
          <Route path="/mybookings" element={<MyBookings />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replce />} />
      </Route>
    </Routes>
  );
};
