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
import { Package, Eye, EyeOff, Trash2, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";

export interface InventoryItem {
  id: string;
  name: string;
  buyingPrice: string;
  sellingPrice: string;
  stock: number;
  lastUpdated: string;
  supplierId: string;
  image?: string;
  gstRate?: number;
}

export interface InventoryTableProps {
  items: InventoryItem[];
  onEditItem: (id: string) => void;
  onDeleteItem: (id: string) => void;
  searchTerm?: string;
}

const InventoryTable: React.FC<InventoryTableProps> = ({ 
  items, 
  onEditItem,
  onDeleteItem,
  searchTerm = ""
}) => {
  const [showBuyingPrice, setShowBuyingPrice] = React.useState(false);
  const [selectedImage, setSelectedImage] = React.useState<string | null>(null);

  const getStockStatus = (stock: number) => {
    if (stock <= 5) return <span className="text-red-500 font-medium">Low</span>;
    if (stock <= 20) return <span className="text-amber-500 font-medium">Medium</span>;
    return <span className="text-green-600 font-medium">Good</span>;
  };

  const calculateGstInclusivePrice = (basePrice: string, gstRate: number) => {
    const price = parseFloat(basePrice.replace('₹', '')) || 0;
    const gstAmount = price * (gstRate / 100);
    return `₹${(price + gstAmount).toFixed(2)}`;
  };

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Image</TableHead>
            <TableHead>ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>
              <div className="flex items-center gap-2">
                Buying Price
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 hover:bg-transparent"
                  onClick={() => setShowBuyingPrice(!showBuyingPrice)}
                >
                  {showBuyingPrice ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </TableHead>
            <TableHead>Selling Price (Incl. GST)</TableHead>
            <TableHead>GST Rate</TableHead>
            <TableHead>Stock</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Last Updated</TableHead>
            <TableHead>Supplier</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredItems.map((item) => (
            <TableRow key={item.id}>
              <TableCell>
                <div 
                  className="w-16 h-16 rounded-md overflow-hidden bg-muted cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => setSelectedImage(item.image || `/products/${item.name.toLowerCase().replace(/\s+/g, '-')}.jpg`)}
                >
                  <img
                    src={item.image || `/products/${item.name.toLowerCase().replace(/\s+/g, '-')}.jpg`}
                    alt={item.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/placeholder-product.jpg';
                      target.onerror = null;
                    }}
                  />
                </div>
              </TableCell>
              <TableCell>{item.id}</TableCell>
              <TableCell className="font-medium">{item.name}</TableCell>
              <TableCell>
                {showBuyingPrice ? item.buyingPrice : '••••••'}
              </TableCell>
              <TableCell>
                {calculateGstInclusivePrice(item.sellingPrice, item.gstRate || 0)}
              </TableCell>
              <TableCell>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {item.gstRate || 0}%
                </span>
              </TableCell>
              <TableCell>{item.stock}</TableCell>
              <TableCell>{getStockStatus(item.stock)}</TableCell>
              <TableCell>{item.lastUpdated}</TableCell>
              <TableCell>{item.supplierId}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEditItem(item.id)}
                  >
                    Edit Details
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDeleteItem(item.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Image Preview Modal */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl p-0">
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2 z-10 bg-black/50 hover:bg-black/70 text-white"
              onClick={() => setSelectedImage(null)}
            >
              <X className="h-4 w-4" />
            </Button>
            {selectedImage && (
              <img
                src={selectedImage}
                alt="Product preview"
                className="w-full h-full object-contain max-h-[80vh]"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/placeholder-product.jpg';
                  target.onerror = null;
                }}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InventoryTable;
