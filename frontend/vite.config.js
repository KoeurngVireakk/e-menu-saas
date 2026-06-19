import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "prompt",
      includeAssets: ["favicon.svg", "icons.svg", "pwa-192x192.png", "pwa-512x512.png"],
      manifest: {
        name: "MenuDIGI",
        short_name: "MenuDIGI",
        description: "QR menus, mobile ordering, kitchen operations, and payment confirmation for restaurants.",
        theme_color: "#2563EB",
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
          const normalizedId = id.replaceAll("\\", "/");

          if (!normalizedId.includes("node_modules")) {
            return undefined;
          }

          if (hasPackage(normalizedId, ["react", "react-dom", "scheduler"])) {
            return "vendor-react";
          }

          if (hasPackage(normalizedId, ["react-router", "react-router-dom"])) {
            return "vendor-router";
          }

          if (hasPackage(normalizedId, ["@tanstack/react-query"])) {
            return "vendor-query";
          }

          if (hasPackage(normalizedId, ["@tanstack/react-table"])) {
            return "vendor-tables";
          }

          if (hasPackage(normalizedId, ["recharts"]) || normalizedId.includes("/node_modules/d3-")) {
            return "vendor-charts";
          }

          if (hasPackage(normalizedId, ["laravel-echo", "pusher-js"])) {
            return "vendor-realtime";
          }

          if (hasPackage(normalizedId, ["framer-motion", "motion-dom", "motion-utils"])) {
            return "vendor-animation";
          }

          if (hasPackage(normalizedId, ["sweetalert2"])) {
            return "vendor-alerts";
          }

          if (hasPackage(normalizedId, ["datatables.net", "datatables.net-dt", "jquery"])) {
            return "vendor-datatables";
          }

          if (hasPackage(normalizedId, ["axios"])) {
            return "vendor-http";
          }

          if (hasPackage(normalizedId, ["lucide-react"])) {
            return "vendor-icons";
          }

          if (hasPackage(normalizedId, ["@hookform/resolvers", "react-hook-form", "zod"])) {
            return "vendor-forms";
          }

          if (hasPackage(normalizedId, ["date-fns", "react-day-picker"])) {
            return "vendor-date";
          }

          if (hasPackage(normalizedId, ["cmdk", "qrcode.react", "sonner"])) {
            return "vendor-ui";
          }

          return "vendor";
        },
      },
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: "./src/test/setup.js",
    exclude: ["e2e/**", "node_modules/**", "dist/**"],
  },
});

function hasPackage(id, packageNames) {
  return packageNames.some((packageName) => id.includes(`/node_modules/${packageName}/`));
}
