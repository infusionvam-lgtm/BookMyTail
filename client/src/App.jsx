import { ToastContainer } from "react-toastify";
import { AppRoutes } from "./routes/AppRoutes";
import './App.css';
import './index.css';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";


export default function App() {
  return (
    <>
      <AppRoutes/>
      <ToastContainer 
        position="top-center"   // <-- This centers the toast at the top center
        autoClose={2000}        // Optional: time before toast auto closes
        hideProgressBar={true} // Optional: show/hide progress bar
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        />
    </>
  );
}


