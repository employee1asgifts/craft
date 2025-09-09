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
import { FileDown, PackagePlus, Upload, X } from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useSuppliers } from "@/contexts/SupplierContext";
import { Package } from "lucide-react";

const Inventory: React.FC = () => {
  const { suppliers, addSupplier } = useSuppliers();
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
    toast.success("Inventory data exported successfully");
  };

  const handleEditItem = (id: string) => {
    const item = inventoryItems.find(item => item.id === id);
    if (item) {
      setCurrentItem(item);
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
      sellingPrice: `₹${values.sellingPrice}`,
      stock: values.stock,
      lastUpdated: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      }),
      supplierId: values.supplierId,
      image: values.image,
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
                sellingPrice: `₹${values.sellingPrice}`,
                stock: values.stock,
                lastUpdated: new Date().toLocaleDateString("en-US", {
                  month: "short",
                  day: "2-digit",
                  year: "numeric",
                }),
                supplierId: values.supplierId,
                image: values.image,
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

  const filteredItems = inventoryItems.filter(
    (item) => {
      if (
        searchTerm &&
        !item.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !item.id.toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        return false;
      }
      
      return true;
    }
  );

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory</h1>
          <p className="text-muted-foreground">
            Manage your product inventory and stock levels
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 justify-between">
          <div className="flex flex-1 items-center space-x-2">
            <Input
              placeholder="Search inventory..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-[300px]"
            />
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExportInventory}>
              <FileDown className="mr-2 h-4 w-4" />
              Export Inventory
            </Button>
            
            <Dialog open={isAddItemOpen} onOpenChange={setIsAddItemOpen}>
              <DialogTrigger asChild>
                <Button>
                  <PackagePlus className="mr-2 h-4 w-4" />
                  Add Product
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Inventory Item</DialogTitle>
                  <DialogDescription>
                    Add a new product to your inventory
                  </DialogDescription>
                </DialogHeader>
                
                <Form {...inventoryForm}>
                  <form onSubmit={inventoryForm.handleSubmit(handleAddProduct)} className="space-y-4">
                    <FormField
                      control={inventoryForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Product Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter product name" {...field} />
                          </FormControl>
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
                            <Input type="text" placeholder="Enter buying price" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={inventoryForm.control}
                      name="sellingPrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Selling Price (₹)</FormLabel>
                          <FormControl>
                            <Input type="text" placeholder="Enter selling price" {...field} />
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
                      <Button type="submit">Add Product</Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <InventoryTable 
          items={filteredItems} 
          onUpdateStock={handleUpdateStock} 
          onEditItem={handleEditItem}
        />

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
                      <FormControl>
                        <Input placeholder="Enter product name" {...field} />
                      </FormControl>
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
                        <Input type="text" placeholder="Enter buying price" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={inventoryForm.control}
                  name="sellingPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Selling Price (₹)</FormLabel>
                      <FormControl>
                        <Input type="text" placeholder="Enter selling price" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
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
      </div>
    </AppLayout>
  );
};

export default Inventory;
