import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus, Search, Eye, Edit, Trash2, GraduationCap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface Teacher {
  id: string;
  teacher_id: string;
  department?: string;
  qualification?: string;
  experience_years?: number;
  salary?: number;
  joining_date: string;
  profile: {
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
  };
}

export default function Teachers() {
  const { profile } = useAuth();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    teacherId: '',
    department: '',
    qualification: '',
    experienceYears: '',
    salary: '',
  });

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      const { data, error } = await supabase
        .from('teachers')
        .select(`
          *,
          profile:profile_id (
            first_name,
            last_name,
            email,
            phone
          )
        `);

      if (error) throw error;
      setTeachers(data || []);
    } catch (error) {
      console.error('Error fetching teachers:', error);
      toast({
        title: "Error",
        description: "Failed to fetch teachers",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (profile?.role !== 'admin') {
      toast({
        title: "Access Denied",
        description: "Only administrators can add teachers",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: 'temppass123',
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            role: 'teacher'
          }
        }
      });

      if (authError) throw authError;

      await new Promise(resolve => setTimeout(resolve, 1000));

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', formData.email)
        .single();

      if (profileError) throw profileError;

      const { error: teacherError } = await supabase
        .from('teachers')
        .insert({
          profile_id: profileData.id,
          teacher_id: formData.teacherId,
          department: formData.department,
          qualification: formData.qualification,
          experience_years: formData.experienceYears ? parseInt(formData.experienceYears) : 0,
          salary: formData.salary ? parseFloat(formData.salary) : null,
        });

      if (teacherError) throw teacherError;

      toast({
        title: "Success",
        description: "Teacher added successfully",
      });

      setIsAddDialogOpen(false);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        teacherId: '',
        department: '',
        qualification: '',
        experienceYears: '',
        salary: '',
      });
      fetchTeachers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add teacher",
        variant: "destructive",
      });
    }
  };

  const filteredTeachers = teachers.filter(teacher =>
    teacher.profile.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.profile.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.teacher_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.department?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Teachers</h1>
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
          <h1 className="text-3xl font-bold">Teachers</h1>
          <p className="text-muted-foreground">
            Manage teaching staff and their information
          </p>
        </div>
        
        {profile?.role === 'admin' && (
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Teacher
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Teacher</DialogTitle>
                <DialogDescription>
                  Create a new teacher account and profile
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddTeacher} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="teacherId">Teacher ID</Label>
                    <Input
                      id="teacherId"
                      value={formData.teacherId}
                      onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="department">Department</Label>
                    <Input
                      id="department"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="qualification">Qualification</Label>
                    <Input
                      id="qualification"
                      value={formData.qualification}
                      onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="experienceYears">Experience (Years)</Label>
                    <Input
                      id="experienceYears"
                      type="number"
                      value={formData.experienceYears}
                      onChange={(e) => setFormData({ ...formData, experienceYears: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="salary">Salary</Label>
                    <Input
                      id="salary"
                      type="number"
                      value={formData.salary}
                      onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Add Teacher</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Teaching Staff</CardTitle>
          <CardDescription>
            View and manage all teaching staff members
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search teachers..."
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
                <TableHead>Teacher ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Experience</TableHead>
                <TableHead>Joining Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTeachers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No teachers found
                  </TableCell>
                </TableRow>
              ) : (
                filteredTeachers.map((teacher) => (
                  <TableRow key={teacher.id}>
                    <TableCell className="font-medium">{teacher.teacher_id}</TableCell>
                    <TableCell>
                      {teacher.profile.first_name} {teacher.profile.last_name}
                    </TableCell>
                    <TableCell>{teacher.profile.email}</TableCell>
                    <TableCell>
                      {teacher.department ? (
                        <Badge variant="secondary">{teacher.department}</Badge>
                      ) : (
                        <span className="text-muted-foreground">Not assigned</span>
                      )}
                    </TableCell>
                    <TableCell>{teacher.experience_years || 0} years</TableCell>
                    <TableCell>
                      {new Date(teacher.joining_date).toLocaleDateString()}
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