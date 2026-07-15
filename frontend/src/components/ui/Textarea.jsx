import { useId } from "react";
import { cn } from "./utils";
import FormMessages from "../../design-system/forms/FormMessages";
import { controlClass, labelClass } from "../../design-system/forms/styles";

export default function Textarea({ label, description, error, className = "", id, ...props }) {
  const generatedId = useId();
  const textareaId = id || generatedId;
  const descriptionId = description ? `${textareaId}-description` : undefined;
  const errorId = error ? `${textareaId}-error` : undefined;
  const describedBy = [props["aria-describedby"], descriptionId, errorId].filter(Boolean).join(" ") || undefined;
  const textarea = (
    <textarea
      {...props}
      id={textareaId}
      aria-describedby={describedBy}
      aria-invalid={error ? true : props["aria-invalid"]}
      className={cn(controlClass, "min-h-32 resize-y", className)}
    />
  );

  if (!label) return textarea;

  return (
    <div>
      <div className="flex items-baseline gap-1">
        <label htmlFor={textareaId} className={cn("block", labelClass)}>{label}</label>
        {props.required ? <span className="text-rose-600" aria-hidden="true">*</span> : null}
      </div>
      <div className="mt-2">{textarea}</div>
      <div className="mt-2 grid gap-1"><FormMessages description={description} descriptionId={descriptionId} error={error} errorId={errorId} /></div>
    </div>
  );
}
