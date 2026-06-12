import Swal from "sweetalert2";

export default function ConfirmButton({ children, title = "Are you sure?", text = "This action cannot be undone.", onConfirm, className = "" }) {
  const handleClick = async () => {
    const result = await Swal.fire({
      title,
      text,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      confirmButtonText: "Confirm",
    });

    if (result.isConfirmed) {
      await onConfirm();
    }
  };

  return (
    <button type="button" onClick={handleClick} className={className}>
      {children}
    </button>
  );
}
