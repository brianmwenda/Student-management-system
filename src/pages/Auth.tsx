import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap } from 'lucide-react';

export default function Auth() {
  const navigate = useNavigate();

  const handleSignIn = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary text-primary-foreground rounded-full">
              <GraduationCap className="h-8 w-8" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Welcome to EduManage</CardTitle>
          <CardDescription>
            Click below to access the school management system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={handleSignIn}
            className="w-full"
            size="lg"
          >
            Enter Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}