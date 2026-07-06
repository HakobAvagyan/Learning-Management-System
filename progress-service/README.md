# Progress Service

Микросервис отслеживания прогресса обучения. Инициализирует прогресс при записи на курс, обновляет его при прохождении уроков и квизов, предоставляет API просмотра прогресса.

**Порт:** `8085` · **БД:** MongoDB (`lms_progress`) · **Брокер:** Kafka (consumer) · **Зависимости:** course-service (синхронный REST)

---

## Архитектура пакетов

```
com.lms.progressservice
├── client/     ← CourseServiceClient
├── config/     ← SecurityConfig, MongoConfig, KafkaConsumerConfig
├── controller/ ← ProgressController, GlobalExceptionHandler
├── document/   ← Progress, LessonProgress
├── dto/        ← Request / Response / Event DTO
├── exception/  ← ProgressNotFoundException
├── listener/   ← EnrollmentEventListener, QuizPassedEventListener
├── repository/ ← ProgressRepository
├── security/   ← HeaderAuthenticationFilter
└── service/    ← ProgressService
```

---

## Документы MongoDB

### `Progress`
Коллекция `progress`. Одна запись = прогресс одного студента по одному курсу.

| Поле | Тип | Описание |
|------|-----|----------|
| `id` | String | MongoDB `_id` |
| `userId` | Long | ID студента. Составной уникальный индекс с `courseId` |
| `courseId` | String | ID курса. Составной уникальный индекс с `userId` |
| `status` | `ProgressStatus` | `NOT_STARTED`, `IN_PROGRESS`, `COMPLETED` |
| `lessonProgress` | `Map<String, LessonProgress>` | Ключ = `lessonId`, значение = `LessonProgress` |
| `totalLessons` | int | Общее количество уроков в курсе |
| `progressPercent` | int | Процент завершения (0–100) |
| `startedAt` | Instant | Время начала обучения |
| `lastActivityAt` | Instant | Время последней активности |
| `completedAt` | Instant | Время завершения курса (`null` если не завершён) |

### `LessonProgress`
Embedded в `Progress.lessonProgress`.

| Поле | Тип | Описание |
|------|-----|----------|
| `lessonId` | String | ID урока |
| `moduleId` | String | ID модуля (для группировки) |
| `lessonTitle` | String | Название урока |
| `moduleTitle` | String | Название модуля |
| `order` | int | Порядковый номер урока |
| `status` | `LessonStatus` | `NOT_STARTED`, `IN_PROGRESS`, `COMPLETED` |
| `completedAt` | Instant | Время завершения (`null` если не завершён) |

---

## Репозиторий

### `ProgressRepository`
Расширяет `MongoRepository<Progress, String>`.

| Метод | Описание |
|-------|----------|
| `findByUserIdAndCourseId(userId, courseId)` | Прогресс по конкретному курсу |
| `findByUserId(userId)` | Прогресс по всем курсам пользователя |
| `existsByUserIdAndCourseId(userId, courseId)` | Проверка идемпотентности при инициализации |

---

## Сервис

### `ProgressService`

**`initializeProgress(userId, courseId)`:**
1. Если запись уже существует — возвращает существующую (идемпотентно)
2. Вызывает `CourseServiceClient.getCourse(courseId)` — получает структуру курса
3. Строит `Map<lessonId, LessonProgress>` из всех модулей и уроков курса
4. Сохраняет документ `Progress` в MongoDB со статусом `NOT_STARTED`

**`completeLesson(userId, courseId, lessonId)`:**
1. Загружает `Progress`, кидает `ProgressNotFoundException` если не найден
2. Находит `LessonProgress` по `lessonId`, устанавливает статус `COMPLETED`, записывает `completedAt`
3. Пересчитывает `progressPercent = завершённые / totalLessons * 100`
4. Если все уроки завершены — переводит статус курса в `COMPLETED` и записывает `completedAt`
5. Иначе — статус `IN_PROGRESS`
6. Сохраняет обновлённый документ

**`getProgress(userId, courseId)`** — получить прогресс по одному курсу.  
**`getAllProgressForUser(userId)`** — прогресс по всем курсам.

---

## Kafka Listeners

### `EnrollmentEventListener`
Топик `course-enrollments`, группа `progress-service`.

Вызывает `progressService.initializeProgress(userId, courseId)` после получения `StudentEnrolledEvent`. Ручное подтверждение.

### `QuizPassedEventListener`
Топик `quiz-passed`, группа `progress-service-quiz`.

При успешной сдаче квиза вызывает `progressService.completeLesson(userId, courseId, lessonId)`. Таким образом сдача квиза автоматически отмечает урок пройденным.

### `KafkaConsumerConfig`
Два независимых `ConsumerFactory` — один для `StudentEnrolledEvent`, один для `QuizPassedEvent`. Оба: `MANUAL_IMMEDIATE` ack, `FixedBackOff(2000ms, 3 попытки)`.

---

## REST-клиент

### `CourseServiceClient`
Spring `RestClient` (синхронный HTTP). Вызывает `course-service` для получения структуры курса при инициализации прогресса.

| Метод | Описание |
|-------|----------|
| `getCourse(courseId)` | `GET http://localhost:8082/api/courses/{courseId}` → `CourseStructureDto` |

При HTTP 4xx — кидает `CourseNotFoundException`. При 5xx — `RuntimeException`.

---

## Контроллер

### `ProgressController` — `/api/progress`

| Метод | Путь | Описание |
|-------|------|----------|
| `POST` | `/api/progress/init?userId=&courseId=` | Инициализировать прогресс вручную (идемпотентно) |
| `POST` | `/api/progress/complete-lesson` | Отметить урок завершённым |
| `GET` | `/api/progress/user/{userId}/course/{courseId}` | Прогресс по одному курсу |
| `GET` | `/api/progress/user/{userId}` | Прогресс по всем курсам |

### `GlobalExceptionHandler`

| Исключение | HTTP | Описание |
|------------|------|----------|
| `ProgressNotFoundException` | 404 | Прогресс не найден для userId + courseId |
| `MethodArgumentNotValidException` | 400 | Ошибки валидации запроса |

---

## DTO

| Класс | Направление | Описание |
|-------|-------------|----------|
| `CompleteLessonRequest` | Запрос | `userId`, `courseId`, `lessonId` — все обязательны |
| `ProgressResponse` | Ответ | `id`, `userId`, `courseId`, `status`, `completedLessonsCount`, `totalLessons`, `progressPercent`, `lessonProgress` (Map), временные метки |
| `CourseStructureDto` | Внутренний | Структура ответа course-service: `id`, `title`, список `ModuleDto` с `LessonDto` |
| `StudentEnrolledEvent` | Kafka (входящий) | `enrollmentId`, `userId`, `courseId`, `enrolledAt`, `occurredAt` |
| `QuizPassedEvent` | Kafka (входящий) | `userId`, `courseId`, `lessonId`, `quizId`, `score`, `maxScore`, `percentage`, `occurredAt` |

---

## Безопасность

### `HeaderAuthenticationFilter`
Стандартный паттерн: читает `X-User-Name` и `X-User-Roles` из заголовков Gateway.

### `SecurityConfig`
Stateless. Actuator открыт, всё остальное требует аутентификации. `@EnableMethodSecurity` включён.

---

## Конфигурация

### `MongoConfig`
Включает `@EnableMongoAuditing`.

---

## Поток прогресса

```
enrollment-service                    assessment-service
       │ course-enrollments                  │ quiz-passed
       ▼                                     ▼
EnrollmentEventListener         QuizPassedEventListener
       │                                     │
       ▼                                     ▼
initializeProgress()                completeLesson()
  ├─ CourseServiceClient → course-service (REST)
  └─ ProgressRepository.save() → MongoDB
                                         │
                                         ▼
                               ProgressRepository.save() → MongoDB
                               (пересчёт % + статус курса)
```
