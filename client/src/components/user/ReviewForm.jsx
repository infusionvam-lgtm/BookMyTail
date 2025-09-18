import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createReview, resetReviewState } from "../../redux/reviewSlice.js";
import { toast } from "react-toastify";

const ReviewForm = () => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const dispatch = useDispatch();
  const { loading, success, error } = useSelector(state => state.reviews);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      toast.error("Comment is required!");
      return;
    }
    dispatch(createReview({ rating, comment }));
  };

  useEffect(() => {
    if (success) {
      toast.success("Review submitted successfully 🎉");
      setRating(5);
      setComment("");
      dispatch(resetReviewState());
    }
    if (error) {
      toast.error(error);
      dispatch(resetReviewState());
    }
  }, [success, error, dispatch]);

  return (
    <div className="bg-text-dark/90 rounded-lg p-6 shadow-lg mt-6 w-full">
      <h2 className="text-2xl font-bold mb-4 text-center">Leave a Review</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-2 font-medium">Rating</label>
          <select
            value={rating}
            onChange={e => setRating(Number(e.target.value))}
            className="w-full p-2 rounded bg-text-light/30 text-white border border-gray-600"
          >
            {[1, 2, 3, 4, 5].map(num => (
              <option key={num} value={num} className="text-text-dark">
                {num} Star{num > 1 ? "s" : ""}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-2 font-medium">Comment</label>
          <textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            className="w-full p-2 rounded bg-text-light/30 text-white border border-gray-600"
            rows="4"
            placeholder="Write your review here..."
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full btn-primary p-2 rounded font-bold transition"
        >
          {loading ? "Submitting..." : "Submit Review"}
        </button>
      </form>
    </div>
  );
};

export default ReviewForm;
