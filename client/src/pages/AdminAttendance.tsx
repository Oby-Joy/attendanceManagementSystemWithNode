import { useEffect, useState } from "react";
import { AttendanceRecord, useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search } from "lucide-react";
import Layout from "@/components/Layout";

export default function AdminAttendance() {
  const { getAllAttendance } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [allAttendance, setAllAttendance] = useState([]);

  const filteredAttendance = allAttendance.filter(
    (record) =>
      record.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.date.includes(searchQuery) ||
      record.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          <h1 className="text-3xl font-bold text-foreground">All Attendance Records</h1>
          <p className="text-muted-foreground mt-1">
            Complete attendance history for all users
          </p>
        </div>

        <Card className="shadow-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Attendance Records</CardTitle>
                <CardDescription>
                  {filteredAttendance.length} total records
                </CardDescription>
              </div>
              <div className="relative w-72">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, date, or status..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredAttendance.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                {searchQuery ? 'No records found matching your search' : 'No attendance records yet'}
              </p>
            ) : (
              <div className="rounded-lg border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-semibold">User Name</TableHead>
                      <TableHead className="font-semibold">Date</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                      <TableHead className="font-semibold">Check-in Time</TableHead>
                      <TableHead className="font-semibold">Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAttendance.map((record) => (
                      <TableRow key={record.id} className="hover:bg-accent/5 transition-smooth">
                        <TableCell className="font-medium">{record.name}</TableCell>
                        <TableCell>
                          {new Date(record.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                              record.status === 'present'
                                ? 'bg-success/10 text-success'
                                : record.status === 'late'
                                ? 'bg-warning/10 text-warning'
                                : 'bg-destructive/10 text-destructive'
                            }`}
                          >
                            {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                          </span>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {record.check_in || '-'}
                        </TableCell>
                        <TableCell className="text-muted-foreground max-w-xs truncate">
                          {record.notes || '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
