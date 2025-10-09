import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit, Search, Trash } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function AdminSettings() {
    const apiUrl = import.meta.env.VITE_APP_URL;
    const [time, setTime] = useState("");
    const [longitude, setLongitude] = useState("");
    const [latitude, setLatitude] = useState("");
    const { addSetting } = useAuth();
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();
    const [open, setOpen] = useState(false);
    const [settings, setSettings] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [editOpen, setEditOpen] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [editTime, setEditTime] = useState('');
    const [editLatitude, setEditLatitude] = useState('');
    const [editLongitude, setEditLongitude] = useState('');

    const handleAddSetting = async (time, longitude, latitude) => {
        if(!longitude || !latitude || !time) return;

        setLoading(true);

        const success = await addSetting(time, longitude, latitude)

        if(success) {
            setSettings((prev) => [...prev, {time, location}]);

            toast({
                title: "Success",
                description: "Setting saved successfully!",
            });
        }
        else{
            toast({
                title: "Error",
                description: "An Error Occurred",
                variant: "destructive",
            });
        }
        setOpen(false)
        setLoading(false);
    }

    const handleUpdateSetting = async() => {
        if(!editLongitude || !editLatitude || !editTime) return;

        setLoading(true)

        try{
            const res = await axios.put(`${apiUrl}/update-setting/${selectedRecord._id}`, {
                latitude: editLatitude,
                longitude: editLongitude,
                time: editTime,
            });
            if(res.data.status){
                setSettings((prev) =>
                    prev.map((item) =>
                        item._id === selectedRecord._id
                        ? { ...item, longitude: editLongitude, latitude: editLatitude, time: editTime }
                        : item
                    )
                );

                toast({
                    title: "Success",
                    description: "Setting updated successfully!",
                });
            }
        }
        catch(err) {
            console.log(err);
        }
        finally{
            setLoading(false);
            setEditOpen(false);
        }
    }

    const handleDelete = async (id) => {
        try{
            const res = await axios.delete(`${apiUrl}/delete-setting/${id}`);
            if(res.data.status) {
                setSettings((prev) => prev.filter((item) => item._id !== id));
                toast({
                    title: "Success",
                    description: "Setting deleted!",
                });
            }
        }
        catch(err) {
            console.log(err);
        }
        
    }

    const filteredSetting = settings.filter(
        (record) =>
        record.time.includes(searchQuery)
    );

    useEffect(() => {
        async function getSettings() {
            const response = await axios.get(`${apiUrl}/settings`);
            setSettings(response.data.settings);
        }

        getSettings();
    }, [apiUrl]);

    return (
        <Layout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Admin Settings</h1>
                        <p className="text-muted-foreground mt-1">
                        Add and update late times and locations
                        </p>
                    </div>
                    {/*<Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button>Add</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add Settings</DialogTitle>
                                <DialogDescription>
                                    Fill in the details below to add new late times or locations.
                                </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-4 mt-4">
                                <Input
                                    type="text"
                                    placeholder="Longitude"
                                    className="w-full border rounded-lg p-2"
                                    value={longitude}
                                    onChange={(e) => setLongitude(e.target.value)}
                                    required
                                />
                                <Input
                                    type="text"
                                    placeholder="Latitude"
                                    className="w-full border rounded-lg p-2"
                                    value={latitude}
                                    onChange={(e) => setLatitude(e.target.value)}
                                    required
                                />
                                <Input
                                    type="time"
                                    className="w-full border rounded-lg p-2"
                                    value={time}
                                    onChange={(e) => setTime(e.target.value)}
                                    required
                                />
                                <Button
                                    className="w-full"
                                    onClick={() => handleAddSetting(time, longitude, latitude)}
                                    disabled={loading}
                                >   
                                    {loading ? 'Saving...' : 'Save' }
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>*/}
                </div>

                <Card className="shadow-card">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Locations & Late Times</CardTitle>
                                <CardDescription>
                                    {filteredSetting.length} total records
                                </CardDescription>
                            </div>
                            <div className="relative w-72">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search by location or time..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {filteredSetting.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-8">
                                {searchQuery ? 'No records found matching your search' : 'No settings yet'}
                            </p>
                        ) : (
                            <div className="rounded-lg border border-border overflow-hidden">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-muted/50">
                                            <TableHead className="font-semibold">Latitude</TableHead>
                                            <TableHead className="font-semibold">Longitude</TableHead>
                                            <TableHead className="font-semibold">Time</TableHead>
                                            <TableHead className="font-semibold">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredSetting.map((record) => (
                                            <TableRow key={record._id} className="hover:bg-accent/5 transition-smooth">
                                                <TableCell className="font-medium">{record.latitude}</TableCell>
                                                <TableCell className="font-medium">{record.longitude}</TableCell>
                                                <TableCell>
                                                    {record.time}
                                                </TableCell>
                                                <TableCell>
                                                    <Button
                                                        style={{ marginRight: '5px' }}
                                                        onClick={() => {
                                                            setSelectedRecord(record);
                                                            setEditTime(record.time);
                                                            setEditLongitude(record.longitude);
                                                            setEditLatitude(record.latitude);
                                                            setEditOpen(true);
                                                        }}      
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        style={{background: 'red'}}
                                                        onClick={() => handleDelete(record._id)}
                                                        disabled={loading}
                                                    >
                                                        <Trash className="w-4 h-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}

                                        <Dialog open={editOpen} onOpenChange={setEditOpen}>
                                            <DialogContent className="max-w-md">
                                                <DialogHeader>
                                                    <DialogTitle>Edit Setting</DialogTitle>
                                                    <DialogDescription>
                                                        Update the time or location for this setting.
                                                    </DialogDescription>
                                                </DialogHeader>

                                                <div className="space-y-4 mt-4">
                                                    <input
                                                        type="text"
                                                        value={editLatitude}
                                                        onChange={(e) => setEditLatitude(e.target.value)}
                                                        placeholder="Location Latitude"
                                                        className="w-full border rounded-lg p-2"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={editLongitude}
                                                        onChange={(e) => setEditLongitude(e.target.value)}
                                                        placeholder="Location Longitude"
                                                        className="w-full border rounded-lg p-2"
                                                    />
                                                    <input
                                                        type="time"
                                                        value={editTime}
                                                        onChange={(e) => setEditTime(e.target.value)}
                                                        className="w-full border rounded-lg p-2"
                                                    />

                                                    <Button
                                                        className="w-full"
                                                        disabled={loading}
                                                        onClick={() => {
                                                            handleUpdateSetting()
                                                        }}
                                                    >
                                                        { loading ? 'Saving...' : 'Save Changes' }
                                                    </Button>
                                                </div>
                                            </DialogContent>
                                        </Dialog>
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