TRUNCATE TABLE
    enrollment.enrollments,
    public.user_roles,
    public.users,
    public.roles
RESTART IDENTITY CASCADE;

INSERT INTO public.roles (name) VALUES
    ('ROLE_STUDENT'),
    ('ROLE_INSTRUCTOR'),
    ('ROLE_ADMIN');

INSERT INTO public.users (username, email, password_hash, first_name, last_name, enabled) VALUES
    ('instructor1', 'aleksei.petrov@lms.ru',   '$2a$10$H7.EG9ksRysXgEm2ZRNGdO3QsBsuDsqXQ0gBVt7xXf2LmViOsLU76', 'Алексей',   'Петров',   true),
    ('instructor2', 'maria.sidorova@lms.ru',   '$2a$10$H7.EG9ksRysXgEm2ZRNGdO3QsBsuDsqXQ0gBVt7xXf2LmViOsLU76', 'Мария',     'Сидорова', true),
    ('instructor3', 'dmitry.kozlov@lms.ru',    '$2a$10$H7.EG9ksRysXgEm2ZRNGdO3QsBsuDsqXQ0gBVt7xXf2LmViOsLU76', 'Дмитрий',   'Козлов',   true),
    ('admin1',      'admin1@lms.ru',            '$2a$10$H7.EG9ksRysXgEm2ZRNGdO3QsBsuDsqXQ0gBVt7xXf2LmViOsLU76', 'Админ',     'Первый',   true),
    ('ivan.ivanov',  'ivan.ivanov@lms.ru',      '$2a$10$H7.EG9ksRysXgEm2ZRNGdO3QsBsuDsqXQ0gBVt7xXf2LmViOsLU76', 'Иван',      'Иванов',   true),
    ('anna.smirnova','anna.smirnova@lms.ru',    '$2a$10$H7.EG9ksRysXgEm2ZRNGdO3QsBsuDsqXQ0gBVt7xXf2LmViOsLU76', 'Анна',      'Смирнова', true),
    ('sergey.volkov','sergey.volkov@lms.ru',    '$2a$10$H7.EG9ksRysXgEm2ZRNGdO3QsBsuDsqXQ0gBVt7xXf2LmViOsLU76', 'Сергей',    'Волков',   true),
    ('kate.novikova','kate.novikova@lms.ru',    '$2a$10$H7.EG9ksRysXgEm2ZRNGdO3QsBsuDsqXQ0gBVt7xXf2LmViOsLU76', 'Екатерина', 'Новикова', true);

INSERT INTO public.user_roles (user_id, role_id)
SELECT u.id, r.id FROM public.users u, public.roles r
WHERE u.username IN ('instructor1','instructor2','instructor3') AND r.name = 'ROLE_INSTRUCTOR';

INSERT INTO public.user_roles (user_id, role_id)
SELECT u.id, r.id FROM public.users u, public.roles r
WHERE u.username = 'admin1' AND r.name = 'ROLE_ADMIN';

INSERT INTO public.user_roles (user_id, role_id)
SELECT u.id, r.id FROM public.users u, public.roles r
WHERE u.username IN ('ivan.ivanov','anna.smirnova','sergey.volkov','kate.novikova')
  AND r.name = 'ROLE_STUDENT';

SELECT u.id, u.username, r.name AS role FROM public.users u
JOIN public.user_roles ur ON u.id = ur.user_id
JOIN public.roles r ON ur.role_id = r.id
ORDER BY u.id;