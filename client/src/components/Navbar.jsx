import { Link, useNavigate } from "react-router-dom";
import { BiBed, BiMenu, BiX } from "react-icons/bi";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import defaultAvatar from "../assets/react.svg";
import { BASE_URL } from "../routes/utilites";
import { fetchUserProfile } from "../redux/role/profileSlice.js";
import { loadCart } from "../redux/cart/cartSlice.js";


export default function Navbar({ loggedIn, role, setLoggedIn, setRole }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { cart } = useSelector((state) => state.cart);
  const { profile } = useSelector((state) => state.profile);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

const fetchData = async () => {
  try {
    await dispatch(loadCart()).unwrap();
    await dispatch(fetchUserProfile()).unwrap();
  } catch (err) {
    console.error("Error while fetching initial data:", err);
  }
};
  const totalRooms =
    cart?.rooms?.reduce((sum, r) => sum + (r.count || 0), 0) || 0;

  const handleLogout = () => {
    localStorage.clear();
    setLoggedIn(false);
    setRole(null);
    navigate("/");
  };

  useEffect(() => {
    fetchData();
  }, [dispatch]);

  const profileImage = profile?.avatar
    ? `${BASE_URL}/upload/${profile.avatar}`
    : defaultAvatar;

  return (
    <nav className="bg-none fixed top-0 left-0 w-full p-2 z-50 md:p-6">
      <div className="border max-w-[1280px] mx-auto border-gold-primary text-white rounded-[40px] bg-text-dark/90 py-4 px-8 flex justify-between items-center">
        <h1 className="text-xl text-gold-primary font-bold">Opulent Hotel</h1>

        {/* Desktop Menu */}
        <div className="hidden md:flex gap-6 items-center">
          <Link to="/" className="nav-link">
            Home
          </Link>
          <Link to="/rooms" className="nav-link">
            Rooms
          </Link>
          <Link to="/mybookings" className="nav-link">
            MyBooking
          </Link>

          <Link to="/cart" className="relative">
            <BiBed size={24} className="text-gold-primary" />
            {totalRooms > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {totalRooms}
              </span>
            )}
          </Link>

          <div className="relative top-1">
            <button onClick={() => setMenuOpen(!menuOpen)}>
              <img
                src={profileImage}
                alt="Profile"
                className="w-8 h-8 rounded-full object-cover border-2 border-gold-primary"
              />
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white text-black rounded-lg shadow-lg overflow-hidden">
                {!loggedIn ? (
                  <>
                    <Link
                      to="/login"
                      className="block px-4 py-2 hover:bg-gray-200"
                      onClick={() => setMenuOpen(false)}
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      className="block px-4 py-2 hover:bg-gray-200"
                      onClick={() => setMenuOpen(false)}
                    >
                      Register
                    </Link>
                  </>
                ) : (
                  <>
                    {role === "admin" ? (
                      <Link
                        to="/admin-dashboard"
                        className="block px-4 py-2 hover:bg-gray-200"
                        onClick={() => setMenuOpen(false)}
                      >
                        Admin Dashboard
                      </Link>
                    ) : (
                      <Link
                        to="/user-dashboard"
                        className="block px-4 py-2 hover:bg-gray-200"
                        onClick={() => setMenuOpen(false)}
                      >
                        My Profile
                      </Link>
                    )}
                    <Link
                      onClick={() => {
                        handleLogout();
                        setMenuOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-200"
                    >
                      Logout
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Mobile Hamburger */}
        <div className="md:hidden flex items-center">
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? (
              <BiX size={28} className="text-gold-primary" />
            ) : (
              <BiMenu size={28} className="text-gold-primary" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="min-h-[calc(100vh-120px)] overflow-y-auto md:hidden w-[150px] mt-[-5px] bg-text-dark/90 text-white rounded-[40px] px-4 py-4 flex flex-col gap-2 border border-gold-primary absolute right-0 top-full z-40">
          <Link
            to="/"
            className="nav-link"
            onClick={() => setMobileMenuOpen(false)}
          >
            Home
          </Link>
          <Link
            to="/rooms"
            className="nav-link"
            onClick={() => setMobileMenuOpen(false)}
          >
            Rooms
          </Link>
          <Link
            to="/mybookings"
            className="nav-link"
            onClick={() => setMobileMenuOpen(false)}
          >
            MyBooking
          </Link>

          <Link
            to="/cart"
            className="relative nav-link flex items-center justify-between"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div className=" flex items-center gap-2">
              <span>Cart</span>
              {totalRooms > 0 && (
                <span className="bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {totalRooms}
                </span>
              )}
            </div>
          </Link>

          {!loggedIn ? (
            <>
              <Link
                to="/login"
                className="nav-link"
                onClick={() => setMobileMenuOpen(false)}
              >
                Login
              </Link>
              <Link
                to="/register"
                className="nav-link"
                onClick={() => setMobileMenuOpen(false)}
              >
                Register
              </Link>
            </>
          ) : (
            <>
              {role === "admin" ? (
                <Link
                  to="/admin-dashboard"
                  className="nav-link"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Admin Dashboard
                </Link>
              ) : (
                <Link
                  to="/user-dashboard"
                  className="nav-link"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  My Profile
                </Link>
              )}
              <button
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                className="text-left nav-link"
              >
                Logout
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
