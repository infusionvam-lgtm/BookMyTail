// components/Loader.jsx
import React from "react";

const Loader = () => {
  return (
    <div className="flex justify-center items-center py-12 min-h-screen">
      <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
};

export default Loader;
