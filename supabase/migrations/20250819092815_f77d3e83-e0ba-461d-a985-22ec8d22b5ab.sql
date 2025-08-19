-- Create user roles enum
CREATE TYPE public.user_role AS ENUM ('admin', 'teacher', 'student', 'parent');

-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  email TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'student',
  phone TEXT,
  address TEXT,
  date_of_birth DATE,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create students table
CREATE TABLE public.students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  student_id TEXT NOT NULL UNIQUE,
  class_id UUID,
  admission_date DATE NOT NULL DEFAULT CURRENT_DATE,
  guardian_name TEXT,
  guardian_phone TEXT,
  guardian_email TEXT,
  emergency_contact TEXT,
  blood_group TEXT,
  medical_conditions TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create teachers table
CREATE TABLE public.teachers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  teacher_id TEXT NOT NULL UNIQUE,
  department TEXT,
  qualification TEXT,
  experience_years INTEGER DEFAULT 0,
  salary DECIMAL(10,2),
  joining_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create classes table
CREATE TABLE public.classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  grade_level INTEGER NOT NULL,
  section TEXT NOT NULL DEFAULT 'A',
  class_teacher_id UUID REFERENCES public.teachers(id),
  academic_year TEXT NOT NULL,
  capacity INTEGER DEFAULT 30,
  room_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(name, grade_level, section, academic_year)
);

-- Update students table to reference classes
ALTER TABLE public.students 
ADD CONSTRAINT fk_students_class 
FOREIGN KEY (class_id) REFERENCES public.classes(id);

-- Create subjects table
CREATE TABLE public.subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  grade_levels INTEGER[] NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create class_subjects table (many-to-many relationship)
CREATE TABLE public.class_subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE NOT NULL,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE NOT NULL,
  teacher_id UUID REFERENCES public.teachers(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(class_id, subject_id)
);

-- Create attendance table
CREATE TABLE public.attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'late', 'excused')),
  remarks TEXT,
  marked_by UUID REFERENCES public.teachers(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(student_id, date)
);

-- Create grades table
CREATE TABLE public.grades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE NOT NULL,
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE NOT NULL,
  exam_type TEXT NOT NULL,
  marks_obtained DECIMAL(5,2) NOT NULL,
  total_marks DECIMAL(5,2) NOT NULL,
  grade_letter TEXT,
  exam_date DATE NOT NULL,
  academic_year TEXT NOT NULL,
  semester TEXT DEFAULT '1',
  created_by UUID REFERENCES public.teachers(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create announcements table
CREATE TABLE public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author_id UUID REFERENCES public.profiles(id) NOT NULL,
  target_audience TEXT NOT NULL CHECK (target_audience IN ('all', 'students', 'teachers', 'parents')),
  class_ids UUID[] DEFAULT '{}',
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create assignments table
CREATE TABLE public.assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  subject_id UUID REFERENCES public.subjects(id) NOT NULL,
  class_id UUID REFERENCES public.classes(id) NOT NULL,
  teacher_id UUID REFERENCES public.teachers(id) NOT NULL,
  due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  total_marks DECIMAL(5,2) NOT NULL DEFAULT 100,
  instructions TEXT,
  attachment_urls TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;

-- Create helper function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS user_role
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT role FROM public.profiles WHERE profiles.user_id = $1;
$$;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins and teachers can view all profiles" ON public.profiles
  FOR SELECT USING (public.get_user_role(auth.uid()) IN ('admin', 'teacher'));

-- Create RLS policies for students
CREATE POLICY "Students can view their own data" ON public.students
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = profile_id AND profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins and teachers can view all students" ON public.students
  FOR SELECT USING (public.get_user_role(auth.uid()) IN ('admin', 'teacher'));

CREATE POLICY "Admins can manage students" ON public.students
  FOR ALL USING (public.get_user_role(auth.uid()) = 'admin');

-- Create RLS policies for teachers
CREATE POLICY "Teachers can view their own data" ON public.teachers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = profile_id AND profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage teachers" ON public.teachers
  FOR ALL USING (public.get_user_role(auth.uid()) = 'admin');

-- Create RLS policies for classes
CREATE POLICY "Everyone can view classes" ON public.classes
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage classes" ON public.classes
  FOR ALL USING (public.get_user_role(auth.uid()) = 'admin');

-- Create RLS policies for subjects
CREATE POLICY "Everyone can view subjects" ON public.subjects
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage subjects" ON public.subjects
  FOR ALL USING (public.get_user_role(auth.uid()) = 'admin');

-- Create RLS policies for attendance
CREATE POLICY "Students can view their own attendance" ON public.attendance
  FOR SELECT USING (
    student_id IN (
      SELECT s.id FROM public.students s
      JOIN public.profiles p ON s.profile_id = p.id
      WHERE p.user_id = auth.uid()
    )
  );

CREATE POLICY "Teachers and admins can manage attendance" ON public.attendance
  FOR ALL USING (public.get_user_role(auth.uid()) IN ('admin', 'teacher'));

-- Create RLS policies for grades
CREATE POLICY "Students can view their own grades" ON public.grades
  FOR SELECT USING (
    student_id IN (
      SELECT s.id FROM public.students s
      JOIN public.profiles p ON s.profile_id = p.id
      WHERE p.user_id = auth.uid()
    )
  );

CREATE POLICY "Teachers and admins can manage grades" ON public.grades
  FOR ALL USING (public.get_user_role(auth.uid()) IN ('admin', 'teacher'));

-- Create RLS policies for announcements
CREATE POLICY "Everyone can view published announcements" ON public.announcements
  FOR SELECT USING (is_published = true);

CREATE POLICY "Admins and teachers can manage announcements" ON public.announcements
  FOR ALL USING (public.get_user_role(auth.uid()) IN ('admin', 'teacher'));

-- Create triggers for updated_at columns
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON public.students
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_teachers_updated_at BEFORE UPDATE ON public.teachers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_classes_updated_at BEFORE UPDATE ON public.classes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_subjects_updated_at BEFORE UPDATE ON public.subjects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_grades_updated_at BEFORE UPDATE ON public.grades
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_announcements_updated_at BEFORE UPDATE ON public.announcements
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_assignments_updated_at BEFORE UPDATE ON public.assignments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, first_name, last_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'student')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();