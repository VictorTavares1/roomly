import { useNavigate } from "react-router-dom";
import { useCallback } from "react";

export function useFadeNavigate() {
  const navigate = useNavigate();

  const fadeNavigate = useCallback(
    (to, options) => {
      const overlay = document.createElement("div");
      overlay.className = "page-fade-overlay";
      document.body.appendChild(overlay);

      // Após o fade-in do overlay (0.18s), navega e remove
      setTimeout(() => {
        navigate(to, options);
        overlay.classList.add("exit");
        setTimeout(() => overlay.remove(), 320);
      }, 180);
    },
    [navigate]
  );

  return fadeNavigate;
}
