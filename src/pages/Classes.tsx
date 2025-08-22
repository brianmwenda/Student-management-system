import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Eye, Edit, Trash2, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface Class {
  id: string;
  name: string;
  grade_level: number;
  section: string;
  capacity?: number;
  room_number?: string;
  academic_year: string;
  class_teacher?: {
    profile: {
      first_name: string;
      last_name: string;
    };
  };
  student_count?: number;
}

interface Teacher {
  id: string;
  teacher_id: string;
  profile: {
    first_name: string;
    last_name: string;
  };
}

export default function Classes() {
  const { profile } = useAuth();
  const [classes, setClasses] = useState<Class[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    gradeLevel: '',
    section: 'A',
    capacity: '30',
    roomNumber: '',
    academicYear: new Date().getFullYear().toString(),
    classTeacherId: '',
  });

  useEffect(() => {
    fetchClasses();
    fetchTeachers();
  }, []);

  const fetchClasses = async () => {
    try {
      const { data, error } = await supabase
        .from('classes')
        .select(`
          *,
          class_teacher:class_teacher_id (
            profile:profile_id (
              first_name,
              last_name
            )
          )
        `);

      if (error) throw error;

      // Get student counts for each class
      const classesWithCounts = await Promise.all(
        (data || []).map(async (cls) => {
          const { count } = await supabase
            .from('students')
            .select('id', { count: 'exact', head: true })
            .eq('class_id', cls.id);
          
          return { ...cls, student_count: count || 0 };
        })
      );

      setClasses(classesWithCounts);
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

  const fetchTeachers = async () => {
    try {
      const { data, error } = await supabase
        .from('teachers')
        .select(`
          id,
          teacher_id,
          profile:profile_id (
            first_name,
            last_name
          )
        `);

      if (error) throw error;
      setTeachers(data || []);
    } catch (error) {
      console.error('Error fetching teachers:', error);
    }
  };

  const handleAddClass = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (profile?.role !== 'admin') {
      toast({
        title: "Access Denied",
        description: "Only administrators can add classes",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('classes')
        .insert({
          name: formData.name,
          grade_level: parseInt(formData.gradeLevel),
          section: formData.section,
          capacity: parseInt(formData.capacity),
          room_number: formData.roomNumber || null,
          academic_year: formData.academicYear,
          class_teacher_id: formData.classTeacherId || null,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Class created successfully",
      });

      setIsAddDialogOpen(false);
      setFormData({
        name: '',
        gradeLevel: '',
        section: 'A',
        capacity: '30',
        roomNumber: '',
        academicYear: new Date().getFullYear().toString(),
        classTeacherId: '',
      });
      fetchClasses();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create class",
        variant: "destructive",
      });
    }
  };

  const filteredClasses = classes.filter(cls =>
    cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cls.section.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cls.grade_level.toString().includes(searchTerm)
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Classes</h1>
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
          <h1 className="text-3xl font-bold">Classes</h1>
          <p className="text-muted-foreground">
            Manage class sections and their details
          </p>
        </div>
        
        {profile?.role === 'admin' && (
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Class
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Class</DialogTitle>
                <DialogDescription>
                  Create a new class section
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddClass} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Class Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Grade 5-A"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="gradeLevel">Grade Level</Label>
                    <Input
                      id="gradeLevel"
                      type="number"
                      value={formData.gradeLevel}
                      onChange={(e) => setFormData({ ...formData, gradeLevel: e.target.value })}
                      min="1"
                      max="12"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="section">Section</Label>
                    <Select value={formData.section} onValueChange={(value) => setFormData({ ...formData, section: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A">A</SelectItem>
                        <SelectItem value="B">B</SelectItem>
                        <SelectItem value="C">C</SelectItem>
                        <SelectItem value="D">D</SelectItem>
                        <SelectItem value="E">E</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="capacity">Capacity</Label>
                    <Input
                      id="capacity"
                      type="number"
                      value={formData.capacity}
                      onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                      min="1"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="roomNumber">Room Number</Label>
                    <Input
                      id="roomNumber"
                      value={formData.roomNumber}
                      onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                      placeholder="e.g., 101"
                    />
                  </div>
                  <div>
                    <Label htmlFor="academicYear">Academic Year</Label>
                    <Input
                      id="academicYear"
                      value={formData.academicYear}
                      onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                      placeholder="e.g., 2024"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="classTeacher">Class Teacher</Label>
                  <Select value={formData.classTeacherId} onValueChange={(value) => setFormData({ ...formData, classTeacherId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a teacher" />
                    </SelectTrigger>
                    <SelectContent>
                      {teachers.map((teacher) => (
                        <SelectItem key={teacher.id} value={teacher.id}>
                          {teacher.profile.first_name} {teacher.profile.last_name} ({teacher.teacher_id})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Create Class</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Class Sections</CardTitle>
          <CardDescription>
            View and manage all class sections
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search classes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Class Name</TableHead>
                <TableHead>Grade</TableHead>
                <TableHead>Section</TableHead>
                <TableHead>Students</TableHead>
                <TableHead>Class Teacher</TableHead>
                <TableHead>Room</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClasses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No classes found
                  </TableCell>
                </TableRow>
              ) : (
                filteredClasses.map((cls) => (
                  <TableRow key={cls.id}>
                    <TableCell className="font-medium">{cls.name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">Grade {cls.grade_level}</Badge>
                    </TableCell>
                    <TableCell>{cls.section}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        {cls.student_count}/{cls.capacity}
                      </div>
                    </TableCell>
                    <TableCell>
                      {cls.class_teacher ? (
                        `${cls.class_teacher.profile.first_name} ${cls.class_teacher.profile.last_name}`
                      ) : (
                        <span className="text-muted-foreground">Not assigned</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {cls.room_number || <span className="text-muted-foreground">N/A</span>}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        {profile?.role === 'admin' && (
                          <>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
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