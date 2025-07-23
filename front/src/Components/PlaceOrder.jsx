import React, { useState } from "react";

const orderSteps = [
  "Brand Name Submitted",
  "Payment Confirmed",
  "Packing Design",
  "Raw Material",
  "Under Production",
  "Under Packing",
  "Under Testing",
  "Dispatched",
  "In Transit",
  "Received at Distribution Centre",
  "Delivered to Client",
];

const PlaceOrderWithTracking = () => {
  const [brand, setBrand] = useState("");
  const [product, setProduct] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [showTracking, setShowTracking] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setShowTracking(false);
    setCurrentStep(0);
    console.log("New order submitted:", { brand, product, quantity });
  };

  const simulateNextStep = () => {
    if (currentStep < orderSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-6 max-w-7xl mx-auto">
      {/* LEFT: TRACKING LINE */}
      <div className="flex-1 bg-white p-6 rounded-md shadow-md border min-h-[400px] relative">
        <h2 className="text-xl font-semibold text-[#d1383a] mb-4">Order Tracking</h2>

        {!showTracking && submitted && (
          <button
            onClick={() => setShowTracking(true)}
            className="absolute left-6 bottom-6 bg-[#d1383a] text-white px-4 py-2 rounded hover:bg-[#b73030]"
          >
            Show Status
          </button>
        )}

        {showTracking && (
          <>
            <div className="flex items-center justify-between relative mt-6 mb-8">
              {orderSteps.map((step, index) => (
                <div key={index} className="flex-1 text-center z-10">
                  <div
                    className={`w-5 h-5 mx-auto rounded-full ${
                      index <= currentStep ? "bg-[#d1383a]" : "bg-gray-300"
                    }`}
                  />
                  <p
                    className={`text-xs mt-2 ${
                      index <= currentStep ? "text-[#d1383a]" : "text-gray-400"
                    }`}
                  >
                    {step}
                  </p>
                </div>
              ))}
              <div className="absolute top-2 left-2 right-2 h-1 bg-gray-200 z-0" />
              <div
                className="absolute top-2 left-2 h-1 bg-[#d1383a] z-10 transition-all duration-500"
                style={{ width: `${(currentStep / (orderSteps.length - 1)) * 100}%` }}
              />
            </div>

            {/* Simulate Progress */}
            <div className="flex justify-end">
              <button
                onClick={simulateNextStep}
                className="bg-gray-200 text-[#d1383a] px-4 py-2 rounded hover:bg-gray-300"
              >
                Next Step
              </button>
            </div>
          </>
        )}
      </div>

      {/* RIGHT: SMALL FORM */}
      <div className="w-full lg:w-[300px] bg-white p-5 rounded-md shadow-md border h-fit">
        <h3 className="text-lg font-semibold mb-4 text-[#d1383a]">New Order</h3>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="Brand Name"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            required
            className="px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#d1383a]"
          />
          <input
            type="text"
            placeholder="Molecule Name"
            value={product}
            onChange={(e) => setProduct(e.target.value)}
            required
            className="px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#d1383a]"
          />
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#d1383a]"
          />
          <button
            type="submit"
            className="bg-[#d1383a] text-white px-4 py-2 rounded hover:bg-[#b73030] mt-2"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default PlaceOrderWithTracking;
