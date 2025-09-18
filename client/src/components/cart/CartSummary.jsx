import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { saveCart, clearCartReducer, selectCartTotals } from "../../redux/cart/cartSlice.js";
import { useNavigate } from "react-router-dom";
import { MdDelete } from "react-icons/md";


const CartSummary = () => {
  const dispatch = useDispatch();
  const { cart } = useSelector(state => state.cart);
  const totals = useSelector(selectCartTotals);
  const { profile } = useSelector(state => state.profile);
  const navigate = useNavigate();

  if (!cart) return null;

  const phoneNumber = profile?.phone?.trim() || cart?.mobileNum?.trim();

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

  const handleCheckout = () => {
    if (!phoneNumber) {
      alert("Please add your mobile number before checkout.");
      navigate("/user-dashboard");
      return;
    }

    if (!cart?.rooms?.length || !cart.checkInDate || !cart.checkOutDate || !totals.totalGuests) {
      alert("Please add your booking details before checkout.");
      navigate("/rooms");
      return;
    }

    navigate("/bookings", { state: { cart, totals } });
  };

  return (
    <div className="w-full md:w-2/6 m-0 md:m-6 bg-text-dark/90 text-white p-4 rounded-lg md:sticky md:top-[150px] h-fit">
      <div className="flex items-center justify-between text-center mb-4">
        <h2 className="text-lg font-semibold">Cart Summary</h2>
        <button onClick={() => dispatch(clearCartReducer())}><MdDelete color="red" size="24px" /></button>
      </div>

      {phoneNumber ? (
        <p><strong>Mobile No.:</strong> {phoneNumber}</p>
      ) : (
        <p>No mobile number.{" "}
          <button onClick={() => navigate("/user-dashboard")} className="text-blue-600 underline">Add now</button>
        </p>
      )}

      <div className="flex items-center justify-between my-2">
        {cart.checkInDate && <p><strong>Check-In:</strong> {new Date(cart.checkInDate).toLocaleDateString()}</p>}
        {cart.checkOutDate && <p><strong>Check-Out:</strong> {new Date(cart.checkOutDate).toLocaleDateString()}</p>}
      </div>

      <p><strong>Total Guests:</strong> {totals.totalGuests}</p>
      <p><strong>Total Rooms:</strong> {totals.totalRooms}</p>

      <div className="mt-4 border-t border-gray-700 pt-2 space-y-1">
        <h3 className="font-semibold mb-2">Room Details:</h3>
        {cart.rooms.map((r) => (
          <div key={r.roomType._id} className="flex justify-between items-center mb-1">
            <div>{r.roomType.type} x {r.count} room{r.count > 1 ? "s" : ""}</div>
            <div className="flex gap-2">
              {r.roomType.services?.lunch > 0 && (
                <label>
                  Lunch:
                  <input
                    type="checkbox"
                    checked={r.lunch > 0}
                    className="ml-1"
                    onChange={(e) => handleUpdateRoom(r.roomType._id, r.count, e.target.checked ? r.roomType.services?.lunch : 0, r.dinner)}
                  />
                </label>
              )}
              {r.roomType.services?.dinner > 0 && (
                <label>
                  Dinner:
                  <input
                    type="checkbox"
                    checked={r.dinner > 0}
                    className="ml-1"
                    onChange={(e) => handleUpdateRoom(r.roomType._id, r.count, r.lunch, e.target.checked ? r.roomType.services?.dinner : 0)}
                  />
                </label>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 border-t border-gray-700 pt-2 space-y-1">
        <p><strong>Subtotal:</strong> ₹{totals.totalPrice}</p>
        <p><strong>GST:</strong> ₹{totals.gst}</p>
        <p><strong>Grand Total:</strong> ₹{totals.grandTotal}</p>
      </div>

      <button onClick={handleCheckout} className="btn-primary flex justify-center w-full mt-4">Check Out</button>
    </div>
  );
};

export default CartSummary;
