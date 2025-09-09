import React, { useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { FileText, Pen, Settings, Printer, Users, Store, Truck } from "lucide-react";
import { templates, defaultTemplate, defaultInvoiceSettings, InvoiceSettings } from "@/utils/invoiceTemplates";
import { Textarea } from "@/components/ui/textarea";
import { generateAndDownloadInvoice } from "@/utils/invoiceUtils";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "designer" | "user";
  active: boolean;
  department?: string;
  specialization?: string;
  lastActive?: string;
}

interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  gstin: string;
  category: string;
  status: "active" | "inactive";
  lastOrderDate?: string;
}

const Admin: React.FC = () => {
  const [users, setUsers] = useState<User[]>([
    {
      id: "usr-1",
      name: "Admin User",
      email: "admin@craftshop.com",
      role: "admin",
      active: true,
      lastActive: "2024-03-20 10:30 AM"
    },
    {
      id: "usr-2",
      name: "Aditya Sharma",
      email: "aditya@craftshop.com",
      role: "designer",
      active: true,
      department: "Graphics",
      specialization: "Logo Design",
      lastActive: "2024-03-20 09:15 AM"
    },
    {
      id: "usr-3",
      name: "Priya Patel",
      email: "priya@craftshop.com",
      role: "designer",
      active: true,
      department: "Print",
      specialization: "Print Design",
      lastActive: "2024-03-20 11:45 AM"
    },
    {
      id: "usr-4",
      name: "Rahul Kumar",
      email: "rahul@craftshop.com",
      role: "user",
      active: true,
      lastActive: "2024-03-19 04:20 PM"
    }
  ]);

  const [shopSettings, setShopSettings] = useState({
    shopName: "CraftShop",
    currency: "INR",
    address: "123 Craft Street, Design District, Mumbai",
    phone: "+91 98765 43210",
    email: "contact@craftshop.com",
    taxRate: "18",
  });

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [settingsChanged, setSettingsChanged] = useState(false);
  
  // Invoice template settings
  const [invoiceSettings, setInvoiceSettings] = useState<InvoiceSettings>(defaultInvoiceSettings);
  const [selectedTemplate, setSelectedTemplate] = useState<string>(defaultTemplate);
  const [previewOrderData, setPreviewOrderData] = useState({
    id: "INV-PREVIEW",
    orderId: "ORD-PREVIEW",
    date: new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
    customer: "Preview Customer",
    items: "Sample Product (x2), Another Product (x1)",
    amount: "₹3,000",
    status: "pending" as "pending" | "paid" | "overdue",
  });
  
  const [activeTab, setActiveTab] = useState<'basic' | 'company' | 'appearance' | 'text' | 'print' | 'advanced'>('basic');

  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newUser, setNewUser] = useState<Partial<User>>({
    role: "user",
    active: true
  });

  const [suppliers, setSuppliers] = useState<Supplier[]>([
    {
      id: "SUP-001",
      name: "PrintPro Solutions",
      contactPerson: "Rajesh Kumar",
      email: "rajesh@printpro.com",
      phone: "+91 98765 43210",
      address: "123 Print Street, Industrial Area, Mumbai",
      gstin: "27ABCDE1234F1Z5",
      category: "Printing",
      status: "active",
      lastOrderDate: "2024-03-15"
    },
    {
      id: "SUP-002",
      name: "Paper Supplies Ltd",
      contactPerson: "Priya Sharma",
      email: "priya@papersupplies.com",
      phone: "+91 98765 43211",
      address: "456 Paper Road, Business Park, Delhi",
      gstin: "07ABCDE1234F1Z6",
      category: "Raw Materials",
      status: "active",
      lastOrderDate: "2024-03-10"
    },
    {
      id: "SUP-003",
      name: "Design Tools Co",
      contactPerson: "Amit Patel",
      email: "amit@designtools.com",
      phone: "+91 98765 43212",
      address: "789 Design Avenue, Tech Hub, Bangalore",
      gstin: "29ABCDE1234F1Z7",
      category: "Equipment",
      status: "inactive",
      lastOrderDate: "2024-02-28"
    }
  ]);

  const [isAddSupplierOpen, setIsAddSupplierOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [supplierDialogOpen, setSupplierDialogOpen] = useState(false);
  const [newSupplier, setNewSupplier] = useState<Partial<Supplier>>({
    status: "active"
  });

  const handleUserEdit = (user: User) => {
    setSelectedUser({...user});
    setUserDialogOpen(true);
  };

  const handleUserUpdate = () => {
    if (!selectedUser) return;
    
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.id === selectedUser.id ? selectedUser : user
      )
    );
    
    toast.success(`User ${selectedUser.name} updated`);
    setUserDialogOpen(false);
  };

  const handleToggleUserStatus = (userId: string) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.id === userId ? { ...user, active: !user.active } : user
      )
    );
    
    const user = users.find(u => u.id === userId);
    const newStatus = user?.active ? "deactivated" : "activated";
    toast.success(`User ${user?.name} ${newStatus}`);
  };

  const handleSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setShopSettings((prev) => ({ ...prev, [name]: value }));
    setSettingsChanged(true);
  };

  const handleSaveSettings = () => {
    toast.success("Shop settings updated");
    setSettingsChanged(false);
  };
  
  const handleInvoiceSettingsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setInvoiceSettings((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleCustomizationChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setInvoiceSettings((prev) => ({
      ...prev,
      customization: {
        ...prev.customization,
        [name]: value,
      }
    }));
  };
  
  const handleCustomizationToggle = (name: string, value: boolean) => {
    setInvoiceSettings((prev) => ({
      ...prev,
      customization: {
        ...prev.customization,
        [name]: value,
      }
    }));
  };
  
  const handleCompanyDetailsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setInvoiceSettings((prev) => ({
      ...prev,
      companyDetails: {
        ...prev.companyDetails,
        [name]: value
      }
    }));
  };
  
  const handleBankDetailsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInvoiceSettings((prev) => ({
      ...prev,
      bankDetails: {
        ...prev.bankDetails,
        [name]: value
      }
    }));
  };
  
  const handleSaveInvoiceSettings = () => {
    // Save settings to localStorage
    localStorage.setItem('invoiceSettings', JSON.stringify(invoiceSettings));
    toast.success("Invoice settings updated");
  };
  
  const handleTemplateChange = (template: string) => {
    setSelectedTemplate(template);
    setInvoiceSettings((prev) => ({
      ...prev,
      template
    }));
  };
  
  const handlePreviewInvoice = () => {
    generateAndDownloadInvoice(previewOrderData, selectedTemplate, invoiceSettings);
  };
  
  const handlePreviewStatusChange = (status: "pending" | "paid" | "overdue") => {
    setPreviewOrderData(prev => ({
      ...prev,
      status
    }));
  };

  const handleAddUser = () => {
    if (!newUser.name || !newUser.email || !newUser.role) {
      toast.error("Please fill in all required fields");
      return;
    }

    const user: User = {
      id: `usr-${users.length + 1}`,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role as User["role"],
      active: true,
      department: newUser.department,
      specialization: newUser.specialization,
      lastActive: new Date().toLocaleString()
    };

    setUsers([...users, user]);
    setIsAddUserOpen(false);
    setNewUser({ role: "user", active: true });
    toast.success("User added successfully");
  };

  const handleSupplierEdit = (supplier: Supplier) => {
    setSelectedSupplier({...supplier});
    setSupplierDialogOpen(true);
  };

  const handleSupplierUpdate = () => {
    if (!selectedSupplier) return;
    
    setSuppliers((prevSuppliers) =>
      prevSuppliers.map((supplier) =>
        supplier.id === selectedSupplier.id ? selectedSupplier : supplier
      )
    );
    
    toast.success(`Supplier ${selectedSupplier.name} updated`);
    setSupplierDialogOpen(false);
  };

  const handleToggleSupplierStatus = (supplierId: string) => {
    setSuppliers((prevSuppliers) =>
      prevSuppliers.map((supplier) =>
        supplier.id === supplierId ? { ...supplier, status: supplier.status === "active" ? "inactive" : "active" } : supplier
      )
    );
    
    const supplier = suppliers.find(s => s.id === supplierId);
    const newStatus = supplier?.status === "active" ? "deactivated" : "activated";
    toast.success(`Supplier ${supplier?.name} ${newStatus}`);
  };

  const handleAddSupplier = () => {
    if (!newSupplier.name || !newSupplier.email || !newSupplier.phone) {
      toast.error("Please fill in all required fields");
      return;
    }

    const supplier: Supplier = {
      id: `SUP-${Math.floor(100 + Math.random() * 900)}`,
      name: newSupplier.name,
      contactPerson: newSupplier.contactPerson || "",
      email: newSupplier.email,
      phone: newSupplier.phone,
      address: newSupplier.address || "",
      gstin: newSupplier.gstin || "",
      category: newSupplier.category || "Other",
      status: newSupplier.status as "active" | "inactive",
    };

    setSuppliers([supplier, ...suppliers]);
    setIsAddSupplierOpen(false);
    setNewSupplier({ status: "active" });
    toast.success("Supplier added successfully");
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Panel</h1>
          <p className="text-muted-foreground">
            Manage shop settings and user accounts
          </p>
        </div>

        <Tabs defaultValue="settings" className="space-y-4">
          <TabsList>
            <TabsTrigger value="settings">Shop Settings</TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
            <TabsTrigger value="invoices">Invoice Templates</TabsTrigger>
          </TabsList>
          
          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Shop Information</CardTitle>
                <CardDescription>
                  Update your shop details and preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="shopName">Shop Name</label>
                    <Input 
                      id="shopName"
                      name="shopName"
                      value={shopSettings.shopName}
                      onChange={handleSettingsChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="currency">Currency</label>
                    <Input 
                      id="currency"
                      name="currency"
                      value={shopSettings.currency}
                      onChange={handleSettingsChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="address">Address</label>
                    <Input 
                      id="address"
                      name="address"
                      value={shopSettings.address}
                      onChange={handleSettingsChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="phone">Phone</label>
                    <Input 
                      id="phone"
                      name="phone"
                      value={shopSettings.phone}
                      onChange={handleSettingsChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="email">Email</label>
                    <Input 
                      id="email"
                      name="email"
                      value={shopSettings.email}
                      onChange={handleSettingsChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="taxRate">Tax Rate (%)</label>
                    <Input 
                      id="taxRate"
                      name="taxRate"
                      value={shopSettings.taxRate}
                      onChange={handleSettingsChange}
                    />
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button 
                    onClick={handleSaveSettings}
                    disabled={!settingsChanged}
                  >
                    Save Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="users">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Users</CardTitle>
                  <CardDescription>Manage user accounts and permissions</CardDescription>
                </div>
                <Button onClick={() => setIsAddUserOpen(true)}>+ Add User</Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Specialization</TableHead>
                      <TableHead>Last Active</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell className="capitalize">{user.role}</TableCell>
                        <TableCell>{user.department || "-"}</TableCell>
                        <TableCell>{user.specialization || "-"}</TableCell>
                        <TableCell>{user.lastActive || "-"}</TableCell>
                        <TableCell>
                          <span className={`status-badge ${user.active ? 'status-ready' : 'status-dispatched'}`}>
                            {user.active ? 'Active' : 'Inactive'}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUserEdit(user)}
                            >
                              <Pen className="h-4 w-4" />
                            </Button>
                            <Button
                              variant={user.active ? "outline" : "default"}
                              size="sm"
                              onClick={() => handleToggleUserStatus(user.id)}
                            >
                              {user.active ? "Deactivate" : "Activate"}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="suppliers">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Suppliers</CardTitle>
                  <CardDescription>Manage your suppliers and vendors</CardDescription>
                </div>
                <Button onClick={() => setIsAddSupplierOpen(true)}>+ Add Supplier</Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Contact Person</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>GSTIN</TableHead>
                      <TableHead>Last Order</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {suppliers.map((supplier) => (
                      <TableRow key={supplier.id}>
                        <TableCell className="font-medium">{supplier.name}</TableCell>
                        <TableCell>{supplier.contactPerson}</TableCell>
                        <TableCell>{supplier.email}</TableCell>
                        <TableCell>{supplier.phone}</TableCell>
                        <TableCell>{supplier.category}</TableCell>
                        <TableCell>{supplier.gstin}</TableCell>
                        <TableCell>{supplier.lastOrderDate || "-"}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            supplier.status === "active" 
                              ? "bg-green-100 text-green-800" 
                              : "bg-red-100 text-red-800"
                          }`}>
                            {supplier.status}
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
                              <DropdownMenuItem onClick={() => handleSupplierEdit(supplier)}>
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleToggleSupplierStatus(supplier.id)}>
                                {supplier.status === "active" ? "Deactivate" : "Activate"}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="invoices" className="space-y-4">
            <Card className="mb-4">
              <CardHeader>
                <CardTitle>Invoice Template Selection</CardTitle>
                <CardDescription>
                  Choose and customize your invoice templates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                  {templates.map((template) => (
                    <div 
                      key={template.id} 
                      className={`border rounded-md p-4 cursor-pointer transition-all hover:shadow-md ${selectedTemplate === template.id ? 'border-primary ring-2 ring-primary ring-opacity-50' : 'border-border'}`}
                      onClick={() => handleTemplateChange(template.id)}
                    >
                      <div className="aspect-[4/5] bg-muted rounded-md mb-3 flex items-center justify-center">
                        <FileText className="h-12 w-12 text-muted-foreground" />
                      </div>
                      <h3 className="font-medium">{template.name}</h3>
                      <p className="text-sm text-muted-foreground">{template.description}</p>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between mb-6">
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Preview Options</h3>
                    <div className="flex space-x-2">
                      <Button 
                        variant={previewOrderData.status === "pending" ? "default" : "outline"} 
                        size="sm"
                        onClick={() => handlePreviewStatusChange("pending")}
                      >
                        Pending
                      </Button>
                      <Button 
                        variant={previewOrderData.status === "paid" ? "default" : "outline"} 
                        size="sm"
                        onClick={() => handlePreviewStatusChange("paid")}
                      >
                        Paid
                      </Button>
                      <Button 
                        variant={previewOrderData.status === "overdue" ? "default" : "outline"} 
                        size="sm"
                        onClick={() => handlePreviewStatusChange("overdue")}
                      >
                        Overdue
                      </Button>
                    </div>
                  </div>
                  
                  <Button onClick={handlePreviewInvoice} variant="outline" className="mr-2">
                    <Printer className="h-4 w-4 mr-2" />
                    Preview Invoice
                  </Button>
                </div>
                
                <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as any)}>
                  <TabsList className="w-full mb-4">
                    <TabsTrigger value="basic" className="flex-1">Basic</TabsTrigger>
                    <TabsTrigger value="company" className="flex-1">Company Info</TabsTrigger>
                    <TabsTrigger value="appearance" className="flex-1">Appearance</TabsTrigger>
                    <TabsTrigger value="text" className="flex-1">Text & Notes</TabsTrigger>
                    <TabsTrigger value="print" className="flex-1">Print Settings</TabsTrigger>
                    <TabsTrigger value="advanced" className="flex-1">Advanced</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="basic">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Theme Color</label>
                          <div className="flex items-center space-x-2">
                            <Input 
                              type="color" 
                              name="color" 
                              value={invoiceSettings.color}
                              onChange={handleInvoiceSettingsChange}
                              className="w-12 h-10 p-1"
                            />
                            <Input 
                              type="text" 
                              name="color" 
                              value={invoiceSettings.color}
                              onChange={handleInvoiceSettingsChange}
                              className="flex-1"
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <label htmlFor="showLogo" className="text-sm font-medium">Show Logo</label>
                            <Switch 
                              id="showLogo" 
                              checked={invoiceSettings.showLogo}
                              onCheckedChange={(checked) => setInvoiceSettings(prev => ({...prev, showLogo: checked}))}
                            />
                          </div>
                          
                          {invoiceSettings.showLogo && (
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Logo Position</label>
                              <select
                                name="logoPosition"
                                value={invoiceSettings.customization.logoPosition}
                                onChange={handleCustomizationChange}
                                className="w-full rounded-md border border-input bg-background px-3 py-2"
                              >
                                <option value="left">Left</option>
                                <option value="center">Center</option>
                                <option value="right">Right</option>
                              </select>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <label htmlFor="includeShipping" className="text-sm font-medium">Include Shipping Details</label>
                          <Switch 
                            id="includeShipping"
                            checked={invoiceSettings.includeShipping}
                            onCheckedChange={(checked) => setInvoiceSettings(prev => ({...prev, includeShipping: checked}))}
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <h3 className="text-sm font-medium">Bank Details</h3>
                          <div className="space-y-2">
                            <label className="text-xs">Account Holder's Name</label>
                            <Input 
                              name="accountName"
                              value={invoiceSettings.bankDetails.accountName}
                              onChange={handleBankDetailsChange}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <label className="text-xs">Bank Name</label>
                            <Input 
                              name="bankName"
                              value={invoiceSettings.bankDetails.bankName}
                              onChange={handleBankDetailsChange}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <label className="text-xs">Account Number</label>
                            <Input 
                              name="accountNumber"
                              value={invoiceSettings.bankDetails.accountNumber}
                              onChange={handleBankDetailsChange}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="company">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Company Name</label>
                          <Input 
                            name="name" 
                            value={invoiceSettings.companyDetails.name}
                            onChange={handleCompanyDetailsChange}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Company Address</label>
                          <Textarea 
                            name="address" 
                            value={invoiceSettings.companyDetails.address}
                            onChange={handleCompanyDetailsChange}
                            rows={3}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <label className="text-sm font-medium">GSTIN</label>
                          <Input 
                            name="gstin" 
                            value={invoiceSettings.companyDetails.gstin}
                            onChange={handleCompanyDetailsChange}
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Phone Number</label>
                          <Input 
                            name="phone" 
                            value={invoiceSettings.companyDetails.phone}
                            onChange={handleCompanyDetailsChange}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Email Address</label>
                          <Input 
                            name="email" 
                            value={invoiceSettings.companyDetails.email}
                            onChange={handleCompanyDetailsChange}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Website</label>
                          <Input 
                            name="website" 
                            value={invoiceSettings.companyDetails.website}
                            onChange={handleCompanyDetailsChange}
                          />
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="appearance">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Font Family</label>
                          <select
                            name="fontFamily"
                            value={invoiceSettings.customization.fontFamily}
                            onChange={handleCustomizationChange}
                            className="w-full rounded-md border border-input bg-background px-3 py-2"
                          >
                            <option value="Inter, sans-serif">Inter</option>
                            <option value="Arial, sans-serif">Arial</option>
                            <option value="Helvetica, sans-serif">Helvetica</option>
                            <option value="Times New Roman, serif">Times New Roman</option>
                            <option value="Georgia, serif">Georgia</option>
                            <option value="Courier New, monospace">Courier New</option>
                            <option value="Verdana, sans-serif">Verdana</option>
                            <option value="Roboto, sans-serif">Roboto</option>
                            <option value="Open Sans, sans-serif">Open Sans</option>
                            <option value="Lato, sans-serif">Lato</option>
                          </select>
                        </div>
                        
                        <div className="space-y-4">
                          <h3 className="text-sm font-medium">Color Scheme</h3>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="text-xs">Primary Color</label>
                              <div className="flex items-center space-x-2">
                                <Input 
                                  type="color" 
                                  name="color" 
                                  value={invoiceSettings.color}
                                  onChange={handleInvoiceSettingsChange}
                                  className="w-12 h-10 p-1"
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <label className="text-xs">Accent Color</label>
                              <div className="flex items-center space-x-2">
                                <Input 
                                  type="color" 
                                  name="accentColor" 
                                  value={invoiceSettings.customization.accentColor}
                                  onChange={handleCustomizationChange}
                                  className="w-12 h-10 p-1"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <h3 className="text-sm font-medium">Elements Visibility</h3>
                          <div className="flex flex-col gap-4">
                            <div className="flex items-center justify-between">
                              <label htmlFor="showSignature" className="text-sm">Show Signature Line</label>
                              <Switch 
                                id="showSignature" 
                                checked={invoiceSettings.customization.showSignature}
                                onCheckedChange={(checked) => handleCustomizationToggle('showSignature', checked)}
                              />
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <label htmlFor="showFooter" className="text-sm">Show Footer</label>
                              <Switch 
                                id="showFooter" 
                                checked={invoiceSettings.customization.showFooter}
                                onCheckedChange={(checked) => handleCustomizationToggle('showFooter', checked)}
                              />
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <label htmlFor="showQrCode" className="text-sm">Show QR Code</label>
                              <Switch 
                                id="showQrCode" 
                                checked={invoiceSettings.customization.showQrCode}
                                onCheckedChange={(checked) => handleCustomizationToggle('showQrCode', checked)}
                              />
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <label htmlFor="showBorders" className="text-sm">Show Borders</label>
                              <Switch 
                                id="showBorders" 
                                checked={invoiceSettings.customization.showBorders}
                                onCheckedChange={(checked) => handleCustomizationToggle('showBorders', checked)}
                              />
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <label htmlFor="showItemImages" className="text-sm">Show Item Images</label>
                              <Switch 
                                id="showItemImages" 
                                checked={invoiceSettings.customization.showItemImages}
                                onCheckedChange={(checked) => handleCustomizationToggle('showItemImages', checked)}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Header Image</label>
                          <div className="flex items-center justify-between mb-2">
                            <label htmlFor="showHeaderImage" className="text-sm">Show Header Image</label>
                            <Switch 
                              id="showHeaderImage" 
                              checked={invoiceSettings.customization.showHeaderImage}
                              onCheckedChange={(checked) => handleCustomizationToggle('showHeaderImage', checked)}
                            />
                          </div>
                          <Input 
                            name="headerImageUrl" 
                            value={invoiceSettings.customization.headerImageUrl}
                            onChange={handleCustomizationChange}
                            placeholder="Enter image URL"
                            disabled={!invoiceSettings.customization.showHeaderImage}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Footer Text</label>
                          <Textarea 
                            name="footerText" 
                            value={invoiceSettings.customization.footerText}
                            onChange={handleCustomizationChange}
                            rows={3}
                            disabled={!invoiceSettings.customization.showFooter}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Date Format</label>
                          <select
                            name="dateFormat"
                            value={invoiceSettings.customization.dateFormat}
                            onChange={handleCustomizationChange}
                            className="w-full rounded-md border border-input bg-background px-3 py-2"
                          >
                            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="text">
                    <div className="grid grid-cols-1 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium" htmlFor="notes">Invoice Notes</label>
                        <Textarea 
                          id="notes"
                          name="notes"
                          value={invoiceSettings.notes}
                          onChange={handleInvoiceSettingsChange}
                          className="min-h-[100px]"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium" htmlFor="termsAndConditions">Terms and Conditions</label>
                        <Textarea 
                          id="termsAndConditions"
                          name="termsAndConditions"
                          value={invoiceSettings.termsAndConditions}
                          onChange={handleInvoiceSettingsChange}
                          className="min-h-[100px]"
                        />
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="print">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Paper Size</label>
                          <select
                            name="paperSize"
                            value={invoiceSettings.customization.paperSize}
                            onChange={handleCustomizationChange}
                            className="w-full rounded-md border border-input bg-background px-3 py-2"
                          >
                            <option value="a4">A4</option>
                            <option value="letter">Letter</option>
                            <option value="legal">Legal</option>
                          </select>
                        </div>
                        
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Orientation</label>
                          <select
                            name="orientation"
                            value={invoiceSettings.customization.orientation}
                            onChange={handleCustomizationChange}
                            className="w-full rounded-md border border-input bg-background px-3 py-2"
                          >
                            <option value="portrait">Portrait</option>
                            <option value="landscape">Landscape</option>
                          </select>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 p-4 rounded-md">
                        <h3 className="text-sm font-medium mb-2">Print Tips</h3>
                        <ul className="text-sm space-y-2 text-gray-600">
                          <li>• Choose A4 size (210 × 297 mm) for standard printing</li>
                          <li>• Select "Fit to page" in your printer settings</li>
                          <li>• Disable headers and footers in browser print settings</li>
                          <li>• For best results, save as PDF before printing</li>
                          <li>• Check "Background graphics" option if colors are missing</li>
                        </ul>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="advanced">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <h3 className="text-sm font-medium">Watermark</h3>
                          <div className="flex items-center justify-between mb-2">
                            <label htmlFor="showWatermark" className="text-sm">Show Watermark</label>
                            <Switch 
                              id="showWatermark" 
                              checked={invoiceSettings.customization.showWatermark}
                              onCheckedChange={(checked) => handleCustomizationToggle('showWatermark', checked)}
                            />
                          </div>
                          {invoiceSettings.customization.showWatermark && (
                            <div className="space-y-2">
                              <label className="text-xs">Watermark Text</label>
                              <Input 
                                name="watermarkText"
                                value={invoiceSettings.customization.watermarkText}
                                onChange={handleCustomizationChange}
                                placeholder="PAID, COPY, etc."
                              />
                            </div>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          <h3 className="text-sm font-medium">Payment QR</h3>
                          <div className="flex items-center justify-between mb-2">
                            <label htmlFor="showPaymentQR" className="text-sm">Show Payment QR Code</label>
                            <Switch 
                              id="showPaymentQR" 
                              checked={invoiceSettings.customization.showPaymentQR}
                              onCheckedChange={(checked) => handleCustomizationToggle('showPaymentQR', checked)}
                            />
                          </div>
                          {invoiceSettings.customization.showPaymentQR && (
                            <div className="space-y-2">
                              <label className="text-xs">Payment QR URL</label>
                              <Input 
                                name="paymentQRUrl"
                                value={invoiceSettings.customization.paymentQRUrl}
                                onChange={handleCustomizationChange}
                                placeholder="UPI QR code or payment link"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="p-4 bg-blue-50 rounded-md">
                          <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                            <Store className="h-4 w-4" />
                            Company Branding Tips
                          </h3>
                          <ul className="text-sm space-y-2 text-blue-600">
                            <li>• Use the same colors as your brand identity</li>
                            <li>• Add your company logo for professional appearance</li>
                            <li>• Consider a watermark for important documents</li>
                            <li>• Include payment QR codes to get paid faster</li>
                            <li>• Keep your template consistent across all invoices</li>
                          </ul>
                        </div>
                        
                        <div className="p-4 bg-amber-50 rounded-md mt-4">
                          <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            Customer Experience
                          </h3>
                          <ul className="text-sm space-y-2 text-amber-600">
                            <li>• Clear payment terms improve on-time payments</li>
                            <li>• Professional invoices build customer trust</li>
                            <li>• Digital payment options speed up transactions</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="flex justify-end mt-8">
                  <Button onClick={handleSaveInvoiceSettings} className="w-full md:w-auto">
                    Save Invoice Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Add User Dialog */}
      <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>
              Create a new user account with specific role and permissions
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <Input
                value={newUser.name || ""}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                placeholder="Enter full name"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input
                value={newUser.email || ""}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                placeholder="Enter email address"
                type="email"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Role</label>
              <select
                value={newUser.role || "user"}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value as User["role"] })}
                className="w-full rounded-md border border-input bg-background px-3 py-2"
              >
                <option value="user">User</option>
                <option value="designer">Designer</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            
            {newUser.role === "designer" && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Department</label>
                  <Input
                    value={newUser.department || ""}
                    onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
                    placeholder="Enter department"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Specialization</label>
                  <Input
                    value={newUser.specialization || ""}
                    onChange={(e) => setNewUser({ ...newUser, specialization: e.target.value })}
                    placeholder="Enter specialization"
                  />
                </div>
              </>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddUserOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddUser}>Add User</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Supplier Dialog */}
      <Dialog open={isAddSupplierOpen} onOpenChange={setIsAddSupplierOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Supplier</DialogTitle>
            <DialogDescription>
              Add a new supplier to your vendor list
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Company Name *</label>
              <Input
                value={newSupplier.name || ""}
                onChange={(e) => setNewSupplier({ ...newSupplier, name: e.target.value })}
                placeholder="Enter company name"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Contact Person</label>
              <Input
                value={newSupplier.contactPerson || ""}
                onChange={(e) => setNewSupplier({ ...newSupplier, contactPerson: e.target.value })}
                placeholder="Enter contact person name"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Email *</label>
              <Input
                value={newSupplier.email || ""}
                onChange={(e) => setNewSupplier({ ...newSupplier, email: e.target.value })}
                placeholder="Enter email address"
                type="email"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Phone *</label>
              <Input
                value={newSupplier.phone || ""}
                onChange={(e) => setNewSupplier({ ...newSupplier, phone: e.target.value })}
                placeholder="Enter phone number"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Address</label>
              <Textarea
                value={newSupplier.address || ""}
                onChange={(e) => setNewSupplier({ ...newSupplier, address: e.target.value })}
                placeholder="Enter address"
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">GSTIN</label>
              <Input
                value={newSupplier.gstin || ""}
                onChange={(e) => setNewSupplier({ ...newSupplier, gstin: e.target.value })}
                placeholder="Enter GSTIN"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <select
                value={newSupplier.category || ""}
                onChange={(e) => setNewSupplier({ ...newSupplier, category: e.target.value })}
                className="w-full rounded-md border border-input bg-background px-3 py-2"
              >
                <option value="">Select category</option>
                <option value="Printing">Printing</option>
                <option value="Raw Materials">Raw Materials</option>
                <option value="Equipment">Equipment</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddSupplierOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddSupplier}>Add Supplier</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Supplier Dialog */}
      <Dialog open={supplierDialogOpen} onOpenChange={setSupplierDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Supplier</DialogTitle>
            <DialogDescription>
              Update supplier information
            </DialogDescription>
          </DialogHeader>
          
          {selectedSupplier && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Company Name *</label>
                <Input
                  value={selectedSupplier.name}
                  onChange={(e) => setSelectedSupplier({ ...selectedSupplier, name: e.target.value })}
                  placeholder="Enter company name"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Contact Person</label>
                <Input
                  value={selectedSupplier.contactPerson}
                  onChange={(e) => setSelectedSupplier({ ...selectedSupplier, contactPerson: e.target.value })}
                  placeholder="Enter contact person name"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Email *</label>
                <Input
                  value={selectedSupplier.email}
                  onChange={(e) => setSelectedSupplier({ ...selectedSupplier, email: e.target.value })}
                  placeholder="Enter email address"
                  type="email"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Phone *</label>
                <Input
                  value={selectedSupplier.phone}
                  onChange={(e) => setSelectedSupplier({ ...selectedSupplier, phone: e.target.value })}
                  placeholder="Enter phone number"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Address</label>
                <Textarea
                  value={selectedSupplier.address}
                  onChange={(e) => setSelectedSupplier({ ...selectedSupplier, address: e.target.value })}
                  placeholder="Enter address"
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">GSTIN</label>
                <Input
                  value={selectedSupplier.gstin}
                  onChange={(e) => setSelectedSupplier({ ...selectedSupplier, gstin: e.target.value })}
                  placeholder="Enter GSTIN"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <select
                  value={selectedSupplier.category}
                  onChange={(e) => setSelectedSupplier({ ...selectedSupplier, category: e.target.value })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                >
                  <option value="Printing">Printing</option>
                  <option value="Raw Materials">Raw Materials</option>
                  <option value="Equipment">Equipment</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setSupplierDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSupplierUpdate}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default Admin;
