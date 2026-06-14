import Card from "./Card";

export default function StatCard({ label, value, note, tone = "orange" }) {
  const accent = tone === "green" ? "bg-emerald-500" : tone === "blue" ? "bg-blue-500" : "bg-orange-500";

  return (
    <Card className="relative overflow-hidden p-4">
      <div className={`absolute inset-y-0 left-0 w-1 ${accent}`} />
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-slate-950">{value}</p>
      {note ? <p className="mt-1 text-xs text-slate-500">{note}</p> : null}
    </Card>
  );
}
