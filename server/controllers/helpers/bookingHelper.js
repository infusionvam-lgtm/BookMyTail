export const calculateTotals = ({ rooms, nights }) => {
  let totalPrice = 0;
  let totalGuests = 0;

  const sanitizedRooms = rooms.map((r) => {
    const roomCount = r.count || 1;
    const roomCapacity = r.roomType?.capacity || 1;

    // Number of guests in this room
    const guestsPerRoom = r.guests || roomCapacity;
    const roomGuestsTotal = guestsPerRoom * roomCount;
    totalGuests += roomGuestsTotal;

    // Room base price
    const roomTotal = (r.roomType?.price || 0) * roomCount * nights;

    // Meals cost (price per guest is stored in r.lunch / r.dinner)
    const lunchCost = r.lunch ? r.lunch * roomGuestsTotal * nights : 0;
    const dinnerCost = r.dinner ? r.dinner * roomGuestsTotal * nights : 0;
    const serviceCost = lunchCost + dinnerCost;

    totalPrice += roomTotal + serviceCost;

    return {
      ...r,
      roomTotal,
      lunchCost,
      dinnerCost,
      serviceCost,
      nights,
      guestsPerRoom,
      roomGuestsTotal,
    };
  });

  const gst = totalPrice * 0.18; // 18% GST
  const grandTotal = totalPrice + gst;

  return { sanitizedRooms, totalGuests, totalPrice, gst, grandTotal };
};
