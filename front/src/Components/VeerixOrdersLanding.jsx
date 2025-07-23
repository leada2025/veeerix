import React from "react";
import { useNavigate } from "react-router-dom";
import veerixLogo from "../assets/v_logo.png";
import fishmanLogo from "../assets/FISHMAN BUSINESS SOLUTIONS.jpeg";
import veerixIcon from "../assets/fishman1.png";
import { useSource } from "../Context/SourceContext";

const VeerixOrdersLanding = () => {
  const navigate = useNavigate();
const { setSource } = useSource();


  const cards = [
   {
    title: "Veerix Order Management",
    description: "Manage your brand & orders",
    image: veerixLogo,
    onClick: () => {
      setSource("veerix");
      navigate("/login");
    },
    bg: "bg-white",
    textColor: "text-[#d1383a]",
  },
    {
      title: "Fishman Business Solutions",
      description: "Trademark, compliance, and legal solutions.",
      image: fishmanLogo,
      onClick: () => {setSource("fishman");
     navigate("/login")},
      bg: "bg-[#7b4159]",
      textColor: "text-white",
    },
    {
      title: "Visit Fishmanb2b",
      description: "Explore our product range and story",
      image: veerixIcon,
      onClick: () => window.open("https://orders.fishmanb2b.in/distributor-signup", "_blank"),
      bg: "bg-[#e6f7f7]",
      textColor: "text-[#0f5d5d]",
    },
  ];

  return (
    <div className="min-h-screen bg-[#f9fafb] flex items-center justify-center p-4">
      <div className="text-center w-full max-w-5xl">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-[#d1383a]">Welcome to Veerix Orders</h1>
          <p className="text-gray-600 mt-2">Choose your workflow to get started</p>
        </div>

       <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
  {cards.map((card, index) => (
    <div
      key={index}
      onClick={card.onClick}
      className={`${card.bg} ${card.textColor} border cursor-pointer rounded-xl p-4 flex flex-col items-center justify-between text-center hover:shadow-lg transform transition-transform hover:scale-105 h-[180px]`}
    >
      {/* Bigger Image Section */}
      <div className="flex justify-center items-center h-[300px] mb-2">
        <img
          src={card.image}
          alt={card.title}
          className="max-h-full max-w-[200px] object-contain"
        />
      </div>

      {/* Title & Description */}
      <div>
        <h2 className="text-lg font-semibold">{card.title}</h2>
        <p className="text-xs mt-1">{card.description}</p>
      </div>
    </div>
  ))}
</div>

      </div>
    </div>
  );
};

export default VeerixOrdersLanding;
