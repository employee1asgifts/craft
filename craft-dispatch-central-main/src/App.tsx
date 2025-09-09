
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Orders from "./pages/Orders";
import Inventory from "./pages/Inventory";
import Attendance from "./pages/Attendance";
import Invoices from "./pages/Invoices";
import Shipping from "./pages/Shipping";
import Design from "./pages/Design";
import Admin from "./pages/Admin";
import Customers from "./pages/Customers";
import Reports from "./pages/Reports";
import Expenses from "./pages/Expenses";
import NotFound from "./pages/NotFound";
import { SupplierProvider } from "./contexts/SupplierContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <SupplierProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/invoices" element={<Invoices />} />
            <Route path="/shipping" element={<Shipping />} />
            <Route path="/design" element={<Design />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </SupplierProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
