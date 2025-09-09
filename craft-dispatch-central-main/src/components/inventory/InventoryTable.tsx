import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Package } from "lucide-react";

export interface InventoryItem {
  id: string;
  name: string;
  buyingPrice: string;
  sellingPrice: string;
  stock: number;
  lastUpdated: string;
  supplierId: string;
  image?: string;
}

interface InventoryTableProps {
  items: InventoryItem[];
  onUpdateStock: (id: string, newStock: number) => void;
  onEditItem: (id: string) => void;
}

const InventoryTable: React.FC<InventoryTableProps> = ({ 
  items, 
  onUpdateStock, 
  onEditItem 
}) => {
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editValue, setEditValue] = React.useState<number>(0);

  const handleEdit = (item: InventoryItem) => {
    setEditingId(item.id);
    setEditValue(item.stock);
  };

  const handleSave = (id: string) => {
    onUpdateStock(id, editValue);
    setEditingId(null);
  };

  const getStockStatus = (stock: number) => {
    if (stock <= 5) return <span className="text-red-500 font-medium">Low</span>;
    if (stock <= 20) return <span className="text-amber-500 font-medium">Medium</span>;
    return <span className="text-green-600 font-medium">Good</span>;
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Image</TableHead>
            <TableHead>ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Buying Price</TableHead>
            <TableHead>Selling Price</TableHead>
            <TableHead>Stock</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Last Updated</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell>
                <div className="w-12 h-12 rounded-md overflow-hidden bg-muted">
                  {item.image ? (
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      <Package className="h-6 w-6" />
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>{item.id}</TableCell>
              <TableCell className="font-medium">{item.name}</TableCell>
              <TableCell>{item.buyingPrice}</TableCell>
              <TableCell>{item.sellingPrice}</TableCell>
              <TableCell>
                {editingId === item.id ? (
                  <Input
                    type="number"
                    value={editValue}
                    onChange={(e) => setEditValue(Number(e.target.value))}
                    className="w-20"
                    min={0}
                  />
                ) : (
                  item.stock
                )}
              </TableCell>
              <TableCell>{getStockStatus(item.stock)}</TableCell>
              <TableCell>{item.lastUpdated}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  {editingId === item.id ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSave(item.id)}
                    >
                      Save
                    </Button>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(item)}
                      >
                        Update Stock
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEditItem(item.id)}
                      >
                        Edit Details
                      </Button>
                    </>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default InventoryTable;
