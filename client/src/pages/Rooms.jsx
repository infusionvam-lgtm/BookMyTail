import React, { useEffect, useState, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { setFilters, resetFilters } from "../redux/room/roomsSlice.js";
import RoomFilters from "../components/rooms/RoomFilters.jsx";
import RoomCard from "../components/rooms/RoomCard.jsx";
import { BASE_URL } from "../routes/utilites.jsx";
import { saveCart, loadCart } from "../redux/cart/cartSlice.js";
import Loader from "../components/support/Loader.jsx";
import ErrorMessage from "../components/support/ErrorMessage.jsx";
import RoomModal from "../components/rooms/RoomModal.jsx";
import ReviewSlider from "../components/slider/ReviewSlider.jsx";
import HotelLocationMap from "../components/user/HotelLocationMap.jsx";

const Rooms = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { checkIn, checkOut, guests, price } = useSelector((state) => state.rooms);
  const { cart } = useSelector((state) => state.cart);

  // Rooms state
  const [rooms, setRooms] = useState([]);

  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Show only selected rooms toggle
  const [showSelectedOnly, setShowSelectedOnly] = useState(false);

  // Load cart on mount
  useEffect(() => {
    dispatch(loadCart());
  }, [dispatch]);

  // Sync URL filters with Redux
  useEffect(() => {
    const urlFilters = {
      checkIn: searchParams.get("checkIn"),
      checkOut: searchParams.get("checkOut"),
      guests: searchParams.get("guests"),
      price: searchParams.get("price"),
    };

    if (Object.values(urlFilters).some(Boolean)) {
      dispatch(setFilters(urlFilters));
    }
  }, [dispatch, searchParams]);

  // Fetch all rooms (no pagination)
  const fetchRooms = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = { checkIn, checkOut, guests, price };
      setSearchParams(params);

      const res = await axios.get(`${BASE_URL}/rooms/getAll`, { params });
      const { rooms: fetchedRooms } = res.data;

      // ✅ Filter out rooms with no availability
      let filteredRooms = fetchedRooms.filter((r) => r.availableRooms > 0);

      // Client-side price filter
      if (price) {
        filteredRooms = filteredRooms.filter((r) => r.price <= Number(price));
      }

      // Sorting logic
      filteredRooms.sort((a, b) => {
        if (guests || (!guests && !price)) {
          return a.capacity === b.capacity ? a.price - b.price : a.capacity - b.capacity;
        }
        if (price && !guests) {
          return a.price - b.price;
        }
        return 0;
      });

      setRooms(filteredRooms);
    } catch (err) {
      setError("Failed to load rooms. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, [checkIn, checkOut, guests, price, setSearchParams]);

  // Fetch rooms on filters change
  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  const selectedCount = cart?.rooms?.length || 0;

  const handleProceed = async () => {
    if (!checkIn || !checkOut || selectedCount === 0) return;

    await dispatch(
      saveCart({
        ...(cart || {}),
        rooms:
          cart?.rooms?.map((r) => ({
            roomType: r.roomType?._id || r.roomType,
            count: r.count,
             lunch: r.lunch,  
             dinner: r.dinner,
          })) || [],
        checkInDate: checkIn,
        checkOutDate: checkOut,
        guests,
      })
    );

    navigate("/cart");
  };

  const roomIdsInCart = new Set(
    (cart?.rooms || []).map((r) => (r.roomType?._id || r.roomType).toString())
  );

  const displayedRooms = showSelectedOnly
    ? rooms.filter((r) => roomIdsInCart.has(r._id))
    : rooms.filter(Boolean);

  if (error) return <ErrorMessage message={error} />;

  return (
    <>
    <div className="pt-[80px] text-white container mx-auto px-4 flex flex-col md:flex-row min-h-screen">
      {/* Filters Sidebar */}
      <div className="md:w-3/12 m-0 md:m-6 bg-text-light text-text-dark p-4 rounded-lg md:sticky md:top-[110px] h-fit">
        <RoomFilters
          showSelectedOnly={showSelectedOnly}
          setShowSelectedOnly={setShowSelectedOnly}
          resetFilters={() => {
            dispatch(resetFilters());
            setSearchParams({});
          }}
        />
      </div>

      {/* Rooms Section */}
      <div className="md:w-9/12 m-0 md:m-6 flex flex-col text-text-light">
        <h1 className="section-title mt-1 mb-4">Available Rooms</h1>
        <div className="flex justify-between items-center">
          {checkIn && checkOut && guests && (
            <p className="section-pera mb-4">
              Showing results for <strong>{guests}</strong> guests from{" "}
              <strong>{checkIn}</strong> to <strong>{checkOut}</strong>
            </p>
          )}
          {selectedCount > 0 && (
            <button
              className={`btn-primary w-content mb-4 ${
                !checkIn || !checkOut ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={!checkIn || !checkOut}
              onClick={handleProceed}
            >
              Proceed with {selectedCount} Room{selectedCount > 1 ? "s" : ""}
            </button>
          )}
        </div>

        {loading ? (
          <Loader />
        ) : displayedRooms.length === 0 ? (
          <p className="text-center py-12">No rooms match your search criteria.</p>
        ) : (
          <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
            {displayedRooms.map((room) => (
              <RoomCard key={room._id} room={room} />
            ))}
          </div>
        )}
      </div>

      {/* Room Details Modal */}
      <RoomModal />
    </div>
    <ReviewSlider/>
    <HotelLocationMap hotelId={2}/>
    </>
  );
};

export default Rooms;
