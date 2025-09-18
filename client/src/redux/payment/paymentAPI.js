import api from "../api";

// Step 1: Create Stripe Payment Intent
export const createPaymentIntentAPI = async(amount) => {
    const {data} = await api.post("/payments/create-intent",{amount}, {withCredentials: true})
    return data // { clientSecret: "..." }
} 

