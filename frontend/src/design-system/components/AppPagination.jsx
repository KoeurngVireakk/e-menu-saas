import { ChevronLeft, ChevronRight } from "lucide-react";
import AppButton from "./AppButton";

export default function AppPagination({ page = 1, pageCount = 1, onPageChange, summary, label = "Pagination" }) {
  const safePageCount = Math.max(1, Number(pageCount) || 1);
  const safePage = Math.min(Math.max(1, Number(page) || 1), safePageCount);

  return (
    <nav className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between" aria-label={label}>
      <p className="khmer-text min-w-0 text-sm font-semibold leading-6 text-slate-500" aria-live="polite">
        {summary || `Page ${safePage} of ${safePageCount}`}
      </p>
      <div className="flex min-w-0 items-center gap-2">
        <AppButton
          type="button"
          variant="secondary"
          size="icon"
          aria-label="Previous page"
          disabled={safePage <= 1}
          onClick={() => onPageChange?.(safePage - 1)}
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        </AppButton>
        <span className="khmer-text min-w-16 text-center text-sm font-bold text-slate-700">{safePage} / {safePageCount}</span>
        <AppButton
          type="button"
          variant="secondary"
          size="icon"
          aria-label="Next page"
          disabled={safePage >= safePageCount}
          onClick={() => onPageChange?.(safePage + 1)}
        >
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </AppButton>
      </div>
    </nav>
  );
}
