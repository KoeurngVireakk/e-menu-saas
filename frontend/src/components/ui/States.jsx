import { motion } from "framer-motion";
import { AlertTriangle, Ban, CheckCircle2, Inbox, SearchX, WifiOff } from "lucide-react";
import Button from "./Button";
import Card from "./Card";

export function EmptyState({ title = "No records found", message = "There is nothing to show yet.", action, icon: Icon = Inbox, checklist = [] }) {
  return (
    <Card className="p-8 text-center">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, ease: "easeOut" }}>
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-3xl bg-linear-to-br from-blue-50 to-slate-100 text-sm font-black text-blue-600">
        <Icon className="h-6 w-6" aria-hidden="true" />
      </div>
      <h3 className="mt-5 text-lg font-black text-slate-950">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">{message}</p>
      {checklist.length ? (
        <ul className="mx-auto mt-4 grid max-w-md gap-2 text-left text-sm font-semibold text-slate-600">
          {checklist.map((item) => <li key={item} className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">{item}</li>)}
        </ul>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
      </motion.div>
    </Card>
  );
}

export function LoadingState({ message = "Loading..." }) {
  return (
    <Card className="p-6" role="status" aria-live="polite">
      <div className="animate-pulse space-y-3">
        <div className="h-4 w-32 rounded-full bg-linear-to-r from-slate-200 via-slate-100 to-slate-200" />
        <div className="h-10 rounded-2xl bg-linear-to-r from-slate-100 via-slate-50 to-slate-100" />
        <div className="h-10 rounded-2xl bg-linear-to-r from-slate-100 via-slate-50 to-slate-100" />
      </div>
      <p className="mt-4 text-sm font-semibold text-slate-500">{message}</p>
      <p className="mt-1 text-xs font-semibold text-slate-400">Keeping this workspace ready while fresh data loads.</p>
    </Card>
  );
}

export function ErrorState({ message = "Unable to load data.", onRetry }) {
  return (
    <Card className="border-rose-200 bg-rose-50/40 p-6">
      <div className="flex items-start gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-rose-100 text-rose-700">
          <AlertTriangle className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <h3 className="font-black text-rose-700">Something went wrong</h3>
          <p className="mt-2 text-sm leading-6 text-rose-600">{message}</p>
          <p className="mt-1 text-xs font-semibold text-rose-500">Check your connection, then retry. Saved work is not changed by this message.</p>
          {onRetry ? <Button type="button" variant="danger" size="sm" className="mt-4" onClick={onRetry}>Retry</Button> : null}
        </div>
      </div>
    </Card>
  );
}

export function NoResultsState({ title = "No matching results", message = "Try a different search term or clear filters.", action, checklist = [] }) {
  return <EmptyState icon={SearchX} title={title} message={message} action={action} checklist={checklist} />;
}

export function OfflineState({ title = "You are offline", message = "Reconnect to continue loading live restaurant data.", action, checklist = [] }) {
  return <EmptyState icon={WifiOff} title={title} message={message} action={action} checklist={checklist} />;
}

export function ForbiddenState({ title = "Access unavailable", message = "Your account does not have permission to view this workspace area.", action, checklist = [] }) {
  return <EmptyState icon={Ban} title={title} message={message} action={action} checklist={checklist} />;
}

export function SuccessState({ title = "All set", message = "The action completed successfully.", action }) {
  return (
    <Card className="border-emerald-200 bg-emerald-50/40 p-8 text-center">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-3xl bg-emerald-100 text-emerald-700">
        <CheckCircle2 className="h-6 w-6" aria-hidden="true" />
      </div>
      <h3 className="mt-5 text-lg font-black text-emerald-900">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-emerald-700">{message}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </Card>
  );
}

export function AppLoadingState(props) {
  return <LoadingState {...props} />;
}

export function AppEmptyState(props) {
  return <EmptyState {...props} />;
}

export function AppErrorState(props) {
  return <ErrorState {...props} />;
}

export function AppNoResultsState(props) {
  return <NoResultsState {...props} />;
}

export function AppOfflineState(props) {
  return <OfflineState {...props} />;
}

export function AppForbiddenState(props) {
  return <ForbiddenState {...props} />;
}

export function AppSuccessState(props) {
  return <SuccessState {...props} />;
}
