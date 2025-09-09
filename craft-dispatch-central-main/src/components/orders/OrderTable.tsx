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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FileDown, FileText, ArrowDown, Edit, Package } from "lucide-react";
import { parsePrice } from "@/utils/invoiceUtils";

export interface Order {
  id: string;
  customer: string;
  date: string;
  amount: string;
  status: "new" | "design" | "ready" | "dispatched" | "delivered" | "cancelled";
  items: string;
  paidAmount?: number;
  totalAmount?: number;
}

interface OrderTableProps {
  orders: Order[];
  onGenerateInvoice: (orderId: string) => void;
  onGenerateCourierSlip: (orderId: string) => void;
  onUpdateStatus: (orderId: string, status: Order["status"]) => void;
  onAssignToDesign: (orderId: string) => void;
  onEditOrder: (orderId: string) => void;
  onViewShipment?: (orderId: string) => void;
}

const OrderTable: React.FC<OrderTableProps> = ({
  orders,
  onGenerateInvoice,
  onGenerateCourierSlip,
  onUpdateStatus,
  onAssignToDesign,
  onEditOrder,
  onViewShipment,
}) => {
  const getStatusBadge = (status: Order["status"]) => {
    return (
      <span className={`status-badge status-${status}`}>
        {status === "new" && "New Order"}
        {status === "design" && "In Design"}
        {status === "ready" && "Ready to Ship"}
        {status === "dispatched" && "Dispatched"}
        {status === "delivered" && "Delivered"}
      </span>
    );
  };

  const getPaymentStatus = (order: Order) => {
    const total = order.totalAmount || parsePrice(order.amount);
    const paid = order.paidAmount || 0;
    
    if (paid === 0) return "unpaid";
    if (paid < total) return "partially-paid";
    return "paid";
  };

  const getNextStatus = (currentStatus: Order["status"]) => {
    switch (currentStatus) {
      case "new":
        return "design";
      case "design":
        return "ready";
      case "ready":
        return "dispatched";
      case "dispatched":
        return "delivered";
      default:
        return currentStatus;
    }
  };

  const getNextStatusText = (currentStatus: Order["status"]) => {
    switch (currentStatus) {
      case "new":
        return "Move to Design";
      case "design":
        return "Mark Ready";
      case "ready":
        return "Dispatch Order";
      case "dispatched":
        return "Mark Delivered";
      default:
        return "Completed";
    }
  };

  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "new":
        return "bg-blue-100 text-blue-800";
      case "design":
        return "bg-purple-100 text-purple-800";
      case "ready":
        return "bg-green-100 text-green-800";
      case "dispatched":
        return "bg-yellow-100 text-yellow-800";
      case "delivered":
        return "bg-gray-100 text-gray-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Order ID</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Items</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Payment</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id} className={getPaymentStatus(order)}>
              <TableCell className="font-medium">{order.id}</TableCell>
              <TableCell>{order.customer}</TableCell>
              <TableCell>{order.items}</TableCell>
              <TableCell>{order.date}</TableCell>
              <TableCell>{order.amount}</TableCell>
              <TableCell>{getStatusBadge(order.status)}</TableCell>
              <TableCell>
                <span className={`payment-badge payment-${getPaymentStatus(order)}`}>
                  {getPaymentStatus(order) === "unpaid" && "Unpaid"}
                  {getPaymentStatus(order) === "partially-paid" && "Partially Paid"}
                  {getPaymentStatus(order) === "paid" && "Paid"}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEditOrder(order.id)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="icon">
                        <FileDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onGenerateInvoice(order.id)}>
                        <FileText className="mr-2 h-4 w-4" />
                        <span>Generate Invoice</span>
                      </DropdownMenuItem>
                      {(order.status === "ready" || order.status === "dispatched" || order.status === "delivered") && (
                        <DropdownMenuItem onClick={() => onGenerateCourierSlip(order.id)}>
                          <FileDown className="mr-2 h-4 w-4" />
                          <span>Generate Courier Slip</span>
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  
                  {order.status === "new" ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onAssignToDesign(order.id)}
                    >
                      <ArrowDown className="mr-2 h-4 w-4 rotate-90" />
                      Assign to Design
                    </Button>
                  ) : order.status !== "delivered" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onUpdateStatus(order.id, getNextStatus(order.status))}
                    >
                      <ArrowDown className="mr-2 h-4 w-4 rotate-90" />
                      {getNextStatusText(order.status)}
                    </Button>
                  )}
                  
                  {(order.status === "ready" || order.status === "dispatched" || order.status === "delivered") && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewShipment && onViewShipment(order.id)}
                    >
                      <Package className="mr-2 h-4 w-4" />
                      View Shipment
                    </Button>
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

export default OrderTable;
