import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { chartColors } from "../tokens/colors";

const palette = [chartColors.warning, chartColors.info, chartColors.success, chartColors.danger, chartColors.muted];

export default function OrderStatusChart({ data = [] }) {
  const rows = data.length ? data : [{ name: "No data", value: 1 }];

  return (
    <ResponsiveContainer width="100%" height="100%" minWidth={0} initialDimension={{ width: 1, height: 1 }}>
      <PieChart>
        <Pie data={rows} dataKey="value" nameKey="name" innerRadius={55} outerRadius={92} paddingAngle={3}>
          {rows.map((entry, index) => <Cell key={entry.name} fill={palette[index % palette.length]} />)}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );
}
