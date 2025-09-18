import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import api from "../../../redux/api.js";
import { toast } from "react-toastify";
import { BASE_URL } from "../../../routes/utilites.jsx";


const AdminRoomForm = ({ room, refresh, onClose  }) => {
  const { register, handleSubmit, reset, watch, setValue } = useForm({
    defaultValues: {
      type: "",
      price: 0,
      capacity: 1,
      totalRooms: 1,
      description: "",
      lunchSelected: false,
      lunchPrice: 0,
      dinnerSelected: false,
      dinnerPrice: 0,
    },
  });

  const [images, setImages] = useState([]);
  const [preview, setPreview] = useState([]);
  const [deletedImages, setDeletedImages] = useState([]);

  useEffect(() => {
    if (room) {
      reset({
        type: room.type,
        price: room.price,
        capacity: room.capacity,
        totalRooms: room.totalRooms,
        description: room.description,
        lunchSelected: room.lunch > 0,
        lunchPrice: room.lunch || 0,
        dinnerSelected: room.dinner > 0,
        dinnerPrice: room.dinner || 0,
      });

      const initialPreview = (room.images || []).map(
        (img) => `${BASE_URL}/upload/${img}`
      );
      setPreview(initialPreview);
      setImages([]);
      setDeletedImages([]);
    } else {
      reset();
      setImages([]);
      setPreview([]);
      setDeletedImages([]);
    }
  }, [room, reset]);

  useEffect(() => {
    if (watch("dinnerSelected")) setValue("lunchSelected", true);
  }, [watch("dinnerSelected"), setValue]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
    const newPreview = files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));
    setPreview((prev) => [
      ...prev.filter((p) => typeof p === "string"),
      ...newPreview,
    ]);
  };

  const onSubmit = async (data) => {
    try {
      const formData = new FormData();
      formData.append("type", data.type);
      formData.append("price", data.price);
      formData.append("capacity", data.capacity);
      formData.append("totalRooms", data.totalRooms);
      formData.append("description", data.description);
      formData.append("services[wifi]", true);
      formData.append("services[breakfast]", true);
      formData.append("services[lunch]", data.lunchSelected ? data.lunchPrice : 0);
      formData.append("services[dinner]", data.dinnerSelected ? data.dinnerPrice : 0);

      images.forEach((img) => formData.append("images", img));
      deletedImages.forEach((img) => formData.append("deletedImages[]", img));

      if (room) {
        await api.put(`/rooms/${room._id}/update`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Room updated successfully!");
      } else {
        await api.post("/rooms/create", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Room created successfully!");
      }

      reset();
      setImages([]);
      setPreview([]);
      setDeletedImages([]);
       if (onClose) onClose();
      if (refresh) refresh();
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong!");
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-white text-text-dark shadow-xl rounded-lg p-6 space-y-4"
    >
      <h2 className="text-2xl font-bold text-gray-800 mb-2">
        {room ? "✏ Edit Room" : "➕ Add Room"}
      </h2>

      <div className="grid grid-cols-2 gap-4">
        <input {...register("type")} placeholder="Room Type" className="border p-2 rounded w-full" />
        <input type="number" {...register("price")} placeholder="Price per night" className="border p-2 rounded w-full" />
        <input type="number" {...register("capacity")} placeholder="Capacity" className="border p-2 rounded w-full" />
        <input type="number" {...register("totalRooms")} placeholder="Total Rooms" min={room?.totalRooms - room?.availableRooms}  className="border p-2 rounded w-full" />
        <small className="text-red-500">
  Cannot reduce below booked rooms: {room?.totalRooms - room?.availableRooms}
</small>
      </div>

      <textarea {...register("description")} placeholder="Description" className="border p-2 rounded w-full" />

      {/* Image Upload */}
      <div>
        <label className="block font-semibold mb-1">Upload Images</label>
        <input type="file" multiple onChange={handleImageChange} className="mb-2" />
        <div className="flex gap-2 flex-wrap">
          {preview.map((img, i) => {
            const src = typeof img === "string" ? img : img.url;
            return (
              <div key={i} className="relative">
                <img src={src} alt="preview" className="w-20 h-20 object-cover rounded border" />
                <button
                  type="button"
                  className="absolute top-0 right-0 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                  onClick={() => {
                    if (typeof img === "string") {
                      const relativePath = img.replace(`${BASE_URL}/upload/rooms/`, "");
                      setDeletedImages((prev) => [...prev, relativePath]);
                    }
                    setPreview((prev) => prev.filter((_, index) => index !== i));
                    setImages((prev) => prev.filter((f) => f !== img.file));
                  }}
                >
                  ×
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Meals */}
      <div className="space-y-2">
        <p className="font-semibold">Meals</p>
        <p>Breakfast: Included ✅</p>

        <label className="flex items-center gap-2">
          <input type="checkbox" {...register("lunchSelected")} />
          Lunch
        </label>
        {watch("lunchSelected") && (
          <input type="number" {...register("lunchPrice")} placeholder="Lunch Price" className="border p-2 rounded w-full" />
        )}

        <label className="flex items-center gap-2">
          <input type="checkbox" {...register("dinnerSelected")} />
          Dinner (auto-adds lunch)
        </label>
        {watch("dinnerSelected") && (
          <input type="number" {...register("dinnerPrice")} placeholder="Dinner Price" className="border p-2 rounded w-full" />
        )}
      </div>

      <button
        type="submit"
        className="w-full py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
      >
        {room ? "Update Room" : "Add Room"}
      </button>
    </form>
  );
};

export default AdminRoomForm;



