import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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
import Payments from "./pages/Payments";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import { SupplierProvider } from "./contexts/SupplierContext";
import { InventoryProvider } from "./contexts/InventoryContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ErrorBoundary } from "react-error-boundary";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function ErrorFallback({ error }: { error: Error }) {
  return (
    <div role="alert" style={{ padding: '20px', color: 'red' }}>
      <h2>Something went wrong:</h2>
      <pre>{error.message}</pre>
      <pre>{error.stack}</pre>
    </div>
  );
}

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const App = () => (
  <ErrorBoundary FallbackComponent={ErrorFallback}>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <SupplierProvider>
            <InventoryProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route
                    path="/"
                    element={
                      <ProtectedRoute>
                        <Index />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/orders"
                    element={
                      <ProtectedRoute>
                        <Orders />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/inventory"
                    element={
                      <ProtectedRoute>
                        <Inventory />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/attendance"
                    element={
                      <ProtectedRoute>
                        <Attendance />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/invoices"
                    element={
                      <ProtectedRoute>
                        <Invoices />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/shipping"
                    element={
                      <ProtectedRoute>
                        <Shipping />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/design"
                    element={
                      <ProtectedRoute>
                        <Design />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/customers"
                    element={
                      <ProtectedRoute>
                        <Customers />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/payments"
                    element={
                      <ProtectedRoute>
                        <Payments />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/expenses"
                    element={
                      <ProtectedRoute>
                        <Expenses />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/reports"
                    element={
                      <ProtectedRoute>
                        <Reports />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute>
                        <Admin />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </InventoryProvider>
          </SupplierProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
