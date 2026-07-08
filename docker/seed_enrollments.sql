
INSERT INTO enrollment.enrollments (user_id, course_id, status, enrolled_at, updated_at)
SELECT u.id, e.course_id, 'ACTIVE', NOW(), NOW()
FROM public.users u
JOIN (VALUES
    ('admin1',        'course-backend'),
    ('admin1',        'course-frontend'),
    ('ivan.ivanov',   'course-backend'),
    ('ivan.ivanov',   'course-qa'),
    ('anna.smirnova', 'course-backend'),
    ('anna.smirnova', 'course-frontend'),
    ('sergey.volkov', 'course-frontend'),
    ('sergey.volkov', 'course-qa'),
    ('kate.novikova', 'course-backend'),
    ('kate.novikova', 'course-qa')
) AS e(username, course_id) ON u.username = e.username;

SELECT u.id AS user_id, u.username, e.course_id, e.status
FROM enrollment.enrollments e
JOIN public.users u ON e.user_id = u.id
ORDER BY u.id, e.course_id;