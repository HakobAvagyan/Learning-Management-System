# Assessment Service

Микросервис тестирования (quiz) для платформы LMS. Управляет созданием квизов, приёмом ответов студентов и публикацией результатов в Kafka.

**Порт:** `8087` · **БД:** MongoDB (`lms_assessments`) · **Брокер:** Kafka

---

## Архитектура пакетов

```
com.lms.assessmentservice
├── config/          ← SecurityConfig, MongoConfig
├── controller/      ← AssessmentController, QuizStudentController, GlobalExceptionHandler
├── document/        ← Quiz, Question, Option, QuizAttempt, AnswerRecord
├── dto/             ← Request/Response/Event DTO
├── exception/       ← QuizNotFoundException
├── mapper/          ← QuizMapper
├── repository/      ← QuizRepository, QuizAttemptRepository
├── security/        ← HeaderAuthenticationFilter
└── service/         ← AssessmentService
```

---

## Документы MongoDB

### `Quiz`
Коллекция `quizzes`. Корневой документ квиза.

| Поле | Тип | Описание |
|------|-----|----------|
| `id` | String | MongoDB `_id`, генерируется автоматически |
| `courseId` | String | ID курса, к которому привязан квиз (индекс) |
| `lessonId` | String | ID урока (индекс, может быть `null`) |
| `title` | String | Название квиза |
| `description` | String | Описание (необязательно) |
| `questions` | `List<Question>` | Список вопросов (embedded subdocuments) |
| `timeLimitMinutes` | Integer | Лимит времени; `null` = без ограничений |
| `passingScore` | int | Проходной балл в % (по умолчанию 70) |
| `status` | `QuizStatus` | `DRAFT` или `PUBLISHED` |
| `createdBy` | String | Username инструктора (индекс) |
| `createdAt` / `updatedAt` | Instant | Проставляются автоматически через `@CreatedDate` / `@LastModifiedDate` |

---

### `Question`
Embedded subdocument внутри `Quiz.questions`.

| Поле | Тип | Описание |
|------|-----|----------|
| `id` | String | UUID, аннотирован `@Field("id")` — **критично** |
| `text` | String | Текст вопроса |
| `type` | `QuestionType` | `SINGLE_CHOICE` или `MULTIPLE_CHOICE` |
| `options` | `List<Option>` | Список вариантов ответа |
| `order` | int | Порядковый номер вопроса |
| `points` | int | Баллы за правильный ответ (по умолчанию 1) |

> **Почему `@Field("id")`?** Spring Data MongoDB по умолчанию маппит поле с именем `id` на `_id` даже в embedded-классах. Из-за этого при чтении из MongoDB поле возвращало `null`, что приводило к `IllegalStateException: Duplicate key null` в `Collectors.toMap()` и в итоге к HTTP 403. Аннотация `@Field("id")` отключает этот маппинг.

---

### `Option`
Embedded subdocument внутри `Question.options`.

| Поле | Тип | Описание |
|------|-----|----------|
| `id` | String | UUID, `@Field("id")` — та же причина, что у `Question.id` |
| `text` | String | Текст варианта ответа |
| `correct` | boolean | `true` = правильный вариант; сериализуется как `isCorrect` в JSON |

---

### `QuizAttempt`
Коллекция `quiz_attempts`. Одна запись = одна попытка сдачи квиза.

| Поле | Тип | Описание |
|------|-----|----------|
| `id` | String | MongoDB `_id` |
| `quizId` | String | Ссылка на квиз (индекс) |
| `studentId` | String | Username студента из заголовка `X-User-Name` (индекс) |
| `courseId` | String | ID курса |
| `earnedPoints` | int | Набранные баллы |
| `totalPoints` | int | Максимум баллов |
| `percentage` | int | Процент (0–100) |
| `passed` | boolean | `true` если `percentage >= passingScore` |
| `answers` | `List<AnswerRecord>` | Детализация по каждому вопросу |
| `submittedAt` | Instant | Время отправки — `@CreatedDate` |

---

### `AnswerRecord`
Embedded subdocument внутри `QuizAttempt.answers`. Хранит итог по одному вопросу.

| Поле | Тип | Описание |
|------|-----|----------|
| `questionId` | String | ID вопроса |
| `selectedOptionIds` | `List<String>` | Выбранные студентом варианты |
| `correct` | boolean | Засчитан ли ответ |
| `pointsEarned` | int | Баллы за этот вопрос |

---

## Репозитории

### `QuizRepository`
Расширяет `MongoRepository<Quiz, String>`.

| Метод | Описание |
|-------|----------|
| `findByCourseId(courseId, pageable)` | Все квизы курса (с пагинацией) |
| `findByCourseIdAndStatus(courseId, status, pageable)` | То же, с фильтром по статусу |
| `findByLessonId(lessonId)` | Все квизы урока |
| `findByCreatedBy(createdBy, pageable)` | Квизы конкретного инструктора |

### `QuizAttemptRepository`
Расширяет `MongoRepository<QuizAttempt, String>`.

| Метод | Описание |
|-------|----------|
| `findByStudentIdAndQuizId(studentId, quizId)` | Попытки студента по конкретному квизу |
| `findByStudentIdAndCourseId(studentId, courseId)` | Все попытки студента по курсу |

---

## DTO

| Класс | Направление | Описание |
|-------|-------------|----------|
| `QuizRequest` | Запрос | Создание/обновление квиза (инструктор). Содержит `courseId`, `title`, `questions`, `passingScore`, `status` |
| `QuestionRequest` | Запрос | Один вопрос в составе `QuizRequest` |
| `OptionRequest` | Запрос | Один вариант ответа (`text`, `correct`) |
| `SubmitQuizRequest` | Запрос | Ответы студента: непустой список `StudentAnswerRequest` |
| `StudentAnswerRequest` | Запрос | Ответ на один вопрос: `questionId` + `selectedOptionIds` |
| `QuizResponse` | Ответ (admin) | Полный квиз с `isCorrect` у каждого варианта |
| `QuestionResponse` | Ответ (admin) | Вопрос с правильными ответами |
| `OptionResponse` | Ответ (admin) | Вариант с флагом `isCorrect` |
| `QuizStudentResponse` | Ответ (студент) | Квиз **без** поля `isCorrect` |
| `QuestionStudentResponse` | Ответ (студент) | Вопрос без правильных ответов |
| `OptionStudentResponse` | Ответ (студент) | Только `id` и `text` |
| `QuizResultResponse` | Ответ | Результат сдачи: баллы, процент, `passed`, детализация по вопросам |
| `AnswerResultDto` | Ответ | Итог по одному вопросу: выбранные / правильные варианты, баллы |
| `QuizPassedEvent` | Kafka | Событие отправляется в топик `quiz-passed` при успешной сдаче |

---

## Контроллеры

### `AssessmentController` — `/api/assessments`
Для инструкторов и администраторов.

| Метод | Путь | Роли | Описание |
|-------|------|------|----------|
| `POST` | `/api/assessments` | INSTRUCTOR, ADMIN | Создать квиз |
| `GET` | `/api/assessments/{id}` | Все авторизованные | Получить квиз по ID |
| `GET` | `/api/assessments?courseId=` | Все авторизованные | Список квизов курса (пагинация, фильтр status) |
| `GET` | `/api/assessments/by-lesson?lessonId=` | Все авторизованные | Квизы урока |
| `PUT` | `/api/assessments/{id}` | INSTRUCTOR, ADMIN | Обновить квиз |
| `DELETE` | `/api/assessments/{id}` | ADMIN | Удалить квиз |

### `QuizStudentController` — `/api/quizzes`
Для студентов.

| Метод | Путь | Описание |
|-------|------|----------|
| `GET` | `/api/quizzes/{id}` | Получить квиз в студенческом формате (без правильных ответов) |
| `POST` | `/api/quizzes/{id}/submit` | Отправить ответы, получить результат |

Endpoint `submit` читает `X-User-Name` и `X-User-Id` из заголовков, проставленных Gateway.

### `GlobalExceptionHandler`
`@RestControllerAdvice` — перехватывает исключения для всех контроллеров.

| Исключение | HTTP | Ответ |
|------------|------|-------|
| `QuizNotFoundException` | 404 | `ProblemDetail` с сообщением |
| `AccessDeniedException` | 403 | «Access denied: insufficient role» |
| `MethodArgumentNotValidException` | 400 | Перечень ошибок валидации |
| `IllegalArgumentException` | 400 | Сообщение исключения |

---

## Сервис

### `AssessmentService`
Вся бизнес-логика. Основные методы:

**`create / findById / update / delete`** — стандартный CRUD через `QuizRepository`.

**`getQuizForStudent(quizId)`** — возвращает `QuizStudentResponse` (без `isCorrect`). Кидает 404 если квиз не `PUBLISHED`.

**`submitQuiz(quizId, userId, studentName, request)`** — основной метод:
1. Загружает квиз, проверяет статус `PUBLISHED`
2. Строит `Map<questionId, Question>` для быстрого поиска
3. Для каждого ответа студента сравнивает `selectedOptionIds` с `correctOptionIds`
4. Считает `earnedPoints`, `totalPoints`, `percentage`, `passed`
5. Сохраняет `QuizAttempt` в MongoDB
6. Если `passed == true` и есть `lessonId` и `userId` — асинхронно отправляет `QuizPassedEvent` в Kafka топик `quiz-passed` (обёрнуто в `try/catch`, чтобы недоступность Kafka не блокировала ответ)
7. Возвращает `QuizResultResponse`

---

## Маппер

### `QuizMapper`
Spring `@Component`. Конвертирует между слоями без MapStruct.

| Метод | Описание |
|-------|----------|
| `toDocument(QuizRequest, createdBy)` | Request → `Quiz` документ. **Здесь генерируются UUID** для каждого `Question` и `Option` |
| `updateDocument(Quiz, QuizRequest)` | Обновляет поля существующего документа |
| `toResponse(Quiz)` | `Quiz` → `QuizResponse` (с `isCorrect`) |
| `toStudentResponse(Quiz)` | `Quiz` → `QuizStudentResponse` (без `isCorrect`) |

---

## Безопасность

### `HeaderAuthenticationFilter`
Расширяет `OncePerRequestFilter`. Читает заголовки от Gateway и строит `Authentication` объект.

**Алгоритм:**
1. Извлекает `X-User-Name` из запроса
2. Если не пустой — парсит `X-User-Roles` (через запятую) в список `SimpleGrantedAuthority`
3. Создаёт `UsernamePasswordAuthenticationToken` и записывает в `SecurityContextHolder`
4. Передаёт запрос дальше по цепочке фильтров

### `SecurityConfig`
`@EnableWebSecurity` + `@EnableMethodSecurity` (без последнего `@PreAuthorize` молча игнорируется).

| Правило | Роли |
|---------|------|
| `GET /api/assessments/**`, `GET /api/quizzes/**` | Любой авторизованный |
| `POST /api/assessments/**` | INSTRUCTOR, ADMIN |
| `PUT /api/assessments/**` | INSTRUCTOR, ADMIN |
| `DELETE /api/assessments/**` | ADMIN |
| `POST /api/quizzes/**` | Любой авторизованный |
| `/actuator/**` | Открыто |

---

## Конфигурация

### `MongoConfig`
Включает `@EnableMongoAuditing` — активирует автозаполнение `@CreatedDate` и `@LastModifiedDate` в документах.

---

## Исключения

### `QuizNotFoundException`
`RuntimeException`. Выбрасывается в `AssessmentService` когда квиз не найден в БД.
`GlobalExceptionHandler` преобразует его в HTTP 404 с `ProblemDetail`.

---

## Поток данных (submit quiz)

```
POST /api/quizzes/{id}/submit
        │
        ▼
HeaderAuthenticationFilter (читает X-User-Name, X-User-Roles, X-User-Id)
        │
        ▼
SecurityConfig: POST /api/quizzes/** → authenticated()
        │
        ▼
QuizStudentController.submit()
        │
        ▼
AssessmentService.submitQuiz()
   ├─ QuizRepository.findById()       → MongoDB
   ├─ QuizAttemptRepository.save()    → MongoDB
   └─ KafkaTemplate.send("quiz-passed") → Kafka (async, при passed=true)
        │
        ▼
QuizResultResponse (JSON)
```
