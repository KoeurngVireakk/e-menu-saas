import AppButton from "./AppButton";

export default function AppPageHeader({ eyebrow, title, description, breadcrumbs, primaryAction, secondaryActions }) {
  return (
    <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="min-w-0">
        {breadcrumbs ? <div className="mb-2 text-xs font-semibold text-slate-500">{breadcrumbs}</div> : null}
        {eyebrow ? <p className="khmer-label text-xs font-black uppercase tracking-wide text-blue-600">{eyebrow}</p> : null}
        <h1 className="khmer-heading mt-2 text-2xl font-black leading-tight text-slate-950 md:text-3xl">{title}</h1>
        {description ? <p className="khmer-text mt-2 max-w-3xl text-sm leading-6 text-slate-500">{description}</p> : null}
      </div>
      {(primaryAction || secondaryActions) ? (
        <div className="flex w-full flex-wrap gap-2 sm:w-auto sm:justify-end">
          {secondaryActions}
          {primaryAction ? <AppButton {...primaryAction}>{primaryAction.children}</AppButton> : null}
        </div>
      ) : null}
    </header>
  );
}
