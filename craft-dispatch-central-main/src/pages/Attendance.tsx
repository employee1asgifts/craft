import React, { useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import AttendanceTable, { Employee } from "@/components/attendance/AttendanceTable";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { addDays, format, subDays, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";
import { exportAttendanceToExcel } from "@/utils/invoiceUtils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const Attendance: React.FC = () => {
  const today = new Date();
  const [startDate, setStartDate] = useState<Date>(subDays(today, 2));
  const [selectedMonth, setSelectedMonth] = useState<Date>(today);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [attendanceNote, setAttendanceNote] = useState("");
  
  // Generate dates for the last 5 days
  const dates = Array.from({ length: 5 }, (_, i) => addDays(startDate, i));
  
  // Generate all dates in the selected month
  const monthDates = eachDayOfInterval({
    start: startOfMonth(selectedMonth),
    end: endOfMonth(selectedMonth)
  });

  const [employees, setEmployees] = useState<Employee[]>([
    {
      id: "EMP001",
      name: "John Doe",
      role: "Senior Designer",
      department: "Design",
      attendance: [
        { date: subDays(today, 2), status: "present", note: "On time" },
        { date: subDays(today, 1), status: "present", note: "Late by 15 minutes" },
        { date: today, status: "present", note: "" },
      ],
    },
    {
      id: "EMP002",
      name: "Jane Smith",
      role: "Junior Designer",
      department: "Design",
      attendance: [
        { date: subDays(today, 2), status: "present" },
        { date: subDays(today, 1), status: "absent" },
        { date: today, status: "present" },
      ],
    },
    {
      id: "EMP003",
      name: "Robert Johnson",
      role: "Production Manager",
      department: "Production",
      attendance: [
        { date: subDays(today, 2), status: "present" },
        { date: subDays(today, 1), status: "present" },
        { date: today, status: "leave" },
      ],
    },
    {
      id: "EMP004",
      name: "Emily Davis",
      role: "Shipping Coordinator",
      department: "Logistics",
      attendance: [
        { date: subDays(today, 2), status: "present" },
        { date: subDays(today, 1), status: "present" },
        { date: today, status: "present" },
      ],
    },
    {
      id: "EMP005",
      name: "Michael Wilson",
      role: "Customer Service",
      department: "Support",
      attendance: [
        { date: subDays(today, 2), status: "present" },
        { date: subDays(today, 1), status: "absent" },
        { date: today, status: "absent" },
      ],
    },
  ]);

  // Calculate attendance statistics
  const calculateStats = () => {
    const stats = {
      totalEmployees: employees.length,
      presentToday: employees.filter(emp => 
        emp.attendance.some(a => 
          format(new Date(a.date), 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd') && 
          a.status === 'present'
        )
      ).length,
      absentToday: employees.filter(emp => 
        emp.attendance.some(a => 
          format(new Date(a.date), 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd') && 
          a.status === 'absent'
        )
      ).length,
      onLeaveToday: employees.filter(emp => 
        emp.attendance.some(a => 
          format(new Date(a.date), 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd') && 
          a.status === 'leave'
        )
      ).length,
    };
    return stats;
  };

  // Calculate monthly attendance for an employee
  const calculateMonthlyAttendance = (employee: Employee) => {
    const monthlyAttendance = monthDates.map(date => {
      const attendance = employee.attendance.find(
        a => format(new Date(a.date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
      );
      return {
        date,
        status: attendance?.status || 'not set',
        note: attendance?.note || ''
      };
    });

    const stats = {
      totalDays: monthDates.length,
      present: monthlyAttendance.filter(a => a.status === 'present').length,
      absent: monthlyAttendance.filter(a => a.status === 'absent').length,
      leave: monthlyAttendance.filter(a => a.status === 'leave').length,
      notSet: monthlyAttendance.filter(a => a.status === 'not set').length
    };

    return { monthlyAttendance, stats };
  };

  const handleToggleAttendance = (
    employeeId: string,
    date: Date,
    status: "present" | "absent" | "leave" | null,
    note?: string
  ) => {
    setEmployees((prevEmployees) =>
      prevEmployees.map((employee) => {
        if (employee.id === employeeId) {
          const existingEntryIndex = employee.attendance.findIndex(
            (a) =>
              format(new Date(a.date), "yyyy-MM-dd") === format(date, "yyyy-MM-dd")
          );

          let updatedAttendance = [...employee.attendance];

          if (existingEntryIndex >= 0) {
            if (status === null) {
              updatedAttendance.splice(existingEntryIndex, 1);
            } else {
              updatedAttendance[existingEntryIndex] = {
                ...updatedAttendance[existingEntryIndex],
                status,
                note: note || ''
              };
            }
          } else if (status !== null) {
            updatedAttendance.push({ date, status, note: note || '' });
          }

          return {
            ...employee,
            attendance: updatedAttendance,
          };
        }
        return employee;
      })
    );

    if (status) {
      toast.success(`Attendance updated successfully`);
    }
  };

  const handleAddNote = (employee: Employee, date: Date) => {
    setSelectedEmployee(employee);
    const attendance = employee.attendance.find(
      a => format(new Date(a.date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    );
    setAttendanceNote(attendance?.note || '');
  };

  const handleSaveNote = () => {
    if (selectedEmployee) {
      const date = dates[0]; // Using the first date in the current view
      handleToggleAttendance(
        selectedEmployee.id,
        date,
        selectedEmployee.attendance.find(
          a => format(new Date(a.date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
        )?.status || 'present',
        attendanceNote
      );
      setSelectedEmployee(null);
      setAttendanceNote('');
    }
  };

  const handlePreviousDates = () => {
    setStartDate(subDays(startDate, 5));
  };

  const handleNextDates = () => {
    setStartDate(addDays(startDate, 5));
  };

  const isNextDisabled = dates.some(date => date > today);

  const handleExportReport = () => {
    try {
      exportAttendanceToExcel(employees);
      toast.success("Attendance report exported successfully");
    } catch (error) {
      toast.error("Failed to export attendance report");
      console.error("Export error:", error);
    }
  };

  const stats = calculateStats();

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Staff Attendance</h1>
          <p className="text-muted-foreground">Track and manage employee attendance</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalEmployees}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Present Today</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.presentToday}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Absent Today</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.absentToday}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">On Leave Today</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.onLeaveToday}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="daily">
          <TabsList>
            <TabsTrigger value="daily">Daily View</TabsTrigger>
            <TabsTrigger value="monthly">Monthly View</TabsTrigger>
          </TabsList>
          <TabsContent value="daily">
            <div className="flex justify-between items-center">
              <div className="text-lg font-medium">
                Date Range: {format(dates[0], "MMM dd, yyyy")} - {format(dates[dates.length - 1], "MMM dd, yyyy")}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handlePreviousDates}>
                  Previous
                </Button>
                <Button variant="outline" onClick={handleNextDates} disabled={isNextDisabled}>
                  Next
                </Button>
                <Button variant="outline" onClick={handleExportReport}>
                  Export Report
                </Button>
              </div>
            </div>

            <AttendanceTable
              employees={employees}
              dates={dates}
              onToggleAttendance={handleToggleAttendance}
              onAddNote={handleAddNote}
            />
          </TabsContent>
          <TabsContent value="monthly">
            <div className="flex justify-between items-center mb-4">
              <div className="text-lg font-medium">
                {format(selectedMonth, "MMMM yyyy")}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setSelectedMonth(subDays(selectedMonth, 30))}>
                  Previous Month
                </Button>
                <Button variant="outline" onClick={() => setSelectedMonth(addDays(selectedMonth, 30))}>
                  Next Month
                </Button>
              </div>
            </div>
            <div className="grid gap-4">
              {employees.map(employee => {
                const { monthlyAttendance, stats } = calculateMonthlyAttendance(employee);
                return (
                  <Card key={employee.id}>
                    <CardHeader>
                      <CardTitle>{employee.name}</CardTitle>
                      <div className="text-sm text-muted-foreground">
                        {employee.role} - {employee.department}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4">
                        <div className="grid grid-cols-4 gap-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">{stats.present}</div>
                            <div className="text-sm text-muted-foreground">Present</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-red-600">{stats.absent}</div>
                            <div className="text-sm text-muted-foreground">Absent</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-yellow-600">{stats.leave}</div>
                            <div className="text-sm text-muted-foreground">Leave</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-gray-600">{stats.notSet}</div>
                            <div className="text-sm text-muted-foreground">Not Set</div>
                          </div>
                        </div>
                        <div className="grid grid-cols-7 gap-2">
                          {monthlyAttendance.map((attendance, index) => (
                            <div
                              key={index}
                              className={`p-2 text-center rounded ${
                                attendance.status === 'present' ? 'bg-green-100' :
                                attendance.status === 'absent' ? 'bg-red-100' :
                                attendance.status === 'leave' ? 'bg-yellow-100' :
                                'bg-gray-100'
                              }`}
                            >
                              <div className="text-xs">{format(attendance.date, 'd')}</div>
                              <div className="text-xs text-muted-foreground">
                                {attendance.status === 'present' ? 'P' :
                                 attendance.status === 'absent' ? 'A' :
                                 attendance.status === 'leave' ? 'L' : '-'}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>

        <Dialog open={!!selectedEmployee} onOpenChange={() => setSelectedEmployee(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Note for {selectedEmployee?.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Textarea
                placeholder="Enter attendance note..."
                value={attendanceNote}
                onChange={(e) => setAttendanceNote(e.target.value)}
              />
              <div className="flex justify-end">
                <Button onClick={handleSaveNote}>Save Note</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
};

export default Attendance;
