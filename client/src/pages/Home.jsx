import bg from "../assets/bg.png";
import HeroSection from "../components/user/HeroSection.jsx";
import RoomSlider from "../components/slider/RoomSlider.jsx";
import ReviewSlider from "../components/slider/ReviewSlider.jsx";
import RoomModal from "../components/rooms/RoomModal.jsx";
import HotelLocationMap from "../components/user/HotelLocationMap.jsx";

export default function Home() {
  return (
    <>
      <div
        className="pt-[120px] md:p-6 text-center min-h-screen flex items-center  justify-center bg-cover bg-center overflow-hidden"
        style={{ backgroundImage: `url(${bg})` }}
      >
        <div className="container">
          <h1 className="main-title font-bold text-6xl md:text-normal">
            Welcome to Opulent Hotel
          </h1>
          <p className="section-para my-4 text-lg md:text-normal">
            Book your perfect stay with us.
          </p>
          <HeroSection />
        </div>
      </div>

      <RoomSlider />
      <div className="border">
          <ReviewSlider />
      </div>

      <HotelLocationMap hotelId={1} />
      <RoomModal />
    </>
  );
}
