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
import { format } from "date-fns";
import { Pencil, CheckCircle2, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export interface Employee {
  id: string;
  name: string;
  role: string;
  department: string;
  attendance: {
    date: Date;
    morning: "present" | "absent" | null;
    afternoon: "present" | "absent" | null;
    note?: string;
  }[];
}

interface AttendanceTableProps {
  employees: Employee[];
  dates: Date[];
  onToggleAttendance: (
    employeeId: string,
    date: Date,
    period: "morning" | "afternoon",
    status: "present" | "absent" | null,
    note?: string
  ) => void;
  onAddNote: (employee: Employee, date: Date) => void;
}

const AttendanceTable: React.FC<AttendanceTableProps> = ({
  employees,
  dates,
  onToggleAttendance,
  onAddNote,
}) => {
  const getAttendanceStatus = (employee: Employee, date: Date, period: "morning" | "afternoon") => {
    const attendance = employee.attendance.find(
      (a) => format(new Date(a.date), "yyyy-MM-dd") === format(date, "yyyy-MM-dd")
    );
    return attendance ? attendance[period] : null;
  };

  const getAttendanceNote = (employee: Employee, date: Date) => {
    const attendance = employee.attendance.find(
      (a) => format(new Date(a.date), "yyyy-MM-dd") === format(date, "yyyy-MM-dd")
    );
    return attendance?.note || '';
  };

  const toggleStatus = (employee: Employee, date: Date, period: "morning" | "afternoon") => {
    const currentStatus = getAttendanceStatus(employee, date, period);
    let nextStatus: "present" | "absent" | null;

    switch (currentStatus) {
      case "present":
        nextStatus = "absent";
        break;
      case "absent":
        nextStatus = null;
        break;
      default:
        nextStatus = "present";
    }

    onToggleAttendance(employee.id, date, period, nextStatus, getAttendanceNote(employee, date));
  };

  const getStatusDisplay = (status: "present" | "absent" | null, note?: string) => {
    const statusConfig = {
      present: {
        icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
        label: "Present",
        color: "bg-green-100 text-green-800",
      },
      absent: {
        icon: <XCircle className="h-4 w-4 text-red-500" />,
        label: "Absent",
        color: "bg-red-100 text-red-800",
      },
      null: {
        icon: null,
        label: "Not Set",
        color: "bg-gray-100 text-gray-800",
      },
    };

    const config = statusConfig[status || "null"];

    return (
      <div className="space-y-1">
        <Badge variant="outline" className={`${config.color} border-0`}>
          <div className="flex items-center gap-1">
            {config.icon}
            <span>{config.label}</span>
          </div>
        </Badge>
        {note && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="text-xs text-gray-500 truncate max-w-[150px] cursor-help">
                  {note}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{note}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    );
  };

  return (
    <div className="rounded-lg border shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="font-semibold">Employee</TableHead>
            <TableHead className="font-semibold">Role</TableHead>
            <TableHead className="font-semibold">Department</TableHead>
            {dates.map((date) => (
              <TableHead key={date.toString()} className="font-semibold">
                <div className="text-center">{format(date, "MMM dd")}</div>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div className="text-xs text-muted-foreground">Morning</div>
                  <div className="text-xs text-muted-foreground">Afternoon</div>
                </div>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {employees.map((employee) => (
            <TableRow key={employee.id} className="hover:bg-muted/50">
              <TableCell className="font-medium">{employee.name}</TableCell>
              <TableCell className="text-muted-foreground">{employee.role}</TableCell>
              <TableCell className="text-muted-foreground">{employee.department}</TableCell>
              {dates.map((date) => (
                <TableCell key={`${employee.id}-${date.toString()}`}>
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="ghost"
                        onClick={() => toggleStatus(employee, date, "morning")}
                        className="flex-1 justify-start p-0 hover:bg-transparent"
                      >
                        {getStatusDisplay(
                          getAttendanceStatus(employee, date, "morning"),
                          getAttendanceNote(employee, date)
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => toggleStatus(employee, date, "afternoon")}
                        className="flex-1 justify-start p-0 hover:bg-transparent"
                      >
                        {getStatusDisplay(
                          getAttendanceStatus(employee, date, "afternoon"),
                          getAttendanceNote(employee, date)
                        )}
                      </Button>
                    </div>
                    <div className="flex justify-end">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onAddNote(employee, date)}
                        className="h-8 w-8 p-0 hover:bg-muted"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default AttendanceTable;
