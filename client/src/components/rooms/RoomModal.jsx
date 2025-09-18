import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { closeRoomModal } from "../../redux/room/roomsSlice.js";
import Loader from "../support/Loader.jsx";
import ErrorMessage from "../support/ErrorMessage.jsx";
import { BASE_URL } from "../../routes/utilites.jsx";

const RoomModal = () => {
  const dispatch = useDispatch();
  const { selectedRoom: room, modalOpen, loading, error } = useSelector((s) => s.rooms);
  const [sliderOpen, setSliderOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!modalOpen) return null;
  if (loading) return <Loader />;
  if (error) return <ErrorMessage message={error} />;

  const images = room.images?.length > 0 ? room.images : ["/assets/room1.jpg"];

  const handlePrev = () => setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  const handleNext = () => setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  const handleImageClick = (idx) => { setCurrentIndex(idx); setSliderOpen(true); };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/70 z-[999]"
        onClick={() => dispatch(closeRoomModal())}
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-[1000] p-4">
        <div
          className="bg-white text-text-dark rounded-xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto p-6 relative border flex flex-col gap-4"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="absolute top-2 right-2 text-xl font-bold"
            onClick={() => dispatch(closeRoomModal())}
          >
            ✕
          </button>

          <h3 className="text-2xl font-bold mb-2">{room.type} - ₹{room.price}/night</h3>

          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div
              className="md:w-3/5 h-64 md:h-80 cursor-pointer rounded overflow-hidden"
              onClick={() => handleImageClick(0)}
            >
              <img
                src={images[0].startsWith("http") ? images[0] : `${BASE_URL}/upload/${images[0]}`}
                alt={`${room.type}-0`}
                className="w-full h-full object-cover rounded"
              />
            </div>
            <div className="md:w-2/5 grid grid-cols-2 grid-rows-2 gap-2 h-64 md:h-80">
              {images.slice(1, 5).map((img, idx) => (
                <img
                  key={idx + 1}
                  src={img.startsWith("http") ? img : `${BASE_URL}/upload/${img}`}
                  alt={`${room.type}-${idx + 1}`}
                  className="w-full h-full object-cover rounded cursor-pointer"
                  onClick={() => handleImageClick(idx + 1)}
                />
              ))}
            </div>
          </div>

          {room.description && <p className="text-gray-700 mb-2">{room.description}</p>}

          <div className="flex flex-wrap gap-4 text-sm text-text-dark">
            <span>👥 Max Guests: {room.capacity}</span>
            {room.services?.wifi && <span>📶 Wifi</span>}
            {room.services?.breakfast && <span>🥐 Breakfast</span>}
            {room.services?.ac && <span>❄️ AC</span>}
            {room.services?.tv && <span>📺 TV</span>}
            {room.services?.lunch > 0 && <span>🍱 Lunch: ₹{room.services.lunch}</span>}
            {room.services?.dinner > 0 && <span>🍽 Dinner: ₹{room.services.dinner}</span>}
          </div>
        </div>
      </div>

      {/* Image Slider */}
      {sliderOpen && (
        <div
          className="fixed inset-0 bg-black/90 z-[1001] flex items-center justify-center p-4"
          onClick={() => setSliderOpen(false)}
        >
          <div
            className="relative max-w-5xl w-full max-h-[90vh] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute left-2 top-1/2 -translate-y-1/2 text-white text-3xl z-50 bg-black/30 rounded-full w-10 h-10 flex items-center justify-center"
              onClick={handlePrev}
            >
              ‹
            </button>
            <img
              src={images[currentIndex].startsWith("http") ? images[currentIndex] : `${BASE_URL}/upload/${images[currentIndex]}`}
              alt={`slide-${currentIndex}`}
              className="max-h-[90vh] object-contain rounded-lg"
            />
            <button
              className="absolute right-2 top-1/2 -translate-y-1/2 text-white text-3xl z-50 bg-black/30 rounded-full w-10 h-10 flex items-center justify-center"
              onClick={handleNext}
            >
              ›
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default RoomModal;
