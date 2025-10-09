import { useToast } from '@/hooks/use-toast';
import axios from 'axios';
import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  _id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
}

export interface AttendanceRecord {
  id: string;
  userId: string;
  userName: string;
  date: string;
  status: 'present' | 'absent' | 'late';
  checkInTime?: string;
  notes?: string;
}

interface Setting {
  id: string;
  location: string;
  time: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  users: User[];
  settings: Setting[];
  attendanceRecords: AttendanceRecord[];
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, name: string, role: 'user' | 'admin') => Promise<boolean>;
  logout: () => void;
  addSetting: (time: string, longitude: string, latitude: string) => Promise<boolean>;
  markAttendance: (status: string, notes?: string, settingLongitude?: number, settingLatitude?: number) => void;
  getUserAttendance: () => Promise<AttendanceRecord[]>;
  getAllAttendance: () => Promise<AttendanceRecord[]>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const apiUrl = import.meta.env.VITE_APP_URL;
  const { toast } = useToast();
  const [settings, setSettings] = useState([]);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    async function getCurrentUser() {
      axios
        .get(`${apiUrl}/current-user`, { withCredentials: true })
        .then((res) => setUser(res.data.user))
        .catch(() => setUser(null))
        .finally(() => setLoading(false));
    }

    async function getUsers() {
      try{
        const res = await axios.get(`${apiUrl}/users`);
        setUsers(res.data.users);
      }
      catch(err) {
        console.log(err)
      }
    }

    getUsers();
    getCurrentUser();
  }, [apiUrl]);

  const login = async (email: string, password: string): Promise<boolean> => {
    try{
      const res = await axios.post(`${apiUrl}/signin`,
        {email, password},
        { withCredentials: true }
      );

      if(res.data.user) {
        setUser(res.data.user);
        return true;
      }
    }
    catch(err) {
      console.log(err.response.data.errors.email || err.response.data.errors.password) 
      return false;
    }
  };

  const signup = async (email: string, password: string, name: string, role: 'user' | 'admin'): Promise<boolean> => {
    try{
      const res = await axios.post(`${apiUrl}/signup`,
        {email, password, name, role},
        { withCredentials: true }
      );

      if(res.data.user) {
        setUser(res.data.user);
        return true;
      }
      
    }
    catch(err) {
      console.log(err);
      return false;
    }
  };

  const logout = async () => {
    await axios.get(`${apiUrl}/logout`, { withCredentials: true });
    setUser(null);
  };

  const addSetting = async (time, longitude, latitude): Promise<boolean> => {
    try{
      const res = await axios.post(`${apiUrl}/add-setting`,
        {time, longitude, latitude},
        { withCredentials: true }
      );

      if(res.data.settings) {
        return true;
      }
      
    }
    catch(err) {
      console.log(err);
      return false;
    }
  }

  const markAttendance = async (status: string, notes?: string, settingLongitude?: number, settingLatitude?: number):Promise<boolean> => {
    if (!user) return false;

    if (!navigator.geolocation) {
      console.log("Geolocation is not supported by your browser.");
      alert("Geolocation is not supported by your browser.");
      return false;
    }

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      }); 

      const userLocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };

      // If location is missing from admin settings, stop
      if (settingLatitude == null || settingLongitude == null) {
        alert("Setting location not available.");
        return false;
      }

      const withinRange =
        Math.abs(userLocation.lat - settingLatitude) < 0.0001 &&
        Math.abs(userLocation.lng - settingLongitude) < 0.0001;

      if (!withinRange) {
        alert("You're not in the right location");
        return false;
      }

      // mark attendance
      const today = new Date().toISOString().split("T")[0];

      const res = await axios.post(`${apiUrl}/attendance/mark`, {
        name: user.name,
        email: user.email,
        date: today,
        status,
        notes,
        check_in: new Date().toLocaleTimeString(),
      });

      if(res.data.status) {
        return true;
      }
      else{
        return false;
      }
    } catch (err) {
      const message = err.response ? err.response.data.message : err.message ;
      alert(message);
      return false;
    }
  };

  const getUserAttendance = async (): Promise<AttendanceRecord[]> => {
    const today = new Date().toISOString().split("T")[0];
    const email = user.email;

    try{
      const res = await axios.get(`${apiUrl}/attendance/user-attendance`, {
        params: {
          date: today, 
          email
        }
      });
      const newRecord: AttendanceRecord = {
        id: Date.now().toString(),
        userId: res.data.attendance._id,
        userName: res.data.attendance.name,
        date: res.data.attendance.date,
        status: res.data.attendance.status,
        checkInTime: new Date().toLocaleTimeString(),
        notes: res.data.attendance.notes,
      };
      const updatedRecords = [...attendanceRecords, newRecord];
      setAttendanceRecords(updatedRecords);
      return updatedRecords;
    }
    catch(err) {
      console.log(err)
    } 
    //return attendanceRecords.filter((record) => record.userId === userId);
  };

  const getAllAttendance = async (): Promise<AttendanceRecord[]> => {
    try{
      const res = await axios.get(`${apiUrl}/attendance`);
      return res.data.attendance;
    }
    catch(err) {
      console.log(err)
    }
    //return attendanceRecords;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        users,
        settings,
        attendanceRecords,
        loading,
        login,
        signup,
        logout,
        addSetting,
        markAttendance,
        getUserAttendance,
        getAllAttendance,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
