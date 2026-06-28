import { StrictMode } from "react";
import ReactDOM from "react-dom/client";

import { App } from "./App";

if (import.meta.env.DEV) {
  ReactDOM.createRoot(document.getElementById("root")!).render(<App />);
} else {
  ReactDOM.createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
