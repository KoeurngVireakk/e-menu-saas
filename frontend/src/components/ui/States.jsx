import Button from "./Button";
import Card from "./Card";

export function EmptyState({ title = "No records found", message = "There is nothing to show yet.", action }) {
  return (
    <Card className="p-8 text-center">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-3xl bg-gradient-to-br from-blue-50 to-slate-100 text-sm font-black text-blue-600">--</div>
      <h3 className="mt-5 text-lg font-black text-slate-950">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">{message}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </Card>
  );
}

export function LoadingState({ message = "Loading..." }) {
  return (
    <Card className="p-6">
      <div className="animate-pulse space-y-3">
        <div className="h-4 w-32 rounded-full bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200" />
        <div className="h-10 rounded-2xl bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100" />
        <div className="h-10 rounded-2xl bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100" />
      </div>
      <p className="mt-4 text-sm font-semibold text-slate-500">{message}</p>
    </Card>
  );
}

export function ErrorState({ message = "Unable to load data.", onRetry }) {
  return (
    <Card className="border-rose-200 bg-rose-50/40 p-6">
      <h3 className="font-black text-rose-700">Something went wrong</h3>
      <p className="mt-2 text-sm leading-6 text-rose-600">{message}</p>
      {onRetry ? <Button type="button" variant="danger" size="sm" className="mt-4" onClick={onRetry}>Retry</Button> : null}
    </Card>
  );
}
