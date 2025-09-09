import React, { useState, useRef, useEffect } from "react";
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
import {
  Package,
  Truck,
  FileText,
  ClipboardList,
  ClipboardCheck,
  FileDown,
  Pen,
  Settings,
  Users,
  ChartBarIcon,
  Wallet,
  CreditCard,
  Mail,
  Phone,
  Calendar,
  Clock,
  Shield,
  Key,
  UserPlus,
  UserMinus,
  UserCheck,
  UserX,
  MoreVertical,
  Search,
  Filter,
  Printer,
  Store,
  Plus,
} from "lucide-react";
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
import { Label } from "@/components/ui/label";

interface UserPermissions {
  canManageUsers: boolean;
  canManageProducts: boolean;
  canManageOrders: boolean;
  canManageSuppliers: boolean;
  canViewReports: boolean;
  canManageSettings: boolean;
  canManageDesigns: boolean;
  canManageAttendance: boolean;
  canViewAttendance: boolean;
}

interface UserActivity {
  date: string;
  action: string;
  details: string;
}

interface User {
  id: string;
  name: string;
  username: string;
  password: string;
  email?: string;
  role: "admin" | "manager" | "designer" | "user";
  active: boolean;
  lastActive?: string;
  joinDate: string;
  permissions: UserPermissions;
  activityLog: UserActivity[];
  newPassword?: string;
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

interface ShopSettings {
  shopName: string;
  currency: string;
  address: string;
  phone: string;
  email: string;
  taxRate: string;
  gstin: string;
  website: string;
  businessType: string;
  openingHours: string;
  description: string;
  logo: string;
  socialMedia: {
    facebook: string;
    instagram: string;
    twitter: string;
  };
}

const getDefaultPermissions = (role: User["role"]): UserPermissions => {
  switch (role) {
    case "admin":
      return {
        canManageUsers: true,
        canManageProducts: true,
        canManageOrders: true,
        canManageSuppliers: true,
        canViewReports: true,
        canManageSettings: true,
        canManageDesigns: true,
        canManageAttendance: true,
        canViewAttendance: true
      };
    case "manager":
      return {
        canManageUsers: false,
        canManageProducts: true,
        canManageOrders: true,
        canManageSuppliers: true,
        canViewReports: true,
        canManageSettings: false,
        canManageDesigns: false,
        canManageAttendance: true,
        canViewAttendance: true
      };
    case "designer":
      return {
        canManageUsers: false,
        canManageProducts: false,
        canManageOrders: false,
        canManageSuppliers: false,
        canViewReports: false,
        canManageSettings: false,
        canManageDesigns: true,
        canManageAttendance: false,
        canViewAttendance: true
      };
    default:
      return {
        canManageUsers: false,
        canManageProducts: false,
        canManageOrders: false,
        canManageSuppliers: false,
        canViewReports: false,
        canManageSettings: false,
        canManageDesigns: false,
        canManageAttendance: false,
        canViewAttendance: true
      };
  }
};

const Admin: React.FC = () => {
  const [users, setUsers] = useState<User[]>([
    {
      id: "1",
      name: "John Doe",
      username: "johndoe",
      password: "hashed_password_here",
      email: "john@example.com",
      role: "admin",
      active: true,
      lastActive: "2024-03-20 11:45 AM",
      joinDate: "2024-01-01",
      permissions: {
        canManageUsers: true,
        canManageProducts: true,
        canManageOrders: true,
        canManageSuppliers: true,
        canViewReports: true,
        canManageSettings: true,
        canManageDesigns: true,
        canManageAttendance: true,
        canViewAttendance: true
      },
      activityLog: [
        {
          date: "2024-03-20 11:45 AM",
          action: "Last Login",
          details: "User logged in successfully"
        }
      ]
    }
  ]);

  const [productNames, setProductNames] = useState<string[]>([
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

  const [shopSettings, setShopSettings] = useState<ShopSettings>({
    shopName: "CraftShop",
    currency: "INR",
    address: "123 Craft Street, Design District, Mumbai",
    phone: "+91 98765 43210",
    email: "contact@craftshop.com",
    taxRate: "18",
    gstin: "27ABCDE1234F1Z5",
    website: "www.craftshop.com",
    businessType: "Printing & Design",
    openingHours: "Mon-Sat: 9:00 AM - 6:00 PM",
    description: "Your one-stop solution for all printing and design needs",
    logo: "",
    socialMedia: {
      facebook: "https://facebook.com/craftshop",
      instagram: "https://instagram.com/craftshop",
      twitter: "https://twitter.com/craftshop"
    }
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
    name: "",
    username: "",
    password: "",
    email: "",
    role: "user",
    active: true,
    joinDate: new Date().toLocaleDateString(),
    permissions: getDefaultPermissions("user")
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

  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [isViewProductOpen, setIsViewProductOpen] = useState(false);
  const [isEditProductOpen, setIsEditProductOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "",
    category: "",
    description: "",
    image: ""
  });

  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [categories, setCategories] = useState<string[]>([
    "Apparel",
    "Paper Products",
    "Mugs & Drinkware",
    "Stickers & Decals",
    "Photo Products",
    "Custom Items"
  ]);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [newCategory, setNewCategory] = useState("");

  const [uploadedLogo, setUploadedLogo] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState<string>("all");
  const [userStatusFilter, setUserStatusFilter] = useState<string>("all");
  const [selectedUserForActivity, setSelectedUserForActivity] = useState<User | null>(null);
  const [showActivityLog, setShowActivityLog] = useState(false);
  const [showPermissionsDialog, setShowPermissionsDialog] = useState(false);
  const [selectedUserForPermissions, setSelectedUserForPermissions] = useState<User | null>(null);

  // Load shop settings from localStorage on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('shopSettings');
    if (savedSettings) {
      setShopSettings(JSON.parse(savedSettings));
    }
  }, []);

  const handleAddUser = async () => {
    try {
      if (!newUser.name || !newUser.username || !newUser.password) {
        toast.error("Please fill in all required fields");
        return;
      }

      const userData = {
        name: newUser.name,
        username: newUser.username,
        password: newUser.password,
        email: newUser.email || "",
        role: newUser.role || "user",
        active: true
      };

      const response = await fetch('http://localhost:3003/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create user');
      }

      // Add the new user to the local state
      setUsers(prevUsers => [...prevUsers, {
        ...data.user,
        permissions: getDefaultPermissions(data.user.role),
        activityLog: [{
          date: new Date().toLocaleString(),
          action: "Account Created",
          details: "New user account was created"
        }]
      }]);
      
      // Reset form
      setNewUser({
        name: "",
        username: "",
        password: "",
        email: "",
        role: "user",
        active: true,
        joinDate: new Date().toLocaleDateString(),
        permissions: getDefaultPermissions("user")
      });
      
      setIsAddUserOpen(false);
      toast.success("User added successfully");
    } catch (error) {
      console.error('Error adding user:', error);
      toast.error(error instanceof Error ? error.message : "Failed to add user");
    }
  };

  const handleUserEdit = (user: User) => {
    const { specialization, ...userWithoutSpecialization } = user;
    setSelectedUser({
      ...userWithoutSpecialization,
      permissions: user.permissions || getDefaultPermissions(user.role)
    });
    setUserDialogOpen(true);
  };

  const handleUserUpdate = () => {
    if (!selectedUser) return;
    
    if (!selectedUser.name || !selectedUser.username || !selectedUser.role) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (selectedUser.newPassword !== undefined && selectedUser.newPassword.trim() === "") {
      toast.error("New password cannot be empty");
      return;
    }
    
    setUsers((prevUsers) =>
      prevUsers.map((user) => {
        if (user.id === selectedUser.id) {
          const updatedUser = {
            ...selectedUser,
            password: selectedUser.newPassword || user.password,
            activityLog: [
              ...user.activityLog,
              {
                date: new Date().toLocaleString(),
                action: "Profile Updated",
                details: selectedUser.newPassword 
                  ? "User profile and password were updated"
                  : "User profile information was updated"
              }
            ]
          };
          delete updatedUser.newPassword;
          return updatedUser;
        }
        return user;
      })
    );
    
    toast.success(`User ${selectedUser.name} updated`);
    setUserDialogOpen(false);
  };

  const handleToggleUserStatus = (userId: string) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) => {
        if (user.id === userId) {
          const newStatus = !user.active;
          return {
            ...user,
            active: newStatus,
            activityLog: [
              ...user.activityLog,
              {
                date: new Date().toLocaleString(),
                action: "Status Changed",
                details: `User status changed to ${newStatus ? "Active" : "Inactive"}`
              }
            ]
          };
        }
        return user;
      })
    );
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

    setSuppliers(prev => [supplier, ...prev]);
    setIsAddSupplierOpen(false);
    setNewSupplier({ status: "active" });
    toast.success("Supplier added successfully");
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setUploadedImage(base64String);
        setNewProduct(prev => ({ ...prev, image: base64String }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddProduct = () => {
    if (!newProduct.name.trim()) {
      toast.error("Product name is required");
      return;
    }

    if (!newProduct.category) {
      toast.error("Please select a category");
      return;
    }

    setProductNames(prev => [...prev, newProduct.name.trim()]);
    setIsAddProductOpen(false);
    setNewProduct({ name: "", category: "", description: "", image: "" });
    setUploadedImage(null);
    toast.success("Product added successfully");
  };

  const handleEditProduct = (name: string) => {
    setSelectedProduct(name);
    // Set the initial values for editing
    setNewProduct({
      name: name,
      category: name.includes('T-shirt') ? 'Apparel' :
               name.includes('Paper') ? 'Paper Products' :
               name.includes('Mug') ? 'Mugs & Drinkware' :
               name.includes('Sticker') ? 'Stickers & Decals' :
               name.includes('Photo') ? 'Photo Products' :
               'Custom Items',
      description: "",
      image: ""
    });
    setIsEditProductOpen(true);
  };

  const handleUpdateProduct = () => {
    if (!selectedProduct || !newProduct.name.trim()) {
      toast.error("Product name is required");
      return;
    }

    // Update the product name in the list
    setProductNames(prev => 
      prev.map(p => p === selectedProduct ? newProduct.name.trim() : p)
    );

    // Close the dialog and reset states
    setIsEditProductOpen(false);
    setSelectedProduct(null);
    setNewProduct({ name: "", category: "", description: "", image: "" });
    setUploadedImage(null);
    toast.success("Product updated successfully");
  };

  const handleViewProduct = (name: string) => {
    setSelectedProduct(name);
    setIsViewProductOpen(true);
  };

  const getProductImage = (name: string, imageUrl?: string) => {
    if (imageUrl) {
      return imageUrl;
    }
    // Try to get image from the product name
    const imagePath = `/products/${name.toLowerCase().replace(/\s+/g, '-')}.jpg`;
    return imagePath;
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.target as HTMLImageElement;
    target.src = '/placeholder-product.jpg';
    target.onerror = null; // Prevent infinite loop
  };

  const handleAddCategory = () => {
    if (!newCategory.trim()) {
      toast.error("Category name is required");
      return;
    }

    if (categories.includes(newCategory.trim())) {
      toast.error("Category already exists");
      return;
    }

    setCategories(prev => [...prev, newCategory.trim()]);
    setNewCategory("");
    setIsAddCategoryOpen(false);
    toast.success("Category added successfully");
  };

  const handleDeleteCategory = (category: string) => {
    // Check if category is in use
    const isInUse = productNames.some(name => {
      const productCategory = name.includes('T-shirt') ? 'Apparel' :
        name.includes('Paper') ? 'Paper Products' :
        name.includes('Mug') ? 'Mugs & Drinkware' :
        name.includes('Sticker') ? 'Stickers & Decals' :
        name.includes('Photo') ? 'Photo Products' :
        'Custom Items';
      return productCategory === category;
    });

    if (isInUse) {
      toast.error("Cannot delete category that is in use");
      return;
    }

    setCategories(prev => prev.filter(c => c !== category));
    toast.success("Category deleted successfully");
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setUploadedLogo(base64String);
        setShopSettings(prev => ({ ...prev, logo: base64String }));
        setSettingsChanged(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.name.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
                         user.email?.toLowerCase().includes(userSearchQuery.toLowerCase());
    const matchesRole = userRoleFilter === "all" || user.role === userRoleFilter;
    const matchesStatus = userStatusFilter === "all" || 
                         (userStatusFilter === "active" && user.active) ||
                         (userStatusFilter === "inactive" && !user.active);
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleSettingsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('social.')) {
      const platform = name.split('.')[1];
      setShopSettings(prev => ({
        ...prev,
        socialMedia: {
          ...prev.socialMedia,
          [platform]: value
        }
      }));
    } else {
      setShopSettings(prev => ({ ...prev, [name]: value }));
    }
    setSettingsChanged(true);
  };

  const handleSaveSettings = () => {
    // Save to localStorage
    localStorage.setItem('shopSettings', JSON.stringify(shopSettings));
    
    // Update document title
    document.title = `${shopSettings.shopName} - Admin Panel`;
    
    toast.success("Shop settings updated successfully");
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

  const handleViewActivity = (user: User) => {
    setSelectedUserForActivity(user);
    setShowActivityLog(true);
  };

  const handleManagePermissions = (user: User) => {
    setSelectedUserForPermissions(user);
    setShowPermissionsDialog(true);
  };

  const handleUpdatePermissions = () => {
    if (!selectedUserForPermissions) return;
    
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.id === selectedUserForPermissions.id ? selectedUserForPermissions : user
      )
    );
    
    toast.success(`Permissions for ${selectedUserForPermissions.name} updated`);
    setShowPermissionsDialog(false);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Admin Panel</h1>
            <p className="text-muted-foreground">
              Manage your shop's settings, users, and more
            </p>
          </div>
        </div>

        <Tabs defaultValue="users" className="space-y-4">
          <TabsList>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
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
                <div className="space-y-4">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search users..."
                          value={userSearchQuery}
                          onChange={(e) => setUserSearchQuery(e.target.value)}
                          className="pl-8"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <select
                        value={userRoleFilter}
                        onChange={(e) => setUserRoleFilter(e.target.value)}
                        className="rounded-md border border-input bg-background px-3 py-2"
                      >
                        <option value="all">All Roles</option>
                        <option value="admin">Admin</option>
                        <option value="manager">Manager</option>
                        <option value="designer">Designer</option>
                        <option value="user">User</option>
                      </select>
                      <select
                        value={userStatusFilter}
                        onChange={(e) => setUserStatusFilter(e.target.value)}
                        className="rounded-md border border-input bg-background px-3 py-2"
                      >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                  </div>

                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Username</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Join Date</TableHead>
                        <TableHead>Last Active</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.name}</TableCell>
                          <TableCell>{user.username}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell className="capitalize">{user.role}</TableCell>
                          <TableCell>{user.joinDate}</TableCell>
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
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewActivity(user)}
                              >
                                <Clock className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleManagePermissions(user)}
                              >
                                <Shield className="h-4 w-4" />
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
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="suppliers" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Suppliers</h2>
              <Dialog open={isAddSupplierOpen} onOpenChange={setIsAddSupplierOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Add Supplier
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Supplier</DialogTitle>
                    <DialogDescription>
                      Enter the supplier's details below
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Name *</Label>
                      <Input
                        id="name"
                        value={newSupplier.name || ""}
                        onChange={(e) => setNewSupplier(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter supplier name"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="contactPerson">Contact Person</Label>
                      <Input
                        id="contactPerson"
                        value={newSupplier.contactPerson || ""}
                        onChange={(e) => setNewSupplier(prev => ({ ...prev, contactPerson: e.target.value }))}
                        placeholder="Enter contact person name"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={newSupplier.email || ""}
                        onChange={(e) => setNewSupplier(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="Enter email address"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="phone">Phone *</Label>
                      <Input
                        id="phone"
                        value={newSupplier.phone || ""}
                        onChange={(e) => setNewSupplier(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="Enter phone number"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="address">Address</Label>
                      <Textarea
                        id="address"
                        value={newSupplier.address || ""}
                        onChange={(e) => setNewSupplier(prev => ({ ...prev, address: e.target.value }))}
                        placeholder="Enter address"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="gstin">GSTIN</Label>
                      <Input
                        id="gstin"
                        value={newSupplier.gstin || ""}
                        onChange={(e) => setNewSupplier(prev => ({ ...prev, gstin: e.target.value }))}
                        placeholder="Enter GSTIN"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="category">Category</Label>
                      <Input
                        id="category"
                        value={newSupplier.category || ""}
                        onChange={(e) => setNewSupplier(prev => ({ ...prev, category: e.target.value }))}
                        placeholder="Enter category"
                      />
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
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Suppliers</CardTitle>
                <CardDescription>Manage your suppliers and vendors</CardDescription>
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
                        <TableCell>{supplier.lastOrderDate || "-"}</TableCell>
                        <TableCell>
                          <span className={`status-badge ${supplier.status === "active" ? "status-ready" : "status-dispatched"}`}>
                            {supplier.status === "active" ? "Active" : "Inactive"}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleSupplierEdit(supplier)}
                            >
                              <Pen className="h-4 w-4" />
                              </Button>
                            <Button
                              variant={supplier.status === "active" ? "outline" : "default"}
                              size="sm"
                              onClick={() => handleToggleSupplierStatus(supplier.id)}
                            >
                                {supplier.status === "active" ? "Deactivate" : "Activate"}
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
          
          
          <TabsContent value="products" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Products</h2>
              <div className="flex gap-2">
                <Dialog open={isAddCategoryOpen} onOpenChange={setIsAddCategoryOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Category
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Category</DialogTitle>
                      <DialogDescription>
                        Enter the category name below
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="category">Category Name</Label>
                        <Input
                          id="category"
                          value={newCategory}
                          onChange={(e) => setNewCategory(e.target.value)}
                          placeholder="Enter category name"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsAddCategoryOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleAddCategory}>Add Category</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Dialog open={isAddProductOpen} onOpenChange={setIsAddProductOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Package className="mr-2 h-4 w-4" />
                      Add Product
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Product</DialogTitle>
                      <DialogDescription>
                        Enter the product details below
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="productName">Product Name *</Label>
                        <Input
                          id="productName"
                          value={newProduct.name}
                          onChange={(e) => setNewProduct(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Enter product name"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="productCategory">Category *</Label>
                        <select
                          id="productCategory"
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          value={newProduct.category}
                          onChange={(e) => setNewProduct(prev => ({ ...prev, category: e.target.value }))}
                        >
                          <option value="">Select a category</option>
                          {categories.map((category) => (
                            <option key={category} value={category}>
                              {category}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="productDescription">Description</Label>
                        <Textarea
                          id="productDescription"
                          value={newProduct.description}
                          onChange={(e) => setNewProduct(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Enter product description"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="productImage">Product Image</Label>
                        <Input
                          id="productImage"
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                        />
                        {uploadedImage && (
                          <div className="mt-2">
                            <img
                              src={uploadedImage}
                              alt="Product preview"
                              className="h-32 w-32 object-cover rounded-md"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsAddProductOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleAddProduct}>Add Product</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Add Categories Card */}
            <Card>
              <CardHeader>
                <CardTitle>Categories</CardTitle>
                <CardDescription>Manage your product categories</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categories.map((category) => (
                    <div
                      key={category}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <span className="font-medium">{category}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteCategory(category)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        Delete
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Products</CardTitle>
                <CardDescription>Manage your product catalog</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Image</TableHead>
                      <TableHead>Product Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {productNames.map((name) => (
                      <TableRow key={name}>
                        <TableCell>
                          <div className="w-16 h-16 rounded-md overflow-hidden bg-muted">
                            <img 
                              src={getProductImage(name)}
                              alt={name}
                              className="w-full h-full object-cover"
                              onError={handleImageError}
                            />
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{name}</TableCell>
                        <TableCell>
                          {name.includes('T-shirt') ? 'Apparel' :
                           name.includes('Paper') ? 'Paper Products' :
                           name.includes('Mug') ? 'Mugs & Drinkware' :
                           name.includes('Sticker') ? 'Stickers & Decals' :
                           name.includes('Photo') ? 'Photo Products' :
                           'Custom Items'}
                        </TableCell>
                        <TableCell>
                          <span className="status-badge status-ready">Active</span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditProduct(name)}
                            >
                              <Pen className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewProduct(name)}
                            >
                              <Package className="h-4 w-4" />
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
                    <label className="text-sm font-medium">Shop Logo</label>
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <Input
                          value={shopSettings.logo}
                          onChange={(e) => {
                            setShopSettings(prev => ({ ...prev, logo: e.target.value }));
                            setSettingsChanged(true);
                          }}
                          placeholder="Enter logo URL"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="file"
                          ref={logoInputRef}
                          onChange={handleLogoUpload}
                          accept="image/*"
                          className="hidden"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => logoInputRef.current?.click()}
                        >
                          Upload Logo
                        </Button>
                      </div>
                    </div>
                    {(uploadedLogo || shopSettings.logo) && (
                      <div className="mt-2">
                        <div className="w-32 h-32 rounded-md overflow-hidden bg-muted">
                          <img
                            src={uploadedLogo || shopSettings.logo}
                            alt="Shop logo"
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = '/placeholder-logo.png';
                              target.onerror = null;
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="businessType">Business Type</label>
                    <Input 
                      id="businessType"
                      name="businessType"
                      value={shopSettings.businessType}
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
                    <label className="text-sm font-medium" htmlFor="gstin">GSTIN</label>
                    <Input 
                      id="gstin"
                      name="gstin"
                      value={shopSettings.gstin}
                      onChange={handleSettingsChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="address">Address</label>
                    <Textarea 
                      id="address"
                      name="address"
                      value={shopSettings.address}
                      onChange={handleSettingsChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="description">Description</label>
                    <Textarea 
                      id="description"
                      name="description"
                      value={shopSettings.description}
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
                    <label className="text-sm font-medium" htmlFor="website">Website</label>
                    <Input 
                      id="website"
                      name="website"
                      value={shopSettings.website}
                      onChange={handleSettingsChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="openingHours">Opening Hours</label>
                    <Input 
                      id="openingHours"
                      name="openingHours"
                      value={shopSettings.openingHours}
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
                
                <div className="space-y-4 mt-4">
                  <h3 className="text-sm font-medium">Social Media Links</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium" htmlFor="social.facebook">Facebook</label>
                      <Input 
                        id="social.facebook"
                        name="social.facebook"
                        value={shopSettings.socialMedia.facebook}
                        onChange={handleSettingsChange}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium" htmlFor="social.instagram">Instagram</label>
                      <Input 
                        id="social.instagram"
                        name="social.instagram"
                        value={shopSettings.socialMedia.instagram}
                        onChange={handleSettingsChange}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium" htmlFor="social.twitter">Twitter</label>
                      <Input 
                        id="social.twitter"
                        name="social.twitter"
                        value={shopSettings.socialMedia.twitter}
                        onChange={handleSettingsChange}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end mt-6">
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
              <label className="text-sm font-medium">Full Name *</label>
              <Input
                value={newUser.name || ""}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                placeholder="Enter full name"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Username *</label>
              <Input
                value={newUser.username || ""}
                onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                placeholder="Enter username"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Password *</label>
              <Input
                value={newUser.password || ""}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                placeholder="Enter password"
                type="password"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input
                value={newUser.email || ""}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                placeholder="Enter email address (optional)"
                type="email"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Role *</label>
              <select
                value={newUser.role || "user"}
                onChange={(e) => {
                  const role = e.target.value as User["role"];
                  setNewUser({ 
                    ...newUser, 
                    role,
                    permissions: getDefaultPermissions(role)
                  });
                }}
                className="w-full rounded-md border border-input bg-background px-3 py-2"
              >
                <option value="user">User</option>
                <option value="designer">Designer</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            
            <div className="space-y-4 pt-4">
              <h3 className="text-sm font-medium">Permissions</h3>
                <div className="space-y-2">
                {Object.entries(newUser.permissions || getDefaultPermissions(newUser.role as User["role"])).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <label className="text-sm">
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </label>
                    <Switch
                      checked={value}
                      onCheckedChange={(checked) => {
                        setNewUser({
                          ...newUser,
                          permissions: {
                            ...(newUser.permissions || getDefaultPermissions(newUser.role as User["role"])),
                            [key]: checked
                          }
                        });
                      }}
                  />
                </div>
                ))}
                </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddUserOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddUser}>Add User</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={userDialogOpen} onOpenChange={setUserDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information and permissions
            </DialogDescription>
          </DialogHeader>
          
          {selectedUser && (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
                <label className="text-sm font-medium">Full Name *</label>
              <Input
                  value={selectedUser.name}
                  onChange={(e) => setSelectedUser({ ...selectedUser, name: e.target.value })}
                  placeholder="Enter full name"
              />
            </div>
            
            <div className="space-y-2">
                <label className="text-sm font-medium">Username *</label>
              <Input
                  value={selectedUser.username}
                  onChange={(e) => setSelectedUser({ ...selectedUser, username: e.target.value })}
                  placeholder="Enter username"
              />
            </div>
            
            <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
              <Input
                  value={selectedUser.email}
                  onChange={(e) => setSelectedUser({ ...selectedUser, email: e.target.value })}
                placeholder="Enter email address"
                type="email"
              />
            </div>
            
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Change Password</label>
                  <Switch
                    checked={!!selectedUser.newPassword}
                    onCheckedChange={(checked) => {
                      setSelectedUser({
                        ...selectedUser,
                        newPassword: checked ? "" : undefined
                      });
                    }}
              />
            </div>
                {selectedUser.newPassword !== undefined && (
              <Input
                    value={selectedUser.newPassword}
                    onChange={(e) => setSelectedUser({ ...selectedUser, newPassword: e.target.value })}
                    placeholder="Enter new password"
                    type="password"
                  />
                )}
            </div>
            
            <div className="space-y-2">
                <label className="text-sm font-medium">Role *</label>
              <select
                  value={selectedUser.role}
                  onChange={(e) => {
                    const role = e.target.value as User["role"];
                    setSelectedUser({ 
                      ...selectedUser, 
                      role,
                      permissions: getDefaultPermissions(role)
                    });
                  }}
                className="w-full rounded-md border border-input bg-background px-3 py-2"
              >
                  <option value="user">User</option>
                  <option value="designer">Designer</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
              </select>
            </div>
            
              <div className="space-y-4 pt-4">
                <h3 className="text-sm font-medium">Permissions</h3>
            <div className="space-y-2">
                  {Object.entries(selectedUser.permissions).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <label className="text-sm">
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </label>
                      <Switch
                        checked={value}
                        onCheckedChange={(checked) => {
                          setSelectedUser({
                            ...selectedUser,
                            permissions: {
                              ...selectedUser.permissions,
                              [key]: checked
                            }
                          });
                        }}
              />
            </div>
                  ))}
            </div>
                  </div>
                </div>
              )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setUserDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUserUpdate}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Activity Log Dialog */}
      <Dialog open={showActivityLog} onOpenChange={setShowActivityLog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>User Activity Log</DialogTitle>
            <DialogDescription>
              View activity history for {selectedUserForActivity?.name}
            </DialogDescription>
          </DialogHeader>
          
            <div className="space-y-4 py-4">
            {selectedUserForActivity?.activityLog.map((activity, index) => (
              <div key={index} className="flex items-start gap-4">
                <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                <div>
                  <p className="font-medium">{activity.action}</p>
                  <p className="text-sm text-muted-foreground">{activity.details}</p>
                  <p className="text-xs text-muted-foreground">{activity.date}</p>
                </div>
              </div>
            ))}
              </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowActivityLog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Permissions Dialog */}
      <Dialog open={showPermissionsDialog} onOpenChange={setShowPermissionsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage Permissions</DialogTitle>
            <DialogDescription>
              Update permissions for {selectedUserForPermissions?.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {selectedUserForPermissions && Object.entries(selectedUserForPermissions.permissions).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <label className="text-sm">
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </label>
                <Switch
                  checked={value}
                  onCheckedChange={(checked) => {
                    setSelectedUserForPermissions({
                      ...selectedUserForPermissions,
                      permissions: {
                        ...selectedUserForPermissions.permissions,
                        [key]: checked
                      }
                    });
                  }}
              />
            </div>
            ))}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPermissionsDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdatePermissions}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default Admin;
