// HotelLocationMap.jsx
import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const hotelIcon = new L.Icon({
  iconUrl: "/hotel-icon.png",
  iconSize: [35, 35],
  iconAnchor: [17, 35],
  popupAnchor: [0, -35],
});

const mockHotelData = {
  1: {
    lat: 23.0338739,
    lng: 72.504656,
    name: "Opulent Hotel",
    address: "Opulent Hotel, Sindhubhavan, Ahmedabad",
  },
  2: {
    lat: 23.0338739,
    lng: 72.504656,
    name: "NYC Hotel",
    address: "456 Broadway, New York, USA",
  },
};

const HotelLocationMap= ({ hotelId }) => {
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setHotel(mockHotelData[hotelId] || null);
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [hotelId]);

  if (loading) return <p className="text-gray-500">Loading hotel map...</p>;
  if (!hotel) return <p className="text-red-500">No hotel data available.</p>;

  return (
    <div className="container my-4 px-2 md:px-4 lg:px-8 z-0">
      <h3 className="mb-4 section-title text-center">
        Location on Map
      </h3>
      <div className="w-full h-64 sm:h-80 md:h-96 lg:h-[500px] rounded-lg overflow-hidden shadow-md">
        <MapContainer
          center={[hotel.lat, hotel.lng]}
          zoom={16}
          style={{ height: "100%", width: "100%" }}
          scrollWheelZoom={false}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <Marker position={[hotel.lat, hotel.lng]} icon={hotelIcon}>
            <Popup>
              <strong>{hotel.name}</strong>
              <br />
              {hotel.address}
            </Popup>
          </Marker>   
        </MapContainer>
      </div>
      <p className="mt-3 text-text-light">{hotel.address}</p>
    </div>
  );
};

export default HotelLocationMap;
