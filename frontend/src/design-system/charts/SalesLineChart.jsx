import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { chartColors } from "../tokens/colors";

const fallback = [
  { label: "9 AM", sales: 0 },
  { label: "11 AM", sales: 0 },
  { label: "1 PM", sales: 0 },
  { label: "3 PM", sales: 0 },
  { label: "5 PM", sales: 0 },
];

export default function SalesLineChart({ data = fallback }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data.length ? data : fallback}>
        <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
        <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
        <Tooltip />
        <Line type="monotone" dataKey="sales" stroke={chartColors.sales} strokeWidth={3} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
