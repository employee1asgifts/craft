import React, { createContext, useContext, useState, useEffect } from 'react';
import { InventoryItem } from '@/components/inventory/InventoryTable';

interface InventoryContextType {
  inventory: InventoryItem[];
  setInventory: React.Dispatch<React.SetStateAction<InventoryItem[]>>;
  loading: boolean;
  error: string | null;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (context === undefined) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
};

export const InventoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // TODO: Replace with actual API call
    const fetchInventory = async () => {
      try {
        // For now, using mock data
        const mockInventory: InventoryItem[] = [
          {
            id: "INV001",
            name: "T-shirt Blanks",
            buyingPrice: "₹350",
            sellingPrice: "₹550",
            stock: 45,
            lastUpdated: "May 01, 2025",
            supplierId: "SUP-001",
            gstRate: 18,
          },
          {
            id: "INV002",
            name: "Premium Business Card Paper",
            buyingPrice: "₹20",
            sellingPrice: "₹35",
            stock: 250,
            lastUpdated: "Apr 28, 2025",
            supplierId: "SUP-002",
            gstRate: 5,
          },
          // Add more mock items as needed
        ];

        setInventory(mockInventory);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch inventory');
        setLoading(false);
      }
    };

    fetchInventory();
  }, []);

  return (
    <InventoryContext.Provider value={{ inventory, setInventory, loading, error }}>
      {children}
    </InventoryContext.Provider>
  );
}; 