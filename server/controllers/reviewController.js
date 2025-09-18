import Review from "../models/reviewModel.js";
import Profile from "../models/profileModels.js";

// ===================== SINGLE USER CREATE REVIEW =====================
export const createReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    if (!rating || !comment) {
      return res
        .status(400)
        .json({ message: "Rating and comment are required" });
    }

    // Ensure one review per user
    const existing = await Review.findOne({ userId: req.user._id });

    if (existing) {
      existing.rating = rating;
      existing.comment = comment;
      await existing.save();

      return res.json({
        message: "Review updated successfully",
        review: existing,
      });
    }
    const review = await Review.create({
      userId: req.user._id,
      rating,
      comment,
    });

    res.status(201).json({ message: "Review submitted successfully", review });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// ===================== ALL REVIEW FOR FRONTEND =====================
export const getAllReviews = async (req, res) => {
  try {
    // 1) Fetch reviews with user info
    const reviews = await Review.find()
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    // 2) Collect all userIds
    const userIds = reviews.map((r) => r.userId._id);

    // 3) Fetch all profiles at once
    const profiles = await Profile.find({ userId: { $in: userIds } });

    // 4) Build a map for quick lookup
    const profileMap = profiles.reduce((acc, profile) => {
      acc[profile.userId.toString()] = profile.avatar;
      return acc;
    }, {});

    // 5) Attach avatar + name to reviews
    const reviewsWithProfile = reviews.map((r) => ({
      _id: r._id,
      name: r.userId.name,
      email: r.userId.email,
      avatar: profileMap[r.userId._id.toString()] || null,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.createdAt,
    }));

    res.json(reviewsWithProfile);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};


