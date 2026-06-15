export default function OperationTimeline({ items = [] }) {
  const rows = items.filter(Boolean);

  if (!rows.length) {
    return <p className="rounded-xl bg-slate-50 p-3 text-sm text-slate-500">No timeline events available yet.</p>;
  }

  return (
    <div className="grid gap-3">
      {rows.map((item, index) => (
        <div key={`${item.label}-${index}`} className="flex gap-3">
          <div className="mt-1 h-2.5 w-2.5 rounded-full bg-blue-600" />
          <div>
            <p className="text-sm font-black text-slate-950">{item.label}</p>
            {item.description ? <p className="text-sm text-slate-500">{item.description}</p> : null}
            {item.time ? <p className="mt-0.5 text-xs font-semibold text-slate-400">{item.time}</p> : null}
          </div>
        </div>
      ))}
    </div>
  );
}
