import { Link } from "react-router-dom";
import { Button, Card } from "../../components/ui";

export default function ForbiddenPage() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl items-center">
      <Card className="w-full border-rose-200 p-6">
        <p className="text-xs font-bold uppercase tracking-wide text-rose-600">403</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-950">Access denied</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Your account does not have permission to use this admin area.
        </p>
        <Button as={Link} to="/admin" variant="dark" className="mt-6">
          Back to dashboard
        </Button>
      </Card>
    </div>
  );
}
