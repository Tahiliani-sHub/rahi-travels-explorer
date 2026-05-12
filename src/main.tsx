import React from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { getRouter } from "./router";
import "./styles.css";

// When deployed to Netlify, rewrite all /api/* fetch calls to go directly
// to the Railway backend, bypassing Netlify's proxy (which doesn't support POST).
const API_BASE = (import.meta.env.VITE_API_URL as string) ?? "";
if (API_BASE) {
  const _fetch = window.fetch.bind(window);
  window.fetch = (input, init) => {
    if (typeof input === "string" && input.startsWith("/api/")) {
      input = API_BASE + input;
    }
    return _fetch(input, init);
  };
}

const router = getRouter();

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
