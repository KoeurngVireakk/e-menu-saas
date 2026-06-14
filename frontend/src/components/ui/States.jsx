import Button from "./Button";
import Card from "./Card";

export function EmptyState({ title = "No records found", message = "There is nothing to show yet.", action }) {
  return (
    <Card className="p-6 text-center">
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-slate-100 text-slate-500">--</div>
      <h3 className="mt-4 font-semibold text-slate-950">{title}</h3>
      <p className="mt-1 text-sm text-slate-500">{message}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </Card>
  );
}

export function LoadingState({ message = "Loading..." }) {
  return (
    <Card className="p-5">
      <div className="animate-pulse space-y-3">
        <div className="h-4 w-32 rounded bg-slate-200" />
        <div className="h-8 rounded bg-slate-100" />
        <div className="h-8 rounded bg-slate-100" />
      </div>
      <p className="mt-4 text-sm text-slate-500">{message}</p>
    </Card>
  );
}

export function ErrorState({ message = "Unable to load data.", onRetry }) {
  return (
    <Card className="border-rose-200 p-5">
      <h3 className="font-semibold text-rose-700">Something went wrong</h3>
      <p className="mt-1 text-sm text-rose-600">{message}</p>
      {onRetry ? <Button type="button" variant="danger" size="sm" className="mt-4" onClick={onRetry}>Retry</Button> : null}
    </Card>
  );
}
