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
INSERT INTO public.classes (id, name, grade_level, section, academic_year, room_number, capacity) VALUES
('c1111111-1111-1111-1111-111111111111', 'Grade 6A', 6, 'A', '2024-25', '101', 25),
('c2222222-2222-2222-2222-222222222222', 'Grade 7A', 7, 'A', '2024-25', '102', 25),
('c3333333-3333-3333-3333-333333333333', 'Grade 8A', 8, 'A', '2024-25', '103', 25),
('c4444444-4444-4444-4444-444444444444', 'Grade 9A', 9, 'A', '2024-25', '201', 30),
('c5555555-5555-5555-5555-555555555555', 'Grade 10A', 10, 'A', '2024-25', '202', 30),
('c6666666-6666-6666-6666-666666666666', 'Grade 6B', 6, 'B', '2024-25', '104', 25),
('c7777777-7777-7777-7777-777777777777', 'Grade 7B', 7, 'B', '2024-25', '105', 25);

-- Insert sample announcements (simplified without user references)
INSERT INTO public.announcements (id, title, content, target_audience, priority, author_id, is_published, published_at, expires_at) VALUES
('an111111-1111-1111-1111-111111111111', 'Parent-Teacher Conference', 'Parent-teacher conferences will be held on February 15-16, 2024. Please schedule your appointment through the school portal.', 'parents', 'high', '11111111-1111-1111-1111-111111111111', true, '2024-01-10 09:00:00+00', '2024-02-16 23:59:00+00'),
('an222222-2222-2222-2222-222222222222', 'Science Fair Registration', 'Registration is now open for the annual science fair. Students can submit their project proposals until January 31st.', 'students', 'normal', '11111111-1111-1111-1111-111111111111', true, '2024-01-05 10:00:00+00', '2024-01-31 23:59:00+00'),
('an333333-3333-3333-3333-333333333333', 'Winter Break Schedule', 'Winter break will be from December 20, 2024 to January 8, 2025. Classes will resume on January 9, 2025.', 'all', 'normal', '11111111-1111-1111-1111-111111111111', true, '2024-01-01 08:00:00+00', '2025-01-09 08:00:00+00'),
('an444444-4444-4444-4444-444444444444', 'New Library Books', 'The library has received 50 new books across various subjects. Come check them out!', 'students', 'low', '22222222-2222-2222-2222-222222222222', true, '2024-01-12 14:00:00+00', '2024-02-12 23:59:00+00'),
('an555555-5555-5555-5555-555555555555', 'School Sports Day', 'Annual sports day will be held on March 15th. All students are encouraged to participate in various athletic events.', 'students', 'normal', '11111111-1111-1111-1111-111111111111', true, '2024-02-01 08:00:00+00', '2024-03-15 18:00:00+00');