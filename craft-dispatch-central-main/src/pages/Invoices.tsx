import React, { useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
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
import { FileDown, FileText, Plus } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { generateAndDownloadInvoice, generateInvoiceNumber, exportOrdersToExcel } from "@/utils/invoiceUtils";
import { defaultTemplate, templates } from "@/utils/invoiceTemplates";

interface Invoice {
  id: string;
  orderId: string;
  customer: string;
  date: string;
  amount: string;
  status: "paid" | "pending" | "overdue";
  template?: string;
}

const Invoices: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([
    {
      id: "INV-7851",
      orderId: "ORD-7851",
      customer: "Jane Cooper",
      date: "May 03, 2025",
      amount: "₹15,000",
      status: "pending",
      template: "a4professional"
    },
    {
      id: "INV-7852",
      orderId: "ORD-7852",
      customer: "Alex Smith",
      date: "May 02, 2025",
      amount: "₹20,000",
      status: "pending",
      template: "a4professional"
    },
    {
      id: "INV-7844",
      orderId: "ORD-7844",
      customer: "Michael Johnson",
      date: "May 02, 2025",
      amount: "₹11,000",
      status: "paid",
      template: "a4professional"
    },
    {
      id: "INV-7841",
      orderId: "ORD-7841",
      customer: "Sarah Williams",
      date: "May 01, 2025",
      amount: "₹25,000",
      status: "paid",
      template: "a4professional"
    },
    {
      id: "INV-7839",
      orderId: "ORD-7839",
      customer: "Robert Brown",
      date: "Apr 30, 2025",
      amount: "₹12,000",
      status: "paid",
      template: "a4professional"
    },
    {
      id: "INV-7838",
      orderId: "ORD-7838",
      customer: "Emily Davis",
      date: "Apr 30, 2025",
      amount: "₹18,500",
      status: "overdue",
      template: "a4professional"
    },
  ]);

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isCreateInvoiceOpen, setIsCreateInvoiceOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedInvoiceTemplate, setSelectedInvoiceTemplate] = useState(defaultTemplate);

  const formSchema = z.object({
    orderId: z.string().min(1, "Order ID is required"),
    customer: z.string().min(1, "Customer is required"),
    date: z.string().min(1, "Date is required"),
    amount: z.string().min(1, "Amount is required"),
    status: z.enum(["pending", "paid", "overdue"]),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      orderId: "",
      customer: "",
      date: new Date().toISOString().split('T')[0],
      amount: "",
      status: "pending",
    },
  });

  const handleGenerateInvoice = (invoiceId: string) => {
    const invoice = invoices.find(inv => inv.id === invoiceId);
    if (!invoice) return;
    
    // Get the admin-selected template from localStorage
    const savedSettings = localStorage.getItem('invoiceSettings');
    const settings = savedSettings ? JSON.parse(savedSettings) : null;
    const template = settings?.template || defaultTemplate;
    
    generateAndDownloadInvoice({
      id: invoice.id,
      orderId: invoice.orderId,
      customer: invoice.customer,
      date: invoice.date,
      amount: invoice.amount,
      items: "Sample Product (x2), Another Product (x1)",
    }, template, settings);
    
    toast.success(`Invoice ${invoiceId} downloaded`);
  };

  const handleUpdateStatus = (invoiceId: string, status: Invoice["status"]) => {
    setInvoices((prevInvoices) =>
      prevInvoices.map((invoice) =>
        invoice.id === invoiceId ? { ...invoice, status } : invoice
      )
    );
    toast.success(`Invoice ${invoiceId} marked as ${status}`);
  };

  const handleExportAll = () => {
    exportOrdersToExcel(invoices);
    toast.success("All invoices exported successfully");
  };

  const handleCreateInvoice = (values: z.infer<typeof formSchema>) => {
    // Get the admin-selected template from localStorage
    const savedSettings = localStorage.getItem('invoiceSettings');
    const settings = savedSettings ? JSON.parse(savedSettings) : null;
    const template = settings?.template || defaultTemplate;

    const newInvoice: Invoice = {
      id: generateInvoiceNumber(),
      orderId: values.orderId,
      customer: values.customer,
      date: values.date,
      amount: `₹${values.amount}`,
      status: values.status,
      template: template,
    };

    setInvoices((prev) => [newInvoice, ...prev]);
    setIsCreateInvoiceOpen(false);
    form.reset();
    toast.success("New invoice created successfully");
  };

  const filteredInvoices = invoices.filter((invoice) => {
    // Filter by status
    if (filterStatus !== "all" && invoice.status !== filterStatus) {
      return false;
    }

    // Filter by search term
    if (
      searchTerm &&
      !invoice.id.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !invoice.orderId.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !invoice.customer.toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      return false;
    }

    return true;
  });

  const getStatusBadge = (status: Invoice["status"]) => {
    switch (status) {
      case "paid":
        return <span className="status-badge status-ready">Paid</span>;
      case "pending":
        return <span className="status-badge status-new">Pending</span>;
      case "overdue":
        return <span className="status-badge status-dispatched">Overdue</span>;
    }
  };
  
  const getTemplateLabel = (templateId?: string) => {
    if (!templateId) return "A4 Professional";
    const template = templates.find(t => t.id === templateId);
    return template?.name || "A4 Professional";
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
          <p className="text-muted-foreground">
            Manage and generate customer invoices
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 justify-between">
          <div className="flex flex-1 items-center space-x-2">
            <Input
              placeholder="Search invoices..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-[300px]"
            />
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExportAll}>
              <FileDown className="mr-2 h-4 w-4" />
              Export All
            </Button>
            
            <Dialog open={isCreateInvoiceOpen} onOpenChange={setIsCreateInvoiceOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Invoice
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Invoice</DialogTitle>
                  <DialogDescription>
                    Generate a new invoice for a customer order
                  </DialogDescription>
                </DialogHeader>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleCreateInvoice)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="orderId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Order ID</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter order ID" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="customer"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Customer Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter customer name" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Amount (₹)</FormLabel>
                          <FormControl>
                            <Input type="text" placeholder="Enter amount" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="paid">Paid</SelectItem>
                              <SelectItem value="overdue">Overdue</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <DialogFooter>
                      <Button type="submit">Create Invoice</Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice ID</TableHead>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Template</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{invoice.id}</TableCell>
                  <TableCell>{invoice.orderId}</TableCell>
                  <TableCell>{invoice.customer}</TableCell>
                  <TableCell>{invoice.date}</TableCell>
                  <TableCell>{invoice.amount}</TableCell>
                  <TableCell>{getTemplateLabel(invoice.template)}</TableCell>
                  <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleGenerateInvoice(invoice.id)}
                      >
                        <FileText className="h-4 w-4" />
                      </Button>
                      {invoice.status !== "paid" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUpdateStatus(invoice.id, "paid")}
                        >
                          Mark Paid
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </AppLayout>
  );
};

export default Invoices;
