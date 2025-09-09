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
import { Check, ChevronsUpDown, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";

interface Customer {
  id: string;
  name: string;
  email?: string;
  phone: string;
  address: string;
  pincode: string;
}

interface CustomerSelectorProps {
  customers: Customer[];
  selectedCustomer: Customer | null;
  onSelectCustomer: (customer: Customer) => void;
  onAddNewClick: () => void;
}

const CustomerSelector = ({
  customers,
  selectedCustomer,
  onSelectCustomer,
  onAddNewClick,
}: CustomerSelectorProps) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex items-center space-x-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="flex-1 justify-between"
          >
            {selectedCustomer ? selectedCustomer.name : "Select customer..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0 w-[400px]">
          <Command>
            <CommandInput placeholder="Search customers..." />
            <CommandList>
              <CommandEmpty>No customer found.</CommandEmpty>
              <CommandGroup heading="Customers">
                {customers.map((customer) => (
                  <CommandItem
                    key={customer.id}
                    value={customer.name}
                    onSelect={() => {
                      onSelectCustomer(customer);
                      setOpen(false);
                    }}
                    className="cursor-pointer"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedCustomer?.id === customer.id
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                    <div className="flex flex-col">
                      <span>{customer.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {customer.phone} | {customer.email}
                      </span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <Button variant="outline" onClick={onAddNewClick}>
        <UserPlus className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default CustomerSelector;
