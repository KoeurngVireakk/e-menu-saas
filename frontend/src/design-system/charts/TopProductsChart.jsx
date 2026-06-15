import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { chartColors } from "../tokens/colors";

export default function TopProductsChart({ data = [] }) {
  const rows = data.length ? data : [{ name: "No products", quantity: 0 }];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={rows} layout="vertical" margin={{ left: 12 }}>
        <XAxis type="number" hide />
        <YAxis dataKey="name" type="category" width={90} tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
        <Tooltip />
        <Bar dataKey="quantity" fill={chartColors.orders} radius={[0, 8, 8, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
