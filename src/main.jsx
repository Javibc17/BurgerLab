// 1. Imports
import React from "react";
import { createRoot } from "react-dom/client";
import AppWithRouter from "./App";
import "./App.css";

// 2. Render principal
createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AppWithRouter />
  </React.StrictMode>
);
