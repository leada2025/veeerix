import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/Axios";
import { useSource } from "../Context/SourceContext";

const LandingPage = () => {

  const navigate = useNavigate();
  const { source } = useSource();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isFishman = source === "fishman"; // should be true for this page

    useEffect(() => {
    window.scroll(0,0);
  },[]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    
    try {
      const res = await axios.post("/api/users/login", { email, password });
      const { token, user } = res.data;

      localStorage.setItem("authToken", token);
      localStorage.setItem("user", JSON.stringify(user));

      navigate("/trademark"); // fishman goes to trademark
    } catch (err) {
      console.error(err);
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-[#7b4159] text-white font-sans flex flex-col">
      {/* Hero + Login Split */}
      <section className="flex flex-col md:flex-row min-h-screen">
        {/* Left Hero */}
        <div className="md:w-2/3 flex flex-col justify-center items-start px-10 md:px-20 py-20 bg-gradient-to-b from-[#7b4159] to-[#9c5d77]">
          <h1 className="text-3xl md:text-5xl font-bold mb-6 leading-snug">
            Professional Trademark Registration Services
          </h1>
          <p className="text-base md:text-lg max-w-xl mb-8">
            Protect your brand with our comprehensive 6-step trademark application process. Expert legal guidance from start to finish.
          </p>
          <a
            href="#application"
            className="bg-white text-[#7b4159] font-semibold px-6 py-3 rounded-lg shadow-lg hover:bg-gray-200 transition text-base"
          >
            Start Your Application
          </a>
        </div>

        {/* Right Login */}
        <div className="md:w-1/3 flex items-center justify-center bg-[#5c2f48] px-8 py-16">
          <div className="w-full max-w-md bg-white rounded-2xl p-8 shadow-xl text-[#7b4159]">
            <h2 className="text-2xl font-bold mb-5 text-center">Login</h2>
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <form className="flex flex-col space-y-3" onSubmit={handleLogin}>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#7b4159]"
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#7b4159]"
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-[#7b4159] text-white font-semibold py-3 rounded-lg shadow hover:bg-[#9c5d77] transition text-base disabled:opacity-50"
              >
                {loading ? "Logging in..." : "Login"}
              </button>
             
            </form>
          </div>
        </div>
      </section>

      {/* 6-Step Process */}
      <section id="application" className="py-16 px-6 md:px-20 bg-white text-[#7b4159]">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">
          Simple 6-Step Process
        </h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {[
            { step: "1", title: "Submit Suggestions", desc: "Provide up to 5 unique name ideas for your trademark with business details." },
            { step: "2", title: "Name Review", desc: "Our legal team reviews your suggestions and checks availability." },
            { step: "3", title: "Choose Final Name", desc: "Select your preferred name from the approved options." },
            { step: "4", title: "Complete Payment", desc: "Make the final payment to complete your trademark registration." },
            { step: "5", title: "Document Preparation", desc: "We prepare and send the required documents for your signature." },
            { step: "6", title: "Return Documents", desc: "Upload your signed documents back to us for processing." },
          ].map((item) => (
            <div key={item.step} className="bg-[#7b4159] text-white p-5 rounded-xl shadow-lg hover:scale-105 transition transform">
              <div className="text-3xl font-bold mb-3">Step {item.step}</div>
              <h3 className="text-xl font-semibold mb-1">{item.title}</h3>
              <p className="text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 px-6 md:px-20 bg-gradient-to-b from-[#9c5d77] to-[#7b4159] text-white">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">Why Choose LegalMark™?</h2>
        <div className="grid md:grid-cols-4 gap-8 max-w-6xl mx-auto text-center">
          {[
            { title: "Expert Review", desc: "Licensed attorneys review every application" },
            { title: "Secure Process", desc: "Bank-level security for all documents and payments" },
            { title: "Fast Turnaround", desc: "2-3 business days review time" },
            { title: "Support Team", desc: "Dedicated support throughout the process" },
          ].map((item, index) => (
            <div key={index} className="bg-white text-[#7b4159] p-5 rounded-xl shadow-lg hover:scale-105 transition transform">
              <h3 className="text-lg font-semibold mb-1">{item.title}</h3>
              <p className="text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Call To Action */}
      <section className="py-16 px-6 md:px-20 text-center bg-[#7b4159]">
        <h2 className="text-2xl md:text-3xl font-bold mb-4">
          Ready to Protect Your Brand?
        </h2>
        <a
          href="#application"
          className="bg-white text-[#7b4159] font-semibold px-6 py-3 rounded-lg shadow-lg hover:bg-gray-200 transition text-base"
        >
          Start Your Application
        </a>
      </section>
    </div>
  );
};

export default LandingPage;
