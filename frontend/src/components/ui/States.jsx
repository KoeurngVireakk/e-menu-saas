import { Ban, CheckCircle2, Inbox, SearchX, WifiOff } from "lucide-react";
import AppCard from "../../design-system/components/AppCard";
import AppSkeleton from "../../design-system/components/AppSkeleton";
import AppState from "../../design-system/components/AppState";

export function EmptyState({ title = "No records found", message = "There is nothing to show yet.", action, icon: Icon = Inbox, checklist = [] }) {
  return <AppState kind="empty" icon={Icon} title={title} message={message} action={action} checklist={checklist} />;
}

export function LoadingState({ message = "Loading..." }) {
  return (
    <AppCard aria-live="polite">
      <AppSkeleton variant="table" rows={2} label={message} />
      <p className="khmer-text mt-4 text-sm font-semibold text-slate-500">{message}</p>
      <p className="khmer-text mt-1 text-xs font-semibold leading-5 text-slate-400">Keeping this workspace ready while fresh data loads.</p>
    </AppCard>
  );
}

export function ErrorState({ title = "Unable to load this content", message = "The latest data could not be retrieved.", details = "Check your connection, then retry. Saved work is not changed by this message.", onRetry }) {
  return <AppState kind="error" title={title} message={message} details={details} actionLabel={onRetry ? "Retry" : undefined} onAction={onRetry} />;
}

export function NoResultsState({ title = "No matching results", message = "Try a different search term or clear filters.", action, checklist = [] }) {
  return <AppState kind="no-results" icon={SearchX} title={title} message={message} action={action} checklist={checklist} />;
}

export function OfflineState({ title = "You are offline", message = "Reconnect to continue loading live restaurant data.", action, checklist = [] }) {
  return <AppState kind="offline" icon={WifiOff} title={title} message={message} action={action} checklist={checklist} />;
}

export function ForbiddenState({ title = "Access unavailable", message = "Your account does not have permission to view this workspace area.", action, checklist = [] }) {
  return <AppState kind="permission" icon={Ban} title={title} message={message} action={action} checklist={checklist} />;
}

export function SuccessState({ title = "All set", message = "The action completed successfully.", action }) {
  return <AppState kind="success" icon={CheckCircle2} title={title} message={message} action={action} />;
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
