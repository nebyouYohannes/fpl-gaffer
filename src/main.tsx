import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
//import App from "./App.tsx";
import ComingSoonPage from "./Pages/ComingSoonPage.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ComingSoonPage />
  </StrictMode>,
);
