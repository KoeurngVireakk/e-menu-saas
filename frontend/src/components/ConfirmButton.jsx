import { confirmAction } from "./ui";
import AppButton from "../design-system/components/AppButton";

export default function ConfirmButton({ children, title = "Are you sure?", text = "This action cannot be undone.", onConfirm, className = "", variant = "danger", size = "sm", ...props }) {
  const handleClick = async () => {
    if (await confirmAction(title, text)) {
      await onConfirm();
    }
  };

  return (
    <AppButton type="button" variant={variant} size={size} onClick={handleClick} className={className} {...props}>
      {children}
    </AppButton>
  );
}
