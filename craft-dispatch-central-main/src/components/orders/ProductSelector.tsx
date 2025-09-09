import { useState } from "react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { InventoryItem } from "@/components/inventory/InventoryTable";
import { parsePrice } from "@/utils/invoiceUtils";

interface ProductSelectorProps {
  products: InventoryItem[];
  selectedProduct: InventoryItem | null;
  onSelectProduct: (product: InventoryItem) => void;
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  maxQuantity: number;
  gst?: number;
  onGstChange?: (gst: number) => void;
}

const ProductSelector = ({
  products,
  selectedProduct,
  onSelectProduct,
  quantity,
  onQuantityChange,
  maxQuantity,
  gst,
  onGstChange,
}: ProductSelectorProps) => {
  const [open, setOpen] = useState(false);

  const handleSelectProduct = (product: InventoryItem) => {
    onSelectProduct(product);
    setOpen(false);
  };

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex items-center space-x-2">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="flex-1 justify-between"
            >
              {selectedProduct ? selectedProduct.name : "Select product..."}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-0 w-[400px]">
            <Command>
              <CommandInput placeholder="Search products..." />
              <CommandList>
                <CommandEmpty>No product found.</CommandEmpty>
                <CommandGroup heading="Products">
                  {products.map((product) => (
                    <CommandItem
                      key={product.id}
                      value={product.name}
                      onSelect={() => handleSelectProduct(product)}
                      disabled={product.stock <= 0}
                      className="cursor-pointer"
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedProduct?.id === product.id
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                      <div className="flex flex-col">
                        <span>{product.name}</span>
                        <span className="text-xs text-muted-foreground">
                          Price: {product.sellingPrice} | Stock: {product.stock}
                        </span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">Qty:</span>
          <input
            type="number"
            min="1"
            max={maxQuantity}
            value={quantity}
            onChange={(e) => onQuantityChange(parseInt(e.target.value) || 1)}
            className="w-16 h-10 px-2 border border-input rounded-md"
          />
        </div>

        {selectedProduct && (
          <>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">GST (%):</span>
              <input
                type="number"
                min="0"
                max="28"
                value={gst}
                onChange={(e) => onGstChange?.(parseFloat(e.target.value) || 0)}
                className="w-16 h-10 px-2 border border-input rounded-md"
              />
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">Price:</span>
              <span className="text-sm">
                ₹{(parsePrice(selectedProduct.sellingPrice) * quantity * (1 + gst/100)).toFixed(2)}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ProductSelector;
