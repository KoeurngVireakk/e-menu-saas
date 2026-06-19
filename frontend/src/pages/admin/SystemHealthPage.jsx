import { useCallback, useEffect, useState } from "react";
import api, { getApiErrorMessage } from "../../api/axios";
import { Badge, Button, Card, ErrorState, LoadingState, PageHeader } from "../../components/ui";
import useLanguage from "../../i18n/useLanguage";

const statusTone = {
  ok: "green",
  available: "green",
  warning: "amber",
  error: "red",
};

export default function SystemHealthPage() {
  const { t } = useLanguage();
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    setError("");

    return api
      .get("/system/health")
      .then((response) => setHealth(response.data.data.health))
      .catch((requestError) => setError(getApiErrorMessage(requestError, "System health could not be loaded.")))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(load, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  if (loading && !health) {
    return <LoadingState message="Checking system health..." />;
  }

  if (error && !health) {
    return <ErrorState message={error} onRetry={load} />;
  }

  const checks = health
    ? [
        ["API", { status: "ok", message: "Authenticated API request completed" }],
        ["Database", health.database],
        ["Storage", health.storage],
        ["Cache", health.cache],
        ["Queue", health.queue],
      ]
    : [];

  return (
    <div className="grid gap-6">
      <PageHeader
        eyebrow="Observability"
        title={t("pageTitles.systemHealthTitle")}
        description={t("pageTitles.systemHealthSubtitle")}
        actions={
          <Button type="button" variant="dark" onClick={load} disabled={loading}>
            {loading ? "Refreshing..." : t("pageTitles.systemHealthCta")}
          </Button>
        }
      />

      {error ? <ErrorState message={error} onRetry={load} /> : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {checks.map(([label, check]) => (
          <HealthCard key={label} label={label} check={check} />
        ))}
      </section>

      <Card className="p-4">
        <p className="text-sm font-semibold text-slate-950">Environment</p>
        <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-3">
          <MetaItem label="App" value={health?.app?.status || "unknown"} />
          <MetaItem label="Environment" value={health?.app?.environment || "unknown"} />
          <MetaItem label="Version" value={health?.app?.version || "not configured"} />
        </dl>
        <p className="mt-4 text-xs font-medium text-slate-500">
          Last checked {health?.checked_at ? new Date(health.checked_at).toLocaleString() : "not available"}
        </p>
      </Card>
    </div>
  );
}

function HealthCard({ label, check = {} }) {
  const status = check.status || "unknown";

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-950">{label}</p>
          <p className="mt-1 text-xs text-slate-500">{check.message || healthDetail(check)}</p>
        </div>
        <Badge tone={statusTone[status] || "slate"}>{status}</Badge>
      </div>
    </Card>
  );
}

function MetaItem({ label, value }) {
  return (
    <div>
      <dt className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="mt-1 font-semibold text-slate-950">{value}</dd>
    </div>
  );
}

function healthDetail(check) {
  if (check.driver) {
    return `Driver: ${check.driver}`;
  }

  if (check.connection) {
    return `Connection: ${check.connection}`;
  }

  if (check.disk) {
    return `Disk: ${check.disk}`;
  }

  return "Probe completed";
}
