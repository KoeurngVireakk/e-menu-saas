import { useId } from "react";
import { cn } from "./utils";
import FormMessages from "../../design-system/forms/FormMessages";
import { controlClass, labelClass } from "../../design-system/forms/styles";

export default function Input({ label, description, error, className = "", id, ...props }) {
  const generatedId = useId();
  const inputId = id || generatedId;
  const descriptionId = description ? `${inputId}-description` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;
  const describedBy = [props["aria-describedby"], descriptionId, errorId].filter(Boolean).join(" ") || undefined;
  const input = (
    <input
      {...props}
      id={inputId}
      aria-describedby={describedBy}
      aria-invalid={error ? true : props["aria-invalid"]}
      className={cn(controlClass, className)}
    />
  );

  if (!label) return input;

  return (
    <div>
      <div className="flex items-baseline gap-1">
        <label htmlFor={inputId} className={cn("block", labelClass)}>{label}</label>
        {props.required ? <span className="text-rose-600" aria-hidden="true">*</span> : null}
      </div>
      <div className="mt-2">{input}</div>
      <div className="mt-2 grid gap-1"><FormMessages description={description} descriptionId={descriptionId} error={error} errorId={errorId} /></div>
    </div>
  );
}
