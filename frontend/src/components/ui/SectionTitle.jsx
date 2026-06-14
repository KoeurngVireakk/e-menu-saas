export default function SectionTitle({ eyebrow, title, description }) {
  return (
    <div>
      {eyebrow ? <p className="text-xs font-bold uppercase tracking-wide text-orange-600">{eyebrow}</p> : null}
      <h2 className="mt-1 text-lg font-bold text-slate-950">{title}</h2>
      {description ? <p className="mt-1 text-sm text-slate-500">{description}</p> : null}
    </div>
  );
}
