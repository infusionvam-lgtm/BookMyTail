import { Outlet, useLocation } from "react-router-dom";
import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import Navbar from "../components/Navbar";
import AdminNavbar from "../components/adminnavbar/AdminNavbar.jsx";
import { AdminSidebar } from "../components/adminnavbar/AdminSidebar.jsx";
import { logoutUser } from "../redux/role/authSlice.js";
import Footer from "../components/Footer.jsx";

export default function MainContent() {
  const dispatch = useDispatch();
  const { loggedIn = false, role = null } = useSelector((state) => state.auth || {});
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const handleLogout = () => {
      dispatch(logoutUser());
  };
  // Hide Navbar on login/register pages
  const hideNavbar = location.pathname === "/login" || location.pathname === "/register";

  // --- Admin Layout ---
  if (role === "admin") {
    return (
      <div className="flex">
        <AdminSidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
        <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? "ml-[145px]" : "ml-0"}`}>
          {!hideNavbar && (
            <AdminNavbar
              loggedIn={loggedIn}
              role={role}
              handleLogout={handleLogout}
              toggleSidebar={toggleSidebar}
              isOpen={sidebarOpen}
            />
          )}
          <main>
            <Outlet />
          </main>
        </div>
      </div>
    );
  }

  // --- User Layout ---
  return (
    <>
      {!hideNavbar && <Navbar loggedIn={loggedIn} role={role} />}
      <main>
        <Outlet />
      </main>
      {!hideNavbar && <Footer loggedIn={loggedIn} role={role} />}
    </>
  );
}
