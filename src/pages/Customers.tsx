import React, { useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { FileDown, UserPlus, FileText, Phone, Mail, CalendarIcon, FileSpreadsheet } from "lucide-react";
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { format, parse, isWithinInterval, startOfDay, endOfDay } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import * as XLSX from 'xlsx';

interface Customer {
  id: string;
  name: string;
  email?: string;
  phone: string;
  address: string;
  pincode: string;
  totalOrders: number;
  totalSpent: string;
  lastOrder: string;
}

type DateRange = {
  from: Date;
  to?: Date;
};

const Customers: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([
    {
      id: "CUS-001",
      name: "Jane Cooper",
      email: "jane@example.com",
      phone: "+91 98765 43210",
      address: "123 Main St, Mumbai, MH",
      pincode: "400001",
      totalOrders: 5,
      totalSpent: "₹65,000",
      lastOrder: "May 03, 2025",
    },
    {
      id: "CUS-002",
      name: "Alex Smith",
      email: "alex@example.com",
      phone: "+91 95432 10987",
      address: "456 Oak Ave, Delhi, DL 110001",
      pincode: "110001",
      totalOrders: 3,
      totalSpent: "₹42,000",
      lastOrder: "May 02, 2025",
    },
    {
      id: "CUS-003",
      name: "Michael Johnson",
      email: "michael@example.com",
      phone: "+91 87654 32109",
      address: "789 Pine Blvd, Bangalore, KA 560001",
      pincode: "560001",
      totalOrders: 2,
      totalSpent: "₹23,000",
      lastOrder: "May 02, 2025",
    },
    {
      id: "CUS-004",
      name: "Sarah Williams",
      email: "sarah@example.com",
      phone: "+91 76543 21098",
      address: "321 Maple Dr, Chennai, TN 600001",
      pincode: "600001",
      totalOrders: 4,
      totalSpent: "₹56,500",
      lastOrder: "May 01, 2025",
    },
    {
      id: "CUS-005",
      name: "Robert Brown",
      email: "robert@example.com",
      phone: "+91 65432 10987",
      address: "654 Elm St, Hyderabad, TS 500001",
      pincode: "500001",
      totalOrders: 1,
      totalSpent: "₹12,000",
      lastOrder: "Apr 30, 2025",
    },
  ]);

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [isViewCustomerOpen, setIsViewCustomerOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  const formSchema = z.object({
    name: z.string().min(2, { message: "Name is required" }),
    email: z.string().email({ message: "Invalid email address" }).optional(),
    phone: z.string().min(10, { message: "Phone number is required" }),
    address: z.string().min(5, { message: "Address is required" }),
    pincode: z.string().min(6, { message: "Pincode is required" }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
      pincode: "",
    },
  });

  const handleAddCustomer = async (values: z.infer<typeof formSchema>) => {
    const newCustomer: Customer = {
      id: `CUS-${String(customers.length + 1).padStart(3, '0')}`,
      name: values.name,
      email: values.email,
      phone: values.phone,
      address: values.address,
      pincode: values.pincode,
      totalOrders: 0,
      totalSpent: "₹0",
      lastOrder: "N/A",
    };





    try {
      // Send the data to the backend API
      const response = await fetch("/customers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: values.name,
          email: values.email,
          phone: values.phone,
          address: values.address,
          pincode: values.pincode,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // If the response is OK, add the new customer to the state
        setCustomers((prev) => [...prev, data.customer]);
        setIsAddCustomerOpen(false); // Close the form
        form.reset(); // Reset form after successful submit
        toast.success("New customer added successfully!");
      } else {
        // If there’s an error from the backend, show the message
        toast.error(data.message || "Failed to add customer");
      }
    } catch (error) {
      console.error("Error adding customer:", error);
      toast.error("Error adding customer");
    }
  };

  

  const handleEditCustomer = (values: z.infer<typeof formSchema>) => {
    if (!selectedCustomer) return;

    const updatedCustomer: Customer = {
      ...selectedCustomer,
      name: values.name,
      email: values.email,
      phone: values.phone,
      address: values.address,
      pincode: values.pincode,
    };

    setCustomers((prev) =>
      prev.map((customer) =>
        customer.id === selectedCustomer.id ? updatedCustomer : customer
      )
    );

    setIsViewCustomerOpen(false);
    setIsEditMode(false);
    form.reset();
    toast.success("Customer updated successfully");
  };

  const handleExportCustomers = () => {
    try {
      // Prepare data for Excel
      const excelData = filteredCustomers.map(customer => ({
        'Customer ID': customer.id,
        'Name': customer.name,
        'Email': customer.email || '-',
        'Phone': customer.phone,
        'Address': customer.address,
        'Pincode': customer.pincode,
        'Total Orders': customer.totalOrders,
        'Total Spent': customer.totalSpent,
        'Last Order': customer.lastOrder
      }));

      // Create worksheet
      const worksheet = XLSX.utils.json_to_sheet(excelData);

      // Create workbook
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Customers');

      // Generate Excel file
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `customers_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Customers exported to Excel successfully');
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      toast.error('Failed to export customers to Excel');
    }
  };

  const handleViewCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsViewCustomerOpen(true);
    setIsEditMode(false);
    form.reset({
      name: customer.name,
      email: customer.email || "",
      phone: customer.phone,
      address: customer.address,
      pincode: customer.pincode,
    });
  };

  const handlePresetSelect = (value: string) => {
    const today = new Date();
    switch (value) {
      case "all":
        setDateRange(undefined);
        break;
      case "today":
        setDateRange({
          from: startOfDay(today),
          to: endOfDay(today),
        });
        break;
      case "yesterday":
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        setDateRange({
          from: startOfDay(yesterday),
          to: endOfDay(yesterday),
        });
        break;
      case "last7days":
        const last7Days = new Date(today);
        last7Days.setDate(last7Days.getDate() - 6);
        setDateRange({
          from: startOfDay(last7Days),
          to: endOfDay(today),
        });
        break;
      case "last30days":
        const last30Days = new Date(today);
        last30Days.setDate(last30Days.getDate() - 29);
        setDateRange({
          from: startOfDay(last30Days),
          to: endOfDay(today),
        });
        break;
      case "thisMonth":
        const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        setDateRange({
          from: startOfDay(thisMonth),
          to: endOfDay(today),
        });
        break;
      case "lastMonth":
        const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
        setDateRange({
          from: startOfDay(lastMonth),
          to: endOfDay(lastMonthEnd),
        });
        break;
      case "custom":
        // Keep existing date range if any
        break;
    }
  };

  const filteredCustomers = customers.filter((customer) => {
    // Filter by search term
    const matchesSearch = 
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm);

    // Filter by date range
    if (dateRange?.from || dateRange?.to) {
      const lastOrderDate = parse(customer.lastOrder, "MMM dd, yyyy", new Date());
      const startDate = dateRange.from ? startOfDay(dateRange.from) : undefined;
      const endDate = dateRange.to ? endOfDay(dateRange.to) : undefined;

      if (startDate && endDate) {
        if (!isWithinInterval(lastOrderDate, { start: startDate, end: endDate })) {
          return false;
        }
      } else if (startDate && !isWithinInterval(lastOrderDate, { start: startDate, end: startDate })) {
        return false;
      } else if (endDate && !isWithinInterval(lastOrderDate, { start: endDate, end: endDate })) {
        return false;
      }
    }

    return matchesSearch;
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
          <p className="text-muted-foreground">
            Manage customer information and order history
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 justify-between">
          <div className="flex flex-1 items-center space-x-2">
            <Input
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-[300px]"
            />
            <Select
              value={dateRange ? "custom" : "all"}
              onValueChange={handlePresetSelect}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Date range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="yesterday">Yesterday</SelectItem>
                <SelectItem value="last7days">Last 7 Days</SelectItem>
                <SelectItem value="last30days">Last 30 Days</SelectItem>
                <SelectItem value="thisMonth">This Month</SelectItem>
                <SelectItem value="lastMonth">Last Month</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-[300px] justify-start text-left font-normal",
                    !dateRange && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "LLL dd, y")} -{" "}
                        {format(dateRange.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(dateRange.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={(range) => {
                    setDateRange(range);
                    if (range) handlePresetSelect("custom");
                  }}
                  numberOfMonths={2}
                />
                {dateRange && (
                  <div className="p-3 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        setDateRange(undefined);
                        handlePresetSelect("all");
                      }}
                    >
                      Clear dates
                    </Button>
                  </div>
                )}
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExportCustomers}>
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Export to Excel
            </Button>
            
            <Dialog open={isAddCustomerOpen} onOpenChange={setIsAddCustomerOpen}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add Customer
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Customer</DialogTitle>
                  <DialogDescription>
                    Add a new customer to your database
                  </DialogDescription>
                </DialogHeader>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleAddCustomer)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter customer name" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter email address" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter phone number" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter full address" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="pincode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pincode</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter pincode" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <DialogFooter>
                      <Button type="submit">Add Customer</Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Total Orders</TableHead>
                <TableHead>Total Spent</TableHead>
                <TableHead>Last Order</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell>{customer.id}</TableCell>
                  <TableCell className="font-medium">{customer.name}</TableCell>
                  <TableCell>{customer.email || "No email provided"}</TableCell>
                  <TableCell>{customer.phone}</TableCell>
                  <TableCell>{customer.totalOrders}</TableCell>
                  <TableCell>{customer.totalSpent}</TableCell>
                  <TableCell>{customer.lastOrder}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewCustomer(customer)}
                    >
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={isViewCustomerOpen} onOpenChange={setIsViewCustomerOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>{isEditMode ? "Edit Customer" : "Customer Details"}</DialogTitle>
            <DialogDescription>
              {isEditMode ? "Update customer information" : "Complete information about the customer"}
            </DialogDescription>
          </DialogHeader>
          
          {selectedCustomer && (
            <div className="space-y-6">
              {isEditMode ? (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleEditCustomer)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter customer name" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter email address" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter phone number" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter full address" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="pincode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pincode</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter pincode" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsEditMode(false)}>
                        Cancel
                      </Button>
                      <Button type="submit">Save Changes</Button>
                    </DialogFooter>
                  </form>
                </Form>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>{selectedCustomer.name}</CardTitle>
                    <CardDescription>Customer ID: {selectedCustomer.id}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedCustomer.email || "No email provided"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedCustomer.phone}</span>
                    </div>
                    <div className="pt-2">
                      <p className="text-sm font-medium">Address:</p>
                      <p className="text-sm text-muted-foreground">{selectedCustomer.address}</p>
                      <p className="text-sm text-muted-foreground">Pincode: {selectedCustomer.pincode}</p>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button onClick={() => setIsEditMode(true)}>Edit Customer</Button>
                  </CardFooter>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default Customers;
