import { Toaster } from "sonner";

export default function ToastProvider() {
  return <Toaster richColors closeButton position="top-right" toastOptions={{ duration: 2200 }} />;
}
