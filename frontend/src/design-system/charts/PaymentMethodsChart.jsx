import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { chartColors } from "../tokens/colors";

export default function PaymentMethodsChart({ data = [] }) {
  return (
    <ResponsiveContainer width="100%" height="100%" minWidth={0} initialDimension={{ width: 1, height: 1 }}>
      <BarChart data={data}>
        <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
        <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
        <Tooltip />
        <Bar dataKey="paid_total" name="Paid" fill={chartColors.success} radius={[8, 8, 0, 0]} />
        <Bar dataKey="pending_total" name="Pending" fill={chartColors.warning} radius={[8, 8, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
