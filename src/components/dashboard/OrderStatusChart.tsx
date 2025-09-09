import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface Order {
  id: string;
  customerName: string;
  status: string;
  total: number;
  date: string;
}

interface OrderStatusChartProps {
  orders: Order[];
}

const OrderStatusChart: React.FC<OrderStatusChartProps> = ({ orders }) => {
  const statusCounts = orders.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const data = Object.entries(statusCounts).map(([status, count]) => ({
    name: status.charAt(0).toUpperCase() + status.slice(1),
    value: count,
  }));

  const COLORS = {
    completed: "#22c55e",
    pending: "#eab308",
    processing: "#3b82f6",
    cancelled: "#ef4444",
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
        >
          {data.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={COLORS[entry.name.toLowerCase() as keyof typeof COLORS] || "#94a3b8"} 
            />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default OrderStatusChart;
