import React, { useState, useEffect } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Calendar as CalendarIcon, FileSpreadsheet, Search, Filter, Download, CreditCard, Clock, AlertCircle, CheckCircle2, ChevronDown } from "lucide-react";
import { format, subDays, startOfDay, endOfDay, isWithinInterval } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
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
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import * as XLSX from 'xlsx';
import { toast } from "sonner";

type DateRange = {
  from: Date;
  to: Date;
};

type PaymentStatus = "unpaid" | "partially-paid" | "paid";

interface PaymentRecord {
  id: string;
  date: string;
  amount: number;
  method: string;
  notes?: string;
  paymentNumber: number;
}

interface Payment {
  id: string;
  orderId: string;
  customer: string;
  date: string;
  amount: number;
  paidAmount: number;
  balance: number;
  status: PaymentStatus;
  method: string;
  paymentRecords: PaymentRecord[];
}

const getPaymentStatusColor = (status: PaymentStatus) => {
  switch (status) {
    case "paid":
      return "bg-green-100 text-green-800";
    case "partially-paid":
      return "bg-yellow-100 text-yellow-800";
    case "unpaid":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const Payments: React.FC = () => {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: startOfDay(new Date()),
    to: endOfDay(new Date()),
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | "all">("all");
  const [methodFilter, setMethodFilter] = useState<string>("all");
  const [payments, setPayments] = useState<Payment[]>([]);

  // Load orders from localStorage and convert to payments
  useEffect(() => {
    const loadPayments = () => {
      const orders = JSON.parse(localStorage.getItem("orders") || "[]");
      const payments: Payment[] = [];

      orders.forEach((order: any) => {
        const totalAmount = order.totalAmount || parseFloat(order.amount.replace('₹', '').replace(',', ''));
        const paidAmount = order.paidAmount || 0;

        // Add initial payment if exists
        if (paidAmount > 0) {
          payments.push({
            id: order.id,
            orderId: order.id,
            customer: order.customer,
            date: order.date,
            amount: totalAmount,
            paidAmount: paidAmount,
            balance: totalAmount - paidAmount,
            status: paidAmount >= totalAmount ? "paid" : "partially-paid",
            method: "Cash",
            paymentRecords: [{
              id: `${order.id}-1`,
              date: order.date,
              amount: paidAmount,
              method: "Cash",
              notes: "Initial payment",
              paymentNumber: 1
            }]
          });
        }

        // Add remaining payment if order is fully paid
        if (paidAmount >= totalAmount && order.paymentHistory?.length > 0) {
          const lastPayment = order.paymentHistory[order.paymentHistory.length - 1];
          payments.push({
            id: `${order.id}-2`,
            orderId: order.id,
            customer: order.customer,
            date: lastPayment.date,
            amount: totalAmount,
            paidAmount: totalAmount,
            balance: 0,
            status: "paid",
            method: lastPayment.method || "Cash",
            paymentRecords: [{
              id: `${order.id}-2`,
              date: lastPayment.date,
              amount: lastPayment.amount,
              method: lastPayment.method || "Cash",
              notes: "Final payment",
              paymentNumber: 2
            }]
          });
        }
      });

      setPayments(payments);
    };

    loadPayments();
    // Set up an interval to refresh payments every minute
    const interval = setInterval(loadPayments, 60000);
    return () => clearInterval(interval);
  }, []);

  // Payment statistics
  const stats = {
    today: payments
      .filter(payment => {
        const paymentDate = new Date(payment.date);
        return isWithinInterval(paymentDate, {
          start: startOfDay(new Date()),
          end: endOfDay(new Date())
        });
      })
      .reduce((sum, payment) => sum + payment.paymentRecords[0].amount, 0),
    
    yesterday: payments
      .filter(payment => {
        const paymentDate = new Date(payment.date);
        const yesterday = subDays(new Date(), 1);
        return isWithinInterval(paymentDate, {
          start: startOfDay(yesterday),
          end: endOfDay(yesterday)
        });
      })
      .reduce((sum, payment) => sum + payment.paymentRecords[0].amount, 0),
    
    pending: payments
      .filter(p => p.status === "partially-paid")
      .reduce((sum, p) => sum + p.balance, 0),
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
  ];

  const getFilterLabel = () => {
    if (dateRange.from === startOfDay(new Date())) return "Today";
    if (dateRange.from === startOfDay(subDays(new Date(), 1))) return "Yesterday";
    if (dateRange.from === startOfDay(subDays(new Date(), 6))) return "Last 7 Days";
    if (dateRange.from === startOfDay(subDays(new Date(), 29))) return "Last 30 Days";
    return `${format(dateRange.from, "MMM d, yyyy")} - ${format(dateRange.to, "MMM d, yyyy")}`;
  };

  const filteredPayments = payments.flatMap(payment => {
    // If no payment records, return the base payment as a single row
    if (payment.paymentRecords.length === 0) {
      return [{
        ...payment,
        paymentRecord: null
      }];
    }

    // Return each payment record as a separate row
    return payment.paymentRecords.map(record => ({
      ...payment,
      paymentRecord: record
    }));
  }).filter(payment => {
    const matchesSearch = 
      payment.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.customer.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || payment.status === statusFilter;
    const matchesMethod = methodFilter === "all" || 
      (payment.paymentRecord && payment.paymentRecord.method === methodFilter);
    
    // Add date range filtering
    const matchesDateRange = !dateRange?.from || !dateRange?.to || (
      payment.paymentRecord && 
      isWithinInterval(new Date(payment.paymentRecord.date), {
        start: startOfDay(dateRange.from),
        end: endOfDay(dateRange.to)
      })
    );
    
    return matchesSearch && matchesStatus && matchesMethod && matchesDateRange;
  });

  const handleExport = () => {
    const data = filteredPayments.map((payment) => ({
      'Order ID': payment.orderId,
      'Customer': payment.customer,
      'Amount': payment.amount,
      'Paid Amount': payment.paidAmount,
      'Balance': payment.balance,
      'Order Date': payment.date,
      'Payment Status': payment.status === 'paid' ? 'Paid' : 
                       payment.status === 'partially-paid' ? 'Partially Paid' : 'Unpaid'
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Payments");
    XLSX.writeFile(wb, "payments.xlsx");
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Payment Tracking</h1>
            <p className="text-muted-foreground">
              Monitor and manage all payment transactions
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
                      dateRange.from === startOfDay(subDays(new Date(), 29)) && filter.label === "Last 30 Days" && "bg-accent"
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

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Payments</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{stats.today.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {payments.filter(payment => {
                  const paymentDate = new Date(payment.date);
                  return isWithinInterval(paymentDate, {
                    start: startOfDay(new Date()),
                    end: endOfDay(new Date())
                  });
                }).length} payments today
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Yesterday's Payments</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{stats.yesterday.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {payments.filter(payment => {
                  const paymentDate = new Date(payment.date);
                  const yesterday = subDays(new Date(), 1);
                  return isWithinInterval(paymentDate, {
                    start: startOfDay(yesterday),
                    end: endOfDay(yesterday)
                  });
                }).length} payments yesterday
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{stats.pending.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {payments.filter(p => p.status === "partially-paid").length} partial payments
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle>Payment Transactions</CardTitle>
                <CardDescription>View and manage all payment transactions</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search payments..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 w-[200px]"
                  />
                </div>
                <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as PaymentStatus | "all")}>
                  <SelectTrigger className="w-[130px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={methodFilter} onValueChange={setMethodFilter}>
                  <SelectTrigger className="w-[130px]">
                    <SelectValue placeholder="Method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Methods</SelectItem>
                    <SelectItem value="UPI">UPI</SelectItem>
                    <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                    <SelectItem value="Credit Card">Credit Card</SelectItem>
                    <SelectItem value="Cash">Cash</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm" onClick={handleExport}>
                  <FileSpreadsheet className="mr-2 h-4 w-4" /> Export
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="relative overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Payment Date</TableHead>
                    <TableHead>Payment Number</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">{payment.orderId}</TableCell>
                      <TableCell>{payment.customer}</TableCell>
                      <TableCell>{payment.date}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          Payment {payment.paymentRecords[0].paymentNumber}
                        </Badge>
                      </TableCell>
                      <TableCell>₹{payment.paymentRecords[0].amount.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={getPaymentStatusColor(payment.status)}
                        >
                          {payment.status === "unpaid" && "Unpaid"}
                          {payment.status === "partially-paid" && "Partially Paid"}
                          {payment.status === "paid" && "Paid"}
                        </Badge>
                      </TableCell>
                      <TableCell>{payment.paymentRecords[0].method}</TableCell>
                      <TableCell>{payment.paymentRecords[0].notes}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Payments; 