import { useId } from "react";
import { cn } from "./utils";
import FormMessages from "../../design-system/forms/FormMessages";
import { controlClass, labelClass } from "../../design-system/forms/styles";

export default function Select({ label, description, options = [], error, className = "", children, id, ...props }) {
  const generatedId = useId();
  const selectId = id || generatedId;
  const descriptionId = description ? `${selectId}-description` : undefined;
  const errorId = error ? `${selectId}-error` : undefined;
  const describedBy = [props["aria-describedby"], descriptionId, errorId].filter(Boolean).join(" ") || undefined;
  const select = (
    <select
      {...props}
      id={selectId}
      aria-describedby={describedBy}
      aria-invalid={error ? true : props["aria-invalid"]}
      className={cn(controlClass, className)}
    >
      {children || options.map(([value, text]) => <option key={value || "empty"} value={value}>{text}</option>)}
    </select>
  );

  if (!label) return select;

  return (
    <div>
      <div className="flex items-baseline gap-1">
        <label htmlFor={selectId} className={cn("block", labelClass)}>{label}</label>
        {props.required ? <span className="text-rose-600" aria-hidden="true">*</span> : null}
      </div>
      <div className="mt-2">{select}</div>
      <div className="mt-2 grid gap-1"><FormMessages description={description} descriptionId={descriptionId} error={error} errorId={errorId} /></div>
    </div>
  );
}
