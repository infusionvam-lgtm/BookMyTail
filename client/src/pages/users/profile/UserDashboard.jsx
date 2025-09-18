import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import ProfileCard from "../../../components/user/ProfileCard.jsx";
import BookingsSection from "../../../components/user/BookingsSection.jsx";
import ReviewForm from "../../../components/user/ReviewForm.jsx";
import { fetchUserProfile } from "../../../redux/role/profileSlice.js";

const UserDashboard = () => {
  const dispatch = useDispatch();
  const { loading, error } = useSelector(state => state.profile);

  // Fetch user profile on mount
  useEffect(() => {
    dispatch(fetchUserProfile());
  }, [dispatch]);

  if (loading) return <p className="text-center mt-20 text-white">Loading...</p>;
  if (error) return <p className="text-center mt-20 text-red-400">{error}</p>;

  return (
    <div className="min-h-screen pt-[120px] px-4 text-white container mx-auto flex flex-col md:flex-row gap-6">
      <div className="md:w-1/4 flex flex-col items-center">
        <ProfileCard />    {/* Uses Redux state internally */}
        <ReviewForm />     {/* Uses Redux state internally */}
      </div>
      <BookingsSection />  {/* Uses Redux state internally */}
    </div>
  );
};

export default UserDashboard;
