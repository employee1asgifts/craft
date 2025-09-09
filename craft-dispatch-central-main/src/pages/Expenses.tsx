import React, { useState } from "react";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import { useForm } from "react-hook-form";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Wallet, FileText, PlusCircle, Calendar, Pen, MoreHorizontal, FileDown, Package, Users, Truck, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { Expense, ExpenseCategory } from "@/types/expense";
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
import { cn } from "@/lib/utils";

type DateRange = {
  from: Date;
  to: Date;
};

const Expenses: React.FC = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [dateRange, setDateRange] = useState<DateRange>({
    from: startOfDay(new Date()),
    to: endOfDay(new Date()),
  });
  const [expenses, setExpenses] = useState<Expense[]>([
    {
      id: "EXP-001",
      date: format(new Date(), "MMMM dd, yyyy"),
      category: "stock",
      amount: 12500,
      description: "Purchase of printing paper stock",
      paymentMethod: "Bank Transfer",
      vendor: "Paper Supplies Ltd.",
      status: "approved"
    },
    {
      id: "EXP-002",
      date: format(new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), "MMMM dd, yyyy"),
      category: "office",
      amount: 3200,
      description: "Office stationery and supplies",
      paymentMethod: "Credit Card",
      vendor: "Office Depot",
      status: "approved"
    },
    {
      id: "EXP-003",
      date: format(new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), "MMMM dd, yyyy"),
      category: "advertising",
      amount: 25000,
      description: "Digital marketing campaign",
      paymentMethod: "Bank Transfer",
      vendor: "DigiAds Marketing",
      status: "pending"
    },
    {
      id: "EXP-004",
      date: format(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), "MMMM dd, yyyy"),
      category: "transport",
      amount: 8500,
      description: "Delivery van monthly lease",
      paymentMethod: "Standing Order",
      vendor: "Metro Fleet Services",
      status: "approved"
    },
    {
      id: "EXP-005",
      date: format(new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), "MMMM dd, yyyy"),
      category: "vendor",
      amount: 35000,
      description: "Payment to print vendor for bulk order",
      paymentMethod: "Bank Transfer",
      vendor: "PrintPro Solutions",
      status: "approved"
    }
  ]);

  const form = useForm({
    defaultValues: {
      category: 'stock' as ExpenseCategory,
      amount: '',
      description: '',
      paymentMethod: 'Cash',
      vendor: '',
    }
  });

  const handleAddExpense = (data: any) => {
    if (!selectedDate) {
      toast.error("Please select a date for the expense");
      return;
    }

    const newExpense: Expense = {
      id: `EXP-${Math.floor(100 + Math.random() * 900)}`,
      date: format(selectedDate, "MMMM dd, yyyy"),
      category: data.category,
      amount: parseFloat(data.amount),
      description: data.description,
      paymentMethod: data.paymentMethod,
      vendor: data.vendor,
      status: 'pending'
    };

    setExpenses([newExpense, ...expenses]);
    setIsAddExpenseOpen(false);
    form.reset();
    setSelectedDate(new Date());
    toast.success("Expense added successfully!");
  };

  const handleApproveExpense = (id: string) => {
    setExpenses(expenses.map(expense => 
      expense.id === id ? { ...expense, status: 'approved' } : expense
    ));
    toast.success("Expense approved successfully");
  };

  const handleRejectExpense = (id: string) => {
    setExpenses(expenses.map(expense => 
      expense.id === id ? { ...expense, status: 'rejected' } : expense
    ));
    toast.success("Expense rejected");
  };

  const handleDeleteExpense = (id: string) => {
    setExpenses(expenses.filter(expense => expense.id !== id));
    toast.success("Expense deleted successfully");
  };

  const filteredExpenses = activeTab === "all" 
    ? expenses 
    : expenses.filter(expense => expense.category === activeTab);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getCategoryColor = (category: ExpenseCategory) => {
    switch(category) {
      case 'stock': return 'bg-blue-100 text-blue-800';
      case 'office': return 'bg-green-100 text-green-800';
      case 'advertising': return 'bg-purple-100 text-purple-800';
      case 'vendor': return 'bg-orange-100 text-orange-800';
      case 'transport': return 'bg-yellow-100 text-yellow-800';
      case 'other': return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTotalByCategory = (category: string): number => {
    if (category === "all") {
      return expenses.reduce((total, expense) => total + expense.amount, 0);
    }
    return expenses
      .filter(expense => expense.category === category)
      .reduce((total, expense) => total + expense.amount, 0);
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
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Expense Tracking</h1>
            <p className="text-muted-foreground">
              Track and manage your business expenses
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-[240px] justify-between">
                  <div className="flex items-center">
                    <Calendar className="mr-2 h-4 w-4" />
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

            <Dialog open={isAddExpenseOpen} onOpenChange={setIsAddExpenseOpen}>
              <DialogTrigger asChild>
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Expense
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Add New Expense</DialogTitle>
                  <DialogDescription>
                    Enter the details of the expense you want to track.
                  </DialogDescription>
                </DialogHeader>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleAddExpense)} className="space-y-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="date" className="text-right">
                        Date
                      </Label>
                      <div className="col-span-3">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-start text-left font-normal"
                            >
                              <Calendar className="mr-2 h-4 w-4" />
                              {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <CalendarComponent
                              mode="single"
                              selected={selectedDate}
                              onSelect={setSelectedDate}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem className="grid grid-cols-4 items-center gap-4">
                          <FormLabel className="text-right">Category</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                            value={field.value}
                          >
                            <FormControl className="col-span-3">
                              <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="stock">Stock/Inventory</SelectItem>
                              <SelectItem value="office">Office Expenses</SelectItem>
                              <SelectItem value="advertising">Advertising/Marketing</SelectItem>
                              <SelectItem value="vendor">Vendor Payments</SelectItem>
                              <SelectItem value="transport">Transport/Logistics</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem className="grid grid-cols-4 items-center gap-4">
                          <FormLabel className="text-right">Amount (₹)</FormLabel>
                          <FormControl className="col-span-3">
                            <Input type="number" placeholder="Enter amount" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem className="grid grid-cols-4 items-center gap-4">
                          <FormLabel className="text-right">Description</FormLabel>
                          <FormControl className="col-span-3">
                            <Textarea placeholder="Brief description of the expense" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="paymentMethod"
                      render={({ field }) => (
                        <FormItem className="grid grid-cols-4 items-center gap-4">
                          <FormLabel className="text-right">Payment Method</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                            value={field.value}
                          >
                            <FormControl className="col-span-3">
                              <SelectTrigger>
                                <SelectValue placeholder="Select payment method" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Cash">Cash</SelectItem>
                              <SelectItem value="Credit Card">Credit Card</SelectItem>
                              <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                              <SelectItem value="UPI">UPI</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="vendor"
                      render={({ field }) => (
                        <FormItem className="grid grid-cols-4 items-center gap-4">
                          <FormLabel className="text-right">Vendor/Payee</FormLabel>
                          <FormControl className="col-span-3">
                            <Input placeholder="Enter vendor or payee name" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <DialogFooter>
                      <Button type="submit">Save Expense</Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
            
            <Button variant="outline">
              <FileDown className="mr-2 h-4 w-4" />
              Export Data
            </Button>
          </div>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Expenses
              </CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(getTotalByCategory('all'))}</div>
              <p className="text-xs text-muted-foreground">
                All time expenses
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Stock Expenses
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(getTotalByCategory('stock'))}</div>
              <p className="text-xs text-muted-foreground">
                Inventory and materials
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Vendor Payments
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(getTotalByCategory('vendor'))}</div>
              <p className="text-xs text-muted-foreground">
                Payments to suppliers
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Transport Expenses
              </CardTitle>
              <Truck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(getTotalByCategory('transport'))}</div>
              <p className="text-xs text-muted-foreground">
                Delivery and logistics
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">All Expenses</TabsTrigger>
            <TabsTrigger value="stock">Stock</TabsTrigger>
            <TabsTrigger value="office">Office</TabsTrigger>
            <TabsTrigger value="advertising">Advertising</TabsTrigger>
            <TabsTrigger value="vendor">Vendor</TabsTrigger>
            <TabsTrigger value="transport">Transport</TabsTrigger>
            <TabsTrigger value="other">Other</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab} className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Expense List</CardTitle>
                <CardDescription>
                  {activeTab === "all" 
                    ? "View all your tracked expenses" 
                    : `View expenses related to ${activeTab}`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Vendor</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredExpenses.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                          No expenses found. Add your first expense to get started.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredExpenses.map((expense) => (
                        <TableRow key={expense.id}>
                          <TableCell className="font-medium">{expense.id}</TableCell>
                          <TableCell>{expense.date}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs ${getCategoryColor(expense.category)}`}>
                              {expense.category.charAt(0).toUpperCase() + expense.category.slice(1)}
                            </span>
                          </TableCell>
                          <TableCell className="max-w-[200px] truncate">{expense.description}</TableCell>
                          <TableCell>{expense.vendor || '-'}</TableCell>
                          <TableCell className="font-medium">{formatCurrency(expense.amount)}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(expense.status)}`}>
                              {expense.status.charAt(0).toUpperCase() + expense.status.slice(1)}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <span className="sr-only">Open menu</span>
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {expense.status === 'pending' && (
                                  <>
                                    <DropdownMenuItem onClick={() => handleApproveExpense(expense.id)}>
                                      Approve
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleRejectExpense(expense.id)}>
                                      Reject
                                    </DropdownMenuItem>
                                  </>
                                )}
                                <DropdownMenuItem onClick={() => handleDeleteExpense(expense.id)}>
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="text-sm text-muted-foreground">
                  Showing {filteredExpenses.length} expense{filteredExpenses.length !== 1 && 's'}
                </div>
                {filteredExpenses.length > 0 && (
                  <div className="text-sm font-semibold">
                    Total: {formatCurrency(filteredExpenses.reduce((total, expense) => total + expense.amount, 0))}
                  </div>
                )}
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Expenses;
