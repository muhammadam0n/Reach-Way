import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

console.log("main.jsx is executing...");

try {
  const rootElement = document.getElementById("root");
  console.log("Root element found:", rootElement);
  
  if (rootElement) {
    const root = createRoot(rootElement);
    root.render(
      <StrictMode>
        <App />
      </StrictMode>
    );
    console.log("App rendered successfully");
  } else {
    console.error("Root element not found!");
    document.body.innerHTML = '<div style="padding: 20px; color: red;">Error: Root element not found!</div>';
  }
} catch (error) {
  console.error("Error in main.jsx:", error);
  document.body.innerHTML = `<div style="padding: 20px; color: red;">Error: ${error.message}</div>`;
}
