import AppButton from "./AppButton";

export default function AppPageHeader({ eyebrow, title, description, breadcrumbs, primaryAction, secondaryActions }) {
  return (
    <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="min-w-0">
        {breadcrumbs ? <div className="mb-2 text-xs font-semibold text-slate-500">{breadcrumbs}</div> : null}
        {eyebrow ? <p className="text-xs font-black uppercase tracking-wide text-blue-600">{eyebrow}</p> : null}
        <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-950 md:text-3xl">{title}</h1>
        {description ? <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">{description}</p> : null}
      </div>
      {(primaryAction || secondaryActions) ? (
        <div className="flex flex-wrap gap-2">
          {secondaryActions}
          {primaryAction ? <AppButton {...primaryAction}>{primaryAction.children}</AppButton> : null}
        </div>
      ) : null}
    </header>
  );
}
