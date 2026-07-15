import { Search, X } from "lucide-react";
import { cn } from "../../components/ui/utils";
import { controlClass } from "../forms/styles";

export default function SearchInput({ value, onChange, placeholder = "Search...", label = placeholder, className = "", disabled = false }) {
  return (
    <label className={`relative block min-w-0 flex-1 ${className}`}>
      <span className="sr-only">{label}</span>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
      <input
        type="search"
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className={cn(controlClass, "pl-9", value ? "pr-11" : "pr-3")}
      />
      {value && !disabled ? (
        <button
          type="button"
          aria-label="Clear search"
          className="absolute right-1 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          onClick={() => onChange("")}
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      ) : null}
    </label>
  );
}
