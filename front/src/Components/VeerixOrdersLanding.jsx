import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import veerixLogo from "../assets/v_logo.png";
import fishmanLogo from "../assets/FISHMAN BUSINESS SOLUTIONS.jpeg";
import veerixIcon from "../assets/fishman1.png";
import { useSource } from "../Context/SourceContext";
import { Settings } from "lucide-react";
import Particles from "@tsparticles/react";

const VeerixOrdersLanding = () => {
  const navigate = useNavigate();
  const { setSource } = useSource();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // New state to track which card index is animating shutter
  const [shutterIndex, setShutterIndex] = useState(null);
  const [activeIndex, setActiveIndex] = useState(null);

  const workflowCards = [
  {
    title: "Veerix Order Management",
    description: "Manage your brand & orders",
    hoverDesc: "Manufacturer",
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
    hoverDesc: "Trademark and Logo",
    image: fishmanLogo,
    onClick: () => {
      setSource("fishman");
      navigate("/login");
    },
    bg: "bg-[#7b4159]",
    textColor: "text-white",
  },
  {
    title: "Visit Fishmanb2b",
    description: "Explore our product range and story",
    hoverDesc: "Purchase",
    image: veerixIcon,
    onClick: () =>
      window.open(
        "https://orders.fishmanb2b.in/distributor-signup",
        "_blank"
      ),
    bg: "bg-[#e6f7f7]",
    textColor: "text-[#0f5d5d]",
  },
];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle click with shutter animation
const handleCardClick = (index, onClick) => {
    if (shutterIndex !== null) return; // prevent multiple clicks during animation
    setShutterIndex(index);
    // mobile overlay toggle
    setActiveIndex(index === activeIndex ? null : index);

    // Wait for shutter animation
    setTimeout(() => {
      onClick();
      setShutterIndex(null);
    }, 700);
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center text-white overflow-hidden">
      {/* Static Red Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#d1383a] via-[#b12f31] to-[#8a2326] -z-20 pointer-events-none"></div>

      {/* Particles Background */}
      <Particles
        className="absolute inset-0 -z-10 pointer-events-none"
        options={{
          fpsLimit: 60,
          particles: {
            number: {
              value: 80,
              density: { enable: true, area: 800 },
            },
            color: { value: "#ffffff" },
            opacity: {
              value: 0.3,
              random: true,
              anim: { enable: true, speed: 1, opacity_min: 0.1, sync: false },
            },
            size: {
              value: 2,
              random: true,
              anim: { enable: false },
            },
            move: {
              enable: true,
              speed: 0.5,
              direction: "none",
              random: true,
              straight: false,
              outModes: "out",
            },
            shape: { type: "circle" },
          },
          detectRetina: true,
          interactivity: {
            detectsOn: "canvas",
            events: {
              onHover: { enable: false },
              onClick: { enable: false },
              resize: true,
            },
          },
        }}
      />

      {/* Settings Icon */}
      <div className="absolute top-5 right-5 z-10" ref={dropdownRef}>
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="p-2 rounded-full hover:bg-white hover:bg-opacity-20 transition"
        >
          <Settings className="h-6 w-6" />
        </button>
        {showDropdown && (
          <div className="absolute right-0 mt-2 w-40 bg-white text-black shadow-lg rounded-md py-2 z-50">
            <button
              onClick={() => {
                setShowDropdown(false);
                navigate("/admin");
              }}
              className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
            >
              Admin
            </button>
          </div>
        )}
      </div>

      {/* Hero Section */}
      <section className="relative z-40 text-center py-16 px-6 max-w-4xl">
        <h1 className="text-4xl font-bold mb-4">We Make Private Label, Made Simple</h1>
        <p className="text-lg">
          Fast. Organized. High-Quality. From healthcare to wellness, Veerix
          Value Link transforms your private label vision into market-ready
          products — faster, smoother, and more profitably than ever before.
        </p>
      </section>

      {/* Why Choose Us */}
      <section className="relative z-10 w-full max-w-6xl px-6 py-10">
        <h2 className="text-2xl font-bold text-center mb-8">
          Why Choose Veerix Value Link?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-gray-700 text-center">
          {[
            {
              title: "Speed to Market",
              desc: "Accelerated timelines without compromising quality.",
            },
            {
              title: "End-to-End Organization",
              desc: "From idea to delivery, every step is structured and transparent.",
            },
            {
              title: "Seamless Communication",
              desc: "One channel, one team, no confusion.",
            },
            {
              title: "Multi-Sector Expertise",
              desc: "Healthcare, Medtech, Pharma, Cosmetics, and Nutraceuticals.",
            },
          ].map((item, i) => (
            <div
              key={i}
              className="bg-white bg-opacity-10 p-6 rounded-xl backdrop-blur-md hover:bg-opacity-20 transition"
            >
              <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
              <p className="text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Our Private Label Solutions */}
      <section className="relative z-10 max-w-5xl px-6 py-10">
        <h2 className="text-2xl font-bold text-center mb-8">
          Our Private Label Solutions
        </h2>
        <div className="space-y-6 text-white text-lg">
          <p>
            <strong>Healthcare & Medtech –</strong> Custom devices,
            diagnostics, and patient care products meeting the highest safety
            standards.
          </p>
          <p>
            <strong>Pharmaceuticals –</strong> Regulatory-compliant
            formulations, WHO-GMP manufacturing, and customized packaging.
          </p>
          <p>
            <strong>Cosmetics & Personal Care –</strong> Beauty and skincare
            products tailored to your brand’s vision.
          </p>
          <p>
            <strong>Nutraceuticals –</strong> Science-backed supplements and
            functional foods that win customer trust.
          </p>
        </div>
      </section>

      {/* How We Work */}
      <section className="relative z-10 max-w-5xl px-6 py-10">
        <h2 className="text-2xl font-bold text-center mb-8">How We Work</h2>
        <ul className="list-disc list-inside space-y-2 text-white text-lg">
          <li>
            <strong>Concept & Consultation –</strong> Define your goals, budget,
            and timelines.
          </li>
          <li>
            <strong>Product Development –</strong> Formulation, prototyping, and
            compliance checks.
          </li>
          <li>
            <strong>Branding & Packaging –</strong> Custom design and
            market-ready presentation.
          </li>
          <li>
            <strong>Manufacturing & Quality Control –</strong> Delivered to your
            specifications.
          </li>
          <li>
            <strong>On-Time Delivery –</strong> Reliable, trackable, and ready
            for launch.
          </li>
        </ul>
      </section>

      {/* Call to Action */}
      <section className="relative z-10 text-center py-10">
        <h2 className="text-3xl font-bold mb-4">Your Competitive Edge</h2>
        <p className="max-w-3xl mx-auto mb-6">
          With Veerix Value Link, you’re not just outsourcing production —
          you’re gaining a partner obsessed with speed, precision, and results.
        </p>
      
      </section>

      {/* Workflow Selection */}
     <section className="relative z-10 text-center w-full max-w-5xl py-10">
        <h2 className="text-2xl font-bold mb-6">Choose Your Workflow</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {workflowCards.map((card, index) => (
            <div
              key={index}
              onClick={() => handleCardClick(index, card.onClick)}
              className={`${card.bg} ${card.textColor} border cursor-pointer rounded-xl p-4 flex flex-col items-center justify-between text-center hover:shadow-lg transform transition-transform hover:scale-105 h-[200px] relative overflow-hidden group`}
            >
              {/* Overlay for hover (desktop) & tap (mobile) */}
              {/* <div
                className={`absolute inset-0 bg-[#d1383a] bg-opacity-60 flex items-center justify-center rounded-xl z-20 transition-opacity duration-300 pointer-events-none
                  ${activeIndex === index ? "opacity-100" : "opacity-0"} 
                  md:group-hover:opacity-100`}
              >
                <span className="text-white text-xl font-semibold select-none">
                  {card.hoverDesc}
                </span>
              </div> */}

              {/* Shutter animation overlays */}
              {shutterIndex === index && (
                <>
                  <div className="absolute top-0 left-0 w-full h-1/2 bg-black/80 shutter-top origin-bottom"></div>
                  <div className="absolute bottom-0 left-0 w-full h-1/2 bg-black/80 shutter-bottom origin-top"></div>
                </>
              )}

              <div className="flex justify-center items-center h-[100px] mb-2 z-10 relative">
                <img
                  src={card.image}
                  alt={card.title}
                  className="max-h-full max-w-[200px] object-contain"
                />
              </div>
              <div className="z-10 relative">
                <h3 className="text-lg font-semibold">{card.title}</h3>
                <p className="text-xs mt-1">{card.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default VeerixOrdersLanding;
