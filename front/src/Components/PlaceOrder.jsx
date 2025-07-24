import React, { useEffect, useState } from "react";
import axios from "../api/Axios";

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
  const [brands, setBrands] = useState([]);
  const [molecules, setMolecules] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedMolecule, setSelectedMolecule] = useState("");
  const [order, setOrder] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState("");


  const user = JSON.parse(localStorage.getItem("user"));
  const customerId = user?.id;

  // Fetch brand and molecule options

useEffect(() => {
  const fetchBrandAndMolecule = async () => {
    try {
      const res = await axios.get(`/orders/options/${customerId}`);
      const { brandName, moleculeName } = res.data;
      setBrands([brandName]);
      setMolecules([moleculeName]);
    } catch (err) {
      console.error("Failed to fetch brand and molecule", err);
    }
  };

  fetchBrandAndMolecule();
}, [customerId]);



  // Fetch latest order
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await axios.get(`/orders/customer/${customerId}`);
        if (res.data.length > 0) {
          setOrder(res.data[0]);
          setCurrentStep(res.data[0].trackingStep || 0);
        }
      } catch (err) {
        console.error("Failed to fetch order", err);
      }
    };

    fetchOrder();
  }, [customerId]);

  const handleSubmit = async () => {
  if (!selectedBrand || !selectedMolecule || !quantity) {
  setError("Please select brand, molecule, and enter quantity.");
  return;
}

    try {
      setError("");
      const res = await axios.post("/orders/from-trademark", {
        customerId,
        brandName: selectedBrand,
        moleculeName: selectedMolecule,
        quantity,
      });
      setOrder(res.data);
      setCurrentStep(0);
    } catch (err) {
      console.error("Order creation failed", err);
      setError(err?.response?.data?.error || "Order creation failed");
    }
  };


  return (
    <div className="flex flex-col lg:flex-row gap-6 p-6 max-w-7xl mx-auto">
      {/* LEFT: Tracking */}
      <div className="flex-1 bg-white p-6 rounded-md shadow-md border min-h-[400px] relative">
        <h2 className="text-xl font-semibold text-[#d1383a] mb-4">Order Tracking</h2>
        {!order ? (
          <p className="text-gray-500">No order placed yet.</p>
        ) : (
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
          </>
        )}
      </div>

      {/* RIGHT: FORM */}
      <div className="w-full lg:w-[300px] bg-white p-5 rounded-md shadow-md border h-fit">
        <h3 className="text-lg font-semibold mb-4 text-[#d1383a]">Place New Order</h3>
        {!order && (
          <>
            <label className="block mb-2 text-sm font-medium text-gray-600">Select Brand</label>
            <select
              className="w-full p-2 mb-4 border rounded"
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
            >
              <option value="">-- Select Brand --</option>
              {brands.map((b, i) => (
                <option key={i} value={b}>{b}</option>
              ))}
            </select>

            <label className="block mb-2 text-sm font-medium text-gray-600">Select Molecule</label>
            <select
              className="w-full p-2 mb-4 border rounded"
              value={selectedMolecule}
              onChange={(e) => setSelectedMolecule(e.target.value)}
            >
              <option value="">-- Select Molecule --</option>
              {molecules.map((m, i) => (
                <option key={i} value={m}>{m}</option>
              ))}
            </select>
            <label className="block mb-2 text-sm font-medium text-gray-600">Quantity</label>
<input
  type="number"
  className="w-full p-2 mb-4 border rounded"
  value={quantity}
  onChange={(e) => setQuantity(e.target.value)}
  placeholder="Enter quantity"
/>

          </>
        )}

        {order && (
          <div className="text-sm mb-4">
            <p><strong>Brand:</strong> {order.brandName}</p>
            <p><strong>Molecule:</strong> {order.moleculeName}</p>
            <p><strong>Quantity:</strong> {order.quantity}</p>
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={!!order}
          className="bg-[#d1383a] text-white px-4 py-2 rounded hover:bg-[#b73030] w-full"
        >
          {order ? "Order Placed" : "Place Order"}
        </button>
        {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
      </div>
    </div>
  );
};

export default PlaceOrderWithTracking;
