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
                    {/* Placeholder for the removed demo data */}
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
                <OrderStatusChart orders={[]} />
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
                  {/* Placeholder for the removed demo data */}
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
                  {/* Placeholder for the removed demo data */}
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
