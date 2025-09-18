import React from "react";

const ErrorMessage = ({ message }) => {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="text-center text-red-500 text-yellow-400">
        <h1 className="text-6xl pb-2">404</h1>
        <p className="text-lg font-semibold">
          {message || "Something went wrong."}
        </p>
      </div>
    </div>
  );
};

export default ErrorMessage;
