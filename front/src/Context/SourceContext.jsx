import React, { createContext, useContext, useState, useEffect } from "react";

const SourceContext = createContext();

export const SourceProvider = ({ children }) => {
  const [source, setSource] = useState(() => {
    // Load from localStorage on initial render
    return localStorage.getItem("selectedSource") || "veerix";
  });

  useEffect(() => {
    // Save to localStorage whenever it changes
    localStorage.setItem("selectedSource", source);
  }, [source]);

  return (
    <SourceContext.Provider value={{ source, setSource }}>
      {children}
    </SourceContext.Provider>
  );
};

export const useSource = () => useContext(SourceContext);
