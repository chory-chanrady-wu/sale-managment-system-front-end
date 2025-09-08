import React from "react";

export default function FormContainer({ title, children }) {
  return (
    <div className=" w-full ">
      {title && (
        <h2 className="text-2xl font-bold mb-4 text-center sm:text-left">
          {title}
        </h2>
      )}
      <div className="bg-white shadow rounded-lg p-4 sm:p-6 lg:p-8 overflow-x-auto">
        {children}
      </div>
    </div>
  );
}
