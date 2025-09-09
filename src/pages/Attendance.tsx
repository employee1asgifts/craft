import React, { useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import AttendanceTable from "@/components/attendance/AttendanceTable";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { addDays, format, subDays, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";
import { exportAttendanceToExcel } from "@/utils/invoiceUtils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Users, CheckCircle2, XCircle } from "lucide-react";

interface Employee {
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
        { 
          date: subDays(today, 2), 
          morning: "present",
          afternoon: "present",
          note: "On time" 
        },
        { 
          date: subDays(today, 1), 
          morning: "present",
          afternoon: "present",
          note: "Late by 15 minutes" 
        },
        { 
          date: today, 
          morning: "present",
          afternoon: "present"
        },
      ],
    },
    {
      id: "EMP002",
      name: "Jane Smith",
      role: "Junior Designer",
      department: "Design",
      attendance: [
        { date: subDays(today, 2), morning: "present", afternoon: "present" },
        { date: subDays(today, 1), morning: "absent", afternoon: "absent" },
        { date: today, morning: "present", afternoon: "present" },
      ],
    },
    {
      id: "EMP003",
      name: "Robert Johnson",
      role: "Production Manager",
      department: "Production",
      attendance: [
        { date: subDays(today, 2), morning: "present", afternoon: "present" },
        { date: subDays(today, 1), morning: "present", afternoon: "present" },
        { date: today, morning: "absent", afternoon: "absent" },
      ],
    },
    {
      id: "EMP004",
      name: "Emily Davis",
      role: "Shipping Coordinator",
      department: "Logistics",
      attendance: [
        { date: subDays(today, 2), morning: "present", afternoon: "present" },
        { date: subDays(today, 1), morning: "present", afternoon: "present" },
        { date: today, morning: "present", afternoon: "present" },
      ],
    },
    {
      id: "EMP005",
      name: "Michael Wilson",
      role: "Customer Service",
      department: "Support",
      attendance: [
        { date: subDays(today, 2), morning: "present", afternoon: "present" },
        { date: subDays(today, 1), morning: "absent", afternoon: "absent" },
        { date: today, morning: "absent", afternoon: "absent" },
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
          (a.morning === 'present' || a.afternoon === 'present')
        )
      ).length,
      absentToday: employees.filter(emp => 
        emp.attendance.some(a => 
          format(new Date(a.date), 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd') && 
          a.morning === 'absent' && a.afternoon === 'absent'
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
        morning: attendance?.morning || null,
        afternoon: attendance?.afternoon || null,
        note: attendance?.note || ''
      };
    });

    const stats = {
      totalDays: monthDates.length,
      present: monthlyAttendance.filter(a => a.morning === 'present' || a.afternoon === 'present').length,
      absent: monthlyAttendance.filter(a => a.morning === 'absent' && a.afternoon === 'absent').length,
      notSet: monthlyAttendance.filter(a => !a.morning && !a.afternoon).length
    };

    return { monthlyAttendance, stats };
  };

  const handleToggleAttendance = (
    employeeId: string,
    date: Date,
    period: "morning" | "afternoon",
    status: "present" | "absent" | null,
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
            if (status === null && !updatedAttendance[existingEntryIndex][period === "morning" ? "afternoon" : "morning"]) {
              updatedAttendance.splice(existingEntryIndex, 1);
            } else {
              updatedAttendance[existingEntryIndex] = {
                ...updatedAttendance[existingEntryIndex],
                [period]: status,
                note: note || ''
              };
            }
          } else if (status !== null) {
            updatedAttendance.push({ 
              date, 
              morning: period === "morning" ? status : null,
              afternoon: period === "afternoon" ? status : null,
              note: note || '' 
            });
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
        "morning",
        selectedEmployee.attendance.find(
          a => format(new Date(a.date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
        )?.morning || 'present',
        "afternoon",
        selectedEmployee.attendance.find(
          a => format(new Date(a.date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
        )?.afternoon || 'present',
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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Staff Attendance</h1>
            <p className="text-muted-foreground">Track and manage employee attendance</p>
          </div>
          <Button variant="outline" onClick={handleExportReport}>
            Export Report
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalEmployees}</div>
              <p className="text-xs text-muted-foreground">Active staff members</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Present Today</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.presentToday}</div>
              <p className="text-xs text-muted-foreground">Checked in today</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Absent Today</CardTitle>
              <XCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.absentToday}</div>
              <p className="text-xs text-muted-foreground">Not checked in</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="daily" className="space-y-4">
          <div className="flex justify-between items-center">
            <TabsList>
              <TabsTrigger value="daily">Daily View</TabsTrigger>
              <TabsTrigger value="monthly">Monthly View</TabsTrigger>
            </TabsList>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handlePreviousDates}>
                Previous
              </Button>
              <Button variant="outline" onClick={handleNextDates} disabled={isNextDisabled}>
                Next
              </Button>
            </div>
          </div>

          <TabsContent value="daily" className="space-y-4">
            <div className="text-lg font-medium">
              Date Range: {format(dates[0], "MMM dd, yyyy")} - {format(dates[dates.length - 1], "MMM dd, yyyy")}
            </div>
            <AttendanceTable
              employees={employees}
              dates={dates}
              onToggleAttendance={handleToggleAttendance}
              onAddNote={handleAddNote}
            />
          </TabsContent>

          <TabsContent value="monthly" className="space-y-4">
            <div className="flex justify-between items-center">
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
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{employee.name}</CardTitle>
                          <div className="text-sm text-muted-foreground">
                            {employee.role} - {employee.department}
                          </div>
                        </div>
                        <div className="flex gap-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">{stats.present}</div>
                            <div className="text-xs text-muted-foreground">Present</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-red-600">{stats.absent}</div>
                            <div className="text-xs text-muted-foreground">Absent</div>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-7 gap-2">
                        {monthlyAttendance.map((attendance, index) => (
                          <div
                            key={index}
                            className={`p-2 text-center rounded-lg ${
                              (attendance.morning === 'present' || attendance.afternoon === 'present') ? 'bg-green-100' :
                              (attendance.morning === 'absent' && attendance.afternoon === 'absent') ? 'bg-red-100' :
                              'bg-gray-100'
                            }`}
                          >
                            <div className="text-xs font-medium">{format(attendance.date, 'd')}</div>
                            <div className="text-xs text-muted-foreground">
                              {attendance.morning === 'present' ? 'M' : attendance.morning === 'absent' ? 'm' : '-'}
                              {attendance.afternoon === 'present' ? 'A' : attendance.afternoon === 'absent' ? 'a' : '-'}
                            </div>
                          </div>
                        ))}
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
                className="min-h-[100px]"
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
