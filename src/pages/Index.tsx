import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { GraduationCap } from 'lucide-react';

const Index = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
      <div className="text-center max-w-2xl mx-auto p-8">
        <div className="flex justify-center mb-8">
          <div className="p-4 bg-primary text-primary-foreground rounded-full">
            <GraduationCap className="h-12 w-12" />
          </div>
        </div>
        
        <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
          EduManage System
        </h1>
        
        <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
          Complete school management solution for students, teachers, and administrators. 
          Streamline attendance, grades, announcements, and more.
        </p>
        
        <div className="flex gap-4 justify-center">
          <Button size="lg" asChild>
            <a href="/auth">Get Started</a>
          </Button>
          <Button variant="outline" size="lg">
            Learn More
          </Button>
        </div>
        
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          <div className="p-6 bg-card rounded-lg border">
            <h3 className="font-semibold text-lg mb-2">Student Management</h3>
            <p className="text-muted-foreground text-sm">
              Comprehensive student profiles, enrollment tracking, and academic progress monitoring.
            </p>
          </div>
          <div className="p-6 bg-card rounded-lg border">
            <h3 className="font-semibold text-lg mb-2">Grade Tracking</h3>
            <p className="text-muted-foreground text-sm">
              Automated grade calculation, report generation, and progress analytics.
            </p>
          </div>
          <div className="p-6 bg-card rounded-lg border">
            <h3 className="font-semibold text-lg mb-2">Communication</h3>
            <p className="text-muted-foreground text-sm">
              Instant announcements, notifications, and seamless school-wide communication.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
