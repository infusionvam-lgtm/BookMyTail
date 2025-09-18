import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { saveCart } from "../../redux/cart/cartSlice.js";
import { BiPlus, BiMinus } from "react-icons/bi";
import { BASE_URL } from "../../routes/utilites.jsx";
import Loader from "../support/Loader.jsx";
import fallbackImg from "../../assets/room1.jpg";
import { openRoomModal } from "../../redux/room/roomsSlice.js";

const RoomCard = ({ room }) => {
  const dispatch = useDispatch();
  const cart = useSelector((s) => s.cart.cart);
  const roomsState = useSelector((s) => s.rooms);

  const [meals, setMeals] = useState({ lunch: 0, dinner: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);

  if (!room || !room._id) return null;

  const cartItem = cart?.rooms?.find((r) => (r.roomType?._id || r.roomType) === room._id);
  const count = cartItem?.count || 0;
  const availableLeft = Math.max((room.availableRooms ?? 0) - count, 0);

  useEffect(() => {
    setMeals({ lunch: cartItem?.lunch || 0, dinner: cartItem?.dinner || 0 });
  }, [cartItem]);

  const handleUpdate = (newCount, newMeals = meals) => {
    if (newCount < 0) return;
    let updatedRooms = [];

    if (!cart?.rooms) {
      if (newCount > 0) updatedRooms = [{ roomType: room, count: newCount, ...newMeals }];
    } else {
      const exists = cart.rooms.some((r) => (r.roomType?._id || r.roomType) === room._id);

      if (newCount === 0) updatedRooms = cart.rooms.filter((r) => (r.roomType?._id || r.roomType) !== room._id);
      else if (exists)
        updatedRooms = cart.rooms.map((r) =>
          (r.roomType?._id || r.roomType) === room._id ? { ...r, count: newCount, ...newMeals } : r
        );
      else updatedRooms = [...cart.rooms, { roomType: room, count: newCount, ...newMeals }];
    }

    dispatch(
      saveCart({
        ...(cart || {}),
        rooms: updatedRooms,
        checkInDate: roomsState.checkIn,
        checkOutDate: roomsState.checkOut,
        guests: roomsState.guests,
      })
    );
  };

  const handleMealChange = (e) => {
    const { name, checked } = e.target;
    const newMeals = {
       lunch: name === "lunch" ? checked : meals.lunch,
    dinner: name === "dinner" ? checked : meals.dinner,
    };
    setMeals(newMeals);
     if (count > 0) {
    handleUpdate(count, newMeals);
  }
  };

  const handleOpenModal = () => dispatch(openRoomModal(room));

  const imageUrl = room.images?.[0] ? `${BASE_URL}/upload/${room.images[0]}` : fallbackImg;

  return (
    <div className="border-1 border-gold-primary p-4 rounded shadow flex flex-col min-h-full bg-text-dark/60">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold pb-1">{room.type}</h2>
        <p className="text-sm">₹{room.price} / night</p>
      </div>

      <div
        className="relative mt-2 w-full h-40 overflow-hidden rounded pb-2 cursor-pointer flex items-center justify-center"
        onClick={handleOpenModal}
      >
        {!imageLoaded && <Loader />}
        <img
          src={imageUrl}
          alt={room.type}
          className={`w-full h-full object-cover rounded ${imageLoaded ? "block" : "hidden"}`}
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageLoaded(true)}
        />
      </div>

      <div className="flex items-center justify-between mt-2">
        <p>Max Guests: {room.capacity}</p>
        <p className={availableLeft <= 0 ? "text-red-500" : ""}>Available: {availableLeft}</p>
      </div>

      <div className="mt-2 flex flex-wrap gap-1 text-sm justify-between">
        {room.services?.wifi && <span>📶 Wifi</span>}
        {room.services?.ac && <span>❄️ AC</span>}
        {room.services?.tv && <span>📺 TV</span>}
        {room.services?.breakfast && <span>🥐 Breakfast</span>}
      </div>

      {(room.services?.lunch > 0 || room.services?.dinner > 0) && (
        <div className="mt-2 flex justify-between text-sm">
          {room.services?.lunch && (
            <label>
              <input type="checkbox" name="lunch" checked={meals.lunch > 0} onChange={handleMealChange} /> Lunch ₹{room.services.lunch}
            </label>
          )}
          {room.services?.dinner && (
            <label>
              <input type="checkbox" name="dinner" checked={meals.dinner > 0} onChange={handleMealChange} /> Dinner ₹{room.services.dinner}
            </label>
          )}
        </div>
      )}

      <div className="mt-auto">
        {count > 0 ? (
          <div className="flex items-center justify-between mt-3 border-1 border-gold-primary rounded p-2">
            <button onClick={() => handleUpdate(count - 1)} disabled={count <= 0}><BiMinus /></button>
            <span>{count}</span>
            <button onClick={() => handleUpdate(count + 1)} disabled={count >= room.availableRooms}><BiPlus /></button>
          </div>
        ) : (
          <button onClick={() => handleUpdate(1)} className="btn-primary w-full mt-3" disabled={availableLeft <= 0}>Book Now</button>
        )}
      </div>
    </div>
  );
};

export default RoomCard;
