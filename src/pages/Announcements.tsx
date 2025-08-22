import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Plus, Search, Eye, Edit, Trash2, Bell, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: string;
  target_audience: string;
  is_published: boolean;
  published_at?: string;
  expires_at?: string;
  created_at: string;
  author: {
    first_name: string;
    last_name: string;
  };
  class_ids?: string[];
}

interface Class {
  id: string;
  name: string;
  grade_level: number;
  section: string;
}

export default function Announcements() {
  const { profile } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    priority: 'normal',
    targetAudience: 'all',
    classIds: [] as string[],
    isPublished: false,
    expiresAt: '',
  });

  useEffect(() => {
    fetchAnnouncements();
    fetchClasses();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const { data, error } = await supabase
        .from('announcements')
        .select(`
          *,
          author:author_id (
            first_name,
            last_name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAnnouncements(data || []);
    } catch (error) {
      console.error('Error fetching announcements:', error);
      toast({
        title: "Error",
        description: "Failed to fetch announcements",
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

  const handleAddAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (profile?.role !== 'admin' && profile?.role !== 'teacher') {
      toast({
        title: "Access Denied",
        description: "Only administrators and teachers can create announcements",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('announcements')
        .insert({
          title: formData.title,
          content: formData.content,
          priority: formData.priority,
          target_audience: formData.targetAudience,
          class_ids: formData.targetAudience === 'specific_classes' ? formData.classIds : [],
          is_published: formData.isPublished,
          published_at: formData.isPublished ? new Date().toISOString() : null,
          expires_at: formData.expiresAt || null,
          author_id: profile?.id,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Announcement created successfully",
      });

      setIsAddDialogOpen(false);
      setFormData({
        title: '',
        content: '',
        priority: 'normal',
        targetAudience: 'all',
        classIds: [],
        isPublished: false,
        expiresAt: '',
      });
      fetchAnnouncements();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create announcement",
        variant: "destructive",
      });
    }
  };

  const togglePublishStatus = async (announcementId: string, currentStatus: boolean) => {
    if (profile?.role !== 'admin' && profile?.role !== 'teacher') {
      toast({
        title: "Access Denied",
        description: "Only administrators and teachers can publish announcements",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('announcements')
        .update({
          is_published: !currentStatus,
          published_at: !currentStatus ? new Date().toISOString() : null,
        })
        .eq('id', announcementId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Announcement ${!currentStatus ? 'published' : 'unpublished'} successfully`,
      });

      fetchAnnouncements();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update announcement status",
        variant: "destructive",
      });
    }
  };

  const handleClassToggle = (classId: string) => {
    setFormData(prev => ({
      ...prev,
      classIds: prev.classIds.includes(classId)
        ? prev.classIds.filter(id => id !== classId)
        : [...prev.classIds, classId]
    }));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'normal':
        return 'bg-blue-100 text-blue-800';
      case 'low':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredAnnouncements = announcements.filter(announcement =>
    announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    announcement.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Announcements</h1>
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
          <h1 className="text-3xl font-bold">Announcements</h1>
          <p className="text-muted-foreground">
            Create and manage school announcements
          </p>
        </div>
        
        {(profile?.role === 'admin' || profile?.role === 'teacher') && (
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Announcement
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Announcement</DialogTitle>
                <DialogDescription>
                  Share important information with students and staff
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddAnnouncement} className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Announcement title..."
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Announcement content..."
                    rows={4}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="targetAudience">Target Audience</Label>
                    <Select value={formData.targetAudience} onValueChange={(value) => setFormData({ ...formData, targetAudience: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Students & Staff</SelectItem>
                        <SelectItem value="students">All Students</SelectItem>
                        <SelectItem value="teachers">All Teachers</SelectItem>
                        <SelectItem value="specific_classes">Specific Classes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {formData.targetAudience === 'specific_classes' && (
                  <div>
                    <Label>Select Classes</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2 max-h-32 overflow-y-auto border rounded p-2">
                      {classes.map((cls) => (
                        <div key={cls.id} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={cls.id}
                            checked={formData.classIds.includes(cls.id)}
                            onChange={() => handleClassToggle(cls.id)}
                            className="rounded"
                          />
                          <Label htmlFor={cls.id} className="text-sm">
                            {cls.name} - Grade {cls.grade_level}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <Label htmlFor="expiresAt">Expires At (Optional)</Label>
                  <Input
                    id="expiresAt"
                    type="datetime-local"
                    value={formData.expiresAt}
                    onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="isPublished"
                    checked={formData.isPublished}
                    onCheckedChange={(checked) => setFormData({ ...formData, isPublished: checked })}
                  />
                  <Label htmlFor="isPublished">Publish immediately</Label>
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Create Announcement</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>School Announcements</CardTitle>
          <CardDescription>
            Manage and view all school announcements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search announcements..."
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
                <TableHead>Title</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAnnouncements.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No announcements found
                  </TableCell>
                </TableRow>
              ) : (
                filteredAnnouncements.map((announcement) => (
                  <TableRow key={announcement.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{announcement.title}</div>
                        <div className="text-sm text-muted-foreground line-clamp-1">
                          {announcement.content}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getPriorityColor(announcement.priority)}>
                        {announcement.priority.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {announcement.target_audience.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {announcement.is_published ? (
                          <Badge className="bg-green-100 text-green-800">Published</Badge>
                        ) : (
                          <Badge variant="secondary">Draft</Badge>
                        )}
                        {(profile?.role === 'admin' || profile?.role === 'teacher') && (
                          <Switch
                            checked={announcement.is_published}
                            onCheckedChange={() => togglePublishStatus(announcement.id, announcement.is_published)}
                          />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {announcement.author.first_name} {announcement.author.last_name}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {new Date(announcement.created_at).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        {(profile?.role === 'admin' || profile?.role === 'teacher') && (
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