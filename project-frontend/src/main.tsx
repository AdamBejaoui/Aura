import React from "react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import axios from "axios";
import App from "./App";

// Set global base URL for axios
axios.defaults.baseURL = import.meta.env.VITE_API_BASE || 'http://localhost:3000';

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
