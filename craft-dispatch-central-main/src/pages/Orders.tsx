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
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useSuppliers } from "@/contexts/SupplierContext";

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
  const [shippingCost, setShippingCost] = useState<number>(0);
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [isEditingOrder, setIsEditingOrder] = useState<boolean>(false);

  // Add new state for tracking order progression
  const [orderProgression, setOrderProgression] = useState<{
    [key: string]: {
      designStartTime?: Date;
      designCompleteTime?: Date;
      shippingStartTime?: Date;
      shippingCompleteTime?: Date;
    };
  }>({});

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
  });

  const orderForm = useForm<z.infer<typeof orderFormSchema>>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      invoiceNumber: invoiceNumber,
      date: new Date(),
      shippingCost: 0,
      paidAmount: 0,
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

  const calculateTotal = () => {
    const itemsTotal = orderItems.reduce((total, item) => total + item.total, 0);
    return itemsTotal + shippingCost;
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
    if (!currentProduct) return;

    // Check if product is already in the order
    const existingItemIndex = orderItems.findIndex(
      (item) => item.productId === currentProduct.id
    );

    if (existingItemIndex >= 0) {
      // Update existing item
      const updatedItems = [...orderItems];
      const oldQuantity = updatedItems[existingItemIndex].quantity;
      const newQuantity = oldQuantity + currentQuantity;
      
      if (newQuantity > currentProduct.stock) {
        toast.error(`Not enough stock. Available: ${currentProduct.stock}`);
        return;
      }
      
      updatedItems[existingItemIndex] = {
        ...updatedItems[existingItemIndex],
        quantity: newQuantity,
        total: parsePrice(currentProduct.sellingPrice) * newQuantity,
      };
      
      setOrderItems(updatedItems);
    } else {
      // Add new item
      if (currentQuantity > currentProduct.stock) {
        toast.error(`Not enough stock. Available: ${currentProduct.stock}`);
        return;
      }
      
      const newItem: OrderItem = {
        productId: currentProduct.id,
        name: currentProduct.name,
        quantity: currentQuantity,
        price: parsePrice(currentProduct.sellingPrice),
        total: parsePrice(currentProduct.sellingPrice) * currentQuantity,
      };
      
      setOrderItems([...orderItems, newItem]);
    }
    
    setCurrentProduct(null);
    setCurrentQuantity(1);
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
    setIsEditingOrder(false);
  };

  // Automatically assign new orders to design
  const handleCreateOrder = () => {
    if (!selectedCustomer) {
      toast.error("Please select a customer");
      return;
    }

    if (orderItems.length === 0) {
      toast.error("Please add at least one product");
      return;
    }

    const itemsDescription = orderItems
      .map((item) => `${item.name} (x${item.quantity})`)
      .join(", ");

    const totalAmount = calculateTotal();
    const newOrder: Order = {
      id: invoiceNumber,
      customer: selectedCustomer.name,
      date: format(orderDate, "MMM dd, yyyy"),
      amount: `₹${totalAmount.toLocaleString('en-IN')}`,
      status: "design", // Automatically set to design status
      items: itemsDescription,
      paidAmount: paidAmount,
      totalAmount: totalAmount,
    };

    // Update progression tracking for new order
    setOrderProgression((prev) => ({
      ...prev,
      [invoiceNumber]: {
        designStartTime: new Date()
      }
    }));

    if (isEditingOrder && currentOrder) {
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === currentOrder.id ? newOrder : order
        )
      );
      toast.success(`Order ${newOrder.id} updated successfully`);
    } else {
      setOrders((prev) => [newOrder, ...prev]);
      toast.success("New order created and assigned to design team");
      
      // Update inventory quantities
      orderItems.forEach((item) => {
        setInventoryItems((prevItems) =>
          prevItems.map((invItem) =>
            invItem.id === item.productId
              ? { ...invItem, stock: invItem.stock - item.quantity }
              : invItem
          )
        );
      });
    }

    setIsCreateOrderOpen(false);
    resetOrderForm();
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
            return {
              productId: product.id,
              name: product.name,
              quantity: parseInt(quantity),
              price: parsePrice(product.sellingPrice),
              total: parsePrice(product.sellingPrice) * parseInt(quantity)
            };
          }
        }
        return null;
      }).filter(Boolean) as OrderItem[];
      
      setOrderItems(items);
      setPaidAmount(order.paidAmount || 0);
      setShippingCost(0); // You might want to store shipping cost in the order object
      setIsEditingOrder(true);
      setIsCreateOrderOpen(true);
    }
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
    
    return true;
  });

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
              <DialogContent className="max-w-3xl">
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
                  <form className="space-y-6 py-4">
                    {/* Order Header */}
                    <div className="flex flex-col md:flex-row gap-4 md:gap-6">
                      {/* Invoice Number */}
                      <div className="flex-1">
                        <FormField
                          control={orderForm.control}
                          name="invoiceNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Invoice Number</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field}
                                  value={invoiceNumber}
                                  onChange={(e) => {
                                    setInvoiceNumber(e.target.value);
                                    field.onChange(e.target.value);
                                  }}
                                  className="font-mono"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      {/* Date */}
                      <div className="flex-1">
                        <FormField
                          control={orderForm.control}
                          name="date"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Date</FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant={"outline"}
                                      className={cn(
                                        "w-full justify-start text-left font-normal",
                                        !field.value && "text-muted-foreground"
                                      )}
                                    >
                                      <CalendarIcon className="mr-2 h-4 w-4" />
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
                      <div className="mb-2">
                        <label className="text-sm font-medium">Customer</label>
                      </div>
                      <CustomerSelector
                        customers={customers}
                        selectedCustomer={selectedCustomer}
                        onSelectCustomer={setSelectedCustomer}
                        onAddNewClick={() => setIsAddCustomerOpen(true)}
                      />
                      
                      {selectedCustomer && (
                        <div className="mt-2 p-3 bg-muted rounded-md">
                          <div className="text-sm">
                            <p><span className="font-medium">Phone:</span> {selectedCustomer.phone}</p>
                            <p><span className="font-medium">Email:</span> {selectedCustomer.email}</p>
                            <p><span className="font-medium">Address:</span> {selectedCustomer.address}</p>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Product Selection */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium">Products</label>
                      </div>
                      
                      <div className="space-y-4">
                        {/* Product Selector */}
                        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
                          <div className="w-full sm:w-2/3">
                            <ProductSelector
                              products={inventoryItems}
                              selectedProduct={currentProduct}
                              onSelectProduct={setCurrentProduct}
                              quantity={currentQuantity}
                              onQuantityChange={setCurrentQuantity}
                              maxQuantity={currentProduct?.stock || 0}
                              gst={0}
                              onGstChange={() => {}}
                            />
                          </div>
                          <div className="w-full sm:w-1/3">
                            <Button 
                              onClick={handleAddProductToOrder}
                              disabled={!currentProduct}
                              className="w-full"
                            >
                              <Plus className="h-4 w-4 mr-1" /> Add Product
                            </Button>
                          </div>
                        </div>
                        
                        {/* Products Table */}
                        {orderItems.length > 0 && (
                          <div className="border rounded-md overflow-x-auto">
                            <table className="w-full min-w-[600px]">
                              <thead className="bg-muted text-sm">
                                <tr>
                                  <th className="px-4 py-2 text-left">Product</th>
                                  <th className="px-4 py-2 text-right">Price</th>
                                  <th className="px-4 py-2 text-right">Qty</th>
                                  <th className="px-4 py-2 text-right">Total</th>
                                  <th className="px-4 py-2"></th>
                                </tr>
                              </thead>
                              <tbody>
                                {orderItems.map((item, index) => (
                                  <tr key={index} className="border-t">
                                    <td className="px-4 py-2">{item.name}</td>
                                    <td className="px-4 py-2 text-right">₹{item.price}</td>
                                    <td className="px-4 py-2 text-right">{item.quantity}</td>
                                    <td className="px-4 py-2 text-right">₹{item.total}</td>
                                    <td className="px-4 py-2 text-right">
                                      <Button 
                                        variant="ghost" 
                                        size="icon"
                                        onClick={() => handleRemoveOrderItem(index)}
                                      >
                                        <Trash className="h-4 w-4" />
                                      </Button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Order Summary */}
                    <div className="space-y-4">
                      <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                          <FormField
                            control={orderForm.control}
                            name="shippingCost"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Shipping Cost (₹)</FormLabel>
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
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="flex-1">
                          <FormField
                            control={orderForm.control}
                            name="paidAmount"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Paid Amount (₹)</FormLabel>
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
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                      
                      <div className="p-4 bg-muted rounded-md">
                        <div className="flex justify-between mb-2">
                          <span>Subtotal:</span>
                          <span>₹{orderItems.reduce((total, item) => total + item.total, 0).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between mb-2">
                          <span>Shipping:</span>
                          <span>₹{shippingCost.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-bold">
                          <span>Total:</span>
                          <span>₹{calculateTotal().toFixed(2)}</span>
                        </div>
                        <div className="border-t my-2 pt-2 flex justify-between">
                          <span>Paid Amount:</span>
                          <span>₹{paidAmount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-bold">
                          <span>Balance:</span>
                          <span className={calculateBalance() > 0 ? "text-red-500" : "text-green-500"}>
                            ₹{calculateBalance().toFixed(2)}
                          </span>
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

        <OrderTable
          orders={filteredOrders}
          onGenerateInvoice={handleGenerateInvoice}
          onGenerateCourierSlip={handleGenerateCourierSlip}
          onUpdateStatus={handleUpdateStatus}
          onAssignToDesign={handleAssignToDesign}
          onEditOrder={handleEditOrder}
          onViewShipment={() => {}}
        />
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
