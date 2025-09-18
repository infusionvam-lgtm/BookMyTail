import { Link } from "react-router-dom";
import { RiHome4Line, RiInformationLine, RiServiceLine, RiContactsLine, RiAlignItemLeftLine, RiAlarmWarningLine } from "react-icons/ri";

export const AdminSidebar = ({ isOpen, toggleSidebar }) => {
  return (
    <>
      <aside
        className={`fixed top-0 left-0 h-full bg-gray-900 text-white transform transition-transform duration-300 z-40
          ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
        style={{ width: "145px" }}
      >
        <div className="pt-18 flex flex-col">
          <Link to="/admin-dashboard" className="flex items-center gap-2 px-4 py-3 hover:bg-gray-700 hover:text-yellow-400 transition">
            <RiHome4Line /> Home
          </Link>
          <Link to="/admin-bookings" className="flex items-center gap-2 px-4 py-3 hover:bg-gray-700 hover:text-yellow-400 transition">
            <RiInformationLine /> Bookings
          </Link>
          <Link to="/admin-rooms" className="flex items-center gap-2 px-4 py-3 hover:bg-gray-700 hover:text-yellow-400 transition">
            <RiServiceLine /> Rooms
          </Link>
          <Link to="/admin-users" className="flex items-center gap-2 px-4 py-3 hover:bg-gray-700 hover:text-yellow-400 transition">
            <RiContactsLine /> Guests
          </Link>
          <Link to="/admin-report" className="flex items-center gap-2 px-4 py-3 hover:bg-gray-700 hover:text-yellow-400 transition">
            <RiAlignItemLeftLine /> Report
          </Link>
        </div>
      </aside>

      {/* Overlay on mobile */}
      {isOpen && window.innerWidth <= 768 && (
        <div className="fixed inset-0 bg-black opacity-50 z-30" onClick={toggleSidebar}></div>
      )}
    </>
  );
};
