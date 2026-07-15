export default function SectionTitle({ eyebrow, title, description }) {
  return (
    <div>
      {eyebrow ? <p className="khmer-label text-xs font-black text-blue-600">{eyebrow}</p> : null}
      <h2 className="khmer-heading mt-1 text-lg font-black leading-7 text-slate-950">{title}</h2>
      {description ? <p className="khmer-text mt-1 text-sm leading-6 text-slate-500">{description}</p> : null}
    </div>
  );
}
