import React from "react";
import { useSelector } from "react-redux";
import CartItem from "./CartItem.jsx";
import { LuCirclePlus } from "react-icons/lu";
import { useNavigate } from "react-router-dom";

const CartList = () => {
  const { cart } = useSelector(state => state.cart);
  const navigate = useNavigate();

  if (!cart || !cart.rooms?.length) {
    return (
      <>
      <div className="border rounded-lg w-full text-center p-6">
        <p>No rooms in cart</p>
        <button className="btn-primary rounded-full p-2 mt-3" onClick={() => navigate("/rooms")}>
          <LuCirclePlus size={29} />
        </button>

      </div>
      </>
    );
  }

  return (
    <ul className="w-full">
      {cart.rooms.map(roomItem => {
        const roomId = roomItem.roomType?._id ? roomItem.roomType._id.toString() : roomItem.roomType.toString();
        return <CartItem key={roomId} roomItem={roomItem} />;
      })}
    </ul>
  );
};

export default CartList;
