export default function RowActionsMenu({ children, label = "Row actions" }) {
  return (
    <div className="flex flex-wrap justify-end gap-2" role="group" aria-label={label}>
      {children}
    </div>
  );
}
