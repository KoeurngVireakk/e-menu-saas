import { lazy, Suspense, useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "../components/layout/Navbar";
import Sidebar from "../components/Sidebar";
import DemoWorkspaceBanner from "../components/demo/DemoWorkspaceBanner";

const AppCommandPalette = lazy(() => import("../components/command/AppCommandPalette"));

export default function AdminLayout() {
  const [commandOpen, setCommandOpen] = useState(false);
  const [navigationOpen, setNavigationOpen] = useState(false);

  useEffect(() => {
    const onKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setCommandOpen(true);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div className="min-h-dvh overflow-x-clip bg-slate-50 text-left text-slate-900">
      <div className="grid min-h-dvh grid-cols-1 lg:grid-cols-[260px_1fr]">
        <Sidebar mobileOpen={navigationOpen} onClose={() => setNavigationOpen(false)} />
        <div className="min-w-0">
          <Navbar onOpenCommand={() => setCommandOpen(true)} onToggleNavigation={() => setNavigationOpen((open) => !open)} />
          <DemoWorkspaceBanner />
          <motion.main
            className="mx-auto max-w-7xl p-4 md:p-6 lg:p-8"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Outlet />
          </motion.main>
        </div>
      </div>
      <Suspense fallback={null}>
        <AppCommandPalette open={commandOpen} onClose={() => setCommandOpen(false)} />
      </Suspense>
    </div>
  );
}
