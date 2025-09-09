import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
} from "@/components/ui/sidebar";
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
  LogOut,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

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
  socialMedia: {
    facebook: string;
    instagram: string;
    twitter: string;
  };
  logo: string;
}

const AppSidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [shopName, setShopName] = useState("CraftShop");
  const [shopLogo, setShopLogo] = useState<string>("");
  
  useEffect(() => {
    const savedSettings = localStorage.getItem('shopSettings');
    if (savedSettings) {
      const settings: ShopSettings = JSON.parse(savedSettings);
      setShopName(settings.shopName);
      setShopLogo(settings.logo);
    }
  }, []);
  
  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/login");
  };
  
  const menuItems = [
    {
      title: "Dashboard",
      path: "/",
      icon: <FileText className="h-5 w-5" />,
    },
    {
      title: "Orders",
      path: "/orders",
      icon: <Package className="h-5 w-5" />,
    },
    {
      title: "Design Team",
      path: "/design",
      icon: <Pen className="h-5 w-5" />,
    },
    {
      title: "Inventory",
      path: "/inventory",
      icon: <ClipboardList className="h-5 w-5" />,
    },
    {
      title: "Staff Attendance",
      path: "/attendance",
      icon: <ClipboardCheck className="h-5 w-5" />,
    },
    {
      title: "Invoices",
      path: "/invoices",
      icon: <FileDown className="h-5 w-5" />,
    },
    {
      title: "Shipping",
      path: "/shipping",
      icon: <Truck className="h-5 w-5" />,
    },
    {
      title: "Customers",
      path: "/customers",
      icon: <Users className="h-5 w-5" />,
    },
    {
      title: "Payments",
      path: "/payments",
      icon: <CreditCard className="h-5 w-5" />,
    },
    {
      title: "Expense Tracking",
      path: "/expenses",
      icon: <Wallet className="h-5 w-5" />,
    },
    {
      title: "Reports",
      path: "/reports",
      icon: <ChartBarIcon className="h-5 w-5" />,
    },
    {
      title: "Admin",
      path: "/admin",
      icon: <Settings className="h-5 w-5" />,
    },
  ];

  return (
    <Sidebar>
      <SidebarHeader className="py-6 px-2">
        <div className="flex items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2">
            {shopLogo ? (
              <img 
                src={shopLogo} 
                alt={shopName} 
                className="h-8 w-8 object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/placeholder-logo.png';
                  target.onerror = null;
                }}
              />
            ) : (
              <Package className="h-6 w-6 text-white" />
            )}
            <span className="text-xl font-bold text-white">{shopName}</span>
          </Link>
          <SidebarTrigger className="hidden md:flex h-8 w-8 items-center justify-center rounded-md border border-sidebar-border bg-sidebar-accent text-sidebar-accent-foreground">
            <Package className="h-4 w-4" />
          </SidebarTrigger>
        </div>
      </SidebarHeader>
      <SidebarContent className="py-2">
        <SidebarGroup>
          <SidebarGroupLabel>Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    asChild
                    data-active={location.pathname === item.path}
                  >
                    <Link to={item.path}>
                      {item.icon}
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <div className="mt-auto p-4">
        <SidebarMenuButton
          onClick={handleLogout}
          className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-900/20"
        >
          <LogOut className="h-5 w-5" />
          <span>Logout</span>
        </SidebarMenuButton>
      </div>
    </Sidebar>
  );
};

export default AppSidebar;
