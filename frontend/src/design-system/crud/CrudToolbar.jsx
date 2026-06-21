import { RotateCcw } from "lucide-react";
import AppButton from "../components/AppButton";
import AppCard from "../components/AppCard";
import SearchInput from "./SearchInput";

export default function CrudToolbar({
  search,
  onSearch,
  searchPlaceholder,
  filters,
  extraActions,
  onClear,
}) {
  return (
    <AppCard className="shadow-none" bodyClassName="p-3 md:p-4">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
        <SearchInput value={search} onChange={onSearch} placeholder={searchPlaceholder} />
        {filters ? <div className="flex min-w-0 flex-wrap gap-2">{filters}</div> : null}
        <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:flex-wrap xl:ml-auto">
          {extraActions}
          {onClear ? (
            <AppButton type="button" variant="secondary" size="sm" iconLeft={<RotateCcw className="h-4 w-4" />} onClick={onClear}>
              Clear filters
            </AppButton>
          ) : null}
        </div>
      </div>
    </AppCard>
  );
}
