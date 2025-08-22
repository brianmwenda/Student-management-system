import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Users, GraduationCap, BookOpen, TrendingUp, Download, Calendar, Award } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface ReportData {
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  totalSubjects: number;
  attendanceRate: number;
  gradeDistribution: { grade: string; count: number }[];
  classEnrollment: { class: string; students: number; capacity: number }[];
  monthlyAttendance: { month: string; present: number; absent: number }[];
}

interface Class {
  id: string;
  name: string;
  grade_level: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export default function Reports() {
  const { profile } = useAuth();
  const [reportData, setReportData] = useState<ReportData>({
    totalStudents: 0,
    totalTeachers: 0,
    totalClasses: 0,
    totalSubjects: 0,
    attendanceRate: 0,
    gradeDistribution: [],
    classEnrollment: [],
    monthlyAttendance: [],
  });
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('current_month');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReportData();
    fetchClasses();
  }, [selectedClass, selectedPeriod]);

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
    }
  };

  const fetchReportData = async () => {
    try {
      // Fetch basic stats
      const [studentsRes, teachersRes, classesRes, subjectsRes] = await Promise.all([
        supabase.from('students').select('id', { count: 'exact', head: true }),
        supabase.from('teachers').select('id', { count: 'exact', head: true }),
        supabase.from('classes').select('id', { count: 'exact', head: true }),
        supabase.from('subjects').select('id', { count: 'exact', head: true }),
      ]);

      // Fetch attendance data
      const attendanceQuery = supabase
        .from('attendance')
        .select('status, date, class_id');

      if (selectedClass) {
        attendanceQuery.eq('class_id', selectedClass);
      }

      const { data: attendanceData } = await attendanceQuery;

      // Calculate attendance rate
      const totalAttendance = attendanceData?.length || 0;
      const presentCount = attendanceData?.filter(record => record.status === 'present').length || 0;
      const attendanceRate = totalAttendance > 0 ? (presentCount / totalAttendance) * 100 : 0;

      // Fetch grade distribution
      const gradeQuery = supabase
        .from('grades')
        .select('grade_letter, class_id');

      if (selectedClass) {
        gradeQuery.eq('class_id', selectedClass);
      }

      const { data: gradesData } = await gradeQuery;

      const gradeDistribution = gradesData?.reduce((acc: { [key: string]: number }, grade) => {
        const letter = grade.grade_letter || 'N/A';
        acc[letter] = (acc[letter] || 0) + 1;
        return acc;
      }, {});

      const gradeDistributionArray = Object.entries(gradeDistribution || {}).map(([grade, count]) => ({
        grade,
        count: count as number,
      }));

      // Fetch class enrollment
      const { data: classEnrollmentData } = await supabase
        .from('classes')
        .select(`
          name,
          capacity,
          students:students(count)
        `);

      const classEnrollment = classEnrollmentData?.map(cls => ({
        class: cls.name,
        students: cls.students?.[0]?.count || 0,
        capacity: cls.capacity || 30,
      })) || [];

      // Generate monthly attendance data (mock data for demonstration)
      const monthlyAttendance = [
        { month: 'Jan', present: 85, absent: 15 },
        { month: 'Feb', present: 88, absent: 12 },
        { month: 'Mar', present: 82, absent: 18 },
        { month: 'Apr', present: 90, absent: 10 },
        { month: 'May', present: 87, absent: 13 },
        { month: 'Jun', present: 91, absent: 9 },
      ];

      setReportData({
        totalStudents: studentsRes.count || 0,
        totalTeachers: teachersRes.count || 0,
        totalClasses: classesRes.count || 0,
        totalSubjects: subjectsRes.count || 0,
        attendanceRate,
        gradeDistribution: gradeDistributionArray,
        classEnrollment,
        monthlyAttendance,
      });
    } catch (error) {
      console.error('Error fetching report data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch report data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const exportReport = () => {
    toast({
      title: "Export Started",
      description: "Your report is being generated...",
    });
    // Implementation for PDF/Excel export would go here
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Reports</h1>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reports & Analytics</h1>
          <p className="text-muted-foreground">
            View detailed reports and analytics for your school
          </p>
        </div>
        
        <Button onClick={exportReport}>
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Report Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="class">Class Filter</Label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
                  <SelectValue placeholder="All classes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Classes</SelectItem>
                  {classes.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.name} - Grade {cls.grade_level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="period">Time Period</Label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current_month">Current Month</SelectItem>
                  <SelectItem value="last_month">Last Month</SelectItem>
                  <SelectItem value="current_year">Current Year</SelectItem>
                  <SelectItem value="last_year">Last Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData.totalStudents}</div>
            <p className="text-xs text-muted-foreground">
              Active enrollments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Teachers</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData.totalTeachers}</div>
            <p className="text-xs text-muted-foreground">
              Teaching staff
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData.attendanceRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Average attendance
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Classes</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData.totalClasses}</div>
            <p className="text-xs text-muted-foreground">
              Active sections
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Grade Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Grade Distribution</CardTitle>
            <CardDescription>
              Distribution of grades across all subjects
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={reportData.gradeDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ grade, count }) => `${grade}: ${count}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {reportData.gradeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Class Enrollment */}
        <Card>
          <CardHeader>
            <CardTitle>Class Enrollment</CardTitle>
            <CardDescription>
              Current enrollment vs capacity by class
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={reportData.classEnrollment}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="class" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="students" fill="#8884d8" name="Enrolled" />
                <Bar dataKey="capacity" fill="#82ca9d" name="Capacity" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Monthly Attendance Trend */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Monthly Attendance Trend</CardTitle>
            <CardDescription>
              Attendance patterns over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={reportData.monthlyAttendance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="present" stroke="#8884d8" name="Present %" />
                <Line type="monotone" dataKey="absent" stroke="#82ca9d" name="Absent %" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Additional Insights */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Top Performing Classes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {reportData.classEnrollment.slice(0, 3).map((cls, index) => (
                <div key={cls.class} className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{cls.class}</div>
                    <div className="text-sm text-muted-foreground">
                      {cls.students} students
                    </div>
                  </div>
                  <Badge variant={index === 0 ? "default" : "secondary"}>
                    #{index + 1}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Key Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">Student-Teacher Ratio</span>
                <span className="font-medium">
                  {reportData.totalTeachers > 0 
                    ? (reportData.totalStudents / reportData.totalTeachers).toFixed(1)
                    : '0'}:1
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Classes per Teacher</span>
                <span className="font-medium">
                  {reportData.totalTeachers > 0 
                    ? (reportData.totalClasses / reportData.totalTeachers).toFixed(1)
                    : '0'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Avg. Class Size</span>
                <span className="font-medium">
                  {reportData.totalClasses > 0 
                    ? (reportData.totalStudents / reportData.totalClasses).toFixed(1)
                    : '0'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start">
              <Download className="h-4 w-4 mr-2" />
              Export Attendance Report
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Download className="h-4 w-4 mr-2" />
              Export Grade Report
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Download className="h-4 w-4 mr-2" />
              Export Student List
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}