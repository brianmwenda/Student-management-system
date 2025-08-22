import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Calendar, Search, CheckCircle, XCircle, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface Student {
  id: string;
  student_id: string;
  profile: {
    first_name: string;
    last_name: string;
  };
}

interface Class {
  id: string;
  name: string;
  grade_level: number;
  section: string;
}

interface AttendanceRecord {
  id: string;
  student_id: string;
  date: string;
  status: string;
  remarks?: string;
  student: {
    student_id: string;
    profile: {
      first_name: string;
      last_name: string;
    };
  };
}

export default function Attendance() {
  const { profile } = useAuth();
  const [classes, setClasses] = useState<Class[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [attendanceData, setAttendanceData] = useState<Record<string, { status: string; remarks: string }>>({});

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchStudents();
      fetchAttendance();
    }
  }, [selectedClass, selectedDate]);

  const fetchClasses = async () => {
    try {
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .order('grade_level', { ascending: true });

      if (error) throw error;
      setClasses(data || []);
    } catch (error) {
      console.error('Error fetching classes:', error);
      toast({
        title: "Error",
        description: "Failed to fetch classes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    if (!selectedClass) return;

    try {
      const { data, error } = await supabase
        .from('students')
        .select(`
          id,
          student_id,
          profile:profile_id (
            first_name,
            last_name
          )
        `)
        .eq('class_id', selectedClass);

      if (error) throw error;
      setStudents(data || []);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const fetchAttendance = async () => {
    if (!selectedClass || !selectedDate) return;

    try {
      const { data, error } = await supabase
        .from('attendance')
        .select(`
          *,
          student:student_id (
            student_id,
            profile:profile_id (
              first_name,
              last_name
            )
          )
        `)
        .eq('class_id', selectedClass)
        .eq('date', selectedDate);

      if (error) throw error;
      setAttendanceRecords(data || []);

      // Initialize attendance data with existing records
      const initialData: Record<string, { status: string; remarks: string }> = {};
      (data || []).forEach(record => {
        initialData[record.student_id] = {
          status: record.status,
          remarks: record.remarks || ''
        };
      });
      setAttendanceData(initialData);
    } catch (error) {
      console.error('Error fetching attendance:', error);
    }
  };

  const handleAttendanceChange = (studentId: string, field: 'status' | 'remarks', value: string) => {
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value
      }
    }));
  };

  const submitAttendance = async () => {
    if (!selectedClass || !selectedDate) return;

    if (profile?.role !== 'admin' && profile?.role !== 'teacher') {
      toast({
        title: "Access Denied",
        description: "Only administrators and teachers can mark attendance",
        variant: "destructive",
      });
      return;
    }

    try {
      // Delete existing attendance for this class and date
      await supabase
        .from('attendance')
        .delete()
        .eq('class_id', selectedClass)
        .eq('date', selectedDate);

      // Insert new attendance records
      const attendanceRecords = students
        .filter(student => attendanceData[student.id]?.status)
        .map(student => ({
          student_id: student.id,
          class_id: selectedClass,
          date: selectedDate,
          status: attendanceData[student.id].status,
          remarks: attendanceData[student.id].remarks || null,
          marked_by: profile?.id
        }));

      if (attendanceRecords.length > 0) {
        const { error } = await supabase
          .from('attendance')
          .insert(attendanceRecords);

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: "Attendance marked successfully",
      });

      fetchAttendance();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to mark attendance",
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'absent':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'late':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'present':
        return <Badge className="bg-green-100 text-green-800">Present</Badge>;
      case 'absent':
        return <Badge variant="destructive">Absent</Badge>;
      case 'late':
        return <Badge className="bg-yellow-100 text-yellow-800">Late</Badge>;
      default:
        return <Badge variant="outline">Not marked</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Attendance</h1>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-muted rounded w-full"></div>
          <div className="h-64 bg-muted rounded w-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Attendance</h1>
          <p className="text-muted-foreground">
            Mark and manage student attendance
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Mark Attendance</CardTitle>
          <CardDescription>
            Select a class and date to mark attendance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <Label htmlFor="class">Class</Label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.name} - Grade {cls.grade_level} ({cls.section})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
          </div>

          {selectedClass && students.length > 0 && (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Remarks</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">{student.student_id}</TableCell>
                      <TableCell>
                        {student.profile.first_name} {student.profile.last_name}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={attendanceData[student.id]?.status || ''}
                          onValueChange={(value) => handleAttendanceChange(student.id, 'status', value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue placeholder="Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="present">Present</SelectItem>
                            <SelectItem value="absent">Absent</SelectItem>
                            <SelectItem value="late">Late</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Input
                          placeholder="Remarks (optional)"
                          value={attendanceData[student.id]?.remarks || ''}
                          onChange={(e) => handleAttendanceChange(student.id, 'remarks', e.target.value)}
                          className="w-48"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {(profile?.role === 'admin' || profile?.role === 'teacher') && (
                <div className="flex justify-end mt-4">
                  <Button onClick={submitAttendance}>
                    <Calendar className="h-4 w-4 mr-2" />
                    Save Attendance
                  </Button>
                </div>
              )}
            </>
          )}

          {selectedClass && students.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No students found in selected class
            </div>
          )}

          {!selectedClass && (
            <div className="text-center py-8 text-muted-foreground">
              Please select a class to mark attendance
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}