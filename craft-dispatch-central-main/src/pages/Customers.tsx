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
import { FileDown, UserPlus, FileText, Phone, Mail } from "lucide-react";
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

  const handleAddCustomer = (values: z.infer<typeof formSchema>) => {
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

    setCustomers((prev) => [...prev, newCustomer]);
    setIsAddCustomerOpen(false);
    form.reset();
    toast.success("New customer added successfully");
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
    toast.success("Customer data exported successfully");
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

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm)
  );

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
          <div className="flex-1 max-w-sm">
            <Input
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExportCustomers}>
              <FileDown className="mr-2 h-4 w-4" />
              Export Customers
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
