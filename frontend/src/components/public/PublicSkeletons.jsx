export function MenuPageSkeleton() {
  return (
    <div className="mx-auto min-h-screen max-w-5xl bg-slate-50 p-4">
      <div className="h-52 animate-pulse rounded-b-[2rem] rounded-t-3xl bg-slate-200" />
      <div className="mt-5 flex gap-2 overflow-hidden">
        {[1, 2, 3, 4].map((item) => <div key={item} className="h-10 w-24 shrink-0 animate-pulse rounded-full bg-slate-200" />)}
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className="grid grid-cols-[96px_1fr] gap-3 rounded-2xl border border-slate-200 bg-white p-3">
            <div className="h-28 animate-pulse rounded-xl bg-slate-200" />
            <div className="space-y-3 py-1">
              <div className="h-4 w-3/4 animate-pulse rounded bg-slate-200" />
              <div className="h-3 w-full animate-pulse rounded bg-slate-100" />
              <div className="h-3 w-2/3 animate-pulse rounded bg-slate-100" />
              <div className="h-9 w-28 animate-pulse rounded-xl bg-slate-200" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function PublicPageSkeleton({ label = "Loading..." }) {
  return (
    <div className="mx-auto min-h-screen max-w-2xl bg-slate-50 p-4">
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="h-4 w-28 animate-pulse rounded bg-slate-200" />
        <div className="mt-4 h-8 w-2/3 animate-pulse rounded bg-slate-200" />
        <div className="mt-6 grid gap-3">
          {[1, 2, 3].map((item) => <div key={item} className="h-16 animate-pulse rounded-2xl bg-slate-100" />)}
        </div>
        <p className="sr-only">{label}</p>
      </div>
    </div>
  );
}
