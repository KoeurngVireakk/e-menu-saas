import { CircleAlert } from "lucide-react";
import { errorClass, helperClass } from "./styles";

export default function FormMessages({ description, descriptionId, error, errorId }) {
  return (
    <>
      {description ? <span id={descriptionId} className={helperClass}>{description}</span> : null}
      {error ? (
        <span id={errorId} className={errorClass} role="alert">
          <CircleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </span>
      ) : null}
    </>
  );
}
