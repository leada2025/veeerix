import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import React from "react"
import { BrowserRouter } from "react-router-dom";
import { SourceProvider } from "./Context/SourceContext.jsx";

createRoot(document.getElementById('root')).render(
  <StrictMode>

      <BrowserRouter>
        <SourceProvider>
        <App />
      </SourceProvider>
    </BrowserRouter>
  </StrictMode>,
)
