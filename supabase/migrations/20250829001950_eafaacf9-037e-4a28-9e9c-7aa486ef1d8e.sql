-- Insert sample profiles (these would normally be created when users sign up)
INSERT INTO public.profiles (id, user_id, email, first_name, last_name, role, phone, address, date_of_birth) VALUES
('11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'admin@school.edu', 'Sarah', 'Johnson', 'admin', '+1-555-0101', '123 Admin St, City, State', '1980-05-15'),
('22222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'teacher1@school.edu', 'Michael', 'Brown', 'teacher', '+1-555-0102', '456 Teacher Ave, City, State', '1985-08-20'),
('33333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', 'teacher2@school.edu', 'Emily', 'Davis', 'teacher', '+1-555-0103', '789 Educator Rd, City, State', '1982-12-10'),
('44444444-4444-4444-4444-444444444444', '44444444-4444-4444-4444-444444444444', 'teacher3@school.edu', 'Robert', 'Wilson', 'teacher', '+1-555-0104', '321 Faculty St, City, State', '1978-03-25'),
('55555555-5555-5555-5555-555555555555', '55555555-5555-5555-5555-555555555555', 'student1@school.edu', 'Alex', 'Smith', 'student', '+1-555-0105', '555 Student Ln, City, State', '2008-01-15'),
('66666666-6666-6666-6666-666666666666', '66666666-6666-6666-6666-666666666666', 'student2@school.edu', 'Emma', 'Johnson', 'student', '+1-555-0106', '666 Learning Way, City, State', '2007-09-20'),
('77777777-7777-7777-7777-777777777777', '77777777-7777-7777-7777-777777777777', 'student3@school.edu', 'James', 'Williams', 'student', '+1-555-0107', '777 Scholar St, City, State', '2008-04-10'),
('88888888-8888-8888-8888-888888888888', '88888888-8888-8888-8888-888888888888', 'student4@school.edu', 'Olivia', 'Brown', 'student', '+1-555-0108', '888 Academy Ave, City, State', '2007-11-05'),
('99999999-9999-9999-9999-999999999999', '99999999-9999-9999-9999-999999999999', 'parent1@school.edu', 'David', 'Smith', 'parent', '+1-555-0109', '555 Student Ln, City, State', '1975-06-30');

-- Insert sample subjects
INSERT INTO public.subjects (id, name, code, description, grade_levels) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Mathematics', 'MATH', 'Core mathematics curriculum covering algebra, geometry, and statistics', ARRAY[6, 7, 8, 9, 10, 11, 12]),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'English Language Arts', 'ELA', 'Reading, writing, literature, and communication skills', ARRAY[6, 7, 8, 9, 10, 11, 12]),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Science', 'SCI', 'General science, biology, chemistry, and physics', ARRAY[6, 7, 8, 9, 10, 11, 12]),
('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Social Studies', 'SS', 'History, geography, civics, and cultural studies', ARRAY[6, 7, 8, 9, 10, 11, 12]),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Physical Education', 'PE', 'Physical fitness, sports, and health education', ARRAY[6, 7, 8, 9, 10, 11, 12]),
('ffffffff-ffff-ffff-ffff-ffffffffffff', 'Art', 'ART', 'Visual arts, drawing, painting, and creative expression', ARRAY[6, 7, 8, 9, 10, 11, 12]),
('gggggggg-gggg-gggg-gggg-gggggggggggg', 'Music', 'MUS', 'Vocal and instrumental music education', ARRAY[6, 7, 8, 9, 10, 11, 12]),
('hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh', 'Computer Science', 'CS', 'Programming, digital literacy, and technology skills', ARRAY[9, 10, 11, 12]);

-- Insert sample classes
INSERT INTO public.classes (id, name, grade_level, section, academic_year, room_number, capacity, class_teacher_id) VALUES
('c1111111-1111-1111-1111-111111111111', 'Grade 6A', 6, 'A', '2024-25', '101', 25, '22222222-2222-2222-2222-222222222222'),
('c2222222-2222-2222-2222-222222222222', 'Grade 7A', 7, 'A', '2024-25', '102', 25, '33333333-3333-3333-3333-333333333333'),
('c3333333-3333-3333-3333-333333333333', 'Grade 8A', 8, 'A', '2024-25', '103', 25, '44444444-4444-4444-4444-444444444444'),
('c4444444-4444-4444-4444-444444444444', 'Grade 9A', 9, 'A', '2024-25', '201', 30, '22222222-2222-2222-2222-222222222222'),
('c5555555-5555-5555-5555-555555555555', 'Grade 10A', 10, 'A', '2024-25', '202', 30, '33333333-3333-3333-3333-333333333333');

-- Insert sample teachers
INSERT INTO public.teachers (id, profile_id, teacher_id, department, qualification, joining_date, experience_years, salary) VALUES
('t1111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'TCH001', 'Mathematics', 'M.Ed Mathematics', '2020-08-15', 4, 55000),
('t2222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', 'TCH002', 'English', 'M.A English Literature', '2019-07-01', 5, 58000),
('t3333333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444', 'TCH003', 'Science', 'M.Sc Physics', '2018-06-20', 6, 60000);

-- Insert sample students
INSERT INTO public.students (id, profile_id, student_id, class_id, guardian_name, guardian_phone, guardian_email, emergency_contact, blood_group, medical_conditions, admission_date) VALUES
('s1111111-1111-1111-1111-111111111111', '55555555-5555-5555-5555-555555555555', 'STU001', 'c1111111-1111-1111-1111-111111111111', 'David Smith', '+1-555-0109', 'parent1@school.edu', '+1-555-0110', 'A+', 'None', '2024-08-01'),
('s2222222-2222-2222-2222-222222222222', '66666666-6666-6666-6666-666666666666', 'STU002', 'c2222222-2222-2222-2222-222222222222', 'Mary Johnson', '+1-555-0111', 'mary.johnson@email.com', '+1-555-0112', 'B+', 'Asthma', '2024-08-01'),
('s3333333-3333-3333-3333-333333333333', '77777777-7777-7777-7777-777777777777', 'STU003', 'c3333333-3333-3333-3333-333333333333', 'John Williams', '+1-555-0113', 'john.williams@email.com', '+1-555-0114', 'O+', 'None', '2024-08-01'),
('s4444444-4444-4444-4444-444444444444', '88888888-8888-8888-8888-888888888888', 'STU004', 'c4444444-4444-4444-4444-444444444444', 'Lisa Brown', '+1-555-0115', 'lisa.brown@email.com', '+1-555-0116', 'AB-', 'Diabetes', '2024-08-01');

-- Insert sample class subjects (linking classes to subjects with teachers)
INSERT INTO public.class_subjects (id, class_id, subject_id, teacher_id) VALUES
('cs111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 't1111111-1111-1111-1111-111111111111'),
('cs222222-2222-2222-2222-222222222222', 'c1111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 't2222222-2222-2222-2222-222222222222'),
('cs333333-3333-3333-3333-333333333333', 'c1111111-1111-1111-1111-111111111111', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 't3333333-3333-3333-3333-333333333333'),
('cs444444-4444-4444-4444-444444444444', 'c2222222-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 't1111111-1111-1111-1111-111111111111'),
('cs555555-5555-5555-5555-555555555555', 'c2222222-2222-2222-2222-222222222222', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 't2222222-2222-2222-2222-222222222222'),
('cs666666-6666-6666-6666-666666666666', 'c3333333-3333-3333-3333-333333333333', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 't3333333-3333-3333-3333-333333333333');

-- Insert sample attendance records
INSERT INTO public.attendance (id, student_id, class_id, date, status, marked_by, remarks) VALUES
('a1111111-1111-1111-1111-111111111111', 's1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', '2024-01-15', 'present', 't1111111-1111-1111-1111-111111111111', NULL),
('a2222222-2222-2222-2222-222222222222', 's2222222-2222-2222-2222-222222222222', 'c2222222-2222-2222-2222-222222222222', '2024-01-15', 'present', 't2222222-2222-2222-2222-222222222222', NULL),
('a3333333-3333-3333-3333-333333333333', 's3333333-3333-3333-3333-333333333333', 'c3333333-3333-3333-3333-333333333333', '2024-01-15', 'absent', 't3333333-3333-3333-3333-333333333333', 'Sick leave'),
('a4444444-4444-4444-4444-444444444444', 's1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', '2024-01-16', 'present', 't1111111-1111-1111-1111-111111111111', NULL),
('a5555555-5555-5555-5555-555555555555', 's2222222-2222-2222-2222-222222222222', 'c2222222-2222-2222-2222-222222222222', '2024-01-16', 'late', 't2222222-2222-2222-2222-222222222222', 'Arrived 30 minutes late');

-- Insert sample grades
INSERT INTO public.grades (id, student_id, class_id, subject_id, exam_type, exam_date, marks_obtained, total_marks, grade_letter, semester, academic_year, created_by) VALUES
('g1111111-1111-1111-1111-111111111111', 's1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Midterm', '2024-01-20', 85, 100, 'A', '1', '2024-25', 't1111111-1111-1111-1111-111111111111'),
('g2222222-2222-2222-2222-222222222222', 's1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Midterm', '2024-01-22', 78, 100, 'B+', '1', '2024-25', 't2222222-2222-2222-2222-222222222222'),
('g3333333-3333-3333-3333-333333333333', 's2222222-2222-2222-2222-222222222222', 'c2222222-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Midterm', '2024-01-20', 92, 100, 'A+', '1', '2024-25', 't1111111-1111-1111-1111-111111111111'),
('g4444444-4444-4444-4444-444444444444', 's3333333-3333-3333-3333-333333333333', 'c3333333-3333-3333-3333-333333333333', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Quiz', '2024-01-18', 45, 50, 'A', '1', '2024-25', 't3333333-3333-3333-3333-333333333333');

-- Insert sample assignments
INSERT INTO public.assignments (id, title, description, instructions, class_id, subject_id, teacher_id, due_date, total_marks, attachment_urls) VALUES
('as111111-1111-1111-1111-111111111111', 'Algebra Basics', 'Complete exercises on linear equations and inequalities', 'Solve problems 1-20 from Chapter 5. Show all work and explain your reasoning.', 'c1111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 't1111111-1111-1111-1111-111111111111', '2024-02-01 23:59:00+00', 50, NULL),
('as222222-2222-2222-2222-222222222222', 'Essay on Climate Change', 'Write a 500-word essay on the effects of climate change', 'Include at least 3 sources and proper citations. Focus on local environmental impacts.', 'c2222222-2222-2222-2222-222222222222', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 't2222222-2222-2222-2222-222222222222', '2024-02-05 23:59:00+00', 100, NULL),
('as333333-3333-3333-3333-333333333333', 'Science Lab Report', 'Document your observations from the plant growth experiment', 'Include hypothesis, methodology, observations, and conclusions.', 'c3333333-3333-3333-3333-333333333333', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 't3333333-3333-3333-3333-333333333333', '2024-02-10 23:59:00+00', 75, NULL);

-- Insert sample announcements
INSERT INTO public.announcements (id, title, content, target_audience, priority, author_id, is_published, published_at, expires_at, class_ids) VALUES
('an111111-1111-1111-1111-111111111111', 'Parent-Teacher Conference', 'Parent-teacher conferences will be held on February 15-16, 2024. Please schedule your appointment through the school portal.', 'parents', 'high', '11111111-1111-1111-1111-111111111111', true, '2024-01-10 09:00:00+00', '2024-02-16 23:59:00+00', ARRAY['c1111111-1111-1111-1111-111111111111', 'c2222222-2222-2222-2222-222222222222']::uuid[]),
('an222222-2222-2222-2222-222222222222', 'Science Fair Registration', 'Registration is now open for the annual science fair. Students can submit their project proposals until January 31st.', 'students', 'normal', '11111111-1111-1111-1111-111111111111', true, '2024-01-05 10:00:00+00', '2024-01-31 23:59:00+00', ARRAY['c3333333-3333-3333-3333-333333333333', 'c4444444-4444-4444-4444-444444444444']::uuid[]),
('an333333-3333-3333-3333-333333333333', 'Winter Break Schedule', 'Winter break will be from December 20, 2024 to January 8, 2025. Classes will resume on January 9, 2025.', 'all', 'normal', '11111111-1111-1111-1111-111111111111', true, '2024-01-01 08:00:00+00', '2025-01-09 08:00:00+00', NULL),
('an444444-4444-4444-4444-444444444444', 'New Library Books', 'The library has received 50 new books across various subjects. Come check them out!', 'students', 'low', '22222222-2222-2222-2222-222222222222', true, '2024-01-12 14:00:00+00', '2024-02-12 23:59:00+00', NULL);