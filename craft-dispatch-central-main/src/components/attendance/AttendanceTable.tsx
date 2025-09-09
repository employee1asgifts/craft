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
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import { Pencil } from "lucide-react";

export interface Employee {
  id: string;
  name: string;
  role: string;
  department: string;
  attendance: {
    date: Date;
    status: "present" | "absent" | "leave" | null;
    note?: string;
  }[];
}

interface AttendanceTableProps {
  employees: Employee[];
  dates: Date[];
  onToggleAttendance: (
    employeeId: string,
    date: Date,
    status: "present" | "absent" | "leave" | null,
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
  const getAttendanceStatus = (employee: Employee, date: Date) => {
    const attendance = employee.attendance.find(
      (a) => format(new Date(a.date), "yyyy-MM-dd") === format(date, "yyyy-MM-dd")
    );
    return attendance ? attendance.status : null;
  };

  const getAttendanceNote = (employee: Employee, date: Date) => {
    const attendance = employee.attendance.find(
      (a) => format(new Date(a.date), "yyyy-MM-dd") === format(date, "yyyy-MM-dd")
    );
    return attendance?.note || '';
  };

  const toggleStatus = (employee: Employee, date: Date) => {
    const currentStatus = getAttendanceStatus(employee, date);
    let nextStatus: "present" | "absent" | "leave" | null;

    switch (currentStatus) {
      case "present":
        nextStatus = "absent";
        break;
      case "absent":
        nextStatus = "leave";
        break;
      case "leave":
        nextStatus = null;
        break;
      default:
        nextStatus = "present";
    }

    onToggleAttendance(employee.id, date, nextStatus, getAttendanceNote(employee, date));
  };

  const getStatusDisplay = (status: "present" | "absent" | "leave" | null, note?: string) => {
    const statusDisplay = (() => {
      switch (status) {
        case "present":
          return (
            <div className="flex items-center">
              <Checkbox checked={true} className="bg-green-500 border-green-500" />
              <span className="ml-2 text-green-600">Present</span>
            </div>
          );
        case "absent":
          return (
            <div className="flex items-center">
              <Checkbox checked={false} className="border-red-500" />
              <span className="ml-2 text-red-600">Absent</span>
            </div>
          );
        case "leave":
          return (
            <div className="flex items-center">
              <Checkbox checked={true} className="bg-amber-500 border-amber-500" />
              <span className="ml-2 text-amber-600">Leave</span>
            </div>
          );
        default:
          return (
            <div className="flex items-center">
              <Checkbox checked={false} />
              <span className="ml-2 text-gray-500">Not Set</span>
            </div>
          );
      }
    })();

    return (
      <div className="space-y-1">
        {statusDisplay}
        {note && (
          <div className="text-xs text-gray-500 truncate max-w-[150px]">
            {note}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Employee</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Department</TableHead>
            {dates.map((date) => (
              <TableHead key={date.toString()}>
                {format(date, "MMM dd")}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {employees.map((employee) => (
            <TableRow key={employee.id}>
              <TableCell className="font-medium">{employee.name}</TableCell>
              <TableCell>{employee.role}</TableCell>
              <TableCell>{employee.department}</TableCell>
              {dates.map((date) => (
                <TableCell key={`${employee.id}-${date.toString()}`}>
                  <div className="flex items-start space-x-2">
                    <Button
                      variant="ghost"
                      onClick={() => toggleStatus(employee, date)}
                      className="flex-1 justify-start p-0 hover:bg-transparent"
                    >
                      {getStatusDisplay(
                        getAttendanceStatus(employee, date),
                        getAttendanceNote(employee, date)
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onAddNote(employee, date)}
                      className="h-8 w-8 p-0"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
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
