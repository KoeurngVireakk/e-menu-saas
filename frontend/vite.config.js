import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg", "icons.svg", "pwa-192x192.png", "pwa-512x512.png"],
      manifest: {
        name: "E-Menu SaaS",
        short_name: "E-Menu",
        description: "QR-based digital menu and ordering app.",
        theme_color: "#f97316",
        background_color: "#f8fafc",
        display: "standalone",
        start_url: "/",
        scope: "/",
        icons: [
          {
            src: "/pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any maskable",
          },
          {
            src: "/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
      workbox: {
        cleanupOutdatedCaches: true,
        globPatterns: ["**/*.{js,css,html,svg,png,ico}"],
        navigateFallback: "/index.html",
        navigateFallbackAllowlist: [
          /^\/$/,
          /^\/login$/,
          /^\/register$/,
          /^\/menu\//,
          /^\/cart$/,
          /^\/payment\//,
          /^\/order-success\//,
        ],
        runtimeCaching: [
          {
            urlPattern: /\/api\/public\/shops\/.*\/menu(?:\?.*)?$/,
            handler: "NetworkFirst",
            options: {
              cacheName: "public-menu-api",
              networkTimeoutSeconds: 4,
              expiration: {
                maxEntries: 40,
                maxAgeSeconds: 60 * 60 * 24,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /\/api\//,
            handler: "NetworkOnly",
            options: {
              cacheName: "api-network-only",
            },
          },
        ],
      },
    }),
  ],
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
