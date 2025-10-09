import { useEffect, useState } from "react";
import { AttendanceRecord, useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, Clock } from "lucide-react";
import Layout from "@/components/Layout";
import axios from "axios";

export default function Attendance() {
  const { user, markAttendance, getUserAttendance } = useAuth();
  const [notes, setNotes] = useState("");
  const { toast } = useToast();
  const apiUrl = import.meta.env.VITE_APP_URL;
  const [settings, setSettings] = useState([]);
  const [isPresent, setIsPresent] = useState(false);
  const [status, setStatus] = useState('late');
  const [settingLongitude, setSettingLongitude] = useState<number | null>(null);
  const [settingLatitude, setSettingLatitude] = useState<number | null>(null);
  const [todayAttendance, setTodayAttendance] = useState<AttendanceRecord | null>(null);

  const today = new Date().toISOString().split('T')[0]; 
  

  const handleMarkAttendance = async (status: string) => {
    const success = await markAttendance(status, notes, settingLongitude, settingLatitude);

    if(success) {
      toast({ 
        title: "Success",
        description: `Attendance marked as ${status}`,
      });
      setNotes("");
    }
  };

  useEffect(() => {
    async function getSettings() {
      const response = await axios.get(`${apiUrl}/settings`);
      const data = response.data.settings;
      setSettings(response.data.settings);
      setSettingLongitude(data[0]?.longitude);
      setSettingLatitude(data[0]?.latitude);

      const settingTime = data[0]?.time;   
      if (!settingTime) return;

      // Split into hours and minutes
      const [settingHour, settingMinute] = settingTime.split(":").map(Number);

      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();

      if(currentHour < settingHour || (currentHour === settingHour && currentMinute <= settingMinute)){
        setIsPresent(true);
        setStatus('present');
      }
      else{
        setIsPresent(false);
        setStatus('late');
      }
    }

    const fetchAttendance = async () => {
      if (user) {
        const records = await getUserAttendance();
        const todayRecord = records[records.length - 1];
        setTodayAttendance(todayRecord);
      }
    };
    
    fetchAttendance();
    getSettings();
  }, [apiUrl]);

  return (
    <Layout> 
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Mark Attendance</h1>
          <p className="text-muted-foreground mt-1">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>

        {todayAttendance && (
          <Card className="shadow-card border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-lg">Today's Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <span
                  className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium ${
                    todayAttendance?.status === 'present'
                      ? 'bg-success text-success-foreground'
                      : todayAttendance.status === 'late'
                      ? 'bg-warning text-warning-foreground'
                      : 'bg-destructive text-destructive-foreground'
                  }`}
                >
                  {todayAttendance.status.charAt(0).toUpperCase() + todayAttendance.status.slice(1)}
                </span>
                {todayAttendance.checkInTime && (
                  <span className="text-sm text-muted-foreground">
                    Checked in at {todayAttendance.checkInTime}
                  </span>
                )}
              </div>
              {todayAttendance.notes && (
                <p className="mt-3 text-sm text-muted-foreground">
                  Notes: {todayAttendance.notes}
                </p>
              )}
            </CardContent>
          </Card>
        )}

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>
              {todayAttendance ? 'Update Attendance' : 'Mark Your Attendance'}
            </CardTitle>
            <CardDescription>
              {todayAttendance
                ? 'You can update your attendance status if needed'
                : 'Select your attendance status for today'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4">
              <Button
                onClick={() => handleMarkAttendance(status)}
                variant="outline"
                className={`h-24 flex-col gap-2 ${isPresent ? 'hover:bg-success/10' : 'hover:bg-warning/10' } ${isPresent ? 'hover:border-success' : 'hover:border-warning' } ${isPresent ? 'hover:text-success' : 'hover:text-warning' } transition-smooth`}
              >
                <CheckCircle className="h-8 w-8" />
                <span className="font-semibold">
                  {isPresent ? 'Present' : 'Late'}
                </span>
              </Button>

              {/*<Button
                onClick={() => handleMarkAttendance('present')}
                variant="outline"
                className="h-24 flex-col gap-2 hover:bg-success/10 hover:border-success hover:text-success transition-smooth"
              >
                <CheckCircle className="h-8 w-8" />
                <span className="font-semibold">Present</span>
              </Button>
              
              <Button
                onClick={() => handleMarkAttendance('late')}
                variant="outline"
                className="h-24 flex-col gap-2 hover:bg-warning/10 hover:border-warning hover:text-warning transition-smooth"
              >
                <Clock className="h-8 w-8" />
                <span className="font-semibold">Late</span>
              </Button>
              
              <Button
                onClick={() => handleMarkAttendance('absent')}
                variant="outline"
                className="h-24 flex-col gap-2 hover:bg-destructive/10 hover:border-destructive hover:text-destructive transition-smooth"
              >
                <XCircle className="h-8 w-8" />
                <span className="font-semibold">Absent</span>
              </Button>*/}
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add any additional notes about your attendance..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
