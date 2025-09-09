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
import { Pen } from "lucide-react";

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

  const filteredTasks = tasks.filter((task) => {
    if (filterStatus !== "all" && task.status !== filterStatus) {
      return false;
    }
    
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        task.id.toLowerCase().includes(searchLower) ||
        task.orderId.toLowerCase().includes(searchLower) ||
        task.customer.toLowerCase().includes(searchLower)
      );
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
          <h1 className="text-3xl font-bold tracking-tight">Design Team</h1>
          <p className="text-muted-foreground">
            Manage design tasks and assignments
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
