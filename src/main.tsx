import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Silence console in production
if (import.meta.env.PROD) {
  const noop = () => {};
  console.log = noop;
  console.warn = noop;
  console.error = noop;
}

createRoot(document.getElementById("root")!).render(<App />);
