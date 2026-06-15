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

export async function confirmAction(title = "Are you sure?", text = "This action cannot be undone.") {
  const Swal = await getSwal();
  const result = await Swal.fire({ title, text, icon: "warning", showCancelButton: true, confirmButtonColor: "#dc2626", confirmButtonText: "Confirm" });
  return result.isConfirmed;
}

export async function alertError(error, fallback = "Something went wrong.") {
  const Swal = await getSwal();
  return Swal.fire("Error", getApiErrorMessage(error, fallback), "error");
}

export async function alertWarning(title, message) {
  const Swal = await getSwal();
  return Swal.fire(title, message, "warning");
}

export async function promptText(title, inputLabel, confirmButtonText = "Confirm") {
  const Swal = await getSwal();
  return Swal.fire({ title, input: "text", inputLabel, icon: "warning", showCancelButton: true, confirmButtonText });
}
