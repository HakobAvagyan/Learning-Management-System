# Course Service

Микросервис управления курсами. Хранит структуру курсов (модули и уроки), предоставляет CRUD для инструкторов и публичный просмотр для студентов.

**Порт:** `8082` · **БД:** MongoDB (`lms_courses`, коллекция `courses`) · **Брокер:** нет

---

## Архитектура пакетов

```
com.lms.courseservice
├── config/      ← SecurityConfig, MongoConfig, DataInitializer
├── controller/  ← CourseController, GlobalExceptionHandler
├── document/    ← Course, Module, Lesson
├── dto/         ← Request / Response DTO
├── exception/   ← CourseNotFoundException
├── mapper/      ← CourseMapper
├── repository/  ← CourseRepository
├── security/    ← HeaderAuthenticationFilter
└── service/     ← CourseService
```

---

## Документы MongoDB

### `Course`
Коллекция `courses`. Корневой документ курса.

| Поле | Тип | Описание |
|------|-----|----------|
| `id` | String | MongoDB `_id` |
| `title` | String | Название курса |
| `description` | String | Описание |
| `instructorId` | String | ID инструктора (индекс) |
| `category` | String | Категория (индекс) |
| `status` | `CourseStatus` | `DRAFT`, `PUBLISHED`, `ARCHIVED` |
| `modules` | `List<Module>` | Список модулей (embedded) |
| `createdAt` / `updatedAt` | Instant | `@CreatedDate` / `@LastModifiedDate` |

### `Module`
Embedded subdocument в `Course.modules`.

| Поле | Тип | Описание |
|------|-----|----------|
| `id` | String | UUID, генерируется в `CourseMapper` |
| `title` | String | Название модуля |
| `description` | String | Описание |
| `order` | int | Порядок отображения |
| `lessons` | `List<Lesson>` | Уроки модуля (embedded) |

### `Lesson`
Embedded subdocument в `Module.lessons`.

| Поле | Тип | Описание |
|------|-----|----------|
| `id` | String | UUID, генерируется в `CourseMapper` |
| `title` | String | Название урока |
| `content` | String | Текстовое содержимое |
| `videoUrl` | String | Ссылка на видео (необязательно) |
| `attachmentUrls` | `List<String>` | Список вложений |
| `durationMinutes` | int | Продолжительность в минутах |
| `order` | int | Порядок отображения |

---

## Репозиторий

### `CourseRepository`
Расширяет `MongoRepository<Course, String>`.

| Метод | Описание |
|-------|----------|
| `findByStatus(status, pageable)` | Курсы по статусу с пагинацией |
| `findByInstructorId(instructorId, pageable)` | Курсы конкретного инструктора |
| `findByCategory(category, pageable)` | Курсы по категории |

---

## Сервис

### `CourseService`
Вся бизнес-логика.

| Метод | Описание |
|-------|----------|
| `findAll(pageable)` | Все курсы с пагинацией |
| `findByStatus(status, pageable)` | Фильтр по статусу |
| `findByInstructor(instructorId, pageable)` | Курсы инструктора |
| `findById(id)` | Один курс по ID (404 если не найден) |
| `create(request, instructorId)` | Создать курс через `CourseMapper` |
| `update(id, request)` | Обновить поля существующего курса |
| `delete(id)` | Удалить курс (404 если не найден) |

---

## Маппер

### `CourseMapper`
Spring `@Component`. Отвечает за преобразование между слоями.

| Метод | Описание |
|-------|----------|
| `toDocument(request, instructorId)` | `CourseRequest` → `Course`. **UUID генерируются здесь** для каждого `Module` и `Lesson` |
| `updateDocument(course, request)` | Обновляет поля документа для PUT-запроса |
| `toResponse(course)` | `Course` → `CourseResponse` (включает все вложенные объекты) |

---

## Контроллер

### `CourseController` — `/api/courses`

| Метод | Путь | Роли | Описание |
|-------|------|------|----------|
| `GET` | `/api/courses` | Открыто | Список курсов. Query params: `status`, `instructorId`, pageable |
| `GET` | `/api/courses/{id}` | Открыто | Один курс по ID |
| `POST` | `/api/courses` | INSTRUCTOR, ADMIN | Создать курс |
| `PUT` | `/api/courses/{id}` | INSTRUCTOR, ADMIN | Обновить курс |
| `DELETE` | `/api/courses/{id}` | ADMIN | Удалить курс |

### `GlobalExceptionHandler`

| Исключение | HTTP | Описание |
|------------|------|----------|
| `CourseNotFoundException` | 404 | Курс не найден |
| `AccessDeniedException` | 403 | Недостаточно прав |
| `MethodArgumentNotValidException` | 400 | Ошибки валидации полей |

---

## DTO

| Класс | Направление | Описание |
|-------|-------------|----------|
| `CourseRequest` | Запрос | `title`, `description`, `instructorId`, `category`, `status`, `modules` |
| `ModuleRequest` | Запрос | `title`, `description`, `order`, `lessons` |
| `LessonRequest` | Запрос | `title`, `content`, `videoUrl`, `attachmentUrls`, `durationMinutes`, `order` |
| `CourseResponse` | Ответ | Полный курс: `id`, все поля + `createdAt`, `updatedAt`, вложенные модули |
| `ModuleResponse` | Ответ | `id`, `title`, `description`, `order`, список уроков |
| `LessonResponse` | Ответ | Все поля урока включая `id` |

---

## Безопасность

### `HeaderAuthenticationFilter`
Тот же паттерн, что во всех downstream-сервисах: читает `X-User-Name` и `X-User-Roles` из заголовков Gateway, создаёт `UsernamePasswordAuthenticationToken` в `SecurityContextHolder`.

### `SecurityConfig`
`@EnableWebSecurity` + `@EnableMethodSecurity`.

- `GET /api/courses/**` — открыто (`permitAll`)
- `POST`, `PUT`, `DELETE` — требуют INSTRUCTOR или ADMIN (через `@PreAuthorize` в контроллере)

---

## Конфигурация

### `MongoConfig`
Включает `@EnableMongoAuditing` для автозаполнения `@CreatedDate` / `@LastModifiedDate`.

### `DataInitializer`
`ApplicationRunner` — засевает 8 учебных курсов при первом старте, если коллекция `courses` пуста:
- Java Backend (от instructor1)
- Spring Boot Микросервисы (от instructor1)
- Веб-дизайн (от instructor2)
- Микросервисы: углублённо (от instructor1)
- Python для начинающих (от instructor2)
- Алгоритмы и структуры данных (от instructor1)
- React и TypeScript (от instructor2)
- DevOps и CI/CD (от instructor1)

### `CourseNotFoundException`
`RuntimeException`, выбрасывается когда курс не найден по ID. `GlobalExceptionHandler` преобразует в HTTP 404.
