import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { chartColors } from "../tokens/colors";

export default function PaymentMethodChart({ data = [] }) {
  const rows = data.length ? data : [{ method: "No data", amount: 0 }];

  return (
    <ResponsiveContainer width="100%" height="100%" minWidth={0} initialDimension={{ width: 1, height: 1 }}>
      <BarChart data={rows}>
        <XAxis dataKey="method" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
        <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
        <Tooltip />
        <Bar dataKey="amount" fill={chartColors.success} radius={[8, 8, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
