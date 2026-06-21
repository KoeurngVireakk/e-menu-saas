import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { chartColors } from "../tokens/colors";

export default function SalesTrendChart({ data = [] }) {
  return (
    <ResponsiveContainer width="100%" height="100%" minWidth={0} initialDimension={{ width: 1, height: 1 }}>
      <LineChart data={data}>
        <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
        <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
        <Tooltip />
        <Line type="monotone" dataKey="sales" name="Sales" stroke={chartColors.sales} strokeWidth={3} dot={false} />
        <Line type="monotone" dataKey="orders" name="Orders" stroke={chartColors.orders} strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
