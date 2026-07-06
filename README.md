# Learning Management System (LMS)

Полноценная платформа онлайн-обучения на основе микросервисной архитектуры.
Backend — Spring Boot 3.3 / Java 21. Frontend — Angular 17 SPA.

> Подробная документация по каждому сервису — в отдельных README:
> [api-gateway](./api-gateway/README.md) · [user-service](./user-service/README.md) · [course-service](./course-service/README.md) · [enrollment-service](./enrollment-service/README.md) · [notification-service](./notification-service/README.md) · [progress-service](./progress-service/README.md) · [media-service](./media-service/README.md) · [assessment-service](./assessment-service/README.md) · [lms-ui](./lms-ui/README.md)

---

## Архитектура

```
Browser (Angular 17, :4200)
        │
        ▼
API Gateway (:8080)          ← единая точка входа, JWT-валидация
        │
        ├── user-service (:8081)         PostgreSQL — пользователи, роли, JWT
        ├── course-service (:8082)       MongoDB — курсы, модули, уроки
        ├── enrollment-service (:8083)   PostgreSQL — записи на курсы
        ├── notification-service (:8084) MongoDB — in-app уведомления
        ├── progress-service (:8085)     MongoDB — прогресс по урокам
        ├── media-service (:8086)        MinIO — видео и файлы
        └── assessment-service (:8087)   MongoDB — квизы и попытки
                │
                └── Kafka события
                        ├── course-enrollments: enrollment-service → progress-service + notification-service
                        └── quiz-passed:        assessment-service → progress-service + notification-service
```

### Принцип аутентификации

1. Клиент отправляет `Authorization: Bearer <JWT>` в Gateway
2. Gateway валидирует токен, извлекает `username`, `roles`, `userId`
3. Gateway **убирает** Authorization-заголовок и добавляет:
   - `X-User-Name: admin1`
   - `X-User-Roles: ROLE_ADMIN`
   - `X-User-Id: 4`
4. Каждый сервис читает эти заголовки через `HeaderAuthenticationFilter`

---

## Инфраструктура

| Контейнер | Образ | Порт | Назначение |
|---|---|---|---|
| `lms-postgres` | postgres:16-alpine | 5432 | Основная БД (пользователи, enrollments) |
| `lms-mongodb` | mongo:latest | 27017 | Документы (курсы, прогресс, квизы, уведомления) |
| `lms-kafka` | confluentinc/cp-kafka:7.5.0 | 29092 | Асинхронные события |
| `lms-minio` | minio/minio | 9000, 9001 | Хранилище медиафайлов |
| `lms-zipkin` | openzipkin/zipkin | 9411 | Распределённая трассировка |
| `lms-loki` | grafana/loki | 3100 | Агрегация логов |
| `lms-grafana` | grafana/grafana | 3000 | Дашборды (логи, метрики) |

### Запуск инфраструктуры

```bash
cd docker
docker compose up -d
```

### Учётные данные инфраструктуры

| Сервис | Логин | Пароль |
|---|---|---|
| PostgreSQL | `lms` | `lms_secret` |
| MongoDB | `lms` | `lms_secret` |
| MinIO | `lms_minio` | `lms_minio_secret` |
| Grafana | `admin` | `admin` |

---

## Базы данных

### PostgreSQL — `lms_db`

Схема управляется **Liquibase** (миграции применяются автоматически при старте).

| Схема | Таблица | Содержимое |
|---|---|---|
| `public` | `users` | Пользователи: `id`, `username`, `email`, `password_hash`, `enabled` |
| `public` | `roles` | Роли: `ROLE_STUDENT`, `ROLE_INSTRUCTOR`, `ROLE_ADMIN` |
| `public` | `user_roles` | Связь пользователь ↔ роль |
| `enrollment` | `enrollments` | Записи на курсы: `user_id`, `course_id`, `status` (ACTIVE/CANCELLED) |

> **Важно:** Liquibase помечает выполненные changesets в таблице `databasechangelog`. После `TRUNCATE` данные надо вставлять вручную — Liquibase не повторяет уже применённые changesets.

### MongoDB

| База | Коллекция | Содержимое |
|---|---|---|
| `lms_courses` | `courses` | Курсы с вложенными модулями и уроками |
| `lms_progress` | `progress` | Прогресс пользователя: статус каждого урока |
| `lms_assessments` | `quizzes` | Квизы, вопросы, варианты ответов |
| `lms_assessments` | `quiz_attempts` | Попытки прохождения квизов |
| `lms_notifications` | `notifications` | In-app уведомления пользователей |

---

## Сервисы

### user-service (:8081)

Регистрация, логин, управление профилем и ролями.

| Метод | Путь | Доступ | Описание |
|---|---|---|---|
| POST | `/api/auth/register` | Публичный | Регистрация (по умолчанию ROLE_STUDENT) |
| POST | `/api/auth/login` | Публичный | Логин → JWT (24 ч) |
| GET | `/api/users/me` | Авторизованный | Свой профиль |
| PUT | `/api/users/me` | Авторизованный | Обновить профиль |
| PUT | `/api/users/me/password` | Авторизованный | Сменить пароль |
| GET | `/api/users` | ROLE_ADMIN | Список пользователей |
| GET | `/api/users/{id}` | ROLE_ADMIN | Пользователь по ID |
| PUT | `/api/users/{id}/roles` | ROLE_ADMIN | Назначить роли |
| PUT | `/api/users/{id}/toggle-enabled` | ROLE_ADMIN | Заблокировать/разблокировать |

Пароли хранятся в BCrypt. JWT содержит `sub` (username), `userId`, `roles`.

---

### course-service (:8082)

Управление каталогом курсов. Курсы хранятся в MongoDB с вложенной структурой: курс → модули → уроки.

| Метод | Путь | Доступ | Описание |
|---|---|---|---|
| GET | `/api/courses` | Авторизованный | Список курсов (пагинация) |
| GET | `/api/courses/{id}` | Авторизованный | Курс по ID |
| POST | `/api/courses` | ROLE_INSTRUCTOR, ROLE_ADMIN | Создать курс |
| PUT | `/api/courses/{id}` | ROLE_INSTRUCTOR, ROLE_ADMIN | Обновить курс |
| DELETE | `/api/courses/{id}` | ROLE_ADMIN | Удалить курс |

**Структура курса в MongoDB:**
```json
{
  "_id": "course-backend",
  "title": "Backend-разработка на Spring Boot 3",
  "instructorId": "instructor1",
  "status": "PUBLISHED",
  "modules": [
    {
      "id": "be-m1",
      "title": "Основы Spring Boot 3",
      "order": 1,
      "lessons": [
        { "id": "be-m1-l1", "title": "...", "order": 1, "durationMinutes": 30 }
      ]
    }
  ]
}
```

---

### enrollment-service (:8083)

Запись пользователей на курсы. После успешной записи публикует событие в Kafka → progress-service создаёт запись прогресса, notification-service отправляет уведомление.

| Метод | Путь | Доступ | Описание |
|---|---|---|---|
| POST | `/api/enrollments/subscribe` | Авторизованный | Записаться на курс |
| GET | `/api/enrollments/user/{userId}` | Авторизованный | Enrollments пользователя |
| GET | `/api/enrollments/course/{courseId}` | Авторизованный | Студенты курса |

**Тело запроса для записи:**
```json
{ "userId": 4, "courseId": "course-backend" }
```

**Kafka-топик:** `course-enrollments` — событие `StudentEnrolledEvent { userId, courseId }`

> **Внимание:** При прямой вставке в таблицу `enrollment.enrollments` (через SQL) Kafka-событие не публикуется. Progress-запись нужно создавать вручную через `/api/progress/init`.

---

### notification-service (:8084)

In-app уведомления. Слушает Kafka-события и сохраняет уведомления в MongoDB. Angular-клиент опрашивает сервис каждые 30 секунд и отображает счётчик на иконке колокольчика.

| Метод | Путь | Доступ | Описание |
|---|---|---|---|
| GET | `/api/notifications` | Авторизованный | Все уведомления текущего пользователя |
| GET | `/api/notifications/unread-count` | Авторизованный | `{ "count": N }` |
| PATCH | `/api/notifications/{id}/read` | Авторизованный | Пометить уведомление прочитанным |
| PATCH | `/api/notifications/read-all` | Авторизованный | Пометить все прочитанными |

**Типы уведомлений:**

| Тип | Триггер | Пример сообщения |
|---|---|---|
| `ENROLLMENT` | Запись на курс (Kafka `course-enrollments`) | "Вы успешно записались на курс ..." |
| `QUIZ_PASSED` | Сдача квиза (Kafka `quiz-passed`) | "Квиз сдан! Результат: 80%" |

---

### progress-service (:8085)

Хранит и обновляет прогресс пользователя по каждому уроку курса.

| Метод | Путь | Доступ | Описание |
|---|---|---|---|
| POST | `/api/progress/init` | Авторизованный | Инициализировать прогресс вручную |
| POST | `/api/progress/complete-lesson` | Авторизованный | Отметить урок выполненным |
| GET | `/api/progress/user/{userId}` | Авторизованный | Весь прогресс пользователя |
| GET | `/api/progress/user/{userId}/course/{courseId}` | Авторизованный | Прогресс по конкретному курсу |

**Структура progress-документа:**
```json
{
  "userId": 4,
  "courseId": "course-backend",
  "status": "IN_PROGRESS",
  "progressPercent": 33.3,
  "totalLessons": 6,
  "lessonProgress": {
    "be-m1-l1": { "status": "COMPLETED", "completedAt": "..." },
    "be-m1-l2": { "status": "NOT_STARTED" }
  }
}
```

**Kafka:** слушает `course-enrollments` (создаёт прогресс) и `quiz-passed` (обновляет статус урока).

---

### media-service (:8086)

Загрузка и раздача медиафайлов через MinIO (S3-совместимое хранилище).

| Метод | Путь | Доступ | Описание |
|---|---|---|---|
| POST | `/api/media/upload` | ROLE_INSTRUCTOR, ROLE_ADMIN | Загрузить файл (multipart) |
| GET | `/api/media/presigned` | Авторизованный | Временная ссылка для скачивания |

Максимальный размер файла: **500 MB**. Файлы хранятся в бакете `lms-media`.

---

### assessment-service (:8087)

Управление квизами и проверка ответов студентов.

**Управление квизами (для инструкторов/админов) — `/api/assessments`:**

| Метод | Путь | Описание |
|---|---|---|
| POST | `/api/assessments` | Создать квиз |
| GET | `/api/assessments/{id}` | Квиз по ID (с правильными ответами) |
| GET | `/api/assessments?courseId=...` | Квизы курса |
| GET | `/api/assessments/by-lesson?lessonId=...` | Квизы урока |
| PUT | `/api/assessments/{id}` | Обновить квиз |
| DELETE | `/api/assessments/{id}` | Удалить квиз |

**Прохождение квизов (для студентов) — `/api/quizzes`:**

| Метод | Путь | Описание |
|---|---|---|
| GET | `/api/quizzes/{id}` | Квиз без правильных ответов |
| POST | `/api/quizzes/{id}/submit` | Отправить ответы и получить результат |

Квиз считается сданным при `percentage >= passingScore` (по умолчанию 70%). При сдаче публикуется событие `quiz-passed` в Kafka.

**Структура квиза:**
```json
{
  "_id": "quiz-backend-m1",
  "courseId": "course-backend",
  "lessonId": "be-m1-l2",
  "passingScore": 70,
  "status": "PUBLISHED",
  "questions": [
    {
      "type": "SINGLE_CHOICE",
      "options": [
        { "id": "a", "text": "...", "isCorrect": true }
      ]
    }
  ]
}
```

---

## Frontend (Angular 17)

**Запуск:**
```bash
cd lms-ui
npm install
ng serve
# Открыть: http://localhost:4200
```

### Страницы и доступ

| Маршрут | Доступ | Описание |
|---|---|---|
| `/login` | Публичный | Форма входа |
| `/register` | Публичный | Регистрация (роль ROLE_STUDENT) |
| `/home` | Авторизованный | Главная: мои курсы с прогрессом |
| `/courses` | Авторизованный | Каталог курсов, запись |
| `/progress/course/:id` | Авторизованный | Просмотр уроков, отметка выполнения |
| `/quiz/:id` | Авторизованный | Прохождение квиза |
| `/profile` | Авторизованный | Профиль, смена пароля |
| `/courses/create` | ROLE_INSTRUCTOR, ROLE_ADMIN | Создание курса |
| `/courses/:id/quizzes` | ROLE_INSTRUCTOR, ROLE_ADMIN | Управление квизами |
| `/admin` | ROLE_ADMIN | Управление пользователями |

### In-app уведомления (колокольчик)

- Иконка колокольчика в хедере показывает количество непрочитанных уведомлений (красный бейдж)
- Список уведомлений открывается по клику, загружается автоматически каждые 30 секунд
- Клик на уведомление → помечается прочитанным
- Кнопка "Прочитать все" — помечает все сразу

### Логика каталога

- `enrolledIds` (Angular-сигнал) — заполняется из **progress-service**, а не из enrollment-service
- Если для enrollment нет progress-записи → курс показывается как "не записан"
- Кнопка **"Записаться"** → `POST /api/enrollments/subscribe` → при успехе переходит на `/progress/course/:id`

---

## Тестовые данные

### Пользователи (все пароли: `password`)

| Логин | Роль | ID |
|---|---|---|
| `admin1` | ROLE_ADMIN | 4 |
| `instructor1` | ROLE_INSTRUCTOR | 1 |
| `instructor2` | ROLE_INSTRUCTOR | 2 |
| `instructor3` | ROLE_INSTRUCTOR | 3 |
| `ivan.ivanov` | ROLE_STUDENT | 5 |
| `anna.smirnova` | ROLE_STUDENT | 6 |
| `sergey.volkov` | ROLE_STUDENT | 7 |
| `kate.novikova` | ROLE_STUDENT | 8 |

### Курсы

| ID | Название | Инструктор | Модули | Уроков |
|---|---|---|---|---|
| `course-backend` | Backend-разработка на Spring Boot 3 | instructor1 | 3 | 6 |
| `course-frontend` | Frontend-разработка на Angular 17 | instructor2 | 3 | 6 |
| `course-qa` | QA-инженерия и тест-автоматизация | instructor3 | 3 | 6 |

### Enrollments (записи на курсы)

| Студент | course-backend | course-frontend | course-qa |
|---|---|---|---|
| admin1 | ✓ | ✓ | — |
| ivan.ivanov | ✓ | — | ✓ |
| anna.smirnova | ✓ | ✓ | — |
| sergey.volkov | — | ✓ | ✓ |
| kate.novikova | ✓ | ✓ | — |

### Квизы (9 штук, по 5 вопросов, проходной балл 70%)

| ID | Курс | Привязан к уроку |
|---|---|---|
| `quiz-backend-m1` / `m2` / `m3` | course-backend | Последний урок каждого модуля |
| `quiz-frontend-m1` / `m2` / `m3` | course-frontend | Последний урок каждого модуля |
| `quiz-qa-m1` / `m2` / `m3` | course-qa | Последний урок каждого модуля |

---

## Seed-скрипты

Скрипты находятся в `docker/`:

| Файл | Назначение |
|---|---|
| `seed_users.sql` | TRUNCATE + 8 пользователей + 3 роли |
| `seed_enrollments.sql` | 10 enrollments |
| `seed_courses_v2.js` | 3 курса в `lms_courses` |
| `seed_quizzes.js` | 9 квизов в `lms_assessments` |
| `seed_progress_all.js` | Progress для всех enrollments в `lms_progress` |

**Полный сброс и заполнение данных:**

```bash
# 1. Пользователи и роли (PostgreSQL)
docker cp docker/seed_users.sql lms-postgres:/tmp/
docker exec lms-postgres psql -U lms -d lms_db -f /tmp/seed_users.sql

# 2. Enrollments (PostgreSQL)
docker cp docker/seed_enrollments.sql lms-postgres:/tmp/
docker exec lms-postgres psql -U lms -d lms_db -f /tmp/seed_enrollments.sql

# 3. Курсы (MongoDB)
docker cp docker/seed_courses_v2.js lms-mongodb:/tmp/
docker exec lms-mongodb mongosh "mongodb://lms:lms_secret@localhost:27017/lms_courses?authSource=admin" /tmp/seed_courses_v2.js

# 4. Квизы (MongoDB)
docker cp docker/seed_quizzes.js lms-mongodb:/tmp/
docker exec lms-mongodb mongosh "mongodb://lms:lms_secret@localhost:27017/lms_assessments?authSource=admin" /tmp/seed_quizzes.js

# 5. Прогресс (MongoDB)
docker cp docker/seed_progress_all.js lms-mongodb:/tmp/
docker exec lms-mongodb mongosh "mongodb://lms:lms_secret@localhost:27017/lms_progress?authSource=admin" /tmp/seed_progress_all.js
```

---

## Запуск сервисов

Каждый сервис — отдельный Spring Boot JAR. Запускать в IntelliJ IDEA или через Maven:

```bash
cd user-service
mvn spring-boot:run
```

**Порядок запуска:**
1. Инфраструктура: `docker compose up -d`
2. `user-service` (:8081)
3. `course-service` (:8082)
4. `enrollment-service` (:8083)
5. `notification-service` (:8084)
6. `progress-service` (:8085)
7. `media-service` (:8086)
8. `assessment-service` (:8087)
9. `api-gateway` (:8080)
10. `lms-ui` — `ng serve`

---

## Известные особенности

### Прогресс создаётся через Kafka

При записи через UI → enrollment-service публикует событие → progress-service создаёт progress. Если Kafka недоступен или сервисы не запущены — progress не создаётся. В этом случае используйте ручную инициализацию:

```bash
curl -X POST "http://localhost:8080/api/progress/init?userId=5&courseId=course-backend" \
  -H "Authorization: Bearer <JWT>"
```

### Статус "записан" в каталоге = наличие progress-записи

Каталог (Angular) показывает "Продолжить" только если есть запись в `lms_progress.progress`. При прямой SQL-вставке в enrollments без соответствующей MongoDB-записи — курс будет показываться как "не записан".

### Ограничения маршрутов Gateway

| Маршрут | Ограничение |
|---|---|
| `POST/PUT/DELETE /api/courses/**` | ROLE_INSTRUCTOR или ROLE_ADMIN |
| `POST /api/quizzes/{id}/submit` | ROLE_STUDENT, ROLE_INSTRUCTOR или ROLE_ADMIN |
| Остальные | Любой аутентифицированный пользователь |

### BCrypt хэш для пароля `password`

```
$2a$10$H7.EG9ksRysXgEm2ZRNGdO3QsBsuDsqXQ0gBVt7xXf2LmViOsLU76
```

Используется во всех seed-скриптах. При добавлении пользователей через API пароль хэшируется автоматически.

---

## Мониторинг

| URL | Сервис |
|---|---|
| http://localhost:9411 | Zipkin — трассировка запросов |
| http://localhost:3000 | Grafana — логи (Loki) и метрики |
| http://localhost:9001 | MinIO Console — управление медиафайлами |
| http://localhost:8080/actuator/gateway | Маршруты API Gateway |
| http://localhost:8081/actuator/health | Health-check user-service |
| http://localhost:8084/actuator/health | Health-check notification-service |
