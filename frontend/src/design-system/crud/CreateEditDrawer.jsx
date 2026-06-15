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
  loading = false,
  disabled = false,
}) {
  return (
    <AppSheet open={open} title={title} onClose={onClose}>
      <form onSubmit={onSubmit} className="flex min-h-full flex-col">
        {description ? <p className="mb-5 text-sm leading-6 text-slate-500">{description}</p> : null}
        <div className="grid flex-1 content-start gap-4">{children}</div>
        <div className="sticky bottom-0 -mx-5 mt-6 flex justify-end gap-2 border-t border-slate-100 bg-white px-5 py-4">
          <AppButton type="button" variant="secondary" onClick={onClose}>Cancel</AppButton>
          <AppButton type="submit" loading={loading} disabled={disabled}>{submitLabel}</AppButton>
        </div>
      </form>
    </AppSheet>
  );
}
