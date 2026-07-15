import { cloneElement, useId, useState } from "react";
import { cn } from "../../components/ui/utils";
import FormMessages from "../forms/FormMessages";
import { controlClass, labelClass } from "../forms/styles";

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
      <div className="flex items-baseline gap-1">
        <label htmlFor={children.props.id || fieldId} className={labelClass}>{label}</label>
        {required ? <span className="text-rose-600" aria-hidden="true">*</span> : null}
      </div>
      {cloneElement(children, {
        id: children.props.id || fieldId,
        required: children.props.required ?? required,
        "aria-describedby": describedBy,
        "aria-invalid": error ? true : children.props["aria-invalid"],
      })}
      <FormMessages description={description} descriptionId={descriptionId} error={error} errorId={errorId} />
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
      className={cn(controlClass, className)}
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
      className={cn(controlClass, "min-h-32 resize-y", className)}
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
      className={cn(controlClass, className)}
      {...props}
    >
      {options.map(([optionValue, label]) => <option key={optionValue || "empty"} value={optionValue}>{label}</option>)}
    </select>
  );
}

export function FileInput({ onChange, accept = "image/*", className = "", ...props }) {
  const [selectedName, setSelectedName] = useState("");
  const statusId = useId();

  return (
    <div className="grid gap-2">
      <input
        {...props}
        type="file"
        accept={accept}
        aria-describedby={[props["aria-describedby"], statusId].filter(Boolean).join(" ")}
        onChange={(event) => {
          const file = event.target.files?.[0] || null;
          setSelectedName(file?.name || "");
          onChange?.(file);
        }}
        className={cn("khmer-text min-h-11 w-full rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-3 py-2.5 text-sm font-medium leading-6 text-slate-600 outline-none transition file:mr-3 file:rounded-xl file:border-0 file:bg-blue-600 file:px-3 file:py-1.5 file:text-sm file:font-bold file:text-white hover:border-blue-300 hover:bg-blue-50/40 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400", className)}
      />
      <span id={statusId} className="khmer-text text-xs font-semibold leading-5 text-slate-500" aria-live="polite">
        {selectedName ? `Selected file: ${selectedName}` : "No file selected."}
      </span>
    </div>
  );
}

export function ToggleField({ label, checked, onChange, description, disabled = false, id }) {
  const generatedId = useId();
  const inputId = id || generatedId;
  const descriptionId = description ? `${inputId}-description` : undefined;

  return (
    <label htmlFor={inputId} className="flex min-h-11 items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-3 transition hover:border-blue-200 hover:bg-blue-50/30 has-disabled:cursor-not-allowed has-disabled:bg-slate-100 has-disabled:opacity-70">
      <span className="min-w-0">
        <span className="khmer-label block text-sm font-bold leading-6 text-slate-800">{label}</span>
        {description ? <span id={descriptionId} className="khmer-text mt-1 block text-xs leading-5 text-slate-500">{description}</span> : null}
      </span>
      <span className="relative mt-0.5 shrink-0">
        <input
          id={inputId}
          type="checkbox"
          checked={checked}
          disabled={disabled}
          aria-label={label}
          aria-describedby={descriptionId}
          onChange={(event) => onChange(event.target.checked)}
          className="peer sr-only"
        />
        <span className="block h-7 w-12 rounded-full bg-slate-300 transition peer-checked:bg-blue-600 peer-focus-visible:ring-4 peer-focus-visible:ring-blue-100 peer-disabled:bg-slate-200 motion-reduce:transition-none" aria-hidden="true" />
        <span className="absolute left-1 top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-5 motion-reduce:transition-none" aria-hidden="true" />
      </span>
    </label>
  );
}
