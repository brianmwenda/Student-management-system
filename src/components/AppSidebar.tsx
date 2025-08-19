import { NavLink, useLocation } from "react-router-dom";
import { 
  Home, 
  Users, 
  GraduationCap, 
  BookOpen, 
  Calendar, 
  ClipboardCheck,
  TrendingUp,
  Bell,
  Settings,
  LogOut
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "./ui/button";

const navigationItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Students",
    url: "/students",
    icon: Users,
  },
  {
    title: "Teachers",
    url: "/teachers",
    icon: GraduationCap,
  },
  {
    title: "Classes",
    url: "/classes",
    icon: BookOpen,
  },
  {
    title: "Subjects",
    url: "/subjects",
    icon: BookOpen,
  },
  {
    title: "Attendance",
    url: "/attendance",
    icon: Calendar,
  },
  {
    title: "Grades",
    url: "/grades",
    icon: ClipboardCheck,
  },
  {
    title: "Reports",
    url: "/reports",
    icon: TrendingUp,
  },
  {
    title: "Announcements",
    url: "/announcements",
    icon: Bell,
  }
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const { signOut, profile } = useAuth();
  const currentPath = location.pathname;
  const collapsed = state === "collapsed";

  const isActive = (path: string) => currentPath === path;
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" : "hover:bg-sidebar-accent/50";

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-3 py-2">
          <div className="p-2 bg-primary text-primary-foreground rounded-lg">
            <GraduationCap className="h-5 w-5" />
          </div>
          {!collapsed && (
            <div>
              <h2 className="font-semibold text-sidebar-foreground">EduManage</h2>
              <p className="text-xs text-sidebar-foreground/60">School Management</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavCls}>
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        {!collapsed && profile && (
          <div className="px-3 py-2">
            <p className="text-sm font-medium text-sidebar-foreground">
              {profile.first_name} {profile.last_name}
            </p>
            <p className="text-xs text-sidebar-foreground/60 capitalize">
              {profile.role}
            </p>
          </div>
        )}
        <div className="px-2 pb-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={signOut}
            className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent"
          >
            <LogOut className="h-4 w-4" />
            {!collapsed && <span className="ml-2">Sign Out</span>}
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}