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
  return (
    <AppSheet open={open} title={title} onClose={onClose}>
      <form onSubmit={onSubmit} className="flex min-h-full flex-col">
        {description ? <p className="mb-5 text-sm leading-6 text-slate-500">{description}</p> : null}
        <div className="grid flex-1 content-start gap-4">{children}</div>
        <div className="sticky bottom-0 -mx-5 mt-6 flex flex-col-reverse gap-2 border-t border-slate-100 bg-white/95 px-5 py-4 shadow-[0_-12px_30px_rgba(15,23,42,0.06)] backdrop-blur sm:flex-row sm:justify-end">
          <AppButton type="button" variant="secondary" onClick={onClose}>{cancelLabel}</AppButton>
          <AppButton type="submit" loading={loading} disabled={disabled} aria-live="polite">{submitLabel}</AppButton>
        </div>
      </form>
    </AppSheet>
  );
}
