import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initCapacitorPlugins } from "./lib/capacitor.ts";

initCapacitorPlugins();

createRoot(document.getElementById("root")!).render(<App />);

