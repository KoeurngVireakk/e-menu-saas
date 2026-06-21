import { Link } from "react-router-dom";
import { AppCard } from "../../design-system/components";
import { useAuth } from "../../context/AuthContext";
import { canView } from "../../utils/permissions";
import { cn } from "../ui/utils";

export default function QuickActionsGrid({ title, description, actions = [] }) {
  const { user } = useAuth();
  const visibleActions = actions.filter((action) => !action.feature || canView(user, action.feature));

  return (
    <AppCard title={title} description={description} labelled>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {visibleActions.map((action) => (
          <Link
            key={action.to}
            to={action.to}
            className="group flex min-h-28 items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-left transition hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <span className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-2xl", action.iconClassName || "bg-blue-50 text-blue-700")}>
              <action.icon className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="min-w-0">
              <span className="khmer-heading block font-black leading-6 text-slate-950">{action.title}</span>
              <span className="khmer-text mt-1 block text-sm leading-6 text-slate-500">{action.description}</span>
            </span>
          </Link>
        ))}
      </div>
    </AppCard>
  );
}
