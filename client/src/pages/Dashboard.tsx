import { AttendanceRecord, useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarCheck, Calendar, CheckCircle, XCircle, Clock } from "lucide-react";
import Layout from "@/components/Layout";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const { user, getUserAttendance } = useAuth();
  //const userAttendance = user ? getUserAttendance(user.id) : [];
  const [userAttendance, setUserAttendance] = useState([]);

  const totalDays = userAttendance.length;
  const presentDays = userAttendance.filter((r) => r.status === 'present').length;
  const absentDays = userAttendance.filter((r) => r.status === 'absent').length;
  const lateDays = userAttendance.filter((r) => r.status === 'late').length;

  const attendancePercentage = totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(1) : '0';

  // Get recent attendance (last 7 days)
  const recentAttendance = userAttendance.slice(-7).reverse();

  useEffect(() => {
    const fetchAttendance = async () => {
      if (user) {
        const records = await getUserAttendance();
        setUserAttendance(records);
      }
    };
    
    fetchAttendance();
  }, [])

  return (
    <Layout>
      <div className="space-y-6"> 
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, {user?.name}! Here's your attendance overview.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Attendance Rate
              </CardTitle>
              <CalendarCheck className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{attendancePercentage}%</div>
              <p className="text-xs text-muted-foreground">
                {presentDays} of {totalDays} days present
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Present Days
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{presentDays}</div>
              <p className="text-xs text-muted-foreground">
                Days marked present
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Absent Days
              </CardTitle>
              <XCircle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{absentDays}</div>
              <p className="text-xs text-muted-foreground">
                Days marked absent
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Late Days
              </CardTitle>
              <Clock className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{lateDays}</div>
              <p className="text-xs text-muted-foreground">
                Days marked late
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Recent Attendance</CardTitle>
            <CardDescription>Your attendance history for the last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            {recentAttendance.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No attendance records yet. Mark your first attendance!
              </p>
            ) : (
              <div className="space-y-3">
                {recentAttendance.map((record) => (
                  <div
                    key={record.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-border bg-card hover:bg-accent/5 transition-smooth"
                  >
                    <div className="flex items-center gap-4">
                      <Calendar className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">
                          {new Date(record.date).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                        {record.checkInTime && (
                          <p className="text-sm text-muted-foreground">
                            Check-in: {record.checkInTime}
                          </p>
                        )}
                      </div>
                    </div>
                    <div>
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          record.status === 'present'
                            ? 'bg-success/10 text-success'
                            : record.status === 'late'
                            ? 'bg-warning/10 text-warning'
                            : 'bg-destructive/10 text-destructive'
                        }`}
                      >
                        {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
