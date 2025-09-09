import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2 } from "lucide-react";
import { InventoryItem } from "@/components/inventory/InventoryTable";

interface ProductSelectorProps {
  products: InventoryItem[];
  selectedProduct: InventoryItem | null;
  onSelectProduct: (product: InventoryItem | null) => void;
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  maxQuantity: number;
  gst: number;
  onGstChange: (gst: number) => void;
  onRemove: () => void;
}

const ProductSelector: React.FC<ProductSelectorProps> = ({
  products,
  selectedProduct,
  onSelectProduct,
  quantity,
  onQuantityChange,
  maxQuantity,
  gst,
  onGstChange,
  onRemove,
}) => {
  const handleProductChange = (productId: string) => {
    const product = products.find((item) => item.id === productId);
    if (product) {
      onSelectProduct(product);
      onGstChange(product.gstRate || 0);
    } else {
      onSelectProduct(null);
      onGstChange(0);
    }
  };

  const handleQuantityChange = (value: number) => {
    if (value < 1) return;
    if (value > maxQuantity) {
      value = maxQuantity;
    }
    onQuantityChange(value);
  };

  const calculateTotal = () => {
    if (!selectedProduct) return 0;
    const price = parseFloat(selectedProduct.sellingPrice.replace('₹', ''));
    const subtotal = price * quantity;
    const gstAmount = subtotal * (gst / 100);
    return subtotal + gstAmount;
  };

  return (
    <div className="p-2 border rounded-md">
      <div className="flex gap-2 items-center">
        <div className="flex-1">
          <select
            className="w-full p-1.5 text-sm border rounded-md"
            value={selectedProduct?.id || ""}
            onChange={(e) => handleProductChange(e.target.value)}
          >
            <option value="">Select a product</option>
            {products.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>

        <div className="w-24">
          <Input
            type="number"
            min="1"
            max={maxQuantity}
            value={quantity}
            onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
            className="h-8 text-sm"
          />
        </div>

        <div className="w-32 text-sm text-right">
          {selectedProduct ? (
            <div className="space-y-0.5">
              <div className="text-xs text-muted-foreground">Price: {selectedProduct.sellingPrice}</div>
              <div className="text-xs text-muted-foreground">GST: {gst}%</div>
              <div className="font-medium">Total: ₹{calculateTotal().toFixed(2)}</div>
            </div>
          ) : (
            <div className="text-xs text-muted-foreground">Select a product</div>
          )}
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={onRemove}
          className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default ProductSelector;
