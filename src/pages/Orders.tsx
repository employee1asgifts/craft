import React, { useState, useEffect } from "react";
import AppLayout from "@/components/layout/AppLayout";
import OrderTable, { Order } from "@/components/orders/OrderTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { 
  Dialog,
  DialogContent, 
  DialogDescription,
  DialogFooter,
  DialogHeader, 
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { FileDown, Plus, Trash, Edit, CalendarIcon } from "lucide-react";
import CustomerSelector from "@/components/orders/CustomerSelector";
import ProductSelector from "@/components/orders/ProductSelector";
import { InventoryItem } from "@/components/inventory/InventoryTable";
import { generateInvoiceNumber, parsePrice, generateAndDownloadInvoice, exportOrdersToExcel } from "@/utils/invoiceUtils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format, parse, isWithinInterval, startOfDay, endOfDay, subDays, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { cn } from "@/lib/utils";
import { useSuppliers } from "@/contexts/SupplierContext";
import { DateRange } from "react-day-picker";
import { Card, CardHeader, CardContent } from "@/components/ui/card";

interface Customer {
  id: string;
  name: string;
  email?: string;
  phone: string;
  address: string;
  pincode: string;
}

interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  total: number;
  gst: number;
  gstAmount: number;
}

interface OrderFormData {
  invoiceNumber: string;
  date: Date;
  customer: Customer | null;
  items: OrderItem[];
  shippingCost: number;
  totalAmount: number;
  paidAmount: number;
  balance: number;
  paymentMethod: string;
}

const Orders: React.FC = () => {
  // Initial mock data for customers
  const initialCustomers: Customer[] = [
    {
      id: "CUS-001",
      name: "Jane Cooper",
      email: "jane@example.com",
      phone: "+91 98765 43210",
      address: "123 Main St, Mumbai, MH 400001",
      pincode: "400001",
    },
    {
      id: "CUS-002",
      name: "Alex Smith",
      email: "alex@example.com",
      phone: "+91 95432 10987",
      address: "456 Oak Ave, Delhi, DL 110001",
      pincode: "110001",
    },
    {
      id: "CUS-003",
      name: "Michael Johnson",
      email: "michael@example.com",
      phone: "+91 87654 32109",
      address: "789 Pine Blvd, Bangalore, KA 560001",
      pincode: "560001",
    },
  ];

  // Initial mock data for orders
  const initialOrders: Order[] = [
    {
      id: "ORD-7851",
      customer: "Jane Cooper",
      date: "May 03, 2025",
      amount: "₹15,000",
      status: "new",
      items: "Custom T-shirt Design (x2)",
    },
    {
      id: "ORD-7852",
      customer: "Alex Smith",
      date: "May 02, 2025",
      amount: "₹20,000",
      status: "design",
      items: "Logo Design, Business Cards (x100)",
    },
    {
      id: "ORD-7844",
      customer: "Michael Johnson",
      date: "May 02, 2025",
      amount: "₹11,000",
      status: "ready",
      items: "Brochure Design (x50)",
    },
  ];

  // State declarations
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([
    {
      id: "INV001",
      name: "T-shirt Blanks",
      buyingPrice: "₹350",
      sellingPrice: "₹550",
      stock: 45,
      lastUpdated: "May 01, 2025",
      supplierId: "SUP-001",
    },
    {
      id: "INV002",
      name: "Premium Business Card Paper",
      buyingPrice: "₹20",
      sellingPrice: "₹35",
      stock: 250,
      lastUpdated: "Apr 28, 2025",
      supplierId: "SUP-002",
    },
    {
      id: "INV003",
      name: "Ceramic Mugs",
      buyingPrice: "₹180",
      sellingPrice: "₹275",
      stock: 18,
      lastUpdated: "May 02, 2025",
      supplierId: "SUP-003",
    },
  ]);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isCreateOrderOpen, setIsCreateOrderOpen] = useState(false);
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [isEditOrderOpen, setIsEditOrderOpen] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [invoiceNumber, setInvoiceNumber] = useState<string>(generateInvoiceNumber());
  const [orderDate, setOrderDate] = useState<Date>(new Date());
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [currentProduct, setCurrentProduct] = useState<InventoryItem | null>(null);
  const [currentQuantity, setCurrentQuantity] = useState<number>(1);
  const [currentGst, setCurrentGst] = useState<number>(0); // Changed default GST to 0
  const [shippingCost, setShippingCost] = useState<number>(0);
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [isEditingOrder, setIsEditingOrder] = useState<boolean>(false);
  const [discount, setDiscount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<string>("UPI");

  // Add new state for tracking order progression
  const [orderProgression, setOrderProgression] = useState<{
    [key: string]: {
      designStartTime?: Date;
      designCompleteTime?: Date;
      shippingStartTime?: Date;
      shippingCompleteTime?: Date;
    };
  }>({});

  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  });

  // Load data from localStorage on component mount
  useEffect(() => {
    try {
      const savedOrders = localStorage.getItem('orders');
      const savedCustomers = localStorage.getItem('customers');
      const savedProgression = localStorage.getItem('orderProgression');
      
      if (savedOrders) {
        setOrders(JSON.parse(savedOrders));
      }
      
      if (savedCustomers) {
        setCustomers(JSON.parse(savedCustomers));
      }
      
      if (savedProgression) {
        setOrderProgression(JSON.parse(savedProgression));
      }
    } catch (error) {
      console.error('Error loading data from localStorage:', error);
    }
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('orders', JSON.stringify(orders));
    } catch (error) {
      console.error('Error saving orders to localStorage:', error);
    }
  }, [orders]);

  useEffect(() => {
    try {
      localStorage.setItem('customers', JSON.stringify(customers));
    } catch (error) {
      console.error('Error saving customers to localStorage:', error);
    }
  }, [customers]);

  useEffect(() => {
    try {
      localStorage.setItem('orderProgression', JSON.stringify(orderProgression));
    } catch (error) {
      console.error('Error saving order progression:', error);
    }
  }, [orderProgression]);

  // Reset function to clear localStorage and restore initial data
  const handleResetData = () => {
    if (window.confirm('Are you sure you want to reset all orders and customer data? This action cannot be undone.')) {
      try {
        localStorage.removeItem('orders');
        localStorage.removeItem('customers');
        localStorage.removeItem('orderProgression');
        setOrders(initialOrders);
        setCustomers(initialCustomers);
        setOrderProgression({});
        toast.success('Data reset successfully');
      } catch (error) {
        console.error('Error resetting data:', error);
        toast.error('Failed to reset data');
      }
    }
  };

  // Create a form for the order
  const orderFormSchema = z.object({
    invoiceNumber: z.string().min(1, "Invoice number is required"),
    date: z.date(),
    shippingCost: z.number().min(0),
    paidAmount: z.number().min(0),
    discount: z.number().min(0),
    paymentMethod: z.string(),
  });

  const orderForm = useForm<z.infer<typeof orderFormSchema>>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      invoiceNumber: invoiceNumber,
      date: new Date(),
      shippingCost: 0,
      paidAmount: 0,
      discount: 0,
      paymentMethod: "UPI",
    },
  });
  
  // Update form values when invoice number or date changes
  useEffect(() => {
    orderForm.setValue('invoiceNumber', invoiceNumber);
  }, [invoiceNumber, orderForm]);
  
  useEffect(() => {
    orderForm.setValue('date', orderDate);
  }, [orderDate, orderForm]);

  useEffect(() => {
    orderForm.setValue('shippingCost', shippingCost);
  }, [shippingCost, orderForm]);

  useEffect(() => {
    orderForm.setValue('paidAmount', paidAmount);
  }, [paidAmount, orderForm]);

  useEffect(() => {
    orderForm.setValue('discount', discount);
  }, [discount, orderForm]);

  useEffect(() => {
    orderForm.setValue('paymentMethod', paymentMethod);
  }, [paymentMethod, orderForm]);

  const calculateTotal = () => {
    const itemsTotal = orderItems.reduce((total, item) => total + item.total, 0);
    const gstTotal = calculateGstTotal();
    const totalBeforeDiscount = itemsTotal + gstTotal + shippingCost;
    return totalBeforeDiscount - discount;
  };

  const calculateGstTotal = () => {
    return orderItems.reduce((total, item) => total + (item.gstAmount || 0), 0);
  };

  const calculateSubtotal = () => {
    return orderItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const calculateBalance = () => {
    return calculateTotal() - paidAmount;
  };

  const customerFormSchema = z.object({
    name: z.string().min(2, { message: "Customer name is required" }),
    email: z.string().email({ message: "Invalid email address" }).optional().or(z.literal('')),
    phone: z.string().min(10, { message: "Phone number is required" }),
    address: z.string().min(5, { message: "Address is required" }),
    pincode: z.string().min(6, { message: "Pincode is required" }),
  });

  const customerForm = useForm<z.infer<typeof customerFormSchema>>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
      pincode: "",
    },
  });

  const handleGenerateInvoice = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    
    // Get the admin-selected template from localStorage
    const savedSettings = localStorage.getItem('invoiceSettings');
    const settings = savedSettings ? JSON.parse(savedSettings) : null;
    const template = settings?.template || 'a4professional';
    
    generateAndDownloadInvoice({
      id: order.id,
      orderId: order.id,
      customer: order.customer,
      date: order.date,
      amount: order.amount,
      items: order.items,
      status: order.status
    }, template, settings);
    
    toast.success(`Invoice for order ${orderId} generated and downloaded`);
  };

  const handleGenerateCourierSlip = (orderId: string) => {
    // In a real app, this would generate and download a courier slip
    toast.success(`Courier slip for order ${orderId} generated and downloaded`);
  };

  // Update order status with automatic progression
  const handleUpdateStatus = (orderId: string, newStatus: Order["status"]) => {
    // Check if user is admin before allowing cancellation
    const isAdmin = localStorage.getItem('userRole') === 'admin';
    if (newStatus === 'cancelled' && !isAdmin) {
      toast.error('Only administrators can cancel orders');
      return;
    }

    setOrders((prevOrders) =>
      prevOrders.map((order) => {
        if (order.id === orderId) {
          const updatedOrder = { ...order, status: newStatus };
          
          // Update progression tracking
          setOrderProgression((prev) => {
            const progression = prev[orderId] || {};
            const now = new Date();
            
            switch (newStatus) {
              case "design":
                return {
                  ...prev,
                  [orderId]: { ...progression, designStartTime: now }
                };
              case "ready":
                return {
                  ...prev,
                  [orderId]: { ...progression, designCompleteTime: now }
                };
              case "dispatched":
                return {
                  ...prev,
                  [orderId]: { ...progression, shippingStartTime: now }
                };
              case "delivered":
                return {
                  ...prev,
                  [orderId]: { ...progression, shippingCompleteTime: now }
                };
              case "cancelled":
                return {
                  ...prev,
                  [orderId]: { ...progression, cancelledTime: now }
                };
              default:
                return prev;
            }
          });

          // Show appropriate toast message
          const statusMessages = {
            design: "Order moved to design team",
            ready: "Design completed, order ready for shipping",
            dispatched: "Order marked as dispatched",
            delivered: "Order marked as delivered",
            cancelled: "Order has been cancelled",
          };
          
          toast.success(statusMessages[newStatus] || "Order status updated");
          
          return updatedOrder;
        }
        return order;
      })
    );
  };

  const handleAssignToDesign = (orderId: string) => {
    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.id === orderId ? { ...order, status: "design" } : order
      )
    );
    
    toast.success(`Order ${orderId} assigned to design team`);
  };

  const handleExportOrders = () => {
    exportOrdersToExcel(orders);
    toast.success("Orders exported successfully");
  };

  const handleAddCustomer = (values: z.infer<typeof customerFormSchema>) => {
    const newCustomer: Customer = {
      id: `CUS-${String(customers.length + 1).padStart(3, '0')}`,
      name: values.name,
      email: values.email,
      phone: values.phone,
      address: values.address,
      pincode: values.pincode,
    };

    setCustomers((prev) => [...prev, newCustomer]);
    setSelectedCustomer(newCustomer);
    setIsAddCustomerOpen(false);
    customerForm.reset();
    toast.success("New customer added successfully");
  };

  const handleAddProductToOrder = () => {
    if (!currentProduct) {
      toast.error("Please select a product");
      return;
    }

    if (currentQuantity <= 0) {
      toast.error("Quantity must be greater than 0");
      return;
    }

    const price = parsePrice(currentProduct.sellingPrice);
    const subtotal = price * currentQuantity;
    const gstAmount = subtotal * (currentGst / 100);
    const total = subtotal + gstAmount;

    const newItem: OrderItem = {
      productId: currentProduct.id,
      name: currentProduct.name,
      quantity: currentQuantity,
      price: price,
      total: total,
      gst: currentGst,
      gstAmount: gstAmount,
    };

    setOrderItems((prev) => [...prev, newItem]);
    setCurrentProduct(null);
    setCurrentQuantity(1);
    setCurrentGst(0);
  };

  const handleRemoveOrderItem = (index: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const resetOrderForm = () => {
    setInvoiceNumber(generateInvoiceNumber());
    setOrderDate(new Date());
    setSelectedCustomer(null);
    setOrderItems([]);
    setCurrentProduct(null);
    setCurrentQuantity(1);
    setShippingCost(0);
    setPaidAmount(0);
    setDiscount(0);
    setPaymentMethod("UPI");
    setIsEditingOrder(false);
  };

  // Automatically assign new orders to design
  const handleCreateOrder = () => {
    if (!selectedCustomer) {
      toast.error("Please select a customer");
      return;
    }

    if (orderItems.length === 0) {
      toast.error("Please add at least one item to the order");
      return;
    }

    const totalAmount = calculateTotal();
    const balance = calculateBalance();

    const newOrder = {
      id: invoiceNumber,
      customer: selectedCustomer.name,
      date: format(orderDate, "MMM dd, yyyy"),
      amount: `₹${totalAmount.toLocaleString()}`,
      status: "design" as const,
      items: orderItems.map(item => `${item.name} (x${item.quantity})`).join(", "),
      paidAmount: paidAmount,
      totalAmount: totalAmount,
      paymentHistory: paidAmount > 0 ? [{
        date: format(orderDate, "MMM dd, yyyy"),
        amount: paidAmount,
        method: paymentMethod,
        notes: "Initial payment"
      }] : []
    };

    // Add new order at the beginning of the array
    const updatedOrders = [newOrder, ...orders];
    setOrders(updatedOrders);
    localStorage.setItem("orders", JSON.stringify(updatedOrders));
    
    // Update progression tracking for new order
    setOrderProgression((prev) => ({
      ...prev,
      [invoiceNumber]: {
        designStartTime: new Date()
      }
    }));
    
    toast.success("Order created and assigned to design team");
    resetOrderForm();
    setIsCreateOrderOpen(false);
  };

  const handleEditOrder = (orderId: string) => {
    const order = orders.find((o) => o.id === orderId);
    if (order) {
      setCurrentOrder(order);
      setInvoiceNumber(order.id);
      setOrderDate(new Date(order.date));
      setSelectedCustomer(customers.find((c) => c.name === order.customer) || null);
      
      // Parse the items string to create order items
      const items = order.items.split(', ').map(item => {
        const match = item.match(/(.*) \(x(\d+)\)/);
        if (match) {
          const [, name, quantity] = match;
          const product = inventoryItems.find(p => p.name === name);
          if (product) {
            const price = parsePrice(product.sellingPrice);
            const quantityNum = parseInt(quantity);
            const subtotal = price * quantityNum;
            const gstAmount = subtotal * (product.gstRate || 0) / 100;
            return {
              productId: product.id,
              name: product.name,
              quantity: quantityNum,
              price: price,
              total: subtotal + gstAmount,
              gst: product.gstRate || 0,
              gstAmount: gstAmount
            };
          }
        }
        return null;
      }).filter(Boolean) as OrderItem[];
      
      setOrderItems(items);
      setPaidAmount(order.paidAmount || 0);
      setShippingCost(0); // You might want to store shipping cost in the order object
      
      // Calculate and set discount
      const totalBeforeDiscount = items.reduce((sum, item) => sum + item.total, 0);
      const discount = totalBeforeDiscount - (order.totalAmount || 0);
      setDiscount(Math.max(0, discount));
      
      setIsEditingOrder(true);
      setIsCreateOrderOpen(true);
    }
  };

  const handlePresetSelect = (value: string) => {
    const today = new Date();
    let range: DateRange | undefined;

    switch (value) {
      case "today":
        range = {
          from: startOfDay(today),
          to: endOfDay(today),
        };
        break;
      case "yesterday":
        range = {
          from: startOfDay(subDays(today, 1)),
          to: endOfDay(subDays(today, 1)),
        };
        break;
      case "last7days":
        range = {
          from: startOfDay(subDays(today, 7)),
          to: endOfDay(today),
        };
        break;
      case "last30days":
        range = {
          from: startOfDay(subDays(today, 30)),
          to: endOfDay(today),
        };
        break;
      case "thisMonth":
        range = {
          from: startOfMonth(today),
          to: endOfDay(today),
        };
        break;
      case "lastMonth":
        range = {
          from: startOfMonth(subMonths(today, 1)),
          to: endOfMonth(subMonths(today, 1)),
        };
        break;
      case "custom":
        range = undefined;
        break;
    }

    setDateRange(range);
  };

  const filteredOrders = orders.filter((order) => {
    // Filter by status
    if (filterStatus !== "all" && order.status !== filterStatus) {
      return false;
    }
    
    // Filter by search term
    if (
      searchTerm &&
      !order.id.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !order.customer.toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      return false;
    }

    // Filter by date range
    if (dateRange?.from || dateRange?.to) {
      const orderDate = parse(order.date, "MMM dd, yyyy", new Date());
      const startDate = dateRange.from ? startOfDay(dateRange.from) : undefined;
      const endDate = dateRange.to ? endOfDay(dateRange.to) : undefined;

      if (startDate && endDate) {
        if (!isWithinInterval(orderDate, { start: startDate, end: endDate })) {
          return false;
        }
      } else if (startDate && !isWithinInterval(orderDate, { start: startDate, end: startDate })) {
        return false;
      } else if (endDate && !isWithinInterval(orderDate, { start: endDate, end: endDate })) {
        return false;
      }
    }
    
    return true;
  });

  const handleMarkAsFullyPaid = (orderId: string, paymentMethod: string = "UPI") => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const total = order.totalAmount || parsePrice(order.amount);
    const paid = order.paidAmount || 0;
    
    if (paid >= total) {
      toast.error("Order is already fully paid");
      return;
    }

    // Update the order's paid amount to match the total
    const updatedOrders = orders.map(o => {
      if (o.id === orderId) {
        return {
          ...o,
          paidAmount: total,
          paymentHistory: [
            ...(o.paymentHistory || []),
            {
              date: format(new Date(), "MMM dd, yyyy"),
              amount: total - paid,
              method: paymentMethod,
              notes: 'Marked as fully paid'
            }
          ]
        };
      }
      return o;
    });

    // Save to localStorage
    localStorage.setItem('orders', JSON.stringify(updatedOrders));
    setOrders(updatedOrders);
    toast.success("Order marked as fully paid");
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
            <p className="text-muted-foreground">Manage and track customer orders</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 justify-between">
          <div className="flex flex-1 items-center space-x-2">
            <Input
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-[300px]"
            />
            <Select
              value={filterStatus}
              onValueChange={setFilterStatus}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="new">New Order</SelectItem>
                <SelectItem value="design">In Design</SelectItem>
                <SelectItem value="ready">Ready to Ship</SelectItem>
                <SelectItem value="dispatched">Dispatched</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
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
            <Button variant="outline" onClick={handleExportOrders}>
              <FileDown className="mr-2 h-4 w-4" />
              Export Orders
            </Button>
            
            <Dialog open={isCreateOrderOpen} onOpenChange={(open) => {
              if (!open) resetOrderForm();
              setIsCreateOrderOpen(open);
            }}>
              <DialogTrigger asChild>
                <Button>+ Create Order</Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh]">
                <DialogHeader>
                  <DialogTitle>
                    {isEditingOrder ? "Edit Order" : "Create New Order"}
                  </DialogTitle>
                  <DialogDescription>
                    {isEditingOrder 
                      ? "Update customer order details"
                      : "Add a new customer order to the system"
                    }
                  </DialogDescription>
                </DialogHeader>
                
                <Form {...orderForm}>
                  <form className="space-y-4 py-2 overflow-y-auto max-h-[calc(90vh-8rem)]">
                    {/* Order Header */}
                    <div className="grid grid-cols-2 gap-3">
                      {/* Invoice Number */}
                      <div>
                        <FormField
                          control={orderForm.control}
                          name="invoiceNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm">Invoice Number</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field}
                                  value={invoiceNumber}
                                  onChange={(e) => {
                                    setInvoiceNumber(e.target.value);
                                    field.onChange(e.target.value);
                                  }}
                                  className="font-mono h-8 text-sm"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      {/* Date */}
                      <div>
                        <FormField
                          control={orderForm.control}
                          name="date"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm">Date</FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant={"outline"}
                                      className={cn(
                                        "w-full justify-start text-left font-normal h-8 text-sm",
                                        !field.value && "text-muted-foreground"
                                      )}
                                    >
                                      <CalendarIcon className="mr-2 h-3 w-3" />
                                      {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <Calendar
                                    mode="single"
                                    selected={field.value}
                                    onSelect={(date) => {
                                      if (date) {
                                        setOrderDate(date);
                                        field.onChange(date);
                                      }
                                    }}
                                    initialFocus
                                    className={cn("p-3 pointer-events-auto")}
                                  />
                                </PopoverContent>
                              </Popover>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    
                    {/* Customer Selection */}
                    <div>
                      <div className="mb-1">
                        <label className="text-sm font-medium">Customer</label>
                      </div>
                      <CustomerSelector
                        customers={customers}
                        selectedCustomer={selectedCustomer}
                        onSelectCustomer={setSelectedCustomer}
                        onAddNewClick={() => setIsAddCustomerOpen(true)}
                      />
                      
                      {selectedCustomer && (
                        <div className="mt-1 p-2 bg-muted rounded-md text-xs">
                          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                            <p><span className="font-medium">Phone:</span> {selectedCustomer.phone}</p>
                            <p><span className="font-medium">Email:</span> {selectedCustomer.email}</p>
                            <p className="col-span-2"><span className="font-medium">Address:</span> {selectedCustomer.address}</p>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Product Selection */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-sm font-medium">Products</label>
                      </div>
                      
                      <div className="space-y-3">
                        {/* Product Selector */}
                        <div className="flex gap-2 items-end">
                          <div className="flex-1">
                            <ProductSelector
                              products={inventoryItems}
                              selectedProduct={currentProduct}
                              onSelectProduct={setCurrentProduct}
                              quantity={currentQuantity}
                              onQuantityChange={setCurrentQuantity}
                              maxQuantity={currentProduct?.stock || 1}
                              gst={currentGst}
                              onGstChange={setCurrentGst}
                              onRemove={() => {
                                setCurrentProduct(null);
                                setCurrentQuantity(1);
                                setCurrentGst(0);
                              }}
                            />
                          </div>
                          <Button 
                            onClick={handleAddProductToOrder}
                            disabled={!currentProduct}
                            size="sm"
                          >
                            <Plus className="h-4 w-4 mr-1" /> Add
                          </Button>
                        </div>
                        
                        {/* Products Table */}
                        {orderItems.length > 0 && (
                          <div className="border rounded-md">
                            <div className="overflow-x-auto">
                              <table className="w-full min-w-[500px] text-sm">
                                <thead className="bg-muted">
                                  <tr>
                                    <th className="px-3 py-1.5 text-center w-12">S.No</th>
                                    <th className="px-3 py-1.5 text-left">Product</th>
                                    <th className="px-3 py-1.5 text-right">Quantity</th>
                                    <th className="px-3 py-1.5 text-right">Base Price</th>
                                    <th className="px-3 py-1.5 text-right">GST</th>
                                    <th className="px-3 py-1.5 text-right">Total Price</th>
                                    <th className="px-3 py-1.5 w-12"></th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {orderItems.map((item, index) => (
                                    <tr key={index} className="border-t">
                                      <td className="px-3 py-1.5 text-center">{index + 1}</td>
                                      <td className="px-3 py-1.5">{item.name}</td>
                                      <td className="px-3 py-1.5 text-right">{item.quantity}</td>
                                      <td className="px-3 py-1.5 text-right">₹{item.price.toFixed(2)}</td>
                                      <td className="px-3 py-1.5 text-right">{item.gst}%</td>
                                      <td className="px-3 py-1.5 text-right">₹{item.total.toFixed(2)}</td>
                                      <td className="px-3 py-1.5 text-right">
                                        <Button 
                                          variant="ghost" 
                                          size="icon"
                                          className="h-6 w-6"
                                          onClick={() => handleRemoveOrderItem(index)}
                                        >
                                          <Trash className="h-3 w-3" />
                                        </Button>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Order Summary */}
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <FormField
                            control={orderForm.control}
                            name="shippingCost"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm">Shipping Cost (₹)</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    min="0"
                                    {...field}
                                    value={shippingCost}
                                    onChange={(e) => {
                                      const value = parseFloat(e.target.value) || 0;
                                      setShippingCost(value);
                                      field.onChange(value);
                                    }}
                                    className="h-8 text-sm"
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </div>
                        <div>
                          <FormField
                            control={orderForm.control}
                            name="discount"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm">Discount (₹)</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    min="0"
                                    {...field}
                                    value={discount}
                                    onChange={(e) => {
                                      const value = parseFloat(e.target.value) || 0;
                                      setDiscount(value);
                                      field.onChange(value);
                                    }}
                                    className="h-8 text-sm"
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </div>
                        <div>
                          <FormField
                            control={orderForm.control}
                            name="paidAmount"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm">Paid Amount (₹)</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    min="0"
                                    {...field}
                                    value={paidAmount}
                                    onChange={(e) => {
                                      const value = parseFloat(e.target.value) || 0;
                                      setPaidAmount(value);
                                      field.onChange(value);
                                    }}
                                    className="h-8 text-sm"
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </div>
                        <div>
                          <FormField
                            control={orderForm.control}
                            name="paymentMethod"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm">Payment Method</FormLabel>
                                <Select
                                  value={paymentMethod}
                                  onValueChange={(value) => {
                                    setPaymentMethod(value);
                                    field.onChange(value);
                                  }}
                                >
                                  <FormControl>
                                    <SelectTrigger className="h-8 text-sm">
                                      <SelectValue placeholder="Select payment method" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="UPI">UPI</SelectItem>
                                    <SelectItem value="Cash">Cash</SelectItem>
                                    <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                                  </SelectContent>
                                </Select>
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                      
                      <div className="p-3 bg-muted rounded-md text-sm">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex justify-between">
                            <span>Subtotal:</span>
                            <span>₹{calculateSubtotal().toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Shipping:</span>
                            <span>₹{shippingCost.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-xs text-muted-foreground col-span-2">
                            <span>GST {orderItems[0]?.gst || 0}%:</span>
                            <span>₹{calculateGstTotal().toFixed(2)}</span>
                          </div>
                          {discount > 0 && (
                            <div className="flex justify-between text-red-500 col-span-2">
                              <span>Discount:</span>
                              <span>-₹{discount.toFixed(2)}</span>
                            </div>
                          )}
                          <div className="flex justify-between font-bold col-span-2">
                            <span>Total (Incl. GST):</span>
                            <span>₹{calculateTotal().toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between col-span-2 border-t my-1 pt-1">
                            <span>Paid Amount:</span>
                            <span>₹{paidAmount.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between font-bold col-span-2">
                            <span>Balance:</span>
                            <span className={calculateBalance() > 0 ? "text-red-500" : "text-green-500"}>
                              ₹{calculateBalance().toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </form>
                </Form>
                
                <DialogFooter>
                  <Button onClick={handleCreateOrder}>
                    {isEditingOrder ? "Update Order" : "Create Order"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Orders</h2>
                <p className="text-muted-foreground">Manage and track customer orders</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <OrderTable
              orders={filteredOrders}
              onGenerateInvoice={handleGenerateInvoice}
              onGenerateCourierSlip={handleGenerateCourierSlip}
              onUpdateStatus={handleUpdateStatus}
              onAssignToDesign={handleAssignToDesign}
              onEditOrder={handleEditOrder}
              onMarkAsFullyPaid={handleMarkAsFullyPaid}
            />
          </CardContent>
        </Card>
      </div>

      {/* Add Customer Dialog */}
      <Dialog open={isAddCustomerOpen} onOpenChange={setIsAddCustomerOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Customer</DialogTitle>
            <DialogDescription>
              Add a new customer to your database
            </DialogDescription>
          </DialogHeader>
          
          <Form {...customerForm}>
            <form onSubmit={customerForm.handleSubmit(handleAddCustomer)} className="space-y-4">
              <FormField
                control={customerForm.control}
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
                control={customerForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter email address (optional)" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={customerForm.control}
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
                control={customerForm.control}
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
                control={customerForm.control}
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
    </AppLayout>
  );
};

export default Orders;
