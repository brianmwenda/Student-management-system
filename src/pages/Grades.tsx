import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus, Search, Trophy, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface Grade {
  id: string;
  marks_obtained: number;
  total_marks: number;
  grade_letter?: string;
  exam_type: string;
  exam_date: string;
  semester?: string;
  academic_year: string;
  student: {
    student_id: string;
    profile: {
      first_name: string;
      last_name: string;
    };
  };
  subject: {
    name: string;
    code: string;
  };
  class: {
    name: string;
    grade_level: number;
  };
}

interface Class {
  id: string;
  name: string;
  grade_level: number;
  section: string;
}

interface Subject {
  id: string;
  name: string;
  code: string;
}

interface Student {
  id: string;
  student_id: string;
  profile: {
    first_name: string;
    last_name: string;
  };
}

export default function Grades() {
  const { profile } = useAuth();
  const [grades, setGrades] = useState<Grade[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    studentId: '',
    subjectId: '',
    classId: '',
    examType: '',
    examDate: '',
    marksObtained: '',
    totalMarks: '',
    semester: '1',
    academicYear: new Date().getFullYear().toString(),
  });

  useEffect(() => {
    fetchGrades();
    fetchClasses();
    fetchSubjects();
  }, [selectedClass, selectedSubject]);

  useEffect(() => {
    if (selectedClass) {
      fetchStudents();
    }
  }, [selectedClass]);

  const fetchGrades = async () => {
    try {
      let query = supabase
        .from('grades')
        .select(`
          *,
          student:student_id (
            student_id,
            profile:profile_id (
              first_name,
              last_name
            )
          ),
          subject:subject_id (
            name,
            code
          ),
          class:class_id (
            name,
            grade_level
          )
        `)
        .order('exam_date', { ascending: false });

      if (selectedClass) {
        query = query.eq('class_id', selectedClass);
      }

      if (selectedSubject) {
        query = query.eq('subject_id', selectedSubject);
      }

      const { data, error } = await query;

      if (error) throw error;
      setGrades(data || []);
    } catch (error) {
      console.error('Error fetching grades:', error);
      toast({
        title: "Error",
        description: "Failed to fetch grades",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

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

  const fetchSubjects = async () => {
    try {
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setSubjects(data || []);
    } catch (error) {
      console.error('Error fetching subjects:', error);
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

  const calculateGradeLetter = (obtained: number, total: number): string => {
    const percentage = (obtained / total) * 100;
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B+';
    if (percentage >= 60) return 'B';
    if (percentage >= 50) return 'C+';
    if (percentage >= 40) return 'C';
    if (percentage >= 35) return 'D';
    return 'F';
  };

  const handleAddGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (profile?.role !== 'admin' && profile?.role !== 'teacher') {
      toast({
        title: "Access Denied",
        description: "Only administrators and teachers can add grades",
        variant: "destructive",
      });
      return;
    }

    try {
      const marksObtained = parseFloat(formData.marksObtained);
      const totalMarks = parseFloat(formData.totalMarks);
      const gradeLetter = calculateGradeLetter(marksObtained, totalMarks);

      const { error } = await supabase
        .from('grades')
        .insert({
          student_id: formData.studentId,
          subject_id: formData.subjectId,
          class_id: formData.classId,
          exam_type: formData.examType,
          exam_date: formData.examDate,
          marks_obtained: marksObtained,
          total_marks: totalMarks,
          grade_letter: gradeLetter,
          semester: formData.semester,
          academic_year: formData.academicYear,
          created_by: profile?.id,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Grade added successfully",
      });

      setIsAddDialogOpen(false);
      setFormData({
        studentId: '',
        subjectId: '',
        classId: '',
        examType: '',
        examDate: '',
        marksObtained: '',
        totalMarks: '',
        semester: '1',
        academicYear: new Date().getFullYear().toString(),
      });
      fetchGrades();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add grade",
        variant: "destructive",
      });
    }
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A+':
      case 'A':
        return 'bg-green-100 text-green-800';
      case 'B+':
      case 'B':
        return 'bg-blue-100 text-blue-800';
      case 'C+':
      case 'C':
        return 'bg-yellow-100 text-yellow-800';
      case 'D':
        return 'bg-orange-100 text-orange-800';
      case 'F':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Grades</h1>
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
          <h1 className="text-3xl font-bold">Grades</h1>
          <p className="text-muted-foreground">
            Manage student grades and exam results
          </p>
        </div>
        
        {(profile?.role === 'admin' || profile?.role === 'teacher') && (
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Grade
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Grade</DialogTitle>
                <DialogDescription>
                  Record a new exam result or grade
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddGrade} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="classId">Class</Label>
                    <Select value={formData.classId} onValueChange={(value) => setFormData({ ...formData, classId: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select class" />
                      </SelectTrigger>
                      <SelectContent>
                        {classes.map((cls) => (
                          <SelectItem key={cls.id} value={cls.id}>
                            {cls.name} - Grade {cls.grade_level}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="subjectId">Subject</Label>
                    <Select value={formData.subjectId} onValueChange={(value) => setFormData({ ...formData, subjectId: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects.map((subject) => (
                          <SelectItem key={subject.id} value={subject.id}>
                            {subject.name} ({subject.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="studentId">Student</Label>
                  <Select value={formData.studentId} onValueChange={(value) => setFormData({ ...formData, studentId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select student" />
                    </SelectTrigger>
                    <SelectContent>
                      {students.map((student) => (
                        <SelectItem key={student.id} value={student.id}>
                          {student.profile.first_name} {student.profile.last_name} ({student.student_id})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="examType">Exam Type</Label>
                    <Select value={formData.examType} onValueChange={(value) => setFormData({ ...formData, examType: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unit_test">Unit Test</SelectItem>
                        <SelectItem value="midterm">Midterm</SelectItem>
                        <SelectItem value="final">Final Exam</SelectItem>
                        <SelectItem value="assignment">Assignment</SelectItem>
                        <SelectItem value="project">Project</SelectItem>
                        <SelectItem value="quiz">Quiz</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="examDate">Exam Date</Label>
                    <Input
                      id="examDate"
                      type="date"
                      value={formData.examDate}
                      onChange={(e) => setFormData({ ...formData, examDate: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="marksObtained">Marks Obtained</Label>
                    <Input
                      id="marksObtained"
                      type="number"
                      step="0.01"
                      value={formData.marksObtained}
                      onChange={(e) => setFormData({ ...formData, marksObtained: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="totalMarks">Total Marks</Label>
                    <Input
                      id="totalMarks"
                      type="number"
                      step="0.01"
                      value={formData.totalMarks}
                      onChange={(e) => setFormData({ ...formData, totalMarks: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="semester">Semester</Label>
                    <Select value={formData.semester} onValueChange={(value) => setFormData({ ...formData, semester: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Semester 1</SelectItem>
                        <SelectItem value="2">Semester 2</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="academicYear">Academic Year</Label>
                    <Input
                      id="academicYear"
                      value={formData.academicYear}
                      onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Add Grade</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Student Grades</CardTitle>
          <CardDescription>
            View and manage student exam results and grades
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <Label htmlFor="classFilter">Filter by Class</Label>
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
            <div className="flex-1">
              <Label htmlFor="subjectFilter">Filter by Subject</Label>
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger>
                  <SelectValue placeholder="All subjects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Subjects</SelectItem>
                  {subjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Exam Type</TableHead>
                <TableHead>Marks</TableHead>
                <TableHead>Grade</TableHead>
                <TableHead>Percentage</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {grades.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No grades found
                  </TableCell>
                </TableRow>
              ) : (
                grades.map((grade) => (
                  <TableRow key={grade.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {grade.student.profile.first_name} {grade.student.profile.last_name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {grade.student.student_id}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {grade.class.name}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{grade.subject.name}</div>
                        <div className="text-sm text-muted-foreground">{grade.subject.code}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {grade.exam_type.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {grade.marks_obtained}/{grade.total_marks}
                    </TableCell>
                    <TableCell>
                      <Badge className={getGradeColor(grade.grade_letter || '')}>
                        {grade.grade_letter}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        {((grade.marks_obtained / grade.total_marks) * 100).toFixed(1)}%
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(grade.exam_date).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}