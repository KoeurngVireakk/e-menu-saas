import { confirmAction } from "./ui";

export default function ConfirmButton({ children, title = "Are you sure?", text = "This action cannot be undone.", onConfirm, className = "" }) {
  const handleClick = async () => {
    if (await confirmAction(title, text)) {
      await onConfirm();
    }
  };

  return (
    <button type="button" onClick={handleClick} className={className}>
      {children}
    </button>
  );
}
