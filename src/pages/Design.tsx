import React, { useState, useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Textarea } from "@/components/ui/textarea";
import { Pen, CalendarIcon, BarChart2, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { format, parse, isWithinInterval, startOfDay, endOfDay } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type DateRange = {
  from: Date;
  to?: Date;
};

interface DesignTask {
  id: string;
  orderId: string;
  customer: string;
  items: string;
  date: string;
  status: "not_assigned" | "in_progress" | "partially_completed" | "completed";
  assignedTo: string | null;
  completionNotes: string;
  partialReason: string;
}

interface Designer {
  id: string;
  name: string;
}

const Design: React.FC = () => {
  const [designers] = useState<Designer[]>([
    { id: "d1", name: "Aditya Sharma" },
    { id: "d2", name: "Priya Patel" },
    { id: "d3", name: "Rajesh Kumar" },
    { id: "d4", name: "Ananya Singh" },
  ]);

  const [tasks, setTasks] = useState<DesignTask[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [selectedTask, setSelectedTask] = useState<DesignTask | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [updateFormData, setUpdateFormData] = useState({
    status: "",
    assignedTo: "",
    completionNotes: "",
    partialReason: "",
  });

  // Load orders and tasks from localStorage
  useEffect(() => {
    try {
      const savedOrders = localStorage.getItem('orders');
      const savedTasks = localStorage.getItem('designTasks');
      
      if (savedOrders) {
        const orders = JSON.parse(savedOrders);
        const designOrders = orders.filter((order: any) => order.status === "design");
        
        // Get existing tasks
        let existingTasks: DesignTask[] = [];
        if (savedTasks) {
          existingTasks = JSON.parse(savedTasks);
        }

        // Create or update tasks for each design order
        const updatedTasks = designOrders.map((order: any) => {
          const existingTask = existingTasks.find((t: DesignTask) => t.orderId === order.id);
          
          if (existingTask) {
            // Update existing task with order data
            return {
              ...existingTask,
              customer: order.customer,
              items: order.items,
              date: order.date,
            };
          } else {
            // Create new task
            return {
              id: `DSN-${order.id.split('-')[1]}`,
              orderId: order.id,
              customer: order.customer,
              items: order.items,
              date: order.date,
              status: "not_assigned",
              assignedTo: null,
              completionNotes: "",
              partialReason: "",
            };
          }
        });

        // Add any existing tasks that don't have matching orders (completed tasks)
        const unmatchedTasks = existingTasks.filter(
          (task: DesignTask) => !designOrders.some((order: any) => order.id === task.orderId)
        );

        setTasks([...updatedTasks, ...unmatchedTasks]);
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  }, []);

  // Save tasks to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('designTasks', JSON.stringify(tasks));
    } catch (error) {
      console.error('Error saving tasks:', error);
    }
  }, [tasks]);

  const handleAssignTask = (taskId: string, designerId: string) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId
          ? { ...task, assignedTo: designerId, status: "in_progress" }
          : task
      )
    );
    toast.success(`Task assigned to ${designers.find(d => d.id === designerId)?.name}`);
  };

  const handleUpdateStatusOpen = (task: DesignTask) => {
    setSelectedTask(task);
    setUpdateFormData({
      status: task.status,
      assignedTo: task.assignedTo || "",
      completionNotes: task.completionNotes,
      partialReason: task.partialReason,
    });
    setDialogOpen(true);
  };

  const handleUpdateStatus = () => {
    if (!selectedTask) return;

    const updatedTasks = tasks.map(task => {
      if (task.id === selectedTask.id) {
        const updatedTask = {
          ...task,
          status: updateFormData.status as DesignTask["status"],
          assignedTo: updateFormData.assignedTo || null,
          completionNotes: updateFormData.completionNotes,
          partialReason: updateFormData.status === "partially_completed" ? updateFormData.partialReason : "",
        };

        // If task is completed, update the order status
        if (updateFormData.status === "completed") {
          try {
            const savedOrders = localStorage.getItem('orders');
            if (savedOrders) {
              const orders = JSON.parse(savedOrders);
              const updatedOrders = orders.map((order: any) => {
                if (order.id === task.orderId) {
                  return { ...order, status: "ready" };
                }
                return order;
              });
              localStorage.setItem('orders', JSON.stringify(updatedOrders));
              toast.success(`Order ${task.orderId} moved to shipping`);
            }
          } catch (error) {
            console.error('Error updating order status:', error);
            toast.error('Failed to update order status');
          }
        }

        return updatedTask;
      }
      return task;
    });

    setTasks(updatedTasks);
    setDialogOpen(false);
    toast.success(`Task ${selectedTask.id} status updated`);
  };

  const handlePresetSelect = (value: string) => {
    const today = new Date();
    switch (value) {
      case "all":
        setDateRange(undefined);
        break;
      case "today":
        setDateRange({
          from: startOfDay(today),
          to: endOfDay(today),
        });
        break;
      case "yesterday":
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        setDateRange({
          from: startOfDay(yesterday),
          to: endOfDay(yesterday),
        });
        break;
      case "last7days":
        const last7Days = new Date(today);
        last7Days.setDate(last7Days.getDate() - 6);
        setDateRange({
          from: startOfDay(last7Days),
          to: endOfDay(today),
        });
        break;
      case "last30days":
        const last30Days = new Date(today);
        last30Days.setDate(last30Days.getDate() - 29);
        setDateRange({
          from: startOfDay(last30Days),
          to: endOfDay(today),
        });
        break;
      case "thisMonth":
        const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        setDateRange({
          from: startOfDay(thisMonth),
          to: endOfDay(today),
        });
        break;
      case "lastMonth":
        const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
        setDateRange({
          from: startOfDay(lastMonth),
          to: endOfDay(lastMonthEnd),
        });
        break;
      case "custom":
        // Keep existing date range if any
        break;
    }
  };

  const filteredTasks = tasks.filter((task) => {
    // Filter by status
    if (filterStatus !== "all" && task.status !== filterStatus) {
      return false;
    }
    
    // Filter by search term
    if (
      searchTerm &&
      !task.id.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !task.customer.toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      return false;
    }

    // Filter by date range
    if (dateRange?.from || dateRange?.to) {
      const taskDate = parse(task.date, "MMM dd, yyyy", new Date());
      const startDate = dateRange.from ? startOfDay(dateRange.from) : undefined;
      const endDate = dateRange.to ? endOfDay(dateRange.to) : undefined;

      if (startDate && endDate) {
        if (!isWithinInterval(taskDate, { start: startDate, end: endDate })) {
          return false;
        }
      } else if (startDate && !isWithinInterval(taskDate, { start: startDate, end: startDate })) {
        return false;
      } else if (endDate && !isWithinInterval(taskDate, { start: endDate, end: endDate })) {
        return false;
      }
    }
    
    return true;
  });

  const getStatusBadge = (status: DesignTask["status"]) => {
    switch (status) {
      case "not_assigned":
        return <span className="status-badge status-new">Not Assigned</span>;
      case "in_progress":
        return <span className="status-badge status-design">In Progress</span>;
      case "partially_completed":
        return <span className="status-badge status-dispatched">Partially Completed</span>;
      case "completed":
        return <span className="status-badge status-delivered">Completed</span>;
    }
  };

  const getDesignerName = (designerId: string | null) => {
    if (!designerId) return "Not Assigned";
    const designer = designers.find((d) => d.id === designerId);
    return designer ? designer.name : "Unknown";
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Design Management</h1>
          <p className="text-muted-foreground">
            Manage design tasks and track designer performance
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 justify-between">
          <div className="flex flex-1 items-center space-x-2">
            <Input
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-[300px]"
            />
            <Select
              value={filterStatus}
              onValueChange={setFilterStatus}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="not_assigned">Not Assigned</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="partially_completed">Partially Completed</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={dateRange ? "custom" : "all"}
              onValueChange={handlePresetSelect}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Date range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="yesterday">Yesterday</SelectItem>
                <SelectItem value="last7days">Last 7 Days</SelectItem>
                <SelectItem value="last30days">Last 30 Days</SelectItem>
                <SelectItem value="thisMonth">This Month</SelectItem>
                <SelectItem value="lastMonth">Last Month</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-[300px] justify-start text-left font-normal",
                    !dateRange && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "LLL dd, y")} -{" "}
                        {format(dateRange.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(dateRange.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={(range) => {
                    setDateRange(range);
                    if (range) handlePresetSelect("custom");
                  }}
                  numberOfMonths={2}
                />
                {dateRange && (
                  <div className="p-3 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        setDateRange(undefined);
                        handlePresetSelect("all");
                      }}
                    >
                      Clear dates
                    </Button>
                  </div>
                )}
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Task ID</TableHead>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Designer</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell className="font-medium">{task.id}</TableCell>
                  <TableCell>{task.orderId}</TableCell>
                  <TableCell>{task.customer}</TableCell>
                  <TableCell>{task.items}</TableCell>
                  <TableCell>{getStatusBadge(task.status)}</TableCell>
                  <TableCell>{getDesignerName(task.assignedTo)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {task.status === "not_assigned" && (
                        <Select
                          onValueChange={(value) => handleAssignTask(task.id, value)}
                        >
                          <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="Assign to" />
                          </SelectTrigger>
                          <SelectContent>
                            {designers.map((designer) => (
                              <SelectItem key={designer.id} value={designer.id}>
                                {designer.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                      {task.status !== "not_assigned" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUpdateStatusOpen(task)}
                        >
                          <Pen className="mr-2 h-4 w-4" />
                          Update Status
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Update Task Status</DialogTitle>
              <DialogDescription>
                Update the status and details of the design task.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right text-sm">Status</label>
                <Select
                  value={updateFormData.status}
                  onValueChange={(value) => setUpdateFormData({...updateFormData, status: value})}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="partially_completed">Partially Completed</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right text-sm">Designer</label>
                <Select
                  value={updateFormData.assignedTo}
                  onValueChange={(value) => setUpdateFormData({...updateFormData, assignedTo: value})}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select designer" />
                  </SelectTrigger>
                  <SelectContent>
                    {designers.map((designer) => (
                      <SelectItem key={designer.id} value={designer.id}>
                        {designer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right text-sm">Completion Notes</label>
                <Textarea
                  className="col-span-3"
                  value={updateFormData.completionNotes}
                  onChange={(e) => setUpdateFormData({...updateFormData, completionNotes: e.target.value})}
                  placeholder="Notes about completion"
                />
              </div>
              {updateFormData.status === "partially_completed" && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <label className="text-right text-sm">Reason for Partial Completion</label>
                  <Textarea
                    className="col-span-3"
                    value={updateFormData.partialReason}
                    onChange={(e) => setUpdateFormData({...updateFormData, partialReason: e.target.value})}
                    placeholder="Why is it partially completed?"
                  />
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleUpdateStatus}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
};

export default Design;
