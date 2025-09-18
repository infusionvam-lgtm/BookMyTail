import React from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { updateFilterField } from "../../redux/room/roomsSlice.js";
import Loader from "../support/Loader.jsx";
import ErrorMessage from "../support/ErrorMessage.jsx";

const RoomFilters = ({
  showSelectedOnly,
  setShowSelectedOnly,
  resetFilters,
  loading, // <-- passed from parent
  error,   // <-- passed from parent
}) => {
  const dispatch = useDispatch();
  const { checkIn, checkOut, guests, price } = useSelector((s) => s.rooms);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: { checkIn, checkOut, guests: guests || 1, price },
  });

  const onSubmit = (data) => {
    const today = new Date().setHours(0, 0, 0, 0);
    const checkInDate = new Date(data.checkIn).setHours(0, 0, 0, 0);
    if (checkInDate < today) {
      alert("Check-In cannot be in the past!");
      return;
    }

    Object.entries(data).forEach(([field, value]) =>
      dispatch(updateFilterField({ field, value }))
    );
  };

  // Show loader or error if provided
  if (loading) return <Loader />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <>
      <h2 className="text-xl font-bold mb-4">Filters</h2>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Check-in & Check-out */}
        <div className="flex flex-col mb-2">
          <div className="w-full">
            <label className="block mb-2">Check-In</label>
            <input
              type="date"
              {...register("checkIn", {
                required: "Check-In required",
                validate: (value) => {
                  const today = new Date().setHours(0, 0, 0, 0);
                  const checkInDate = new Date(value).setHours(0, 0, 0, 0);
                  return checkInDate >= today || "Check-In cannot be past";
                },
              })}
              className="w-full mb-2 p-2 text-black rounded border"
            />
            {errors.checkIn && (
              <p className="text-red-500 text-sm">{errors.checkIn.message}</p>
            )}
          </div>
          <div className="w-full">
            <label className="block mb-2">Check-Out</label>
            <input
              type="date"
              {...register("checkOut", {
                required: "Check-Out required",
                validate: (value) => {
                  const ci = watch("checkIn");
                  if (!ci) return true;
                  return (
                    new Date(value) > new Date(ci) ||
                    "Check-Out must be after Check-In"
                  );
                },
              })}
              className="w-full mb-2 p-2 text-black rounded border"
            />
            {errors.checkOut && (
              <p className="text-red-500 text-sm">{errors.checkOut.message}</p>
            )}
          </div>
        </div>

        {/* Guests */}
        <label className="block mb-2">Guests</label>
        <input
          type="number"
          min="1"
          {...register("guests", {
            required: "Guests required",
            min: { value: 1, message: "At least 1 guest required" },
            valueAsNumber: true,
          })}
          defaultValue={1}
          className="w-full mb-2 p-2 text-black rounded border"
        />
        {errors.guests && (
          <p className="text-red-500 text-sm">{errors.guests.message}</p>
        )}

        {/* Price */}
        <label className="block mb-2">Max Price (₹)</label>
        <input
          type="number"
          {...register("price")}
          className="w-full mb-4 p-2 text-black rounded border"
        />

        <button type="submit" className="btn-primary w-full mb-4">
          Apply Filters
        </button>
      </form>

      {/* Clear + Selected toggle */}
      <button onClick={resetFilters} className="btn-primary w-full">
        Clear Filters
      </button>

      <div className="mt-4">
        <label className="inline-flex items-center gap-2">
          <input
            type="checkbox"
            checked={showSelectedOnly}
            onChange={() => setShowSelectedOnly(!showSelectedOnly)}
          />
          Show Selected Only
        </label>
      </div>
    </>
  );
};

export default RoomFilters;
