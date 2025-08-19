-- Fix security issues from linter

-- Add missing RLS policies for class_subjects
CREATE POLICY "Everyone can view class subjects" ON public.class_subjects
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage class subjects" ON public.class_subjects
  FOR ALL USING (public.get_user_role(auth.uid()) = 'admin');

-- Add missing RLS policies for assignments
CREATE POLICY "Students can view their class assignments" ON public.assignments
  FOR SELECT USING (
    class_id IN (
      SELECT s.class_id FROM public.students s
      JOIN public.profiles p ON s.profile_id = p.id
      WHERE p.user_id = auth.uid() AND s.class_id IS NOT NULL
    )
  );

CREATE POLICY "Teachers and admins can manage assignments" ON public.assignments
  FOR ALL USING (public.get_user_role(auth.uid()) IN ('admin', 'teacher'));

-- Fix function search paths
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS user_role
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE profiles.user_id = $1;
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
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
$$;