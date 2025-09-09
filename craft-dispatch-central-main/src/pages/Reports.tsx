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
} from "recharts";
import { Calendar as CalendarIcon, FileDown, ChartBar, ChartBarIcon, Wallet, Package, Users, Truck, ChevronDown, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
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

type DateRange = {
  from: Date;
  to: Date;
};

const Reports: React.FC = () => {
  const [dateRange, setDateRange] = React.useState<DateRange>({
    from: startOfDay(new Date()),
    to: endOfDay(new Date()),
  });
  const [activeTab, setActiveTab] = useState("sales");

  // Sample data for charts
  const monthlySalesData = [
    { month: "Jan", sales: 45000, orders: 28 },
    { month: "Feb", sales: 52000, orders: 35 },
    { month: "Mar", sales: 49000, orders: 30 },
    { month: "Apr", sales: 63000, orders: 42 },
    { month: "May", sales: 58000, orders: 38 },
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
  ];

  const handleDownloadReport = (reportId: number) => {
    // TODO: Implement report download functionality
    console.log(`Downloading report ${reportId}`);
  };

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
          <TabsList className="grid grid-cols-4 w-full md:w-[500px]">
            <TabsTrigger value="sales">Sales</TabsTrigger>
            <TabsTrigger value="profitloss">Profit & Loss</TabsTrigger>
            <TabsTrigger value="expenses">Expenses</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
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
                  <p className="text-xs text-muted-foreground">
                    +18% from last month
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Orders</CardTitle>
                  <ChartBar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">173</div>
                  <p className="text-xs text-muted-foreground">
                    +12% from last month
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Average Order</CardTitle>
                  <ChartBar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">₹1,544</div>
                  <p className="text-xs text-muted-foreground">
                    +5% from last month
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                  <ChartBar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">24%</div>
                  <p className="text-xs text-muted-foreground">
                    +2% from last month
                  </p>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>Monthly Sales</CardTitle>
                </CardHeader>
                <CardContent className="pl-0">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={monthlySalesData}
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
                      <Bar dataKey="sales" fill="#8884d8" name="Sales (₹)" />
                      <Bar dataKey="orders" fill="#82ca9d" name="Orders" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              
              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>Sales by Category</CardTitle>
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
            </div>
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
                <Button variant="outline" size="sm" onClick={() => toast.success("Expense report exported")}>
                  <FileDown className="mr-2 h-4 w-4" /> Export Expense Report
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
                <Button variant="outline" size="sm" onClick={() => toast.success("Product report exported")}>
                  <FileDown className="mr-2 h-4 w-4" /> Export Product Report
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
            </div>
          </TabsContent>
        </Tabs>

        <div className="grid gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Available Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Report Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Last Generated</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell className="font-medium">{report.name}</TableCell>
                      <TableCell>{report.description}</TableCell>
                      <TableCell>{report.lastGenerated}</TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDownloadReport(report.id)}
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default Reports;
