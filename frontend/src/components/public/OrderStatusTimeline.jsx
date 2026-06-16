import { CheckCircle2, Circle } from "lucide-react";

const steps = [
  ["pending", "Order sent", "The restaurant has received your order."],
  ["accepted", "Accepted", "Staff confirmed your order."],
  ["preparing", "Preparing", "The kitchen is preparing your food."],
  ["ready", "Ready", "Your order is ready."],
  ["completed", "Completed", "Enjoy your meal."],
];

export default function OrderStatusTimeline({ status }) {
  const currentIndex = steps.findIndex(([value]) => value === status);
  const cancelled = status === "cancelled";

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-4 text-left shadow-sm">
      <h2 className="text-base font-black text-slate-950">Order status</h2>
      {cancelled ? <p className="mt-2 rounded-2xl bg-rose-50 p-3 text-sm font-semibold text-rose-700">This order was cancelled by the restaurant.</p> : null}
      <ol className="mt-4 grid gap-3">
        {steps.map(([value, label, description], index) => {
          const done = !cancelled && currentIndex >= index;
          const active = !cancelled && currentIndex === index;
          return (
            <li key={value} className="flex gap-3">
              <div className={`mt-0.5 ${done ? "text-emerald-600" : "text-slate-300"}`}>
                {done ? <CheckCircle2 className="h-5 w-5" aria-hidden="true" /> : <Circle className="h-5 w-5" aria-hidden="true" />}
              </div>
              <div>
                <p className={`font-black ${active ? "text-blue-700" : "text-slate-900"}`}>{label}</p>
                <p className="text-sm leading-5 text-slate-500">{description}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
