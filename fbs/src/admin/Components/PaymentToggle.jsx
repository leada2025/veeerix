// src/Components/PaymentToggle.jsx
import React from "react";

const PaymentToggle = ({ paid, onChange }) => {
  return (
    <button
      onClick={() => onChange(!paid)}
      className={`px-3 py-1 rounded text-white text-sm ${
        paid ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"
      }`}
    >
      {paid ? "Paid" : "Not Paid"}
    </button>
  );
};

export default PaymentToggle;
