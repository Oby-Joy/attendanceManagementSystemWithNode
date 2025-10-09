import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, CheckCircle, TrendingUp } from "lucide-react";
import Layout from "@/components/Layout";
import { useEffect, useState } from "react";

export default function AdminDashboard() {
  const { users, getAllAttendance } = useAuth();
  const [allAttendance, setAllAttendance] = useState([]);

  const totalUsers = users.length;
  const totalRecords = allAttendance.length;
  const presentToday = allAttendance.filter(
    (r) => r.date === new Date().toISOString().split('T')[0] && r.status === 'present'
  ).length;

  const overallAttendanceRate =
    totalRecords > 0
      ? ((allAttendance.filter((r) => r.status === 'present').length / totalRecords) * 100).toFixed(1)
      : '0';

  // Get user statistics
  const userStats = users.map((user) => {
    const userRecords = allAttendance.filter((r) => r.email === user.email);
    const presentCount = userRecords.filter((r) => r.status === 'present').length;
    const rate = userRecords.length > 0 ? ((presentCount / userRecords.length) * 100).toFixed(1) : '0';
    
    return {
      ...user,
      totalRecords: userRecords.length,
      presentCount,
      rate,
    };
  });

  useEffect(() => {
    const fetchAttendance = async () => {
      const records = await getAllAttendance();
      setAllAttendance(records);
    };
    
    fetchAttendance();
  }, [getAllAttendance]);

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Overview of all users and attendance records
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Users
              </CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                Registered in the system
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Present Today
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{presentToday}</div>
              <p className="text-xs text-muted-foreground">
                Users marked present
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Records
              </CardTitle>
              <Calendar className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalRecords}</div>
              <p className="text-xs text-muted-foreground">
                Attendance entries
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Overall Rate
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overallAttendanceRate}%</div>
              <p className="text-xs text-muted-foreground">
                Average attendance
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>User Statistics</CardTitle>
            <CardDescription>Attendance overview for all users</CardDescription>
          </CardHeader>
          <CardContent>
            {userStats.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No users registered yet
              </p>
            ) : (
              <div className="space-y-4">
                {userStats.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-border bg-card hover:bg-accent/5 transition-smooth"
                  >
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs px-2 py-1 rounded-md bg-secondary text-secondary-foreground">
                          {user.role}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">{user.rate}%</p>
                      <p className="text-xs text-muted-foreground">
                        {user.presentCount} of {user.totalRecords} days
                      </p>
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
