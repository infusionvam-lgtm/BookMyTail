import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { saveCart, clearCartReducer } from "../../redux/cart/cartSlice.js";
import { MdDelete } from "react-icons/md";
import { BiPlus, BiMinus } from "react-icons/bi";
import { LuCirclePlus } from "react-icons/lu";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../../routes/utilites.jsx";
import bg from "../../assets/room1.jpg";

const CartItem = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { cart } = useSelector(state => state.cart);

  const handleUpdateRoom = (roomId, newCount, lunch = null, dinner = null) => {
    if (!cart) return;

    const updatedRooms = cart.rooms
      .map(r => {
        const id = r.roomType?._id ? r.roomType._id.toString() : r.roomType.toString();
        if (id === roomId) {
          return {
            ...r,
            count: newCount,
            lunch: lunch !== null ? lunch : r.lunch,
            dinner: dinner !== null ? dinner : r.dinner,
          };
        }
        return r;
      })
      .filter(r => r.count > 0);

    if (updatedRooms.length === 0) {
      dispatch(saveCart({ rooms: [], checkInDate: null, checkOutDate: null, guests: 0, mobileNum: "" }));
      dispatch(clearCartReducer());
    } else {
      dispatch(saveCart({ ...cart, rooms: updatedRooms }));
    }
  };

  const handleRemoveRoom = (roomId) => {
    if (!cart) return;

    const updatedRooms = cart.rooms.filter(r => {
      const id = r.roomType?._id ? r.roomType._id.toString() : r.roomType.toString();
      return id !== roomId;
    });

    if (updatedRooms.length === 0) {
      dispatch(saveCart({ rooms: [], checkInDate: null, checkOutDate: null, guests: 0, mobileNum: "" }));
      dispatch(clearCartReducer());
    } else {
      dispatch(saveCart({ ...cart, rooms: updatedRooms }));
    }
  };

  return (
    
<ul className="w-full contaier">
  {(!cart || !cart.rooms?.length) ? (
    <div className="border rounded-lg text-center p-6">
      <p>No rooms in cart</p>
      <button
        className="btn-primary rounded-full p-2 mt-3"
        onClick={() => navigate("/rooms")}
      >
        <LuCirclePlus size={29} />
      </button>
    </div>
  ) : (
    cart.rooms.map(roomItem => {
      const roomData = roomItem.roomType?._id ? roomItem.roomType : null;
      if (!roomData) return null;

      const lunchPrice = roomData.services?.lunch || 0;
      const dinnerPrice = roomData.services?.dinner || 0;
      const roomId = roomData._id.toString();

      return (
        <li
          key={roomId}
          className="relative flex flex-col md:flex-row justify-between items-start md:items-center border rounded-lg p-3 m-3 mb-5"
        >
          <div className="flex gap-4 items-center w-full md:w-auto">
            <div className="w-24 h-24 flex-shrink-0">
              <img
                src={roomData?.images?.[0] ? `${BASE_URL}/upload/${roomData.images[0]}` : bg}
                alt={roomData?.type}
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
            <div>
              <h3>{roomData?.type}</h3>
              <p>Max Guests: {roomData?.capacity}</p>
              <p>Room Price: ₹{roomData.price}</p>

              <div className="flex flex-col gap-4 mt-2 md:flex-row md:m-0 p-0">
                {lunchPrice > 0 && (
                  <label className="flex items-center gap-1">
                    <input
                      type="checkbox"
                      checked={roomItem.lunch > 0}
                      onChange={(e) =>
                        handleUpdateRoom(
                          roomId,
                          roomItem.count,
                          e.target.checked,
                          roomItem.dinner
                        )
                      }
                    />
                    Lunch (₹{lunchPrice})
                  </label>
                )}

                {dinnerPrice > 0 && (
                  <label className="flex items-center gap-1">
                    <input
                      type="checkbox"
                      checked={roomItem.dinner > 0}
                      onChange={(e) =>
                        handleUpdateRoom(
                          roomId,
                          roomItem.count,
                          roomItem.lunch,
                          e.target.checked
                        )
                      }
                    />
                    Dinner (₹{dinnerPrice})
                  </label>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-row items-center md:items-center gap-4 mt-2 md:mt-0">
            <div className="flex items-center gap-4 border rounded-xl px-2 py-1">
              <button
                onClick={() =>
                  handleUpdateRoom(roomId, roomItem.count - 1, roomItem.lunch, roomItem.dinner)
                }
                disabled={roomItem.count <= 0}
                className={roomItem.count <= 0 ? "opacity-50" : ""}
              >
                <BiMinus />
              </button>
              <span className="border-x px-4">{roomItem.count}</span>
              <button
                onClick={() =>
                  handleUpdateRoom(roomId, roomItem.count + 1, roomItem.lunch, roomItem.dinner)
                }
                className={roomItem.count >= roomData.availableRooms ? "opacity-50" : ""}
              >
                <BiPlus />
              </button>
            </div>

            <button onClick={() => handleRemoveRoom(roomId)}>
              <MdDelete color="red" size="24px" />
            </button>
          </div>
        </li>
      );
    })
  )}
</ul>

  );
};

export default CartItem;
