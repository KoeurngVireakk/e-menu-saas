import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) {
            return undefined;
          }

          if (id.includes("react") || id.includes("react-router-dom")) {
            return "vendor-react";
          }

          if (id.includes("framer-motion") || id.includes("motion-dom") || id.includes("motion-utils")) {
            return "vendor-animation";
          }

          if (id.includes("sweetalert2")) {
            return "vendor-alerts";
          }

          if (id.includes("datatables.net") || id.includes("jquery")) {
            return "vendor-datatables";
          }

          if (id.includes("axios")) {
            return "vendor-http";
          }

          return "vendor";
        },
      },
    },
  },
});
