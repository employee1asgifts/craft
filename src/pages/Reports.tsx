import React, { useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import { Calendar as CalendarIcon, FileDown, ChartBar, ChartBarIcon, Wallet, Package, Users, Truck, ChevronDown, Download, FileSpreadsheet, ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown, CreditCard, Clock, AlertCircle, CheckCircle2, BarChart2, CheckCircle, UserCheck, CalendarDays, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, subDays, startOfDay, endOfDay, differenceInDays, parse, isWithinInterval } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import * as XLSX from 'xlsx';

type DateRange = {
  from: Date;
  to?: Date;
};

interface DesignTask {
  id: string;
  orderId: string;
  customer: string;
  items: string;
  date: string;
  status: "not_assigned" | "in_progress" | "partially_completed" | "completed";
  assignedTo: string | null;
  completionNotes: string;
  partialReason: string;
}

interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  checkIn: string;
  checkOut: string;
  status: "present" | "absent" | "late" | "half_day";
  workingHours: number;
  department: string;
}

const Reports: React.FC = () => {
  const [dateRange, setDateRange] = React.useState<DateRange>({
    from: startOfDay(new Date()),
    to: endOfDay(new Date()),
  });
  const [activeTab, setActiveTab] = useState("sales");
  const [reportDateRange, setReportDateRange] = useState<DateRange | undefined>();
  const [tasks, setTasks] = useState<DesignTask[]>([]);

  // Enhanced sample data
  const monthlySalesData = [
    { month: "Jan", sales: 45000, orders: 28, returns: 2, avgOrderValue: 1607 },
    { month: "Feb", sales: 52000, orders: 35, returns: 3, avgOrderValue: 1486 },
    { month: "Mar", sales: 49000, orders: 30, returns: 1, avgOrderValue: 1633 },
    { month: "Apr", sales: 63000, orders: 42, returns: 4, avgOrderValue: 1500 },
    { month: "May", sales: 58000, orders: 38, returns: 2, avgOrderValue: 1526 },
  ];

  const dailySalesData = [
    { date: "2024-03-01", sales: 2500, orders: 3 },
    { date: "2024-03-02", sales: 3200, orders: 4 },
    { date: "2024-03-03", sales: 2800, orders: 3 },
    { date: "2024-03-04", sales: 3500, orders: 5 },
    { date: "2024-03-05", sales: 4200, orders: 6 },
  ];

  const categoryData = [
    { name: "Apparel", value: 35 },
    { name: "Print", value: 25 },
    { name: "Design", value: 20 },
    { name: "Packaging", value: 15 },
    { name: "Other", value: 5 },
  ];

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE'];
  
  const profitLossData = [
    { month: "Jan", revenue: 45000, expenses: 32000, profit: 13000 },
    { month: "Feb", revenue: 52000, expenses: 36000, profit: 16000 },
    { month: "Mar", revenue: 49000, expenses: 34000, profit: 15000 },
    { month: "Apr", revenue: 63000, expenses: 42000, profit: 21000 },
    { month: "May", revenue: 58000, expenses: 38000, profit: 20000 },
  ];

  const topProducts = [
    { name: "Custom T-shirts", sales: "₹18,500", quantity: 45 },
    { name: "Business Cards", sales: "₹12,300", quantity: 1250 },
    { name: "Logo Design", sales: "₹35,000", quantity: 14 },
    { name: "Brochures", sales: "₹9,800", quantity: 500 },
    { name: "Ceramic Mugs", sales: "₹7,200", quantity: 120 },
  ];

  // Sample data for expense charts
  const expensesData = [
    { month: "Jan", stock: 15000, office: 8000, advertising: 12000, vendor: 22000, transport: 10000 },
    { month: "Feb", stock: 18000, office: 7500, advertising: 15000, vendor: 25000, transport: 9000 },
    { month: "Mar", stock: 16000, office: 9000, advertising: 14000, vendor: 20000, transport: 9500 },
    { month: "Apr", stock: 22000, office: 8500, advertising: 18000, vendor: 28000, transport: 12000 },
    { month: "May", stock: 20000, office: 7800, advertising: 16500, vendor: 24000, transport: 11000 },
  ];

  const expenseCategoryData = [
    { name: "Stock", value: 91000, color: "#8884d8" },
    { name: "Office", value: 40800, color: "#82ca9d" },
    { name: "Advertising", value: 75500, color: "#ffc658" },
    { name: "Vendor", value: 119000, color: "#ff8042" },
    { name: "Transport", value: 51500, color: "#0088FE" },
  ];

  const totalRevenue = "₹267,000";
  const totalExpenses = "₹182,000";
  const netProfit = "₹85,000";
  const profitMargin = "31.8%";

  const customerMetrics = {
    totalCustomers: 1250,
    newCustomers: 45,
    returningCustomers: 380,
    averageOrderFrequency: 2.8,
    customerRetentionRate: 78,
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

  const reports = [
    {
      id: 1,
      name: "Sales Report",
      description: "Detailed sales analysis with revenue breakdown",
      lastGenerated: "2024-03-15",
    },
    {
      id: 2,
      name: "Order Status Report",
      description: "Current status of all orders",
      lastGenerated: "2024-03-15",
    },
    {
      id: 3,
      name: "Customer Report",
      description: "Customer details and order history",
      lastGenerated: "2024-03-14",
    },
    {
      id: 4,
      name: "Product Performance",
      description: "Product-wise sales and performance metrics",
      lastGenerated: "2024-03-14",
    },
    {
      id: 5,
      name: "Payment Report",
      description: "Payment status and collection details",
      lastGenerated: "2024-03-13",
    },
    {
      id: 6,
      name: "Inventory Report",
      description: "Current stock levels and inventory status",
      lastGenerated: "2024-03-16",
    },
    {
      id: 7,
      name: "Supplier Report",
      description: "Supplier performance and order history",
      lastGenerated: "2024-03-16",
    },
  ];

  // Add sample data for inventory and supplier reports
  const inventoryData = [
    { product: "T-shirt Blanks", currentStock: 500, reorderLevel: 100, lastOrdered: "2024-03-10", supplier: "PrintPro Solutions" },
    { product: "Premium Business Card Paper", currentStock: 2000, reorderLevel: 500, lastOrdered: "2024-03-12", supplier: "Paper Supplies Ltd" },
    { product: "Ceramic Mugs", currentStock: 300, reorderLevel: 50, lastOrdered: "2024-03-08", supplier: "Design Tools Co" },
    { product: "Vinyl Sticker Material", currentStock: 150, reorderLevel: 75, lastOrdered: "2024-03-15", supplier: "PrintPro Solutions" },
    { product: "Canvas Prints", currentStock: 100, reorderLevel: 25, lastOrdered: "2024-03-14", supplier: "Paper Supplies Ltd" },
  ];

  const supplierData = [
    { 
      name: "PrintPro Solutions",
      totalOrders: 45,
      totalSpent: "₹125,000",
      lastOrder: "2024-03-15",
      avgDeliveryTime: "3 days",
      reliability: "98%",
      category: "Printing"
    },
    { 
      name: "Paper Supplies Ltd",
      totalOrders: 38,
      totalSpent: "₹95,000",
      lastOrder: "2024-03-12",
      avgDeliveryTime: "2 days",
      reliability: "99%",
      category: "Raw Materials"
    },
    { 
      name: "Design Tools Co",
      totalOrders: 25,
      totalSpent: "₹75,000",
      lastOrder: "2024-03-10",
      avgDeliveryTime: "4 days",
      reliability: "95%",
      category: "Equipment"
    },
  ];

  const handleDownloadReport = (reportId: number) => {
    let data: any[] = [];
    let reportType = '';

    switch (reportId) {
      case 6: // Inventory Report
        data = inventoryData;
        reportType = 'inventory';
        break;
      case 7: // Supplier Report
        data = supplierData;
        reportType = 'supplier';
        break;
      default:
        // Handle other report types
        console.log(`Downloading report ${reportId}`);
        return;
    }

    handleExportReport(reportType, data);
  };

  const handleExportReport = (reportType: string, data: any[]) => {
    try {
      // Prepare data for Excel
      const excelData = data.map(item => {
        if (reportType === 'inventory') {
          return {
            'Product Name': item.product,
            'Current Stock': item.currentStock,
            'Reorder Level': item.reorderLevel,
            'Last Ordered': item.lastOrdered,
            'Supplier': item.supplier
          };
        } else if (reportType === 'supplier') {
          return {
            'Supplier Name': item.name,
            'Total Orders': item.totalOrders,
            'Total Spent': item.totalSpent,
            'Last Order': item.lastOrder,
            'Average Delivery Time': item.avgDeliveryTime,
            'Reliability': item.reliability,
            'Category': item.category
          };
        }
        return item;
      });

      // Create worksheet
      const ws = XLSX.utils.json_to_sheet(excelData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, reportType === 'inventory' ? 'Inventory Report' : 'Supplier Report');

      // Generate Excel file
      XLSX.writeFile(wb, `${reportType === 'inventory' ? 'Inventory' : 'Supplier'}_Report_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
      
      toast.success(`${reportType === 'inventory' ? 'Inventory' : 'Supplier'} report downloaded successfully`);
    } catch (error) {
      console.error('Error exporting report:', error);
      toast.error('Failed to export report');
    }
  };

  // Payment tracking data
  const paymentData = {
    today: {
      total: 45000,
      count: 12,
      pending: 3,
      completed: 9
    },
    yesterday: {
      total: 38000,
      count: 10,
      pending: 2,
      completed: 8
    },
    pending: {
      total: 125000,
      count: 25,
      overdue: 8
    }
  };

  const recentPayments = [
    {
      id: "PAY-001",
      orderId: "ORD-001",
      amount: 12500,
      date: "2024-03-15",
      status: "completed",
      method: "UPI",
      customer: "John Doe"
    },
    {
      id: "PAY-002",
      orderId: "ORD-002",
      amount: 8500,
      date: "2024-03-15",
      status: "pending",
      method: "Bank Transfer",
      customer: "Jane Smith"
    },
    {
      id: "PAY-003",
      orderId: "ORD-003",
      amount: 15000,
      date: "2024-03-14",
      status: "completed",
      method: "Credit Card",
      customer: "Mike Johnson"
    },
    {
      id: "PAY-004",
      orderId: "ORD-004",
      amount: 9500,
      date: "2024-03-14",
      status: "overdue",
      method: "Bank Transfer",
      customer: "Sarah Wilson"
    },
    {
      id: "PAY-005",
      orderId: "ORD-005",
      amount: 22000,
      date: "2024-03-13",
      status: "completed",
      method: "UPI",
      customer: "David Brown"
    }
  ];

  const paymentMethods = [
    { name: "UPI", value: 45 },
    { name: "Bank Transfer", value: 25 },
    { name: "Credit Card", value: 20 },
    { name: "Cash", value: 10 }
  ];

  const paymentTrends = [
    { date: "2024-03-10", completed: 35000, pending: 15000 },
    { date: "2024-03-11", completed: 42000, pending: 18000 },
    { date: "2024-03-12", completed: 38000, pending: 12000 },
    { date: "2024-03-13", completed: 45000, pending: 20000 },
    { date: "2024-03-14", completed: 40000, pending: 15000 },
    { date: "2024-03-15", completed: 48000, pending: 22000 }
  ];

  // Add this function to handle date range selection
  const handleDateRangeSelect = (range: DateRange | undefined) => {
    if (range?.from) {
      setReportDateRange({
        from: range.from,
        to: range.to || range.from
      });
    } else {
      setReportDateRange(undefined);
    }
  };

  // Add sample attendance data
  const attendanceData = {
    today: {
      present: 45,
      absent: 3,
      late: 2,
      halfDay: 1
    },
    thisWeek: {
      present: 215,
      absent: 12,
      late: 8,
      halfDay: 5
    },
    thisMonth: {
      present: 850,
      absent: 45,
      late: 25,
      halfDay: 15
    }
  };

  const attendanceTrends = [
    { date: "2024-03-11", present: 48, absent: 2, late: 1, halfDay: 0 },
    { date: "2024-03-12", present: 47, absent: 3, late: 1, halfDay: 0 },
    { date: "2024-03-13", present: 46, absent: 2, late: 2, halfDay: 1 },
    { date: "2024-03-14", present: 45, absent: 3, late: 2, halfDay: 1 },
    { date: "2024-03-15", present: 45, absent: 3, late: 2, halfDay: 1 }
  ];

  const recentAttendance = [
    {
      id: "ATT001",
      employeeId: "EMP001",
      employeeName: "John Doe",
      date: "2024-03-15",
      checkIn: "09:00 AM",
      checkOut: "06:00 PM",
      status: "present",
      workingHours: 9,
      department: "Design"
    },
    {
      id: "ATT002",
      employeeId: "EMP002",
      employeeName: "Jane Smith",
      date: "2024-03-15",
      checkIn: "09:30 AM",
      checkOut: "06:00 PM",
      status: "late",
      workingHours: 8.5,
      department: "Development"
    },
    {
      id: "ATT003",
      employeeId: "EMP003",
      employeeName: "Mike Johnson",
      date: "2024-03-15",
      checkIn: "09:00 AM",
      checkOut: "02:00 PM",
      status: "half_day",
      workingHours: 5,
      department: "Marketing"
    },
    {
      id: "ATT004",
      employeeId: "EMP004",
      employeeName: "Sarah Wilson",
      date: "2024-03-15",
      checkIn: "-",
      checkOut: "-",
      status: "absent",
      workingHours: 0,
      department: "Sales"
    }
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
            <p className="text-muted-foreground">
              Monitor your business performance and profitability
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
                      <Calendar
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
            
            <Button variant="outline" onClick={() => setDateRange({
              from: startOfDay(new Date()),
              to: endOfDay(new Date()),
            })}>
              Reset
            </Button>
          </div>
        </div>

        <Tabs defaultValue="sales" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-6 w-full md:w-[720px]">
            <TabsTrigger value="sales">Sales</TabsTrigger>
            <TabsTrigger value="profitloss">Profit & Loss</TabsTrigger>
            <TabsTrigger value="expenses">Expenses</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="designers">Designers</TabsTrigger>
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
          </TabsList>
          
          <TabsContent value="sales" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
                  <ChartBar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">₹267,000</div>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                    +18% from last month
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Orders</CardTitle>
                  <ChartBar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">173</div>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                    +12% from last month
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Average Order</CardTitle>
                  <ChartBar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">₹1,544</div>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                    +5% from last month
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                  <ChartBar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">24%</div>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                    +2% from last month
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>Daily Sales Trend</CardTitle>
                  <CardDescription>Last 5 days of sales activity</CardDescription>
                </CardHeader>
                <CardContent className="pl-0">
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart
                      data={dailySalesData}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Area type="monotone" dataKey="sales" stroke="#8884d8" fill="#8884d8" name="Sales (₹)" />
                      <Area type="monotone" dataKey="orders" stroke="#82ca9d" fill="#82ca9d" name="Orders" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              
              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>Customer Metrics</CardTitle>
                  <CardDescription>Key customer performance indicators</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Total Customers</p>
                      <p className="text-2xl font-bold">{customerMetrics.totalCustomers}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">New Customers</p>
                      <p className="text-2xl font-bold">{customerMetrics.newCustomers}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Returning Customers</p>
                      <p className="text-2xl font-bold">{customerMetrics.returningCustomers}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Retention Rate</p>
                      <p className="text-2xl font-bold">{customerMetrics.customerRetentionRate}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Detailed Sales Analysis</CardTitle>
                <CardDescription>Monthly breakdown of sales metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-muted-foreground uppercase bg-muted/40">
                      <tr>
                        <th scope="col" className="px-6 py-3">Month</th>
                        <th scope="col" className="px-6 py-3">Sales (₹)</th>
                        <th scope="col" className="px-6 py-3">Orders</th>
                        <th scope="col" className="px-6 py-3">Returns</th>
                        <th scope="col" className="px-6 py-3">Avg Order Value (₹)</th>
                        <th scope="col" className="px-6 py-3">Return Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {monthlySalesData.map((data, index) => (
                        <tr key={index} className="border-b">
                          <td className="px-6 py-4 font-medium">{data.month}</td>
                          <td className="px-6 py-4">₹{data.sales.toLocaleString()}</td>
                          <td className="px-6 py-4">{data.orders}</td>
                          <td className="px-6 py-4">{data.returns}</td>
                          <td className="px-6 py-4">₹{data.avgOrderValue.toLocaleString()}</td>
                          <td className="px-6 py-4">
                            {((data.returns / data.orders) * 100).toFixed(1)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleExportReport('sales', monthlySalesData)}
                >
                  <FileSpreadsheet className="mr-2 h-4 w-4" /> Export Sales Report
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="profitloss" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <ChartBar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalRevenue}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                  <ChartBar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalExpenses}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
                  <ChartBar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{netProfit}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Profit Margin</CardTitle>
                  <ChartBar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{profitMargin}</div>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Profit & Loss Trend</CardTitle>
              </CardHeader>
              <CardContent className="pl-0">
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart
                    data={profitLossData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="revenue" stroke="#8884d8" name="Revenue (₹)" />
                    <Line type="monotone" dataKey="expenses" stroke="#ff7300" name="Expenses (₹)" />
                    <Line type="monotone" dataKey="profit" stroke="#82ca9d" name="Profit (₹)" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="expenses" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                  <Wallet className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">₹378,800</div>
                  <p className="text-xs text-muted-foreground">
                    Year to date
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Stock Expenses</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">₹91,000</div>
                  <p className="text-xs text-muted-foreground">
                    24% of total expenses
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Vendor Payments</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">₹119,000</div>
                  <p className="text-xs text-muted-foreground">
                    31% of total expenses
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Transport Costs</CardTitle>
                  <Truck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">₹51,500</div>
                  <p className="text-xs text-muted-foreground">
                    14% of total expenses
                  </p>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>Expense Trends</CardTitle>
                </CardHeader>
                <CardContent className="pl-0">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={expensesData}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="stock" fill="#8884d8" name="Stock" />
                      <Bar dataKey="office" fill="#82ca9d" name="Office" />
                      <Bar dataKey="advertising" fill="#ffc658" name="Advertising" />
                      <Bar dataKey="vendor" fill="#ff8042" name="Vendor" />
                      <Bar dataKey="transport" fill="#0088FE" name="Transport" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              
              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>Expense Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={expenseCategoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {expenseCategoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Monthly Expense Summary</CardTitle>
                <CardDescription>
                  Detailed breakdown of expenses by category and month
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-muted-foreground uppercase bg-muted/40">
                      <tr>
                        <th scope="col" className="px-6 py-3">Month</th>
                        <th scope="col" className="px-6 py-3">Stock</th>
                        <th scope="col" className="px-6 py-3">Office</th>
                        <th scope="col" className="px-6 py-3">Advertising</th>
                        <th scope="col" className="px-6 py-3">Vendor</th>
                        <th scope="col" className="px-6 py-3">Transport</th>
                        <th scope="col" className="px-6 py-3">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {expensesData.map((data, index) => (
                        <tr key={index} className="border-b">
                          <td className="px-6 py-4 font-medium">{data.month}</td>
                          <td className="px-6 py-4">₹{data.stock.toLocaleString()}</td>
                          <td className="px-6 py-4">₹{data.office.toLocaleString()}</td>
                          <td className="px-6 py-4">₹{data.advertising.toLocaleString()}</td>
                          <td className="px-6 py-4">₹{data.vendor.toLocaleString()}</td>
                          <td className="px-6 py-4">₹{data.transport.toLocaleString()}</td>
                          <td className="px-6 py-4 font-semibold">
                            ₹{(data.stock + data.office + data.advertising + data.vendor + data.transport).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-muted/20">
                        <td className="px-6 py-4 font-medium">Total</td>
                        <td className="px-6 py-4 font-semibold">₹91,000</td>
                        <td className="px-6 py-4 font-semibold">₹40,800</td>
                        <td className="px-6 py-4 font-semibold">₹75,500</td>
                        <td className="px-6 py-4 font-semibold">₹119,000</td>
                        <td className="px-6 py-4 font-semibold">₹51,500</td>
                        <td className="px-6 py-4 font-semibold">₹378,800</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button variant="outline" size="sm" onClick={() => handleExportReport('expenses', expensesData)}>
                  <FileSpreadsheet className="mr-2 h-4 w-4" /> Export Expense Report
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="products" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Top Selling Products</CardTitle>
                <CardDescription>Products with the highest sales volume</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-muted-foreground uppercase bg-muted/40">
                      <tr>
                        <th scope="col" className="px-6 py-3">Product Name</th>
                        <th scope="col" className="px-6 py-3">Total Sales</th>
                        <th scope="col" className="px-6 py-3">Quantity Sold</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topProducts.map((product, index) => (
                        <tr key={index} className="border-b">
                          <td className="px-6 py-4 font-medium">{product.name}</td>
                          <td className="px-6 py-4">{product.sales}</td>
                          <td className="px-6 py-4">{product.quantity}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button variant="outline" size="sm" onClick={() => handleExportReport('products', topProducts)}>
                  <FileSpreadsheet className="mr-2 h-4 w-4" /> Export Product Report
                </Button>
              </CardFooter>
            </Card>
            
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Product Category Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Inventory Stock Levels</CardTitle>
                  <CardDescription>Current stock vs reorder levels</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={inventoryData}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="product" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="currentStock" fill="#82ca9d" name="Current Stock" />
                      <Bar dataKey="reorderLevel" fill="#ff8042" name="Reorder Level" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Supplier Performance</CardTitle>
                <CardDescription>Key metrics by supplier</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart
                        data={supplierData}
                        margin={{
                          top: 5,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="totalOrders" fill="#8884d8" name="Total Orders" />
                        <Bar dataKey="reliability" fill="#82ca9d" name="Reliability %" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={supplierData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, totalSpent }) => `${name}: ${totalSpent}`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="totalOrders"
                        >
                          {supplierData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Today's Payments</CardTitle>
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">₹{paymentData.today.total.toLocaleString()}</div>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <span>{paymentData.today.count} payments</span>
                    <span className="mx-2">•</span>
                    <span className="text-yellow-500">{paymentData.today.pending} pending</span>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Yesterday's Payments</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">₹{paymentData.yesterday.total.toLocaleString()}</div>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <span>{paymentData.yesterday.count} payments</span>
                    <span className="mx-2">•</span>
                    <span className="text-yellow-500">{paymentData.yesterday.pending} pending</span>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">₹{paymentData.pending.total.toLocaleString()}</div>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <span>{paymentData.pending.count} payments</span>
                    <span className="mx-2">•</span>
                    <span className="text-red-500">{paymentData.pending.overdue} overdue</span>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Payment Success Rate</CardTitle>
                  <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">92%</div>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <span>Last 30 days</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>Payment Trends</CardTitle>
                  <CardDescription>Daily payment collection vs pending</CardDescription>
                </CardHeader>
                <CardContent className="pl-0">
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart
                      data={paymentTrends}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Area type="monotone" dataKey="completed" stroke="#82ca9d" fill="#82ca9d" name="Completed (₹)" />
                      <Area type="monotone" dataKey="pending" stroke="#ff8042" fill="#ff8042" name="Pending (₹)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>Payment Methods</CardTitle>
                  <CardDescription>Distribution by payment method</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={paymentMethods}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {paymentMethods.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recent Payments</CardTitle>
                <CardDescription>Latest payment transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-muted-foreground uppercase bg-muted/40">
                      <tr>
                        <th scope="col" className="px-6 py-3">Payment ID</th>
                        <th scope="col" className="px-6 py-3">Order ID</th>
                        <th scope="col" className="px-6 py-3">Customer</th>
                        <th scope="col" className="px-6 py-3">Amount</th>
                        <th scope="col" className="px-6 py-3">Date</th>
                        <th scope="col" className="px-6 py-3">Method</th>
                        <th scope="col" className="px-6 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentPayments.map((payment) => (
                        <tr key={payment.id} className="border-b">
                          <td className="px-6 py-4 font-medium">{payment.id}</td>
                          <td className="px-6 py-4">{payment.orderId}</td>
                          <td className="px-6 py-4">{payment.customer}</td>
                          <td className="px-6 py-4">₹{payment.amount.toLocaleString()}</td>
                          <td className="px-6 py-4">{payment.date}</td>
                          <td className="px-6 py-4">{payment.method}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              payment.status === 'completed' ? 'bg-green-100 text-green-800' :
                              payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleExportReport('payments', recentPayments)}
                >
                  <FileSpreadsheet className="mr-2 h-4 w-4" /> Export Payment Report
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="designers" className="space-y-4">
            <div className="space-y-6">
              {/* Date Range Filter for Designer Reports */}
              <Card>
                <CardHeader>
                  <CardTitle>Date Filter</CardTitle>
                  <CardDescription>Filter designer reports by date range</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant={!reportDateRange ? "default" : "outline"}
                        onClick={() => setReportDateRange(undefined)}
                      >
                        All Time
                      </Button>
                      <Button
                        variant={reportDateRange?.from && !reportDateRange?.to && 
                          format(reportDateRange.from, "dd/MM/yyyy") === format(new Date(), "dd/MM/yyyy") 
                          ? "default" : "outline"}
                        onClick={() => setReportDateRange({
                          from: startOfDay(new Date()),
                          to: endOfDay(new Date())
                        })}
                      >
                        Today
                      </Button>
                      <Button
                        variant={reportDateRange?.from && !reportDateRange?.to && 
                          format(reportDateRange.from, "dd/MM/yyyy") === format(new Date(new Date().setDate(new Date().getDate() - 1)), "dd/MM/yyyy")
                          ? "default" : "outline"}
                        onClick={() => {
                          const yesterday = new Date();
                          yesterday.setDate(yesterday.getDate() - 1);
                          setReportDateRange({
                            from: startOfDay(yesterday),
                            to: endOfDay(yesterday)
                          });
                        }}
                      >
                        Yesterday
                      </Button>
                      <Button
                        variant={reportDateRange?.from && reportDateRange?.to && 
                          format(reportDateRange.from, "dd/MM/yyyy") === format(new Date(new Date().setDate(new Date().getDate() - 6)), "dd/MM/yyyy")
                          ? "default" : "outline"}
                        onClick={() => {
                          const last7Days = new Date();
                          last7Days.setDate(last7Days.getDate() - 6);
                          setReportDateRange({
                            from: startOfDay(last7Days),
                            to: endOfDay(new Date())
                          });
                        }}
                      >
                        Last 7 Days
                      </Button>
                      <Button
                        variant={reportDateRange?.from && reportDateRange?.to && 
                          format(reportDateRange.from, "dd/MM/yyyy") === format(new Date(new Date().setDate(new Date().getDate() - 29)), "dd/MM/yyyy")
                          ? "default" : "outline"}
                        onClick={() => {
                          const last30Days = new Date();
                          last30Days.setDate(last30Days.getDate() - 29);
                          setReportDateRange({
                            from: startOfDay(last30Days),
                            to: endOfDay(new Date())
                          });
                        }}
                      >
                        Last 30 Days
                      </Button>
                      <Button
                        variant={reportDateRange?.from && reportDateRange?.to && 
                          format(reportDateRange.from, "dd/MM/yyyy") === format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), "dd/MM/yyyy")
                          ? "default" : "outline"}
                        onClick={() => {
                          const thisMonth = new Date();
                          thisMonth.setDate(1);
                          setReportDateRange({
                            from: startOfDay(thisMonth),
                            to: endOfDay(new Date())
                          });
                        }}
                      >
                        This Month
                      </Button>
                    </div>
                    <div className="flex items-center gap-4">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-[300px] justify-start text-left font-normal",
                              !reportDateRange && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {reportDateRange?.from ? (
                              reportDateRange.to ? (
                                <>
                                  {format(reportDateRange.from, "dd/MM/yyyy")} -{" "}
                                  {format(reportDateRange.to, "dd/MM/yyyy")}
                                </>
                              ) : (
                                format(reportDateRange.from, "dd/MM/yyyy")
                              )
                            ) : (
                              <span>Select custom date range</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            initialFocus
                            mode="range"
                            defaultMonth={reportDateRange?.from}
                            selected={reportDateRange}
                            onSelect={handleDateRangeSelect}
                            numberOfMonths={2}
                          />
                        </PopoverContent>
                      </Popover>
                      <Button
                        variant="outline"
                        onClick={() => setReportDateRange(undefined)}
                      >
                        Clear Filter
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Designer Reports Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { id: "d1", name: "Aditya Sharma", totalTasks: 45, completedTasks: 38, inProgressTasks: 5, partiallyCompletedTasks: 2, completionRate: 84.4 },
                  { id: "d2", name: "Priya Patel", totalTasks: 38, completedTasks: 32, inProgressTasks: 4, partiallyCompletedTasks: 2, completionRate: 84.2 },
                  { id: "d3", name: "Rajesh Kumar", totalTasks: 32, completedTasks: 28, inProgressTasks: 3, partiallyCompletedTasks: 1, completionRate: 87.5 },
                  { id: "d4", name: "Ananya Singh", totalTasks: 28, completedTasks: 25, inProgressTasks: 2, partiallyCompletedTasks: 1, completionRate: 89.3 }
                ].map((designer) => {
                  const designerTasks = tasks.filter(task => {
                    const taskDate = parse(task.date, "dd/MM/yyyy", new Date());
                    const isInDateRange = reportDateRange
                      ? isWithinInterval(taskDate, {
                          start: startOfDay(reportDateRange.from),
                          end: reportDateRange.to ? endOfDay(reportDateRange.to) : endOfDay(reportDateRange.from),
                        })
                      : true;
                    return task.assignedTo === designer.id && isInDateRange;
                  });

                  const totalTasks = designerTasks.length;
                  const completedTasks = designerTasks.filter(t => t.status === "completed").length;
                  const inProgressTasks = designerTasks.filter(t => t.status === "in_progress").length;
                  const partiallyCompletedTasks = designerTasks.filter(t => t.status === "partially_completed").length;
                  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

                  return (
                    <Card key={designer.id}>
                      <CardHeader>
                        <CardTitle className="text-lg">{designer.name}</CardTitle>
                        <CardDescription>
                          {reportDateRange
                            ? `${format(reportDateRange.from, "dd/MM/yyyy")}${
                                reportDateRange.to
                                  ? ` - ${format(reportDateRange.to, "dd/MM/yyyy")}`
                                  : ""
                              }`
                            : "All time"}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <BarChart2 className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">Total Tasks</span>
                            </div>
                            <span className="font-medium">{totalTasks}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              <span className="text-sm">Completed</span>
                            </div>
                            <span className="font-medium">{completedTasks}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-blue-500" />
                              <span className="text-sm">In Progress</span>
                            </div>
                            <span className="font-medium">{inProgressTasks}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <AlertCircle className="h-4 w-4 text-yellow-500" />
                              <span className="text-sm">Partially Completed</span>
                            </div>
                            <span className="font-medium">{partiallyCompletedTasks}</span>
                          </div>
                          <div className="pt-2">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm">Completion Rate</span>
                              <span className="font-medium">{completionRate.toFixed(1)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-primary h-2 rounded-full"
                                style={{ width: `${completionRate}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="attendance" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Today's Attendance</CardTitle>
                  <UserCheck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{attendanceData.today.present}</div>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <span>Present</span>
                    <span className="mx-2">•</span>
                    <span className="text-red-500">{attendanceData.today.absent} absent</span>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">This Week</CardTitle>
                  <CalendarDays className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{attendanceData.thisWeek.present}</div>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <span>Present</span>
                    <span className="mx-2">•</span>
                    <span className="text-red-500">{attendanceData.thisWeek.absent} absent</span>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">This Month</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{attendanceData.thisMonth.present}</div>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <span>Present</span>
                    <span className="mx-2">•</span>
                    <span className="text-red-500">{attendanceData.thisMonth.absent} absent</span>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">94.5%</div>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <span>Last 30 days</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>Attendance Trends</CardTitle>
                  <CardDescription>Daily attendance patterns</CardDescription>
                </CardHeader>
                <CardContent className="pl-0">
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart
                      data={attendanceTrends}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Area type="monotone" dataKey="present" stroke="#82ca9d" fill="#82ca9d" name="Present" />
                      <Area type="monotone" dataKey="absent" stroke="#ff8042" fill="#ff8042" name="Absent" />
                      <Area type="monotone" dataKey="late" stroke="#8884d8" fill="#8884d8" name="Late" />
                      <Area type="monotone" dataKey="halfDay" stroke="#ffc658" fill="#ffc658" name="Half Day" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>Attendance Distribution</CardTitle>
                  <CardDescription>Status breakdown for today</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: "Present", value: attendanceData.today.present },
                          { name: "Absent", value: attendanceData.today.absent },
                          { name: "Late", value: attendanceData.today.late },
                          { name: "Half Day", value: attendanceData.today.halfDay }
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        <Cell fill="#82ca9d" />
                        <Cell fill="#ff8042" />
                        <Cell fill="#8884d8" />
                        <Cell fill="#ffc658" />
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Today's Attendance Details</CardTitle>
                <CardDescription>Detailed attendance records for today</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-muted-foreground uppercase bg-muted/40">
                      <tr>
                        <th scope="col" className="px-6 py-3">Employee ID</th>
                        <th scope="col" className="px-6 py-3">Name</th>
                        <th scope="col" className="px-6 py-3">Department</th>
                        <th scope="col" className="px-6 py-3">Check In</th>
                        <th scope="col" className="px-6 py-3">Check Out</th>
                        <th scope="col" className="px-6 py-3">Working Hours</th>
                        <th scope="col" className="px-6 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentAttendance.map((record) => (
                        <tr key={record.id} className="border-b">
                          <td className="px-6 py-4 font-medium">{record.employeeId}</td>
                          <td className="px-6 py-4">{record.employeeName}</td>
                          <td className="px-6 py-4">{record.department}</td>
                          <td className="px-6 py-4">{record.checkIn}</td>
                          <td className="px-6 py-4">{record.checkOut}</td>
                          <td className="px-6 py-4">{record.workingHours}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              record.status === 'present' ? 'bg-green-100 text-green-800' :
                              record.status === 'absent' ? 'bg-red-100 text-red-800' :
                              record.status === 'late' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleExportReport('attendance', recentAttendance)}
                >
                  <FileSpreadsheet className="mr-2 h-4 w-4" /> Export Attendance Report
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>

        <Card>
          <CardHeader>
            <CardTitle>Available Reports</CardTitle>
            <CardDescription>Download detailed reports in Excel format</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Report Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Last Generated</TableHead>
                  <TableHead>Data Range</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell className="font-medium">{report.name}</TableCell>
                    <TableCell>{report.description}</TableCell>
                    <TableCell>{report.lastGenerated}</TableCell>
                    <TableCell>{getFilterLabel()}</TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleExportReport(report.name.toLowerCase(), report.name === "Sales Report" ? monthlySalesData : report.name === "Expenses" ? expensesData : topProducts)}
                      >
                        <FileSpreadsheet className="mr-2 h-4 w-4" />
                        Export
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Reports;
