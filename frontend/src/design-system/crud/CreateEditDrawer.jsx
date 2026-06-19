import { useId } from "react";
import AppButton from "../components/AppButton";
import AppSheet from "../components/AppSheet";

export default function CreateEditDrawer({
  open,
  title,
  description,
  children,
  onClose,
  onSubmit,
  submitLabel = "Save changes",
  cancelLabel = "Cancel",
  loading = false,
  disabled = false,
}) {
  const formId = useId();

  const footer = (
    <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
      <AppButton type="button" variant="secondary" onClick={onClose}>{cancelLabel}</AppButton>
      <AppButton type="submit" form={formId} loading={loading} disabled={disabled}>{submitLabel}</AppButton>
    </div>
  );

  return (
    <AppSheet open={open} title={title} description={description} onClose={onClose} footer={footer}>
      <form id={formId} onSubmit={onSubmit} className="grid content-start gap-4">
        {children}
      </form>
    </AppSheet>
  );
}
