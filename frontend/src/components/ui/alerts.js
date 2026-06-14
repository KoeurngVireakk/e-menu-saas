import Swal from "sweetalert2";

export function toastSuccess(message) {
  return Swal.fire({ icon: "success", title: message, timer: 1200, showConfirmButton: false, toast: true, position: "top-end" });
}

export function toastError(message) {
  return Swal.fire({ icon: "error", title: message, timer: 1800, showConfirmButton: false, toast: true, position: "top-end" });
}

export async function confirmAction(title = "Are you sure?", text = "This action cannot be undone.") {
  const result = await Swal.fire({ title, text, icon: "warning", showCancelButton: true, confirmButtonColor: "#dc2626", confirmButtonText: "Confirm" });
  return result.isConfirmed;
}

export function alertError(error, fallback = "Something went wrong.") {
  return Swal.fire("Error", error?.response?.data?.message || error?.message || fallback, "error");
}
