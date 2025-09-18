import { useSelector } from "react-redux";


import CartList from "../../../components/cart/CartList.jsx";
import CartSummary from "../../../components/cart/CartSummary.jsx";
import Loader from "../../../components/support/Loader.jsx";
import ErrorMessage from "../../../components/support/ErrorMessage.jsx";

const Cart = () => {
  const { loading, error } = useSelector((state) => state.cart);

  if (loading) return <Loader />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="pt-[120px] container mx-auto px-4 flex flex-col-reverse md:flex-row gap-6 text-white">
      {/* Mobile: summary first, desktop: summary second */}
      <div className="w-full md:w-4/6">
        <h2 className="text-lg font-semibold ms-3 mb-4">Booking Cart</h2>
        <div className="flex flex-col items-center justify-center w-full">
          <CartList />
        </div>
      </div>
      <CartSummary className="w-full md:w-2/6" />
    </div>
  );
};

export default Cart;
