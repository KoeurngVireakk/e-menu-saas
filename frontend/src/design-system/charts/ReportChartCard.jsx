import AppCard from "../components/AppCard";

export default function ReportChartCard({ title, description, children, summary }) {
  return (
    <AppCard title={title} description={description} bodyClassName="p-4">
      <div className="h-72" role="img" aria-label={`${title}. ${summary || description || ""}`}>
        {children}
      </div>
      {summary ? <p className="mt-3 text-sm font-semibold text-slate-600">{summary}</p> : null}
    </AppCard>
  );
}
