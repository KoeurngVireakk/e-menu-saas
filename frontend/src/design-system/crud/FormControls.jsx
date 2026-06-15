export function Field({ label, children }) {
  return (
    <label className="grid gap-1.5 text-sm font-bold text-slate-700">
      <span>{label}</span>
      {children}
    </label>
  );
}

export function TextInput({ value, onChange, type = "text", required = false, placeholder = "" }) {
  return (
    <input
      type={type}
      value={value}
      required={required}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
      className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
    />
  );
}

export function TextArea({ value, onChange, required = false, placeholder = "", rows = 4, className = "" }) {
  return (
    <textarea
      value={value}
      required={required}
      rows={rows}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
      className={`rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:ring-2 focus:ring-blue-100 ${className}`}
    />
  );
}

export function SelectInput({ value, onChange, options, required = false, disabled = false }) {
  return (
    <select
      value={value}
      required={required}
      disabled={disabled}
      onChange={(event) => onChange(event.target.value)}
      className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-900 outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100 disabled:text-slate-500"
    >
      {options.map(([optionValue, label]) => <option key={optionValue || "empty"} value={optionValue}>{label}</option>)}
    </select>
  );
}

export function FileInput({ onChange, accept = "image/*" }) {
  return (
    <input
      type="file"
      accept={accept}
      onChange={(event) => onChange(event.target.files?.[0] || null)}
      className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3 py-3 text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-600 file:px-3 file:py-1.5 file:text-sm file:font-bold file:text-white"
    />
  );
}

export function ToggleField({ label, checked, onChange, description }) {
  return (
    <label className="flex items-start justify-between gap-4 rounded-xl border border-slate-200 bg-white p-3">
      <span>
        <span className="block text-sm font-bold text-slate-800">{label}</span>
        {description ? <span className="mt-1 block text-xs leading-5 text-slate-500">{description}</span> : null}
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-1 h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
      />
    </label>
  );
}
