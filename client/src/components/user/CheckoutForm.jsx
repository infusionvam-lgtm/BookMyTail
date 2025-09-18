import React, { useState } from "react";
import {
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { useDispatch, useSelector } from "react-redux";
import { GoLock } from "react-icons/go";
import {
  setBookingId,
  clearCartReducer,
  selectCart,
  selectCartTotals,
  selectBookingId,
} from "../../redux/cart/cartSlice.js";
import {
  updateCartBooking,
  confirmBooking,
  loadMyBookings,
} from "../../redux/booking/bookingSlice.js";
import { useNavigate } from "react-router-dom";
import Loader from "../support/Loader.jsx";
import Error from "../support/ErrorMessage.jsx";

const CheckoutForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const stripe = useStripe();
  const elements = useElements();

  // Redux state
  const cart = useSelector(selectCart);
  const totals = useSelector(selectCartTotals);
  const bookingId = useSelector(selectBookingId);
  const { clientSecret, status: paymentStatus, error: paymentErrorState } =
    useSelector((state) => state.payment);
  const { user, profile, status: profileStatus, error: profileError } =
    useSelector((state) => state.profile);

  // Local state for errors
  const [cardNumberError, setCardNumberError] = useState(null);
  const [cardExpiryError, setCardExpiryError] = useState(null);
  const [cardCvcError, setCardCvcError] = useState(null);
  const [localError, setLocalError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const handlePayment = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) return setLocalError("Stripe not loaded yet.");
    if (!clientSecret) return setLocalError("Payment cannot be processed.");

    setIsProcessing(true);
    setLocalError(null);

    try {
      // Create/update pending booking
      let finalBookingId = bookingId;

      if (!finalBookingId) {
        const bookingData = {
          userId: profile._id,
          email: profile.email,
          mobileNum: profile.phone,
          totalGuests: totals.totalGuests,
          rooms: cart.rooms.map((r) => ({
            roomType: r.roomType._id,
            count: r.count,
            image: r.image || null,
            lunch: r.lunch || 0,
            dinner: r.dinner || 0,
          })),
          checkInDate: cart.checkInDate,
          checkOutDate: cart.checkOutDate,
          totalPrice: totals.totalPrice,
          gst: totals.gst,
          grandTotal: totals.grandTotal,
          status: "pending",
          paymentStatus: "unpaid",
        };
        const updatedBooking = await dispatch(updateCartBooking(bookingData)).unwrap();
        finalBookingId = updatedBooking._id;
        dispatch(setBookingId(finalBookingId));
      }

      // Confirm payment
      const cardElement = elements.getElement(CardNumberElement);
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card: cardElement },
      });

      if (result.error) {
        setLocalError(result.error.message);
      } else if (result.paymentIntent.status === "succeeded") {
        await dispatch(
          confirmBooking({
            id: finalBookingId,
            rooms: cart.rooms.map((r) => ({
              roomType: r.roomType._id,
              count: r.count,
              image: r.image,
              lunch: r.lunch || 0,
              dinner: r.dinner || 0,
            })), 
            checkInDate: cart.checkInDate,
            checkOutDate: cart.checkOutDate,
            totalGuests: totals.totalGuests,
            mobileNum: profile.phone,
            email: user.email,
            totalPrice: totals.totalPrice,
            gst: totals.gst,
            grandTotal: totals.grandTotal,
            paymentIntentId: result.paymentIntent.id,
          })
        ).unwrap();

        dispatch(loadMyBookings());
        dispatch(clearCartReducer());
        dispatch(setBookingId(null));
        setPaymentSuccess(true);
        navigate("/mybookings", { replace: true });
      } else {
        setLocalError("Payment was not successful. Please try again.");
      }
    } catch (err) {
      setLocalError(err.message || "Something went wrong.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (paymentStatus === "loading" || profileStatus === "loading") return <Loader />;

  if (paymentErrorState || profileError) return <Error message={paymentErrorState || profileError} />;

  if (paymentSuccess) {
    return (
      <div className="text-center p-6 border rounded shadow">
        <h2 className="text-2xl font-bold mb-2">Booking Confirmed!</h2>
        <p className="mb-4">Thank you for your booking.</p>
        <p className="font-semibold">Total Paid: ₹{totals.grandTotal}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handlePayment} className="space-y-4">
      <div>
        <div className="border p-2 rounded text-text-dark bg-white/60">
          <label className="block mb-1">Card Number</label>
          <CardNumberElement
            className="p-2 text-text-light"
            onChange={(e) => setCardNumberError(e.error ? e.error.message : null)}
          />

        </div>
        {cardNumberError && ( <p className="text-red-500 text-sm mt-1">{cardNumberError}</p>)}
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <div className="border p-2 rounded text-text-dark bg-white/60">
            <label className="block mb-1">Expiry Date</label>
            <CardExpiryElement
              className="p-2"
              onChange={(e) => setCardExpiryError(e.error ? e.error.message : null)}
            />

          </div>
        {cardExpiryError && ( <p className="text-red-500 text-sm mt-1">{cardExpiryError}</p>)}

        </div>
        <div className="flex-1  ">
          <div className="border p-2 rounded text-text-dark bg-white/60">
            <label className="block mb-1">CVC</label>
            <CardCvcElement
              className="p-2"
              onChange={(e) => setCardCvcError(e.error ? e.error.message : null)}
            />

          </div>

          {cardCvcError && ( <p className="text-red-500 text-sm mt-1">{cardCvcError}</p>)}
        </div>
      </div>

      <button
        type="submit"
        disabled={!stripe || isProcessing || !clientSecret}
        className={`btn-primary w-full py-2 flex items-center justify-center gap-4 ${
          !stripe || isProcessing || !clientSecret
            ? "opacity-50 cursor-not-allowed"
            : "hover:opacity-90"
        }`}
      >
        <GoLock />
        {isProcessing ? "Processing..." : `Complete Booking - ₹${totals.grandTotal}`}
      </button>

        {(localError || paymentErrorState) && (
    <p className="text-red-600 text-center text-sm mt-2">
      {localError || paymentErrorState}
    </p>
  )}
    </form>
  );
};

export default CheckoutForm;
