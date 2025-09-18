import React, { useState, useEffect } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import api from "../../redux/api.js";
import { BASE_URL } from "../../routes/utilites.jsx";
import defaultAvatar from "../../assets/react.svg";
import { FaStar, FaRegStar } from "react-icons/fa";
import Loader from "../support/Loader.jsx";
import ErrorMessage from "../support/ErrorMessage.jsx";

const ReviewSlider = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await api.get(`${BASE_URL}/reviews`);
        setReviews(res.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load reviews. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, []);

  if (loading) return <Loader />;
  if (error) return <ErrorMessage message={error} />;
  if (!reviews || reviews.length === 0)
    return <p className="text-center text-white py-12">No reviews available.</p>;

  const settings = {
    dots: true,
    infinite: true,
    speed: 800,
    slidesToShow: Math.min(reviews.length, 3),
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    arrows: false,
    responsive: [
      {
        breakpoint: 1024, // tablet
        settings: {
          slidesToShow: Math.min(reviews.length, 2),
        },
      },
      {
        breakpoint: 640, // mobile
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };

  const renderStars = (rating) =>
    Array.from({ length: 5 }, (_, i) =>
      i < rating ? (
        <FaStar key={i} className="text-yellow-400 inline" />
      ) : (
        <FaRegStar key={i} className="text-gray-400 inline" />
      )
    );

  return (
    <div className="container text-center px-4 sm:px-6 md:px-12 py-12  pb-15">
      <div className="text-text-light mb-8">
        <h2 className="section-title mb-2 ">What Our Guests Say</h2>
        <p className="text-sm md:text-base">Real experiences from our valued guests 🌟</p>
      </div>

      <Slider key={reviews.length} {...settings}>
        {reviews.map((review) => {
          const isExpanded = expanded[review._id];
          const shortText =
            review.comment.length > 100 && !isExpanded
              ? review.comment.slice(0, 100)
              : review.comment;

          return (
            <div key={review._id} className="px-2 sm:px-3 hover:scale-105">
              <div className="bg-text-dark/50 text-white p-6 rounded-2xl shadow-lg flex flex-col items-center transition-transform duration-300 hover:scale-95 min-h-[220px] md:min-h-[270px]">
                <img
                  src={review.avatar ? `${BASE_URL}/upload/${review.avatar}` : defaultAvatar}
                  alt={review.name || "Guest"}
                  className="w-20 h-20 rounded-full border-2 border-gold-primary object-cover mb-3"
                />
                <h3 className="text-gold-primary text-lg">{review.name || "Anonymous"}</h3>
                <div className="flex gap-1 my-2">{renderStars(review.rating)}</div>
                <p className="text-gray-300 italic text-sm mt-2 text-center">
                  "{shortText}
                  {review.comment.length > 100 && (
                    <span
                      onClick={() =>
                        setExpanded((prev) => ({
                          ...prev,
                          [review._id]: !isExpanded,
                        }))
                      }
                      className="text-yellow-400 font-semibold cursor-pointer ml-1 hover:underline"
                    >
                      {isExpanded ? "Read less" : "...Read more"}
                    </span>
                  )}
                  "
                </p>
              </div>
            </div>
          );
        })}
      </Slider>
    </div>
  );
};

export default ReviewSlider;
