export default function OfflineBanner({ cached = false }) {
  return (
    <div className="mx-auto max-w-3xl px-4 pt-4">
      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900 shadow-sm">
        {cached
          ? "You are offline. Showing the last saved menu; prices and availability may have changed."
          : "You are offline. Connect to the internet to refresh the menu and submit orders."}
      </div>
    </div>
  );
}
