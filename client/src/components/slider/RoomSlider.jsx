import React, { useEffect } from "react";
import Slider from "react-slick";
import { useDispatch, useSelector } from "react-redux";
import { fetchRooms, openRoomModal } from "../../redux/room/roomsSlice.js";
import Loader from "../support/Loader.jsx";
import ErrorMessage from "../support/ErrorMessage.jsx";
import { BASE_URL } from "../../routes/utilites.jsx";
import fallbackImg from "../../assets/room1.jpg";

const RoomSlider = () => {
  const dispatch = useDispatch();
  const { rooms, loading, error, checkIn, checkOut, guests } = useSelector((s) => s.rooms);

  useEffect(() => {
    dispatch(fetchRooms({ checkIn, checkOut, guests }));
  }, [dispatch, checkIn, checkOut, guests]);

  if (loading) return <Loader />;
  if (error) return <ErrorMessage message={error} />;
  if (!rooms || rooms.length === 0)
    return <p className="text-center py-12 text-white">No rooms available.</p>;

  const settings = {
    dots: false,
    infinite: true,
    speed: 1200,
    slidesToShow: Math.min(rooms.length, 4),
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    responsive: [
      {
        breakpoint: 1280, // large screens
        settings: {
          slidesToShow: Math.min(rooms.length, 3),
        },
      },
      {
        breakpoint: 1024, // tablets
        settings: {
          slidesToShow: Math.min(rooms.length, 2),
        },
      },
      {
        breakpoint: 640, // mobile
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };

  return (
    <div className="container px-4 sm:px-6 md:px-8 py-12">
      <div className="text-text-light mb-6">
        <h2 className="section-title mb-2">Featured Rooms</h2>
        <p className="section-pera">Discover our handpicked selection of exceptional rooms.</p>
      </div>

      <Slider key={rooms.length} {...settings}>
        {rooms.map((room) => (
          <div key={room._id} className="px-2 sm:px-3">
            <div
              className="border rounded shadow flex flex-col cursor-pointer hover:shadow-lg transition"
              onClick={() => dispatch(openRoomModal(room))}
            >
              <img
                src={room.images?.[0] ? `${BASE_URL}/upload/${room.images[0]}` : fallbackImg}
                alt={room.type}
                className="w-full h-40 sm:h-48 md:h-52 lg:h-56 object-cover rounded-t"
              />
              <div className="p-2 sm:p-3 text-center text-text-light">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="font-bold text-lg truncate">{room.type}</h2>
                  <p className="text-sm">Guests: {room.capacity}</p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-lg font-semibold">
                    ₹{room.price} <span className="text-sm">/ night</span>
                  </p>
                  <button className="btn-secondary px-3 py-1 rounded text-sm sm:text-base">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default RoomSlider;
