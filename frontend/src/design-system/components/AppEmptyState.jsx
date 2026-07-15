import { Inbox } from "lucide-react";
import AppState from "./AppState";

export default function AppEmptyState({
  icon: Icon = Inbox,
  title = "No records found",
  description = "There is nothing to show yet.",
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  checklist = [],
  contained = true,
  className = "",
  kind = "empty",
  action,
  details,
}) {
  return (
    <AppState
      kind={kind}
      icon={Icon}
      title={title}
      description={description}
      details={details}
      action={action}
      actionLabel={actionLabel}
      onAction={onAction}
      secondaryActionLabel={secondaryActionLabel}
      onSecondaryAction={onSecondaryAction}
      checklist={checklist}
      contained={contained}
      className={className}
    />
  );
}
