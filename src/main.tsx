import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// This app does not use a service worker. Remove the older sw.js worker if a browser still has it
// installed; it can intercept Vite asset requests and fail while cloning responses.
if ("serviceWorker" in navigator) {
  void navigator.serviceWorker
    .getRegistrations()
    .then((registrations) => {
      const staleWorkers = registrations.filter((registration) =>
        [registration.active, registration.waiting, registration.installing].some((worker) =>
          worker?.scriptURL.endsWith("/sw.js"),
        ),
      );

      if (staleWorkers.length === 0) return;

      void Promise.all(staleWorkers.map((registration) => registration.unregister())).then(() => {
        window.location.reload();
      });
    })
    .catch(() => undefined);
}

createRoot(document.getElementById("root")!).render(<App />);
