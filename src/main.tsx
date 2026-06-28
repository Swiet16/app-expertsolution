import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { getRouter } from "./router";
import { initSupabase } from "./integrations/supabase/client";
import "./styles.css";

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}

initSupabase()
  .then(() => {
    const router = getRouter();
    createRoot(document.getElementById("root")!).render(
      <StrictMode>
        <RouterProvider router={router} />
      </StrictMode>,
    );
  })
  .catch((err) => {
    console.error("Failed to initialize app:", err);
    document.getElementById("root")!.innerHTML =
      '<div style="display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;color:#666;">Failed to load app configuration. Please refresh.</div>';
  });
