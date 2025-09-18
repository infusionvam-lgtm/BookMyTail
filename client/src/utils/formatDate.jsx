export const formatDate = (date) => {
  if (!date) return null;
  return new Intl.DateTimeFormat("en-GB", {
     weekday: "short",
    day: "numeric",
    month: "short",
    // year: "numeric",
  }).format(new Date(date));
};