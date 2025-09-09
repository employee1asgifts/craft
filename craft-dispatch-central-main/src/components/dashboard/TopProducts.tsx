import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const TopProducts: React.FC = () => {
  const topProducts = [
    {
      id: 1,
      name: "Custom T-Shirt",
      orders: 45,
      revenue: "₹22,500",
    },
    {
      id: 2,
      name: "Mug Print",
      orders: 32,
      revenue: "₹9,600",
    },
    {
      id: 3,
      name: "Photo Frame",
      orders: 28,
      revenue: "₹14,000",
    },
    {
      id: 4,
      name: "Keychain",
      orders: 25,
      revenue: "₹3,750",
    },
    {
      id: 5,
      name: "Sticker Pack",
      orders: 20,
      revenue: "₹2,000",
    },
  ];

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Product</TableHead>
          <TableHead className="text-right">Orders</TableHead>
          <TableHead className="text-right">Revenue</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {topProducts.map((product) => (
          <TableRow key={product.id}>
            <TableCell className="font-medium">{product.name}</TableCell>
            <TableCell className="text-right">{product.orders}</TableCell>
            <TableCell className="text-right">{product.revenue}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default TopProducts; 