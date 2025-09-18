import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { MdEdit } from "react-icons/md";
import defaultAvatar from "../../assets/react.svg";
import { BASE_URL } from "../../routes/utilites.jsx";
import { deleteProfile } from "../../redux/role/authSlice.js";
import { updateUserProfile } from "../../redux/role/profileSlice.js";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";

const ProfileCard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status } = useSelector(state => state.auth);
  const { user, profile } = useSelector(state => state.profile);

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm({ mode: "onBlur" });
  const [previewAvatar, setPreviewAvatar] = useState(defaultAvatar);

  // Prefill form with Redux data
  useEffect(() => {
    if (user) {
      setValue("name", user.name);
      setValue("email", user.email);
    }
    if (profile) {
      setValue("phone", profile.phone || "");
      setValue("age", profile.age || "");
      setValue("gender", profile.gender || "");
      setValue("dob", profile.dob ? profile.dob.split("T")[0] : "");
      setPreviewAvatar(profile.avatar ? `${BASE_URL}/upload/${profile.avatar}` : defaultAvatar);
    }
  }, [user, profile, setValue]);

  // Avatar preview
  const watchAvatar = watch("avatar");
  useEffect(() => {
    if (watchAvatar && watchAvatar[0]) {
      const url = URL.createObjectURL(watchAvatar[0]);
      setPreviewAvatar(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [watchAvatar]);

  // Submit profile update
  const submitHandler = async (data) => {
    const formData = new FormData();
    ["name", "email", "phone", "age", "gender", "dob"].forEach(key => formData.append(key, data[key] || ""));
    if (data.avatar?.[0]) formData.append("avatar", data.avatar[0]);

    dispatch(updateUserProfile(formData))
      .unwrap()
      .then(updatedUser => {
        toast.success("Profile updated successfully");
        reset({
          name: updatedUser.name,
          email: updatedUser.email,
          phone: updatedUser.profile?.phone || "",
          age: updatedUser.profile?.age || "",
          gender: updatedUser.profile?.gender || "",
          dob: updatedUser.profile?.dob?.split("T")[0] || "",
          avatar: null
        });
        setPreviewAvatar(updatedUser.profile?.avatar ? `${BASE_URL}/upload/${updatedUser.profile.avatar}` : defaultAvatar);
      })
      .catch(err => toast.error(err.response?.data?.message || "Something went wrong!"));
  };

  // Delete account
  const handleDelete = async () => {
    const confirmDelete = window.confirm("Are you sure you want to delete your account? This action cannot be undone.");
    if (!confirmDelete) return;

    const result = await dispatch(deleteProfile());
    if (deleteProfile.fulfilled.match(result)) {
      alert("Your account has been deleted successfully.");
      navigate("/"); // redirect to home
    } else {
      alert(result.payload || "Failed to delete account");
    }
  };

  return (
    <div className="bg-text-dark/90 rounded-lg p-6 shadow-lg flex flex-col items-center w-full">
      <div className="relative">
        <img src={previewAvatar} alt="Avatar" className="w-32 h-32 rounded-full border-2 border-gold-primary object-cover" />
        <label htmlFor="avatarInput" className="absolute bottom-0 right-0 bg-blue-600 p-1 rounded-full cursor-pointer hover:bg-blue-700">
          <MdEdit size={18} />
        </label>
        <input type="file" {...register("avatar")} id="avatarInput" className="hidden" />
      </div>

      <h2 className="mt-4 font-bold text-xl">{user?.name}</h2>
      <p className="text-gray-300">{user?.email}</p>

      <form onSubmit={handleSubmit(submitHandler)} className="mt-4 w-full space-y-2">
        <input type="text" placeholder="Name" {...register("name")} className="w-full p-2 rounded bg-text-light/30 text-white border border-gray-600" />
        {errors.name && <p className="text-red-400 text-sm">{errors.name.message}</p>}

        <input type="text" placeholder="Phone" {...register("phone")} className="w-full p-2 rounded bg-text-light/30 text-white border border-gray-600" />
        <input type="number" placeholder="Age" {...register("age")} className="w-full p-2 rounded bg-text-light/30 text-white border border-gray-600" />
        <select {...register("gender")} className="w-full p-2 rounded bg-text-light/30 text-white border border-gray-600">
          <option value="">Select Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>
        <input type="date" {...register("dob")} className="w-full p-2 rounded bg-text-light/30 text-white border border-gray-600" />

        <button type="submit" className="w-full btn-primary p-2 rounded mt-2 font-bold">Update Profile</button>
        <button onClick={handleDelete} className="w-full mt-4 p-2 rounded bg-red-600 hover:bg-red-700 font-bold text-white">
          {status === "loading" ? "Deleting..." : "Delete Profile"}
        </button>
      </form>
    </div>
  );
};

export default ProfileCard;
