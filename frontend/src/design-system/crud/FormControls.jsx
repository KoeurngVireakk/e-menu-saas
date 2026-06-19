import { cloneElement, useId } from "react";

const controlClass = "min-h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500 aria-invalid:border-rose-300 aria-invalid:focus:border-rose-500 aria-invalid:focus:ring-rose-100";

export function Field({ label, children, description, error, required = false }) {
  const fieldId = useId();
  const descriptionId = `${fieldId}-description`;
  const errorId = `${fieldId}-error`;
  const describedBy = [
    children.props["aria-describedby"],
    description ? descriptionId : null,
    error ? errorId : null,
  ].filter(Boolean).join(" ") || undefined;

  return (
    <div className="grid gap-1.5">
      <label htmlFor={children.props.id || fieldId} className="khmer-label text-sm font-bold leading-6 text-slate-700">
        {label}{required ? <span className="text-rose-600" aria-hidden="true"> *</span> : null}
      </label>
      {cloneElement(children, {
        id: children.props.id || fieldId,
        required: children.props.required ?? required,
        "aria-describedby": describedBy,
        "aria-invalid": error ? true : children.props["aria-invalid"],
      })}
      {description ? <span id={descriptionId} className="khmer-text text-xs font-medium leading-5 text-slate-500">{description}</span> : null}
      {error ? <span id={errorId} className="khmer-text text-xs font-bold leading-5 text-rose-600" role="alert">{error}</span> : null}
    </div>
  );
}

export function TextInput({ value, onChange, type = "text", required = false, placeholder = "", className = "", ...props }) {
  return (
    <input
      type={type}
      value={value}
      required={required}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
      className={`${controlClass} h-10 ${className}`}
      {...props}
    />
  );
}

export function TextArea({ value, onChange, required = false, placeholder = "", rows = 4, className = "", ...props }) {
  return (
    <textarea
      value={value}
      required={required}
      rows={rows}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
      className={`${controlClass} py-2 ${className}`}
      {...props}
    />
  );
}

export function SelectInput({ value, onChange, options, required = false, disabled = false, className = "", ...props }) {
  return (
    <select
      value={value}
      required={required}
      disabled={disabled}
      onChange={(event) => onChange(event.target.value)}
      className={`${controlClass} h-10 ${className}`}
      {...props}
    >
      {options.map(([optionValue, label]) => <option key={optionValue || "empty"} value={optionValue}>{label}</option>)}
    </select>
  );
}

export function FileInput({ onChange, accept = "image/*", className = "", ...props }) {
  return (
    <input
      type="file"
      accept={accept}
      onChange={(event) => onChange(event.target.files?.[0] || null)}
      className={`rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3 py-3 text-sm font-medium leading-6 text-slate-600 outline-none transition file:mr-3 file:rounded-xl file:border-0 file:bg-blue-600 file:px-3 file:py-1.5 file:text-sm file:font-bold file:text-white hover:border-blue-200 hover:bg-blue-50/40 focus:border-blue-300 focus:ring-2 focus:ring-blue-100 ${className}`}
      {...props}
    />
  );
}

export function ToggleField({ label, checked, onChange, description }) {
  return (
    <label className="flex items-start justify-between gap-4 rounded-xl border border-slate-200 bg-white p-3 transition hover:border-blue-200 hover:bg-blue-50/30">
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
