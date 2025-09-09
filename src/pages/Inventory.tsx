import React, { useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import InventoryTable, { InventoryItem } from "@/components/inventory/InventoryTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { FileDown, PackagePlus, Upload, X, Eye, EyeOff, Calendar } from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useSuppliers } from "@/contexts/SupplierContext";
import { Package } from "lucide-react";
import { format, subDays, startOfDay, endOfDay, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import * as XLSX from 'xlsx';

const GST_PRESETS = [
  { value: "0", label: "0%" },
  { value: "3", label: "3%" },
  { value: "5", label: "5%" },
  { value: "9", label: "9%" },
  { value: "18", label: "18%" },
  { value: "custom", label: "Custom" },
];

const Inventory: React.FC = () => {
  const { suppliers, addSupplier } = useSuppliers();

  // Convert productNames to state
  const [productNames, setProductNames] = useState([
    "T-shirt Blanks",
    "Premium Business Card Paper",
    "Ceramic Mugs",
    "Vinyl Sticker Material",
    "Canvas Prints",
    "Photo Paper",
    "Mug Sublimation Paper",
    "T-shirt Transfer Paper",
    "Banner Material",
    "Sticker Paper",
    "Business Card Paper",
    "Photo Frame",
    "Keychain Blanks",
    "Mouse Pad Blanks",
    "Puzzle Blanks",
    "Custom Phone Case Blanks",
    "Custom Watch Blanks",
    "Custom Pen Blanks",
    "Custom Notebook Blanks",
    "Custom Bag Blanks"
  ]);

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
    {
      id: "INV004",
      name: "Vinyl Sticker Material",
      buyingPrice: "₹80",
      sellingPrice: "₹125",
      stock: 120,
      lastUpdated: "Apr 25, 2025",
      supplierId: "SUP-001",
    },
  ]);

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  const [isEditItemOpen, setIsEditItemOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<InventoryItem | null>(null);
  const [isSupplierDialogOpen, setIsSupplierDialogOpen] = useState(false);
  const [isAddProductNameOpen, setIsAddProductNameOpen] = useState(false);
  const [showBuyingPrice, setShowBuyingPrice] = useState(false);
  const [selectedGst, setSelectedGst] = useState<number>(18);
  const [isCustomGst, setIsCustomGst] = useState(false);
  const [gstInclusivePrice, setGstInclusivePrice] = useState<string>("");
  const [profit, setProfit] = useState<{ amount: number; percentage: number }>({ amount: 0, percentage: 0 });
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: endOfDay(new Date()),
  });

  const inventoryFormSchema = z.object({
    name: z.string().min(2, { message: "Item name is required" }),
    buyingPrice: z.string().min(1, { message: "Buying price is required" }),
    sellingPrice: z.string().min(1, { message: "Selling price is required" }),
    stock: z.coerce.number().min(0, { message: "Stock must be a positive number" }),
    supplierId: z.string().min(1, { message: "Supplier is required" }),
    image: z.string().optional(),
    imageFile: z.instanceof(File).optional(),
  });

  const supplierFormSchema = z.object({
    name: z.string().min(2, { message: "Supplier name is required" }),
    email: z.string().email({ message: "Invalid email address" }),
    phone: z.string().min(10, { message: "Phone number is required" }),
    address: z.string().min(5, { message: "Address is required" }),
  });

  const inventoryForm = useForm<z.infer<typeof inventoryFormSchema>>({
    resolver: zodResolver(inventoryFormSchema),
    defaultValues: {
      name: "",
      buyingPrice: "",
      sellingPrice: "",
      stock: 0,
      supplierId: "",
    },
  });

  const supplierForm = useForm<z.infer<typeof supplierFormSchema>>({
    resolver: zodResolver(supplierFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
    },
  });

  const productNameFormSchema = z.object({
    name: z.string().min(2, { message: "Product name must be at least 2 characters" }),
    description: z.string().optional(),
  });

  const productNameForm = useForm<z.infer<typeof productNameFormSchema>>({
    resolver: zodResolver(productNameFormSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const handleUpdateStock = (id: string, newStock: number) => {
    setInventoryItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id
          ? {
              ...item,
              stock: newStock,
              lastUpdated: new Date().toLocaleDateString("en-US", {
                month: "short",
                day: "2-digit",
                year: "numeric",
              }),
            }
          : item
      )
    );
    toast.success(`Stock updated for item ${id}`);
  };

  const handleExportInventory = () => {
    try {
      // Prepare data for export
      const exportData = filteredItems.map(item => ({
        'ID': item.id,
        'Product Name': item.name,
        'Buying Price': item.buyingPrice,
        'Selling Price (Incl. GST)': calculateGstInclusivePrice(item.sellingPrice, item.gstRate || 0),
        'GST Rate': `${item.gstRate || 0}%`,
        'Stock': item.stock,
        'Status': getStockStatus(item.stock),
        'Last Updated': item.lastUpdated,
        'Supplier ID': item.supplierId
      }));

      // Create worksheet
      const worksheet = XLSX.utils.json_to_sheet(exportData);

      // Set column widths
      const columnWidths = [
        { wch: 10 }, // ID
        { wch: 30 }, // Product Name
        { wch: 15 }, // Buying Price
        { wch: 20 }, // Selling Price
        { wch: 10 }, // GST Rate
        { wch: 10 }, // Stock
        { wch: 15 }, // Status
        { wch: 15 }, // Last Updated
        { wch: 15 }, // Supplier ID
      ];
      worksheet['!cols'] = columnWidths;

      // Create workbook
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Inventory');

      // Generate filename with current date
      const fileName = `inventory_export_${format(new Date(), 'yyyy-MM-dd')}.xlsx`;

      // Save file
      XLSX.writeFile(workbook, fileName);
      toast.success("Inventory exported successfully");
    } catch (error) {
      console.error('Export error:', error);
      toast.error("Failed to export inventory");
    }
  };

  const calculateGstInclusivePrice = (basePrice: string, gstRate: number) => {
    const price = parseFloat(basePrice.replace('₹', '')) || 0;
    const gstAmount = price * (gstRate / 100);
    return `₹${(price + gstAmount).toFixed(2)}`;
  };

  const getStockStatus = (stock: number) => {
    if (stock <= 5) return "Low";
    if (stock <= 20) return "Medium";
    return "Good";
  };

  const handleEditItem = (id: string) => {
    const item = inventoryItems.find(item => item.id === id);
    if (item) {
      setCurrentItem(item);
      setSelectedGst(item.gstRate || 18);
      inventoryForm.reset({
        name: item.name,
        buyingPrice: item.buyingPrice.replace("₹", ""),
        sellingPrice: item.sellingPrice.replace("₹", ""),
        stock: item.stock,
        supplierId: item.supplierId,
      });
      setIsEditItemOpen(true);
    }
  };

  const handleAddProduct = (values: z.infer<typeof inventoryFormSchema>) => {
    const newItem: InventoryItem = {
      id: `INV${String(inventoryItems.length + 1).padStart(3, '0')}`,
      name: values.name,
      buyingPrice: `₹${values.buyingPrice}`,
      sellingPrice: `₹${values.sellingPrice.replace('₹', '')}`,
      stock: values.stock,
      lastUpdated: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      }),
      supplierId: values.supplierId,
      image: values.image,
      gstRate: selectedGst,
    };

    setInventoryItems((prev) => [newItem, ...prev]);
    setIsAddItemOpen(false);
    inventoryForm.reset();
    toast.success("New inventory item added successfully");
  };

  const handleUpdateProduct = (values: z.infer<typeof inventoryFormSchema>) => {
    if (currentItem) {
      setInventoryItems((prevItems) =>
        prevItems.map((item) =>
          item.id === currentItem.id
            ? {
                ...item,
                name: values.name,
                buyingPrice: `₹${values.buyingPrice}`,
                sellingPrice: `₹${values.sellingPrice.replace('₹', '')}`,
                stock: values.stock,
                lastUpdated: new Date().toLocaleDateString("en-US", {
                  month: "short",
                  day: "2-digit",
                  year: "numeric",
                }),
                supplierId: values.supplierId,
                image: values.image,
                gstRate: selectedGst,
              }
            : item
        )
      );
      setIsEditItemOpen(false);
      inventoryForm.reset();
      toast.success("Inventory item updated successfully");
    }
  };

  const handleAddSupplier = (values: z.infer<typeof supplierFormSchema>) => {
    // Ensure all required fields are present as non-optional
    const supplierData = {
      name: values.name,
      email: values.email,
      phone: values.phone,
      address: values.address,
    };
    
    addSupplier(supplierData);
    setIsSupplierDialogOpen(false);
    supplierForm.reset();
    toast.success("New supplier added successfully");
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, field: any) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }

      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      field.onChange(previewUrl);
      
      // Store the file for later upload
      inventoryForm.setValue('imageFile', file);
    }
  };

  const handleRemoveImage = (field: any) => {
    field.onChange('');
    inventoryForm.setValue('imageFile', undefined);
  };

  const handleAddProductName = (values: z.infer<typeof productNameFormSchema>) => {
    const newName = values.name.trim();
    if (!productNames.includes(newName)) {
      setProductNames(prev => [...prev, newName]);
      // Set the newly added product as the selected value
      inventoryForm.setValue('name', newName);
      toast.success("New product name added successfully");
      setIsAddProductNameOpen(false);
      productNameForm.reset();
    } else {
      toast.error("This product name already exists");
    }
  };

  const getProductImage = (name: string) => {
    // Try to get image from the product name
    const imagePath = `/products/${name.toLowerCase().replace(/\s+/g, '-')}.jpg`;
    return imagePath;
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.target as HTMLImageElement;
    target.src = '/placeholder-product.jpg';
    target.onerror = null; // Prevent infinite loop
  };

  const handleGstChange = (value: string) => {
    if (value === "custom") {
      setIsCustomGst(true);
      return;
    }
    setIsCustomGst(false);
    const gstValue = parseFloat(value);
    setSelectedGst(gstValue);
    // Recalculate base price if GST-inclusive price is set
    if (gstInclusivePrice) {
      const price = parseFloat(gstInclusivePrice);
      const basePrice = price / (1 + gstValue / 100);
      inventoryForm.setValue("sellingPrice", `₹${basePrice.toFixed(2)}`);
    }
  };

  const handleCustomGstChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    if (value >= 0 && value <= 28) {
      setSelectedGst(value);
      // Recalculate base price if GST-inclusive price is set
      if (gstInclusivePrice) {
        const price = parseFloat(gstInclusivePrice);
        const basePrice = price / (1 + value / 100);
        inventoryForm.setValue("sellingPrice", `₹${basePrice.toFixed(2)}`);
      }
    }
  };

  const handleGstInclusivePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setGstInclusivePrice(value);
    
    if (value) {
      const price = parseFloat(value);
      const basePrice = price / (1 + selectedGst / 100);
      inventoryForm.setValue("sellingPrice", `₹${basePrice.toFixed(2)}`);
    }
  };

  const calculateProfit = (buyingPrice: string, sellingPrice: string) => {
    const buying = parseFloat(buyingPrice.replace('₹', '')) || 0;
    const selling = parseFloat(sellingPrice.replace('₹', '')) || 0;
    const amount = selling - buying;
    const percentage = buying > 0 ? (amount / buying) * 100 : 0;
    setProfit({ amount, percentage });
  };

  React.useEffect(() => {
    const subscription = inventoryForm.watch((value, { name }) => {
      if (name === 'buyingPrice' || name === 'sellingPrice') {
        calculateProfit(value.buyingPrice || '', value.sellingPrice || '');
      }
    });
    return () => subscription.unsubscribe();
  }, [inventoryForm.watch]);

  const handleDeleteClick = (id: string) => {
    setItemToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (itemToDelete) {
      setInventoryItems((prevItems) => prevItems.filter(item => item.id !== itemToDelete));
      toast.success("Item deleted successfully");
      setIsDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

  const handlePresetSelect = (preset: string) => {
    const today = new Date();
    let range: DateRange | undefined;

    switch (preset) {
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
      default:
        range = undefined;
    }

    setDateRange(range);
  };

  const filteredItems = inventoryItems.filter((item) => {
    // Search term filter
    if (
      searchTerm &&
      !item.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !item.id.toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      return false;
    }

    // Date range filter
    if (dateRange?.from) {
      const itemDate = new Date(item.lastUpdated);
      const fromDate = startOfDay(dateRange.from);
      const toDate = dateRange.to ? endOfDay(dateRange.to) : endOfDay(dateRange.from);

      if (itemDate < fromDate || itemDate > toDate) {
        return false;
      }
    }
    
    return true;
  });

  const resetFormAndState = () => {
    inventoryForm.reset({
      name: "",
      buyingPrice: "",
      sellingPrice: "",
      stock: 0,
      supplierId: "",
      image: "",
    });
    setSelectedGst(18);
    setIsCustomGst(false);
    setGstInclusivePrice("");
    setProfit({ amount: 0, percentage: 0 });
    setShowBuyingPrice(false);
  };

  const handleAddItemClick = () => {
    resetFormAndState();
    setIsAddItemOpen(true);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Inventory</h1>
            <p className="text-muted-foreground">
              Manage your inventory items and stock levels
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExportInventory}>
              <FileDown className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button onClick={handleAddItemClick}>
              <PackagePlus className="mr-2 h-4 w-4" />
              Add Item
            </Button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Input
            placeholder="Search inventory..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
          
          <div className="flex items-center gap-2">
            <Select
              value={dateRange ? "custom" : "all"}
              onValueChange={handlePresetSelect}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select date range" />
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
                    "w-[240px] justify-start text-left font-normal",
                    !dateRange && "text-muted-foreground"
                  )}
                >
                  <Calendar className="mr-2 h-4 w-4" />
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
                <CalendarComponent
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>

            {dateRange && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDateRange(undefined)}
                className="h-10 px-2"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        <InventoryTable
          items={filteredItems}
          onEditItem={handleEditItem}
          onDeleteItem={handleDeleteClick}
          searchTerm={searchTerm}
        />

        {/* Add Item Dialog */}
        <Dialog open={isAddItemOpen} onOpenChange={(open) => {
          setIsAddItemOpen(open);
          if (!open) {
            resetFormAndState();
          }
        }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Item</DialogTitle>
              <DialogDescription>
                Add a new item to your inventory
              </DialogDescription>
            </DialogHeader>

            <Form {...inventoryForm}>
              <form onSubmit={inventoryForm.handleSubmit(handleAddProduct)} className="space-y-6">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  {/* Product Name and Image Section */}
                  <div className="space-y-4">
                    <FormField
                      control={inventoryForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Product Name</FormLabel>
                          <FormControl>
                            <Select
                              value={field.value}
                              onValueChange={(value) => {
                                field.onChange(value);
                                const imagePath = getProductImage(value);
                                inventoryForm.setValue('image', imagePath);
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select a product" />
                              </SelectTrigger>
                              <SelectContent>
                                {productNames.map((name) => (
                                  <SelectItem key={name} value={name}>
                                    {name}
                                  </SelectItem>
                                ))}
                                <SelectItem value="add-new" className="text-primary font-medium">
                                  + Add New Product
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={inventoryForm.control}
                      name="image"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Product Image</FormLabel>
                          <FormControl>
                            <div className="w-32 h-32 rounded-md overflow-hidden bg-muted">
                              {field.value ? (
                                <img 
                                  src={field.value} 
                                  alt="Product preview"
                                  className="w-full h-full object-cover"
                                  onError={handleImageError}
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                  <Package className="h-8 w-8" />
                                </div>
                              )}
                            </div>
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Price and Stock Section */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        control={inventoryForm.control}
                        name="buyingPrice"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Buying Price (₹)</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input 
                                  type={showBuyingPrice ? "text" : "password"}
                                  placeholder="Enter buying price" 
                                  {...field} 
                                  className="pr-10"
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                  onClick={() => setShowBuyingPrice(!showBuyingPrice)}
                                >
                                  {showBuyingPrice ? (
                                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                                  ) : (
                                    <Eye className="h-4 w-4 text-muted-foreground" />
                                  )}
                                </Button>
                              </div>
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={inventoryForm.control}
                        name="stock"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Initial Stock</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} min={0} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Add Profit Display */}
                    <div className="bg-muted/50 rounded-lg p-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Profit Amount</p>
                          <p className={`text-lg font-semibold ${profit.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            ₹{profit.amount.toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Profit Percentage</p>
                          <p className={`text-lg font-semibold ${profit.percentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {profit.percentage.toFixed(2)}%
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <FormField
                        control={inventoryForm.control}
                        name="sellingPrice"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Selling Price (Including GST)</FormLabel>
                            <FormControl>
                              <div className="space-y-3">
                                <Input 
                                  type="number"
                                  placeholder="Enter price including GST" 
                                  value={gstInclusivePrice}
                                  onChange={handleGstInclusivePriceChange}
                                />
                                {gstInclusivePrice && (
                                  <p className="text-sm text-muted-foreground">
                                    Base Price: {field.value}
                                  </p>
                                )}
                              </div>
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <div className="space-y-2">
                        <FormLabel className="text-sm font-medium">GST Rate</FormLabel>
                        <div className="flex flex-wrap items-center gap-2">
                          {isCustomGst ? (
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                min="0"
                                max="28"
                                step="0.01"
                                value={selectedGst}
                                onChange={handleCustomGstChange}
                                className="w-20"
                              />
                              <span className="text-sm">%</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsCustomGst(false)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <Select
                              value={selectedGst.toString()}
                              onValueChange={handleGstChange}
                            >
                              <SelectTrigger className="w-[100px]">
                                <SelectValue placeholder="Select GST" />
                              </SelectTrigger>
                              <SelectContent>
                                {GST_PRESETS.map((preset) => (
                                  <SelectItem key={preset.value} value={preset.value}>
                                    {preset.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        </div>
                      </div>
                    </div>

                    <FormField
                      control={inventoryForm.control}
                      name="supplierId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Supplier</FormLabel>
                          <div className="w-full">
                            <Select 
                              onValueChange={field.onChange} 
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a supplier" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {suppliers.map((supplier) => (
                                  <SelectItem key={supplier.id} value={supplier.id}>
                                    {supplier.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button type="submit">Add Product</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Edit Item Dialog */}
        <Dialog open={isEditItemOpen} onOpenChange={setIsEditItemOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Inventory Item</DialogTitle>
              <DialogDescription>
                Update product details
              </DialogDescription>
            </DialogHeader>
            
            <Form {...inventoryForm}>
              <form onSubmit={inventoryForm.handleSubmit(handleUpdateProduct)} className="space-y-4">
                <FormField
                  control={inventoryForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Name</FormLabel>
                      <Select 
                        onValueChange={(value) => {
                          if (value === "add-new") {
                            setIsAddProductNameOpen(true);
                          } else {
                            field.onChange(value);
                          }
                        }} 
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="flex-1">
                            <SelectValue placeholder="Select a product" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {productNames.map((name) => (
                            <SelectItem key={name} value={name}>
                              {name}
                            </SelectItem>
                          ))}
                          <SelectItem value="add-new" className="text-primary font-medium">
                            + Add New Product
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={inventoryForm.control}
                  name="buyingPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Buying Price (₹)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            type={showBuyingPrice ? "text" : "password"}
                            placeholder="Enter buying price" 
                            {...field} 
                            className="pr-10"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowBuyingPrice(!showBuyingPrice)}
                          >
                            {showBuyingPrice ? (
                              <EyeOff className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <Eye className="h-4 w-4 text-muted-foreground" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />

                {/* Add Profit Display */}
                <div className="bg-muted/50 rounded-lg p-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Profit Amount</p>
                      <p className={`text-lg font-semibold ${profit.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ₹{profit.amount.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Profit Percentage</p>
                      <p className={`text-lg font-semibold ${profit.percentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {profit.percentage.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <FormField
                    control={inventoryForm.control}
                    name="sellingPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Selling Price (Including GST)</FormLabel>
                        <FormControl>
                          <div className="space-y-3">
                            <Input 
                              type="number"
                              placeholder="Enter price including GST" 
                              value={gstInclusivePrice}
                              onChange={handleGstInclusivePriceChange}
                            />
                            {gstInclusivePrice && (
                              <p className="text-sm text-muted-foreground">
                                Base Price: {field.value}
                              </p>
                            )}
                          </div>
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <div className="space-y-2">
                    <FormLabel className="text-sm font-medium">GST Rate</FormLabel>
                    <div className="flex flex-wrap items-center gap-2">
                      {isCustomGst ? (
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            min="0"
                            max="28"
                            step="0.01"
                            value={selectedGst}
                            onChange={handleCustomGstChange}
                            className="w-20"
                          />
                          <span className="text-sm">%</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsCustomGst(false)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <Select
                          value={selectedGst.toString()}
                          onValueChange={handleGstChange}
                        >
                          <SelectTrigger className="w-[100px]">
                            <SelectValue placeholder="Select GST" />
                          </SelectTrigger>
                          <SelectContent>
                            {GST_PRESETS.map((preset) => (
                              <SelectItem key={preset.value} value={preset.value}>
                                {preset.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  </div>
                </div>
                
                <FormField
                  control={inventoryForm.control}
                  name="stock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stock</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} min={0} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={inventoryForm.control}
                  name="supplierId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Supplier</FormLabel>
                      <div className="flex gap-2">
                        <Select 
                          onValueChange={field.onChange} 
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="flex-1">
                              <SelectValue placeholder="Select a supplier" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {suppliers.map((supplier) => (
                              <SelectItem key={supplier.id} value={supplier.id}>
                                {supplier.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setIsSupplierDialogOpen(true)}
                        >
                          Add New
                        </Button>
                      </div>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={inventoryForm.control}
                  name="image"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Image</FormLabel>
                      <FormControl>
                        <div className="space-y-4">
                          <div className="flex items-center gap-4">
                            <div className="w-24 h-24 rounded-md overflow-hidden bg-muted relative group">
                              {field.value ? (
                                <>
                                  <img 
                                    src={field.value} 
                                    alt="Product preview"
                                    className="w-full h-full object-cover"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveImage(field)}
                                    className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                                  >
                                    <X className="h-6 w-6 text-white" />
                                  </button>
                                </>
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                  <Package className="h-8 w-8" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex gap-2">
                                <Input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => handleImageUpload(e, field)}
                                  className="hidden"
                                  id="image-upload"
                                />
                                <label
                                  htmlFor="image-upload"
                                  className="flex items-center gap-2 px-4 py-2 border rounded-md cursor-pointer hover:bg-muted"
                                >
                                  <Upload className="h-4 w-4" />
                                  Upload Image
                                </label>
                                <Input
                                  type="text"
                                  placeholder="Or enter image URL"
                                  value={field.value}
                                  onChange={field.onChange}
                                />
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                Upload an image or enter a URL. Max size: 5MB
                              </p>
                            </div>
                          </div>
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <Button type="submit">Update Product</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Add Product Name Dialog */}
        <Dialog open={isAddProductNameOpen} onOpenChange={setIsAddProductNameOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Product Name</DialogTitle>
              <DialogDescription>
                Add a new product name to your inventory catalog
              </DialogDescription>
            </DialogHeader>
            
            <Form {...productNameForm}>
              <form onSubmit={productNameForm.handleSubmit(handleAddProductName)} className="space-y-4">
                <FormField
                  control={productNameForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter product name" 
                          {...field} 
                          onChange={(e) => field.onChange(e.target.value.trim())}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={productNameForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter product description" 
                          {...field} 
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <Button type="submit">Add Product Name</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Add Supplier Dialog */}
        <Dialog open={isSupplierDialogOpen} onOpenChange={setIsSupplierDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Supplier</DialogTitle>
              <DialogDescription>
                Add a new supplier to your database
              </DialogDescription>
            </DialogHeader>
            
            <Form {...supplierForm}>
              <form onSubmit={supplierForm.handleSubmit(handleAddSupplier)} className="space-y-4">
                <FormField
                  control={supplierForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Supplier Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter supplier name" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={supplierForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter email address" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={supplierForm.control}
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
                  control={supplierForm.control}
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
                
                <DialogFooter>
                  <Button type="submit">Add Supplier</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Item</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this item? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteConfirm}
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
};

export default Inventory;
