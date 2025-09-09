import React, { useState } from "react";
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
import { FileDown, FileText, ArrowDown, Edit, Package, CheckCircle } from "lucide-react";
import { parsePrice } from "@/utils/invoiceUtils";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface Order {
  id: string;
  customer: string;
  date: string;
  amount: string;
  status: "new" | "design" | "ready" | "dispatched" | "delivered" | "cancelled";
  items: string;
  paidAmount?: number;
  totalAmount?: number;
  paymentHistory?: Array<{
    date: string;
    amount: number;
    method: string;
    notes?: string;
  }>;
}

interface OrderTableProps {
  orders: Order[];
  onGenerateInvoice: (orderId: string) => void;
  onGenerateCourierSlip: (orderId: string) => void;
  onUpdateStatus: (orderId: string, newStatus: Order["status"]) => void;
  onAssignToDesign: (orderId: string) => void;
  onEditOrder: (orderId: string) => void;
  onMarkAsFullyPaid: (orderId: string) => void;
}

const OrderTable: React.FC<OrderTableProps> = ({
  orders,
  onGenerateInvoice,
  onGenerateCourierSlip,
  onUpdateStatus,
  onAssignToDesign,
  onEditOrder,
  onMarkAsFullyPaid,
}) => {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("UPI");
  const [orderToMarkPaid, setOrderToMarkPaid] = useState<Order | null>(null);

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

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "partially-paid":
        return "bg-yellow-100 text-yellow-800";
      case "unpaid":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleMarkAsFullyPaid = (order: Order) => {
    const total = order.totalAmount || parsePrice(order.amount);
    const paid = order.paidAmount || 0;
    
    if (paid >= total) {
      toast.error("Order is already fully paid");
      return;
    }

    setOrderToMarkPaid(order);
    setShowPaymentDialog(true);
  };

  const handleConfirmPayment = () => {
    if (!orderToMarkPaid) return;
    
    onMarkAsFullyPaid(orderToMarkPaid.id);
    setShowPaymentDialog(false);
    setOrderToMarkPaid(null);
    setSelectedPaymentMethod("UPI");
  };

  const getPaymentHistory = (order: Order) => {
    const paymentHistory = [];
    const totalAmount = order.totalAmount || parsePrice(order.amount);
    const paidAmount = order.paidAmount || 0;

    // Add initial payment if exists
    if (paidAmount > 0) {
      paymentHistory.push({
        number: 1,
        date: order.date,
        amount: paidAmount,
        method: 'Cash',
        notes: 'Initial payment'
      });
    }

    // Add remaining payment if order is fully paid
    if (paidAmount >= totalAmount && order.paymentHistory?.length > 0) {
      const lastPayment = order.paymentHistory[order.paymentHistory.length - 1];
      paymentHistory.push({
        number: 2,
        date: lastPayment.date,
        amount: lastPayment.amount,
        method: lastPayment.method || 'Cash',
        notes: lastPayment.notes || 'Final payment'
      });
    }

    return paymentHistory;
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Total Amount</TableHead>
              <TableHead>Paid Amount</TableHead>
              <TableHead>Balance</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id} className={getPaymentStatus(order)}>
                <TableCell 
                  className="font-medium cursor-pointer hover:text-blue-600"
                  onClick={() => setSelectedOrder(order)}
                >
                  {order.id}
                </TableCell>
                <TableCell>{order.customer}</TableCell>
                <TableCell>{order.items}</TableCell>
                <TableCell>{order.date}</TableCell>
                <TableCell>{order.amount}</TableCell>
                <TableCell>₹{order.paidAmount?.toLocaleString() || "0"}</TableCell>
                <TableCell>₹{((order.totalAmount || parsePrice(order.amount)) - (order.paidAmount || 0)).toLocaleString()}</TableCell>
                <TableCell>{getStatusBadge(order.status)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={getPaymentStatusColor(getPaymentStatus(order))}
                    >
                      {getPaymentStatus(order) === "unpaid" && "Unpaid"}
                      {getPaymentStatus(order) === "partially-paid" && "Partially Paid"}
                      {getPaymentStatus(order) === "paid" && "Paid"}
                    </Badge>
                    {getPaymentStatus(order) !== "paid" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-6 px-2 bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                        onClick={() => handleMarkAsFullyPaid(order)}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Mark Paid
                      </Button>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onGenerateInvoice(order.id)}>
                        <FileText className="mr-2 h-4 w-4" />
                        Generate Invoice
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onGenerateCourierSlip(order.id)}>
                        <FileDown className="mr-2 h-4 w-4" />
                        Generate Courier Slip
                      </DropdownMenuItem>
                      {order.status === "new" && (
                        <DropdownMenuItem onClick={() => onAssignToDesign(order.id)}>
                          <Package className="mr-2 h-4 w-4" />
                          Assign to Design
                        </DropdownMenuItem>
                      )}
                      {order.status !== "delivered" && order.status !== "cancelled" && (
                        <DropdownMenuItem onClick={() => onUpdateStatus(order.id, getNextStatus(order.status))}>
                          {getNextStatusText(order.status)}
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={() => onEditOrder(order.id)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Order
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Order Details - {selectedOrder?.id}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium mb-2">Customer Information</h3>
                <p className="text-sm text-muted-foreground">{selectedOrder?.customer}</p>
              </div>
              <div>
                <h3 className="font-medium mb-2">Order Status</h3>
                <Badge className={getStatusColor(selectedOrder?.status || "new")}>
                  {selectedOrder?.status.charAt(0).toUpperCase() + selectedOrder?.status.slice(1)}
                </Badge>
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-2">Items</h3>
              <p className="text-sm text-muted-foreground">{selectedOrder?.items}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium mb-2">Order Date</h3>
                <p className="text-sm text-muted-foreground">{selectedOrder?.date}</p>
              </div>
              <div>
                <h3 className="font-medium mb-2">Total Amount</h3>
                <p className="text-sm text-muted-foreground">{selectedOrder?.amount}</p>
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-2">Payment Details</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Amount:</span>
                  <span>₹{selectedOrder?.totalAmount?.toLocaleString() || parsePrice(selectedOrder?.amount || "0")}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Paid Amount:</span>
                  <span>₹{selectedOrder?.paidAmount?.toLocaleString() || "0"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Balance:</span>
                  <span>₹{(selectedOrder?.totalAmount || parsePrice(selectedOrder?.amount || "0")) - (selectedOrder?.paidAmount || 0)}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-2">Payment History</h3>
              <div className="space-y-2">
                {selectedOrder && getPaymentHistory(selectedOrder).map((payment) => (
                  <div key={payment.number} className="flex justify-between items-center text-sm p-2 bg-muted rounded-md">
                    <div>
                      <span className="font-medium">Payment {payment.number}</span>
                      <p className="text-muted-foreground">{payment.date}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-medium">₹{payment.amount.toLocaleString()}</span>
                      <p className="text-muted-foreground">{payment.method}</p>
                      {payment.notes && (
                        <p className="text-xs text-muted-foreground">{payment.notes}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Select Payment Method</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Payment Method</label>
                <Select
                  value={selectedPaymentMethod}
                  onValueChange={setSelectedPaymentMethod}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UPI">UPI</SelectItem>
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {orderToMarkPaid && (
                <div className="text-sm text-muted-foreground">
                  <p>Order ID: {orderToMarkPaid.id}</p>
                  <p>Amount to Pay: ₹{((orderToMarkPaid.totalAmount || parsePrice(orderToMarkPaid.amount)) - (orderToMarkPaid.paidAmount || 0)).toLocaleString()}</p>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPaymentDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmPayment}>
              Confirm Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default OrderTable;
