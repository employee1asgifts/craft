
import React, { createContext, useState, useContext, ReactNode } from "react";

export interface Supplier {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
}

interface SupplierContextType {
  suppliers: Supplier[];
  addSupplier: (supplier: Omit<Supplier, "id">) => void;
  updateSupplier: (id: string, supplier: Partial<Supplier>) => void;
  getSupplierById: (id: string) => Supplier | undefined;
}

const SupplierContext = createContext<SupplierContextType>({
  suppliers: [],
  addSupplier: () => {},
  updateSupplier: () => {},
  getSupplierById: () => undefined,
});

export const useSuppliers = () => useContext(SupplierContext);

interface SupplierProviderProps {
  children: ReactNode;
}

export const SupplierProvider: React.FC<SupplierProviderProps> = ({ children }) => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([
    {
      id: "SUP-001",
      name: "Kumar Textiles",
      email: "kumar@example.com",
      phone: "+91 98765 43210",
      address: "123 Textile Lane, Mumbai, MH 400001",
    },
    {
      id: "SUP-002",
      name: "Sharma Paper Products",
      email: "sharma@example.com",
      phone: "+91 87654 32109",
      address: "456 Paper Mill Road, Delhi, DL 110001",
    },
    {
      id: "SUP-003",
      name: "Patel Electronics",
      email: "patel@example.com",
      phone: "+91 76543 21098",
      address: "789 Circuit Avenue, Bangalore, KA 560001",
    },
  ]);

  const addSupplier = (supplier: Omit<Supplier, "id">) => {
    const newSupplier = {
      ...supplier,
      id: `SUP-${String(suppliers.length + 1).padStart(3, '0')}`,
    };
    setSuppliers([...suppliers, newSupplier]);
  };

  const updateSupplier = (id: string, updatedData: Partial<Supplier>) => {
    setSuppliers(
      suppliers.map((supplier) =>
        supplier.id === id ? { ...supplier, ...updatedData } : supplier
      )
    );
  };

  const getSupplierById = (id: string) => {
    return suppliers.find((supplier) => supplier.id === id);
  };

  return (
    <SupplierContext.Provider
      value={{
        suppliers,
        addSupplier,
        updateSupplier,
        getSupplierById,
      }}
    >
      {children}
    </SupplierContext.Provider>
  );
};
