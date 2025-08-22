import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Search, Eye, Edit, Trash2, BookOpen } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface Subject {
  id: string;
  name: string;
  code: string;
  description?: string;
  grade_levels: number[];
  created_at: string;
}

export default function Subjects() {
  const { profile } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    gradeLevels: [] as number[],
  });

  useEffect(() => {
    fetchSubjects();
  }, []);

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
      toast({
        title: "Error",
        description: "Failed to fetch subjects",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (profile?.role !== 'admin') {
      toast({
        title: "Access Denied",
        description: "Only administrators can add subjects",
        variant: "destructive",
      });
      return;
    }

    if (formData.gradeLevels.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please select at least one grade level",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('subjects')
        .insert({
          name: formData.name,
          code: formData.code,
          description: formData.description || null,
          grade_levels: formData.gradeLevels,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Subject created successfully",
      });

      setIsAddDialogOpen(false);
      setFormData({
        name: '',
        code: '',
        description: '',
        gradeLevels: [],
      });
      fetchSubjects();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create subject",
        variant: "destructive",
      });
    }
  };

  const handleGradeLevelToggle = (level: number) => {
    setFormData(prev => ({
      ...prev,
      gradeLevels: prev.gradeLevels.includes(level)
        ? prev.gradeLevels.filter(g => g !== level)
        : [...prev.gradeLevels, level].sort()
    }));
  };

  const filteredSubjects = subjects.filter(subject =>
    subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subject.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Subjects</h1>
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
          <h1 className="text-3xl font-bold">Subjects</h1>
          <p className="text-muted-foreground">
            Manage academic subjects and curricula
          </p>
        </div>
        
        {profile?.role === 'admin' && (
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Subject
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Subject</DialogTitle>
                <DialogDescription>
                  Create a new academic subject
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddSubject} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Subject Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Mathematics"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="code">Subject Code</Label>
                    <Input
                      id="code"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                      placeholder="e.g., MATH101"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description of the subject..."
                    rows={3}
                  />
                </div>

                <div>
                  <Label>Grade Levels</Label>
                  <div className="grid grid-cols-6 gap-2 mt-2">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((level) => (
                      <Button
                        key={level}
                        type="button"
                        variant={formData.gradeLevels.includes(level) ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleGradeLevelToggle(level)}
                      >
                        {level}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Create Subject</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Academic Subjects</CardTitle>
          <CardDescription>
            View and manage all academic subjects
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search subjects..."
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
                <TableHead>Subject Name</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Grade Levels</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSubjects.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No subjects found
                  </TableCell>
                </TableRow>
              ) : (
                filteredSubjects.map((subject) => (
                  <TableRow key={subject.id}>
                    <TableCell className="font-medium">{subject.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{subject.code}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {subject.grade_levels.map((level) => (
                          <Badge key={level} variant="secondary" className="text-xs">
                            {level}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs truncate">
                        {subject.description || <span className="text-muted-foreground">No description</span>}
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(subject.created_at).toLocaleDateString()}
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