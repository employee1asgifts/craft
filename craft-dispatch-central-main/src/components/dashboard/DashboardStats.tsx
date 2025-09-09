import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Package, FileText, ClipboardList, Truck, Wallet, AlertCircle } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
  className?: string;
}

interface DateRange {
  from: Date;
  to: Date;
}

interface DashboardStatsProps {
  selectedDate: DateRange;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  description,
  icon,
  className,
}) => (
  <Card className={className}>
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">
        {title}
      </CardTitle>
      <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
        {icon}
      </div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
);

const DashboardStats: React.FC<DashboardStatsProps> = ({ selectedDate }) => {
  // In a real application, these values would be calculated based on the selectedDate range
  const stats = {
    newOrders: {
      value: 12,
      change: 8,
    },
    inDesign: {
      value: 8,
      change: -3,
    },
    readyToShip: {
      value: 5,
      change: 2,
    },
    dispatched: {
      value: 15,
      change: 0,
    },
    paidAmount: {
      value: "₹45,000",
      total: "Total payments received",
    },
    pendingAmount: {
      value: "₹15,000",
      total: "Payments awaiting collection",
    },
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
      <StatCard
        title="New Orders"
        value={stats.newOrders.value}
        description={`${stats.newOrders.change > 0 ? '+' : ''}${stats.newOrders.change} more than previous period`}
        icon={<Package className="h-4 w-4" />}
        className="bg-shop-soft-blue/20 border-shop-blue/20"
      />
      <StatCard
        title="In Design"
        value={stats.inDesign.value}
        description={`${stats.inDesign.change > 0 ? '+' : ''}${stats.inDesign.change} more than previous period`}
        icon={<FileText className="h-4 w-4" />}
        className="bg-shop-soft-purple/20 border-shop-purple/20"
      />
      <StatCard
        title="Ready to Ship"
        value={stats.readyToShip.value}
        description={`${stats.readyToShip.change > 0 ? '+' : ''}${stats.readyToShip.change} more than previous period`}
        icon={<ClipboardList className="h-4 w-4" />}
        className="bg-shop-soft-green/20 border-green-700/20"
      />
      <StatCard
        title="Dispatched"
        value={stats.dispatched.value}
        description={`${stats.dispatched.change > 0 ? '+' : ''}${stats.dispatched.change} more than previous period`}
        icon={<Truck className="h-4 w-4" />}
        className="bg-shop-soft-orange/20 border-orange-700/20"
      />
      <StatCard
        title="Paid Amount"
        value={stats.paidAmount.value}
        description={stats.paidAmount.total}
        icon={<Wallet className="h-4 w-4" />}
        className="bg-green-100 border-green-200"
      />
      <StatCard
        title="Pending Amount"
        value={stats.pendingAmount.value}
        description={stats.pendingAmount.total}
        icon={<AlertCircle className="h-4 w-4" />}
        className="bg-red-100 border-red-200"
      />
    </div>
  );
};

export default DashboardStats;
