import Stripe from "stripe";

// ===================== CREATE PAYMENT INTENT (GET STRIPE ID) =====================
export const createPaymentIntent = async (req, res) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  try {
    const { amount, currency = "INR" } = req.body;

    // Convert to number safely
    const numericAmount = Number(amount);

    // Validate amount
    if (!numericAmount || numericAmount <= 0 || Number.isNaN(numericAmount)) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    // Create Payment Intent in paise (multiply by 100)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(numericAmount * 100),
      currency,
      payment_method_types: ["card"],
    });

    res.status(200).json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    res.status(500).json({
      message: "Stripe Payment failed",
      error: error.message,
    });
  }
};
