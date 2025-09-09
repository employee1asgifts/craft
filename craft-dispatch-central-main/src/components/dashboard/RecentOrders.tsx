
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface OrderItemProps {
  id: string;
  customer: string;
  date: string;
  amount: string;
  status: "new" | "design" | "ready" | "dispatched" | "delivered";
}

const OrderItem: React.FC<OrderItemProps> = ({
  id,
  customer,
  date,
  amount,
  status,
}) => {
  const getStatusText = (status: OrderItemProps["status"]) => {
    switch (status) {
      case "new":
        return "New Order";
      case "design":
        return "In Design";
      case "ready":
        return "Ready to Ship";
      case "dispatched":
        return "Dispatched";
      case "delivered":
        return "Delivered";
    }
  };

  return (
    <div className="flex items-center py-3">
      <div className="flex items-center gap-3 flex-1">
        <div className="h-9 w-9 rounded bg-primary/10 flex items-center justify-center text-primary">
          <Package className="h-4 w-4" />
        </div>
        <div>
          <div className="font-medium">{customer}</div>
          <div className="text-sm text-muted-foreground">{id}</div>
        </div>
      </div>
      <div className="hidden md:block text-right">
        <div className="font-medium">{amount}</div>
        <div className="text-sm text-muted-foreground">{date}</div>
      </div>
      <div className={`status-badge status-${status} ml-4`}>
        {getStatusText(status)}
      </div>
    </div>
  );
};

const RecentOrders: React.FC = () => {
  const orders: OrderItemProps[] = [
    {
      id: "ORD-7851",
      customer: "Jane Cooper",
      date: "May 03, 2025",
      amount: "₹15,000",
      status: "new",
    },
    {
      id: "ORD-7852",
      customer: "Alex Smith",
      date: "May 02, 2025",
      amount: "₹20,000",
      status: "design",
    },
    {
      id: "ORD-7844",
      customer: "Michael Johnson",
      date: "May 02, 2025",
      amount: "₹11,000",
      status: "ready",
    },
    {
      id: "ORD-7841",
      customer: "Sarah Williams",
      date: "May 01, 2025",
      amount: "₹25,000",
      status: "dispatched",
    },
    {
      id: "ORD-7839",
      customer: "Robert Brown",
      date: "Apr 30, 2025",
      amount: "₹12,000",
      status: "delivered",
    },
  ];

  return (
    <Card className="col-span-3">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl">Recent Orders</CardTitle>
        <Button variant="outline" asChild>
          <Link to="/orders">View All</Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-0 divide-y">
          {orders.map((order) => (
            <OrderItem key={order.id} {...order} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentOrders;
