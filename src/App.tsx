import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Students from "./pages/Students";
import { Layout } from "./components/Layout";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
          <Route path="/students" element={<Layout><Students /></Layout>} />
          <Route path="/teachers" element={<Layout><div>Teachers Page - Coming Soon</div></Layout>} />
          <Route path="/classes" element={<Layout><div>Classes Page - Coming Soon</div></Layout>} />
          <Route path="/subjects" element={<Layout><div>Subjects Page - Coming Soon</div></Layout>} />
          <Route path="/attendance" element={<Layout><div>Attendance Page - Coming Soon</div></Layout>} />
          <Route path="/grades" element={<Layout><div>Grades Page - Coming Soon</div></Layout>} />
          <Route path="/reports" element={<Layout><div>Reports Page - Coming Soon</div></Layout>} />
          <Route path="/announcements" element={<Layout><div>Announcements Page - Coming Soon</div></Layout>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
