import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { selectCartTotals } from "../../../redux/cart/cartSlice.js";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import CheckoutForm from "../../../components/user/CheckoutForm.jsx";
import { formatDate } from "../../../utils/formatDate.jsx";
import { createPaymentIntent } from "../../../redux/payment/paymentSlice.js";
import Loader from "../../../components/support/Loader.jsx";
import Error from "../../../components/support/ErrorMessage.jsx";

import { CiCalendar } from "react-icons/ci";
import { IoIosArrowRoundForward } from "react-icons/io";
import { GoPeople } from "react-icons/go";
import { LuPhone } from "react-icons/lu";
import { MdOutlineMailOutline } from "react-icons/md";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_KEY);

const Booking = () => {
  const dispatch = useDispatch();
  const { cart, status: cartStatus, error: cartError } = useSelector((state) => state.cart);
  const totals = useSelector(selectCartTotals);
  const { clientSecret, status: paymentStatus, error: paymentError } = useSelector((state) => state.payment);
  const { user, profile, status: profileStatus, error: profileError } = useSelector((state) => state.profile);



  useEffect(() => {
    if (totals?.grandTotal) {
      dispatch(createPaymentIntent(Number(totals.grandTotal)));
    }
  }, [dispatch, totals]);

  if (cartStatus === "loading" || profileStatus === "loading") return <Loader />;
  if (cartError || profileError) return <Error message={cartError || profileError} />;
  if (!cart || !cart.rooms?.length) return <Error message="No rooms in cart" />;

  return (
    <div className="pt-24 container mx-auto px-4 flex flex-col md:flex-row gap-6">
      {/* Left: Booking Summary */}
      <div className="md:w-2/5 bg-text-dark/90 text-white p-4 rounded-lg">
        <h2 className="text-xl font-bold mb-4">Booking Summary</h2>

        {/* Dates */}
        <div className="flex items-center gap-3">
          <CiCalendar />
          <p>{formatDate(cart.checkInDate)}</p>
          <IoIosArrowRoundForward />
          <p>{formatDate(cart.checkOutDate)}</p>
        </div>

        {/* Contact Info */}
        <p className="flex items-center gap-4 mt-2">
          <LuPhone />
          {profile?.phone || "No mobile number"}
        </p>
        <p className="flex items-center gap-4">
          <MdOutlineMailOutline />  
          {user?.email || "No Email"}
        </p>
        <p className="flex items-center gap-4">
          <GoPeople />
          {totals.totalGuests} Guests
        </p>

        {/* Room Details */}
        <div className="w-full text-left mt-4">
          <h3 className="font-semibold mb-2">Room Details</h3>
          {cart.rooms.map((r) => {
            const basePrice = r.roomType?.price || 0;
            const lunchPrice = r.lunch || 0;
            const dinnerPrice = r.dinner || 0;
            const nights = r.nights || 1;
            const guestsPerRoom = r.roomType?.capacity || 1;
            const roomTotal = basePrice * r.count * nights + (lunchPrice + dinnerPrice) * guestsPerRoom * r.count * nights;

            return (
              <div key={r.roomType?._id || r.id} className="flex flex-col border-b border-gray-700 py-2">
                <div className="flex justify-between">
                  <div>
                    <h4 className="font-semibold">{r.roomType?.type || "Deleted Room"}</h4>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <p>₹{basePrice}</p> × {r.count} room{r.count > 1 ? "s" : ""} × {nights} night{nights > 1 ? "s" : ""}
                    </div>
                  </div>
                  <p className="font-medium">₹{basePrice * r.count * nights}</p>
                </div>

                {lunchPrice > 0 && (
                  <div className="flex justify-between pl-4 text-sm">
                    <p>+ Lunch (₹{lunchPrice} × {r.count} rooms × {guestsPerRoom} guests × {nights} nights)</p>
                    <p>₹{lunchPrice * guestsPerRoom * r.count * nights}</p>
                  </div>
                )}

                {dinnerPrice > 0 && (
                  <div className="flex justify-between pl-4 text-sm">
                    <p>+ Dinner (₹{dinnerPrice} × {r.count} rooms × {guestsPerRoom} guests × {nights} nights)</p>
                    <p>₹{dinnerPrice * guestsPerRoom * r.count * nights}</p>
                  </div>
                )}

                <div className="flex justify-between font-semibold mt-1">
                  <p>Total for this room</p>
                  <p>₹{roomTotal}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Totals */}
        <div className="text-right mt-4 border-b pb-3">
          <div className="flex items-end justify-between">
            <p>Subtotal</p>
            <p>₹{totals.totalPrice}</p>
          </div>
          <div className="flex items-end justify-between">
            <p>GST & Fees</p>
            <p>₹{totals.gst}</p>
          </div>
        </div>
        <div className="flex items-end justify-between pt-3 font-bold text-gold-primary">
          <p>Total</p>
          <p>₹{totals.grandTotal}</p>
        </div>
      </div>
          
      {/* Right: Payment */}
      <div className="md:w-3/5 bg-gray-800 text-white p-4 rounded-lg">
        <h2 className="text-xl font-bold mb-4">Payment</h2>
        {paymentStatus === "loading" ? (
          <Loader />
        ) : paymentError ? (
          <Error message={paymentError} />
        ) : clientSecret ? (
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <CheckoutForm />
          </Elements>
        ) : (
          <Loader />
        )}
      </div>
    </div>
  );
};

export default Booking;
