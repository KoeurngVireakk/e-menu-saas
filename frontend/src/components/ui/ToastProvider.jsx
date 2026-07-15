import { Toaster } from "sonner";

export default function ToastProvider() {
  return (
    <Toaster
      richColors
      closeButton
      position="top-right"
      toastOptions={{
        duration: 3200,
        style: {
          borderRadius: "1rem",
          borderColor: "var(--menudigi-border)",
          boxShadow: "var(--menudigi-card-shadow)",
          fontFamily: 'Inter, "Noto Sans Khmer", "Khmer OS Battambang", system-ui, sans-serif',
        },
      }}
    />
  );
}
