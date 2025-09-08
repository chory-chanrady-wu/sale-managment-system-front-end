// components/Toast.js
import React, { useEffect } from "react";

export default function Toast({ show, message, type, onClose }) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(onClose, 2000); // auto-hide after 2s
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div className="fixed top-5 left-1/2 transform -translate-x-1/2 z-50">
      <div
        className={`flex items-center px-6 py-4 rounded shadow-lg text-lg font-bold ${
          type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"
        } animate-pop`}
      >
        {type === "success" ? (
          <span className="mr-3 text-2xl">✔️</span>
        ) : (
          <span className="mr-3 text-2xl">❌</span>
        )}
        {message}
      </div>
    </div>
  );
}
