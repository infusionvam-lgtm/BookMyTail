import React from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setFilters } from "../../redux/room/roomsSlice.js";

const HeroSection = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const today = new Date().toISOString().split("T")[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    defaultValues: {
      checkIn: today,
      checkOut: tomorrow,
      guests: 1,
    },
  });

  const checkInValue = watch("checkIn");
  const onSubmit = (data) => {
    dispatch(setFilters(data));
    navigate(
      `/rooms?checkIn=${data.checkIn}&checkOut=${data.checkOut}&guests=${data.guests}`
    );
  };
  return (
    <>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white/70 mt-8 p-1 rounded-xl items-center m-8 md:max-w-[800px] md:mx-auto"
      >
        <div className="bg-none text-black flex flex-col gap-4 border-2 rounded-xl border-gold-black p-6 pb-7 lg:flex-row lg:items-end lg:justify-between">
          {/* Check-in & Check-out container */}
          <div className="flex flex-col gap-4 w-full md:flex-row md:gap-6">
            {/* Check-in */}
            <div className="flex flex-col items-start relative flex-1">
              <label>Check in</label>
              <input
                type="date"
                {...register("checkIn", {
                  required: "Check-in date is required",
                  validate: (value) =>
                    new Date(value) >=
                      new Date(new Date().setHours(0, 0, 0, 0)) ||
                    "Check-in date cannot be in the past",
                })}
                className="border p-2 rounded font-bold w-full"
              />
              {errors.checkIn && (
                <span className="text-red-500 w-max text-sm absolute bottom-[-25px]">
                  {errors.checkIn.message}
                </span>
              )}
            </div>

            {/* Check-out */}
            <div className="flex flex-col items-start relative flex-1">
              <label>Check out</label>
              <input
                type="date"
                {...register("checkOut", {
                  required: "Check-out date is required",
                  validate: (value) =>
                    !checkInValue ||
                    new Date(value) > new Date(checkInValue) ||
                    "Check-out must be after check-in",
                })}
                className="border p-2 rounded font-bold w-full"
              />
              {errors.checkOut && (
                <span className="text-red-500 w-max text-sm absolute bottom-[-25px]">
                  {errors.checkOut.message}
                </span>
              )}
            </div>
          </div>

          {/* Guests */}
          <div className="flex flex-col items-start relative w-full md:w-auto">
            <label>Guests</label>
            <input
              type="number"
              min="1"
              {...register("guests", {
                required: true,
                min: { value: 1, message: "Minimum 1 guest" },
              })}
              className="border p-2 rounded font-bold w-full md:w-auto"
            />
            {errors.guests && (
              <span className="text-red-500 absolute bottom-[-25px]">
                {errors.guests.message}
              </span>
            )}
          </div>

          {/* Search Button */}
          <button
            type="submit"
            className="btn-primary px-5 py-2 rounded w-full md:w-auto mt-2 md:mt-0"
          >
            Search
          </button>
        </div>
      </form>
    </>
  );
};

export default HeroSection;
