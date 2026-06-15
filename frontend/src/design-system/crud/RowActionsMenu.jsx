export default function RowActionsMenu({ children }) {
  return (
    <div className="flex flex-wrap justify-end gap-2">
      {children}
    </div>
  );
}
