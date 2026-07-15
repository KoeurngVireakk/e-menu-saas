import { getApiErrorMessage } from "../../api/axios";
import { toast } from "sonner";

async function getSwal() {
  const module = await import("sweetalert2");
  return module.default;
}

export async function toastSuccess(message) {
  return toast.success(message);
}

export async function toastError(message) {
  return toast.error(message);
}

const buttonBase = "khmer-button min-h-11 rounded-2xl px-4 text-sm font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2";

export async function confirmAction(title = "Are you sure?", text = "This action cannot be undone.", options = {}) {
  const Swal = await getSwal();
  const {
    confirmButtonText = "Confirm",
    cancelButtonText = "Cancel",
    tone = "danger",
  } = options;
  const destructive = tone === "danger";
  const result = await Swal.fire({
    title,
    text,
    icon: destructive ? "warning" : "question",
    showCancelButton: true,
    confirmButtonText,
    cancelButtonText,
    buttonsStyling: false,
    reverseButtons: true,
    focusCancel: destructive,
    customClass: {
      popup: "rounded-3xl",
      actions: "flex flex-wrap gap-2",
      confirmButton: `${buttonBase} ${destructive ? "bg-rose-600 text-white focus-visible:ring-rose-500" : "bg-blue-600 text-white focus-visible:ring-blue-500"}`,
      cancelButton: `${buttonBase} border border-slate-200 bg-white text-slate-700 focus-visible:ring-slate-300`,
    },
  });
  return result.isConfirmed;
}

export async function alertError(error, fallback = "The request could not be completed.") {
  const Swal = await getSwal();
  return Swal.fire("Unable to complete the request", getApiErrorMessage(error, fallback), "error");
}

export async function alertWarning(title, message) {
  const Swal = await getSwal();
  return Swal.fire(title, message, "warning");
}

export async function promptText(title, inputLabel, confirmButtonText = "Confirm") {
  const Swal = await getSwal();
  return Swal.fire({ title, input: "text", inputLabel, icon: "question", showCancelButton: true, confirmButtonText, cancelButtonText: "Cancel" });
}
