import { lazy, Suspense, useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "../components/layout/Navbar";
import Sidebar from "../components/Sidebar";

const AppCommandPalette = lazy(() => import("../components/command/AppCommandPalette"));

export default function AdminLayout() {
  const [commandOpen, setCommandOpen] = useState(false);

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
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.08),transparent_28%),linear-gradient(180deg,#F8FAFC,#EEF2F7)] text-left text-slate-900">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[260px_1fr]">
        <Sidebar />
        <div className="min-w-0">
          <Navbar onOpenCommand={() => setCommandOpen(true)} />
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
