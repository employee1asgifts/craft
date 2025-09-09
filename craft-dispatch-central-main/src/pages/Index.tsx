import React, { useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import DashboardStats from "@/components/dashboard/DashboardStats";
import RecentOrders from "@/components/dashboard/RecentOrders";
import OrderStatusChart from "@/components/dashboard/OrderStatusChart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Settings, CalendarIcon, ChevronDown, Package, Wallet, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import { cn } from "@/lib/utils";
import { Table, TableHeader, TableBody, TableCell, TableHead, TableRow } from "@/components/ui/table";

type DateRange = {
  from: Date;
  to: Date;
};

// Sample data
const orders = [
  {
    id: "ORD-001",
    customerName: "John Doe",
    status: "pending",
    total: 15000,
    date: "2024-03-15"
  },
  {
    id: "ORD-002",
    customerName: "Jane Smith",
    status: "completed",
    total: 25000,
    date: "2024-03-14"
  },
  {
    id: "ORD-003",
    customerName: "Mike Johnson",
    status: "processing",
    total: 18000,
    date: "2024-03-13"
  }
];

const customers = [
  { id: "CUST-001", name: "John Doe", orderCount: 3, totalSpent: 45000 },
  { id: "CUST-002", name: "Jane Smith", orderCount: 2, totalSpent: 35000 },
  { id: "CUST-003", name: "Mike Johnson", orderCount: 1, totalSpent: 18000 }
];

const products = [
  { id: "PROD-001", name: "Product 1", category: "Category A" },
  { id: "PROD-002", name: "Product 2", category: "Category B" },
  { id: "PROD-003", name: "Product 3", category: "Category A" }
];

const Index: React.FC = () => {
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState<DateRange>({
    from: startOfDay(new Date()),
    to: endOfDay(new Date()),
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getTotalRevenue = () => {
    return orders.reduce((total, order) => total + order.total, 0);
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTopProducts = () => {
    return products.map(product => ({
      ...product,
      orderCount: Math.floor(Math.random() * 10),
      revenue: Math.floor(Math.random() * 100000)
    }));
  };

  const getRecentCustomers = () => {
    return customers;
  };

  const quickFilters = [
    {
      label: "Today",
      onClick: () => {
        const today = new Date();
        setDateRange({
          from: startOfDay(today),
          to: endOfDay(today),
        });
      },
    },
    {
      label: "Yesterday",
      onClick: () => {
        const yesterday = subDays(new Date(), 1);
        setDateRange({
          from: startOfDay(yesterday),
          to: endOfDay(yesterday),
        });
      },
    },
    {
      label: "Last 7 Days",
      onClick: () => {
        const today = new Date();
        setDateRange({
          from: startOfDay(subDays(today, 6)),
          to: endOfDay(today),
        });
      },
    },
    {
      label: "Last 30 Days",
      onClick: () => {
        const today = new Date();
        setDateRange({
          from: startOfDay(subDays(today, 29)),
          to: endOfDay(today),
        });
      },
    },
    {
      label: "Last 60 Days",
      onClick: () => {
        const today = new Date();
        setDateRange({
          from: startOfDay(subDays(today, 59)),
          to: endOfDay(today),
        });
      },
    },
    {
      label: "Last Year",
      onClick: () => {
        const today = new Date();
        setDateRange({
          from: startOfDay(subDays(today, 364)),
          to: endOfDay(today),
        });
      },
    },
  ];

  const getFilterLabel = () => {
    if (dateRange.from === startOfDay(new Date())) return "Today";
    if (dateRange.from === startOfDay(subDays(new Date(), 1))) return "Yesterday";
    if (dateRange.from === startOfDay(subDays(new Date(), 6))) return "Last 7 Days";
    if (dateRange.from === startOfDay(subDays(new Date(), 29))) return "Last 30 Days";
    if (dateRange.from === startOfDay(subDays(new Date(), 59))) return "Last 60 Days";
    if (dateRange.from === startOfDay(subDays(new Date(), 364))) return "Last Year";
    return `${format(dateRange.from, "MMM d, yyyy")} - ${format(dateRange.to, "MMM d, yyyy")}`;
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Overview of your shop's performance and recent activity
            </p>
          </div>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-[240px] justify-between">
                  <div className="flex items-center">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    <span>{getFilterLabel()}</span>
                  </div>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[240px]">
                {quickFilters.map((filter) => (
                  <DropdownMenuItem
                    key={filter.label}
                    onClick={filter.onClick}
                    className={cn(
                      "cursor-pointer",
                      dateRange.from === startOfDay(new Date()) && filter.label === "Today" && "bg-accent",
                      dateRange.from === startOfDay(subDays(new Date(), 1)) && filter.label === "Yesterday" && "bg-accent",
                      dateRange.from === startOfDay(subDays(new Date(), 6)) && filter.label === "Last 7 Days" && "bg-accent",
                      dateRange.from === startOfDay(subDays(new Date(), 29)) && filter.label === "Last 30 Days" && "bg-accent",
                      dateRange.from === startOfDay(subDays(new Date(), 59)) && filter.label === "Last 60 Days" && "bg-accent",
                      dateRange.from === startOfDay(subDays(new Date(), 364)) && filter.label === "Last Year" && "bg-accent"
                    )}
                  >
                    {filter.label}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuItem className="p-0">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="ghost"
                        className="w-full justify-start font-normal"
                      >
                        Custom Range
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="range"
                        selected={dateRange}
                        onSelect={(range) => {
                          if (range?.from && range?.to) {
                            setDateRange({
                              from: startOfDay(range.from),
                              to: endOfDay(range.to),
                            });
                          }
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button 
              variant="outline" 
              onClick={() => setDateRange({
                from: startOfDay(new Date()),
                to: endOfDay(new Date()),
              })}
            >
              Reset
            </Button>
          </div>
        </div>
        
        <div className="space-y-4">
          <DashboardStats selectedDate={dateRange} />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Orders
                </CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{orders.length}</div>
                <p className="text-xs text-muted-foreground">
                  All time orders
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Revenue
                </CardTitle>
                <Wallet className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(getTotalRevenue())}</div>
                <p className="text-xs text-muted-foreground">
                  All time revenue
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Customers
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{customers.length}</div>
                <p className="text-xs text-muted-foreground">
                  All time customers
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Products
                </CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{products.length}</div>
                <p className="text-xs text-muted-foreground">
                  All time products
                </p>
              </CardContent>
            </Card>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>
                  Latest orders from your customers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.slice(0, 5).map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.id}</TableCell>
                        <TableCell>{order.customerName}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </TableCell>
                        <TableCell>{formatCurrency(order.total)}</TableCell>
                        <TableCell>{order.date}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Order Status</CardTitle>
                <CardDescription>
                  Distribution of orders by status
                </CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-center h-[300px]">
                <OrderStatusChart orders={orders} />
              </CardContent>
            </Card>
          </div>
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Top Products</CardTitle>
              <CardDescription>
                Most ordered products
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Orders</TableHead>
                    <TableHead>Revenue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getTopProducts().slice(0, 5).map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell>{product.orderCount}</TableCell>
                      <TableCell>{formatCurrency(product.revenue)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Recent Customers</CardTitle>
              <CardDescription>
                Latest customers who placed orders
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Orders</TableHead>
                    <TableHead>Total Spent</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getRecentCustomers().slice(0, 5).map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell className="font-medium">{customer.name}</TableCell>
                      <TableCell>{customer.orderCount}</TableCell>
                      <TableCell>{formatCurrency(customer.totalSpent)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-1">
            <Card className="mt-4">
              <CardHeader className="pb-3">
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Frequently used features</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    variant="outline" 
                    className="justify-start"
                    onClick={() => navigate('/invoices')}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Invoices
                  </Button>
                  <Button 
                    variant="outline"
                    className="justify-start"
                    onClick={() => navigate('/admin?tab=invoices')}
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Invoice Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Index;
