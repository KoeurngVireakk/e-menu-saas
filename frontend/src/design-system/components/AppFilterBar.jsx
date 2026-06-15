import AppCard from "./AppCard";

export default function AppFilterBar({ children, action }) {
  return (
    <AppCard bodyClassName="p-3 md:p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-1 flex-wrap items-end gap-3">{children}</div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
    </AppCard>
  );
}
