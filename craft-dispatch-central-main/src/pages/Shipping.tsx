import React, { useState, useEffect } from "react";
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
import { FileDown, Truck, ArrowDown, Plus, Package } from "lucide-react";
import { toast } from "sonner";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface Shipment {
  id: string;
  orderId: string;
  customer: string;
  address: string;
  phone: string;
  date: string;
  courierService: string;
  trackingId: string;
  status: "ready" | "dispatched" | "delivered";
  weight?: string;
  deliveryCost?: string;
}

interface CompanyAddress {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  email: string;
  isDefault: boolean;
}

const Shipping: React.FC = () => {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isCreateShipmentOpen, setIsCreateShipmentOpen] = useState(false);
  const [isDeliveryFormOpen, setIsDeliveryFormOpen] = useState(false);
  const [currentShipment, setCurrentShipment] = useState<Shipment | null>(null);
  const [isCompanyAddressOpen, setIsCompanyAddressOpen] = useState(false);
  const [isCourierSlipOpen, setIsCourierSlipOpen] = useState(false);
  const [selectedShipmentIds, setSelectedShipmentIds] = useState<string[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [isPaymentWarningOpen, setIsPaymentWarningOpen] = useState(false);
  const [pendingShipments, setPendingShipments] = useState<Shipment[]>([]);

  const [companyAddresses, setCompanyAddresses] = useState<CompanyAddress[]>([
    {
      id: "addr-1",
      name: "Creative Print Solutions",
      address: "Plot 123, Industrial Area",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400001",
      phone: "+91 22 1234 5678",
      email: "info@creativeprintsolutions.com",
      isDefault: true,
    },
    {
      id: "addr-2",
      name: "Creative Print Solutions - Delhi Branch",
      address: "45 Commercial Complex",
      city: "Delhi",
      state: "Delhi",
      pincode: "110001",
      phone: "+91 11 8765 4321",
      email: "delhi@creativeprintsolutions.com",
      isDefault: false,
    }
  ]);

  const [courierServices, setCourierServices] = useState<string[]>([
    "BlueDart",
    "DTDC",
    "Delhivery",
    "Ekart",
    "India Post"
  ]);

  const [isAddCourierOpen, setIsAddCourierOpen] = useState(false);
  const [newCourier, setNewCourier] = useState("");

  // Load orders and shipments from localStorage
  useEffect(() => {
    try {
      const savedOrders = localStorage.getItem('orders');
      const savedShipments = localStorage.getItem('shipments');
      const savedCustomers = localStorage.getItem('customers');
      
      if (savedOrders) {
        const parsedOrders = JSON.parse(savedOrders);
        setOrders(parsedOrders);
        
        // Convert orders to shipments
        const readyOrders = parsedOrders.filter((order: any) => 
          order.status === "ready" || 
          order.status === "dispatched" || 
          order.status === "delivered"
        );
        
        const newShipments = readyOrders.map((order: any) => {
          // Find customer details from saved customers
          let customerDetails = {
            name: order.customer,
            address: order.address || "Address not provided",
            phone: ""
          };

          if (savedCustomers) {
            const customers = JSON.parse(savedCustomers);
            const customer = customers.find((c: any) => c.name === order.customer);
            if (customer) {
              customerDetails = {
                name: customer.name,
                address: customer.address,
                phone: customer.phone || ""
              };
            }
          }

          return {
            id: `SHP-${order.id.split('-')[1]}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            orderId: order.id,
            customer: customerDetails.name,
            address: customerDetails.address,
            phone: customerDetails.phone,
            date: order.date,
            courierService: order.courierService || "",
            trackingId: order.trackingId || "",
            status: order.status,
            weight: order.weight || "",
            deliveryCost: order.deliveryCost || "",
          };
        });

        if (savedShipments) {
          const existingShipments = JSON.parse(savedShipments);
          const mergedShipments = newShipments.map((newShipment: Shipment) => {
            const existingShipment = existingShipments.find((s: Shipment) => s.orderId === newShipment.orderId);
            return existingShipment || newShipment;
          });
          setShipments(mergedShipments);
        } else {
          setShipments(newShipments);
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }, []);

  // Save shipments to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('shipments', JSON.stringify(shipments));
    } catch (error) {
      console.error('Error saving shipments:', error);
    }
  }, [shipments]);

  const formSchema = z.object({
    orderId: z.string().min(1, { message: "Order ID is required" }),
    customer: z.string().min(1, { message: "Customer name is required" }),
    address: z.string().min(5, { message: "Address is required" }),
    courierService: z.string().min(1, { message: "Courier service is required" }),
    trackingId: z.string().min(1, { message: "Tracking ID is required" }),
    cost: z.string().min(1, { message: "Cost is required" }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      orderId: "",
      customer: "",
      address: "",
      courierService: "",
      trackingId: "",
      cost: "",
    },
  });

  const deliveryFormSchema = z.object({
    trackingId: z.string().min(1, { message: "Tracking ID is required" }),
    weight: z.string().min(1, { message: "Weight is required" }),
    deliveryCost: z.string().min(1, { message: "Delivery cost is required" }),
    courierService: z.string().min(1, { message: "Courier service is required" }),
  });

  const deliveryForm = useForm<z.infer<typeof deliveryFormSchema>>({
    resolver: zodResolver(deliveryFormSchema),
    defaultValues: {
      trackingId: "",
      weight: "",
      deliveryCost: "",
      courierService: "",
    },
  });

  const addressFormSchema = z.object({
    name: z.string().min(1, { message: "Company name is required" }),
    address: z.string().min(5, { message: "Address is required" }),
    city: z.string().min(1, { message: "City is required" }),
    state: z.string().min(1, { message: "State is required" }),
    pincode: z.string().min(5, { message: "Pincode is required" }),
    phone: z.string().min(10, { message: "Phone number is required" }),
    email: z.string().email({ message: "Invalid email address" }),
    isDefault: z.boolean().default(false),
  });

  const addressForm = useForm<z.infer<typeof addressFormSchema>>({
    resolver: zodResolver(addressFormSchema),
    defaultValues: {
      name: "",
      address: "",
      city: "",
      state: "",
      pincode: "",
      phone: "",
      email: "",
      isDefault: false,
    },
  });

  // Debug function to log state changes
  const logSelectionState = (action: string, shipmentId: string) => {
    console.log(`Action: ${action}`);
    console.log(`Shipment ID: ${shipmentId}`);
    console.log(`Current selections:`, selectedShipmentIds);
    console.log(`Filtered shipments:`, filteredShipments.map(s => s.id));
  };

  const handleSelectShipment = (shipment: Shipment) => {
    logSelectionState('Select Shipment', shipment.id);
    
    setSelectedShipmentIds(prev => {
      // Create a new array to avoid mutation
      const newSelections = [...prev];
      const index = newSelections.indexOf(shipment.id);
      
      if (index === -1) {
        // Add the ID if not present
        newSelections.push(shipment.id);
      } else {
        // Remove the ID if present
        newSelections.splice(index, 1);
      }
      
      console.log('New selections:', newSelections);
      return newSelections;
    });
  };

  const handleSelectAll = () => {
    console.log('Select All clicked');
    console.log('Current selections:', selectedShipmentIds);
    console.log('Filtered shipments:', filteredShipments.map(s => s.id));
    
    setSelectedShipmentIds(prev => {
      const allIds = filteredShipments.map(s => s.id);
      if (prev.length === allIds.length) {
        // If all are selected, clear all
        return [];
      } else {
        // If not all are selected, select all
        return [...allIds];
      }
    });
  };

  const handleUpdateStatus = (shipmentId: string) => {
    setShipments((prevShipments) =>
      prevShipments.map((shipment) => {
        if (shipment.id === shipmentId) {
          let newStatus: Shipment["status"] = "ready";
          if (shipment.status === "ready") newStatus = "dispatched";
          else if (shipment.status === "dispatched") {
            // Open delivery form for entering details
            setCurrentShipment(shipment);
            setIsDeliveryFormOpen(true);
            return shipment;
          }
          
          // Update order status in localStorage when shipment status changes
          if (newStatus === "dispatched") {
            try {
              const savedOrders = localStorage.getItem('orders');
              if (savedOrders) {
                const orders = JSON.parse(savedOrders);
                const updatedOrders = orders.map((order: any) => 
                  order.id === shipment.orderId ? { ...order, status: "dispatched" } : order
                );
                localStorage.setItem('orders', JSON.stringify(updatedOrders));
              }
            } catch (error) {
              console.error('Error updating order status:', error);
            }
          }
          
          return { ...shipment, status: newStatus };
        }
        return shipment;
      })
    );
    
    toast.success(`Shipment ${shipmentId} status updated`);
  };

  const handleMarkDelivered = (values: z.infer<typeof deliveryFormSchema>) => {
    if (!currentShipment) return;
    
    setShipments((prevShipments) =>
      prevShipments.map((shipment) => {
        if (shipment.id === currentShipment.id) {
          // Update order status in localStorage
          try {
            const savedOrders = localStorage.getItem('orders');
            if (savedOrders) {
              const orders = JSON.parse(savedOrders);
              const updatedOrders = orders.map((order: any) => 
                order.id === shipment.orderId ? { ...order, status: "delivered" } : order
              );
              localStorage.setItem('orders', JSON.stringify(updatedOrders));
            }
          } catch (error) {
            console.error('Error updating order status:', error);
          }
          
          return { 
            ...shipment, 
            status: "delivered",
            trackingId: values.trackingId,
            weight: values.weight,
            deliveryCost: values.deliveryCost
          };
        }
        return shipment;
      })
    );
    
    setIsDeliveryFormOpen(false);
    deliveryForm.reset();
    toast.success(`Shipment ${currentShipment.id} marked as delivered`);
  };

  const handleExportAll = () => {
    toast.success("All shipping labels exported successfully");
  };

  const handleCreateShipment = (values: z.infer<typeof formSchema>) => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    
    // Format the address properly
    const formattedAddress = values.address
      .split('\n')
      .map(line => line.trim())
      .filter(line => line)
      .join('\n');

    const newShipment: Shipment = {
      id: `SHP-${timestamp}-${random}`,
      orderId: values.orderId,
      customer: values.customer,
      address: formattedAddress,
      phone: "",
      date: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      }),
      courierService: values.courierService,
      trackingId: values.trackingId,
      status: "ready",
      deliveryCost: values.cost,
    };

    setShipments((prev) => [newShipment, ...prev]);
    setIsCreateShipmentOpen(false);
    form.reset();
    toast.success("New shipment created successfully");
  };

  const handleAddAddress = (values: z.infer<typeof addressFormSchema>) => {
    // Ensure all required fields are provided as non-optional
    const newAddress: CompanyAddress = {
      id: `addr-${companyAddresses.length + 1}`,
      name: values.name,
      address: values.address,
      city: values.city,
      state: values.state,
      pincode: values.pincode,
      phone: values.phone,
      email: values.email,
      isDefault: values.isDefault || false,
    };

    // If this is set as default, update other addresses
    if (values.isDefault) {
      setCompanyAddresses(prevAddresses => 
        prevAddresses.map(addr => ({...addr, isDefault: false}))
      );
    }

    setCompanyAddresses(prev => [...prev, newAddress]);
    setIsCompanyAddressOpen(false);
    addressForm.reset();
    toast.success("New company address added successfully");
  };

  const getDefaultAddress = () => {
    return companyAddresses.find(addr => addr.isDefault) || companyAddresses[0];
  };

  const filteredShipments = shipments.filter((shipment) => {
    // Filter by status
    if (filterStatus !== "all" && shipment.status !== filterStatus) {
      return false;
    }
    
    // Filter by search term
    if (
      searchTerm &&
      !shipment.orderId.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !shipment.customer.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !shipment.trackingId.toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      return false;
    }
    
    return true;
  });

  const getStatusBadge = (status: Shipment["status"]) => {
    switch (status) {
      case "ready":
        return <span className="status-badge status-ready">Ready to Ship</span>;
      case "dispatched":
        return <span className="status-badge status-dispatched">Dispatched</span>;
      case "delivered":
        return <span className="status-badge status-delivered">Delivered</span>;
    }
  };

  const handleAddCourier = () => {
    if (newCourier.trim() && !courierServices.includes(newCourier.trim())) {
      setCourierServices(prev => [...prev, newCourier.trim()]);
      setNewCourier("");
      setIsAddCourierOpen(false);
      toast.success("New courier service added");
    }
  };

  const handleDownloadCourierSlip = () => {
    const selectedShipments = shipments.filter(shipment => selectedShipmentIds.includes(shipment.id));
    if (selectedShipments.length === 0) {
      toast.error("Please select at least one shipment");
      return;
    }

    // Check for partially paid or unpaid orders
    const unpaidShipments = selectedShipments.filter(shipment => {
      const order = orders.find(o => o.id === shipment.orderId);
      return order?.paymentStatus === "partial" || order?.paymentStatus === "unpaid";
    });

    if (unpaidShipments.length > 0) {
      setPendingShipments(unpaidShipments);
      setIsPaymentWarningOpen(true);
      return;
    }

    generateCourierSlips(selectedShipments);
  };

  const handleSingleOrderDownload = (shipment: Shipment) => {
    // Check if the order is partially paid or unpaid
    const order = orders.find(o => o.id === shipment.orderId);
    if (order?.paymentStatus === "partial" || order?.paymentStatus === "unpaid") {
      setPendingShipments([shipment]);
      setIsPaymentWarningOpen(true);
      return;
    }

    setSelectedShipmentIds([shipment.id]);
    generateCourierSlips([shipment]);
  };

  const generateCourierSlips = (shipmentsToPrint: Shipment[]) => {
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error("Could not open print window. Please check your browser settings.");
      return;
    }

    // Get the default address
    const defaultAddress = getDefaultAddress();

    // Create the HTML content for the courier slips
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Courier Slips</title>
          <style>
            @page {
              size: A4;
              margin: 0;
            }
            body { 
              font-family: Arial, sans-serif; 
              margin: 0;
              padding: 0;
            }
            .page {
              width: 210mm;
              height: 297mm;
              padding: 5mm;
              box-sizing: border-box;
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              grid-template-rows: repeat(3, 1fr);
              gap: 5mm;
              page-break-after: always;
            }
            .page:last-child {
              page-break-after: avoid;
            }
            .slip-container { 
              border: 1px solid #000;
              padding: 3mm;
              display: flex;
              flex-direction: column;
              gap: 2mm;
              height: 95mm;
              box-sizing: border-box;
            }
            .order-id { 
              text-align: center; 
              font-size: 20px; 
              font-weight: bold; 
              padding: 2mm;
              border: 1px solid #000;
              background-color: #f8f8f8;
              margin: 0;
            }
            .addresses { 
              display: flex; 
              flex-direction: column; 
              gap: 0;
              flex: 1;
            }
            .address { 
              padding: 2mm;
              flex: 1;
            }
            .address.to-address {
              flex: 2;
            }
            .address h3 { 
              font-size: 12px;
              margin: 0 0 1mm 0;
              color: #333;
              border-bottom: 1px solid #000;
              padding-bottom: 1mm;
            }
            .address.to-address p {
              font-size: 14px;
              font-weight: bold;
              margin: 0;
              line-height: 1.4;
              white-space: pre-wrap;
            }
            .address.from-address p {
              font-size: 10px;
              margin: 0;
              line-height: 1.2;
              white-space: pre-wrap;
            }
            @media print {
              body { 
                margin: 0;
                padding: 0;
              }
              .no-print { 
                display: none; 
              }
            }
          </style>
        </head>
        <body>
          ${Array.from({ length: Math.ceil(shipmentsToPrint.length / 6) }, (_, pageIndex) => {
            const startIndex = pageIndex * 6;
            const endIndex = Math.min(startIndex + 6, shipmentsToPrint.length);
            const pageShipments = shipmentsToPrint.slice(startIndex, endIndex);
            
            return `
              <div class="page">
                ${pageShipments.map(shipment => {
                  // Format the address with proper line breaks
                  const formattedAddress = shipment.address
                    .split('\n')
                    .map(line => line.trim())
                    .filter(line => line)
                    .join('\n');

                  return `
                  <div class="slip-container">
                    <div class="order-id">
                      ${shipment.orderId}
                    </div>
                    
                    <div class="addresses">
                      <div class="address to-address">
                        <h3>TO:</h3>
                        <p>${shipment.customer}
${formattedAddress}
${shipment.phone ? `Phone: ${shipment.phone}` : ''}</p>
                      </div>
                      
                      <div class="address from-address">
                        <h3>FROM:</h3>
                        <p>${defaultAddress.name}
${defaultAddress.address}
${defaultAddress.city}, ${defaultAddress.state} - ${defaultAddress.pincode}
Phone: ${defaultAddress.phone}</p>
                      </div>
                    </div>
                  </div>
                `}).join('')}
              </div>
            `;
          }).join('')}
          
          <div class="no-print" style="text-align: center; margin: 20px;">
            <button onclick="window.print()" style="padding: 10px 20px; font-size: 16px; cursor: pointer;">Print All Slips</button>
          </div>
        </body>
      </html>
    `;

    // Write the content to the new window
    printWindow.document.write(htmlContent);
    printWindow.document.close();

    // Close the dialog
    setIsCourierSlipOpen(false);
    toast.success(`Generated ${shipmentsToPrint.length} courier slips`);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Shipping</h1>
          <p className="text-muted-foreground">
            Manage shipments and generate courier slips
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 justify-between">
          <div className="flex flex-1 items-center space-x-2">
            <Input
              placeholder="Search shipments..."
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
                <SelectItem value="ready">Ready to Ship</SelectItem>
                <SelectItem value="dispatched">Dispatched</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsCompanyAddressOpen(true)}>
              <Package className="mr-2 h-4 w-4" />
              Manage From Address
            </Button>
            
            <Button variant="outline" onClick={handleExportAll}>
              <FileDown className="mr-2 h-4 w-4" />
              Export All
            </Button>
            
            <Dialog open={isCreateShipmentOpen} onOpenChange={setIsCreateShipmentOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Shipment
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Shipment</DialogTitle>
                  <DialogDescription>
                    Create a new shipment for an order
                  </DialogDescription>
                </DialogHeader>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleCreateShipment)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="orderId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Order ID</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter order ID" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="customer"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Customer Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter customer name" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Delivery Address</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Enter full delivery address" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="courierService"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Courier Service</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select courier service" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="BlueDart">BlueDart</SelectItem>
                              <SelectItem value="DTDC">DTDC</SelectItem>
                              <SelectItem value="Delhivery">Delhivery</SelectItem>
                              <SelectItem value="Ekart">Ekart</SelectItem>
                              <SelectItem value="India Post">India Post</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="trackingId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tracking ID</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter tracking ID" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="cost"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Shipping Cost</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter shipping cost" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <DialogFooter>
                      <Button type="submit">Create Shipment</Button>
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
                <TableHead className="w-[50px]">
                  <input
                    type="checkbox"
                    checked={selectedShipmentIds.length === filteredShipments.length && filteredShipments.length > 0}
                    onChange={handleSelectAll}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                </TableHead>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Cost</TableHead>
                <TableHead>Weight</TableHead>
                <TableHead>Tracking ID</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredShipments.map((shipment) => {
                const isSelected = selectedShipmentIds.includes(shipment.id);
                
                return (
                  <TableRow key={shipment.id}>
                    <TableCell className="w-[50px]">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectShipment(shipment)}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                    </TableCell>
                    <TableCell>{shipment.orderId}</TableCell>
                    <TableCell>{shipment.customer}</TableCell>
                    <TableCell>{shipment.courierService}</TableCell>
                    <TableCell>{shipment.deliveryCost || "-"}</TableCell>
                    <TableCell>{shipment.weight || "-"}</TableCell>
                    <TableCell>{shipment.trackingId || "-"}</TableCell>
                    <TableCell>{getStatusBadge(shipment.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleSingleOrderDownload(shipment)}
                        >
                          <FileDown className="h-4 w-4" />
                        </Button>
                        {shipment.status !== "delivered" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUpdateStatus(shipment.id)}
                          >
                            <Truck className="mr-2 h-4 w-4" />
                            {shipment.status === "ready" ? "Mark Dispatched" : "Mark Delivered"}
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {selectedShipmentIds.length > 0 && (
          <div className="fixed bottom-4 right-4">
            <Button
              onClick={handleDownloadCourierSlip}
              className="bg-primary text-white"
            >
              <FileDown className="mr-2 h-4 w-4" />
              Generate Courier Slips ({selectedShipmentIds.length})
            </Button>
          </div>
        )}
      </div>

      {/* Delivery Form Dialog */}
      <Dialog open={isDeliveryFormOpen} onOpenChange={setIsDeliveryFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark as Delivered</DialogTitle>
            <DialogDescription>
              Enter delivery details to complete the shipment
            </DialogDescription>
          </DialogHeader>
          
          <Form {...deliveryForm}>
            <form onSubmit={deliveryForm.handleSubmit(handleMarkDelivered)} className="space-y-4">
              <FormField
                control={deliveryForm.control}
                name="courierService"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Courier Service</FormLabel>
                    <div className="flex gap-2">
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select courier service" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {courierServices.map((service) => (
                            <SelectItem key={service} value={service}>
                              {service}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsAddCourierOpen(true)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </FormItem>
                )}
              />
              
              <FormField
                control={deliveryForm.control}
                name="trackingId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tracking ID</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter tracking ID" 
                        defaultValue={currentShipment?.trackingId} 
                        {...field} 
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={deliveryForm.control}
                name="weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Package Weight</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 1.5 kg" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={deliveryForm.control}
                name="deliveryCost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Delivery Cost</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., ₹120" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="submit">Mark as Delivered</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Add New Courier Dialog */}
      <Dialog open={isAddCourierOpen} onOpenChange={setIsAddCourierOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Courier Service</DialogTitle>
            <DialogDescription>
              Add a new courier service to the list
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Enter courier service name"
              value={newCourier}
              onChange={(e) => setNewCourier(e.target.value)}
            />
            <DialogFooter>
              <Button onClick={handleAddCourier}>Add Courier</Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Company Address Form */}
      <Dialog open={isCompanyAddressOpen} onOpenChange={setIsCompanyAddressOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Manage Company Addresses</DialogTitle>
            <DialogDescription>
              Add or update company addresses for shipping
            </DialogDescription>
          </DialogHeader>
          
          <div className="mb-4">
            <h3 className="text-sm font-medium mb-2">Current Addresses</h3>
            <div className="space-y-2">
              {companyAddresses.map((address) => (
                <div key={address.id} className={`p-3 border rounded-md ${address.isDefault ? 'bg-muted' : ''}`}>
                  <div className="flex justify-between">
                    <span className="font-medium">{address.name}</span>
                    {address.isDefault && <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded">Default</span>}
                  </div>
                  <p className="text-sm">{address.address}, {address.city}, {address.state} - {address.pincode}</p>
                  <p className="text-sm">{address.phone} | {address.email}</p>
                </div>
              ))}
            </div>
          </div>
          
          <Form {...addressForm}>
            <form onSubmit={addressForm.handleSubmit(handleAddAddress)} className="space-y-4">
              <h3 className="text-sm font-medium">Add New Address</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={addressForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter company name" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={addressForm.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter street address" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={addressForm.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input placeholder="City" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={addressForm.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State</FormLabel>
                      <FormControl>
                        <Input placeholder="State" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={addressForm.control}
                  name="pincode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pincode</FormLabel>
                      <FormControl>
                        <Input placeholder="Pincode" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={addressForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="Contact number" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={addressForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="Email address" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={addressForm.control}
                name="isDefault"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                    </FormControl>
                    <FormLabel>Set as default address</FormLabel>
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="submit">Add Address</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Payment Warning Dialog */}
      <Dialog open={isPaymentWarningOpen} onOpenChange={setIsPaymentWarningOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Payment Status Warning</DialogTitle>
            <DialogDescription>
              The following orders have incomplete payment. Do you want to proceed with generating courier slips?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            {pendingShipments.map(shipment => {
              const order = orders.find(o => o.id === shipment.orderId);
              return (
                <div key={shipment.id} className="p-2 border rounded">
                  <p className="font-medium">Order ID: {shipment.orderId}</p>
                  <p className="text-sm text-muted-foreground">Customer: {shipment.customer}</p>
                  <p className="text-sm text-red-500">
                    Payment Status: {order?.paymentStatus === "partial" ? "Partially Paid" : "Unpaid"}
                  </p>
                </div>
              );
            })}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPaymentWarningOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              generateCourierSlips(pendingShipments);
              setIsPaymentWarningOpen(false);
            }}>
              Generate Slips
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default Shipping;
