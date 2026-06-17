export default function AppSkeleton({ variant = "card", rows = 3 }) {
  const block = "animate-pulse rounded-3xl bg-gradient-to-r from-slate-100 via-slate-200 to-slate-100 bg-[length:200%_100%]";

  if (variant === "page") {
    return (
      <div className="animate-pulse space-y-5">
        <div className="h-8 w-64 rounded-xl bg-slate-200" />
        <div className="grid gap-4 sm:grid-cols-3">
          {[0, 1, 2].map((item) => <div key={item} className={`h-28 ${block}`} />)}
        </div>
        <div className={`h-72 ${block}`} />
      </div>
    );
  }

  if (variant === "table") {
    return (
      <div className="animate-pulse space-y-3">
        {Array.from({ length: rows }).map((_, index) => <div key={index} className={`h-12 ${block}`} />)}
      </div>
    );
  }

  if (variant === "product-grid") {
    return (
      <div className="grid animate-pulse gap-3">
        {Array.from({ length: rows }).map((_, index) => <div key={index} className={`h-32 ${block}`} />)}
      </div>
    );
  }

  return <div className={`h-32 ${block}`} />;
}
