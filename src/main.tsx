import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles/globals.css";

// Clear stale react-resizable-panels sizes so new defaults apply
Object.keys(localStorage).forEach(key => {
  if (key.startsWith('react-resizable-panels')) localStorage.removeItem(key);
});

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
