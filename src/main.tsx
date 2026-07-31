import { StrictMode } from "react";
import ReactDOM from "react-dom/client";

import { App } from "@/app/App";
import { initializeObservability } from "@/utils";

initializeObservability();

if (import.meta.env.DEV) {
  ReactDOM.createRoot(document.getElementById("root")!).render(<App />);
} else {
  ReactDOM.createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
