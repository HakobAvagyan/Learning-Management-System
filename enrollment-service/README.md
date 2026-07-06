# Enrollment Service

Микросервис записи на курсы. Управляет подписками студентов на курсы, публикует событие в Kafka после успешной записи (для инициализации прогресса и отправки уведомления).

**Порт:** `8083` · **БД:** PostgreSQL (`lms_db`, схема `enrollment`) · **Миграции:** Liquibase · **Брокер:** Kafka (producer, топик `course-enrollments`)

---

## Архитектура пакетов

```
com.lms.enrollmentservice
├── config/      ← SecurityConfig, KafkaProducerConfig, KafkaTopicConfig
├── controller/  ← EnrollmentController, GlobalExceptionHandler
├── dto/         ← Request / Response / Event DTO
├── entity/      ← Enrollment
├── event/       ← EnrollmentCreatedEvent, EnrollmentKafkaPublisher
├── exception/   ← AlreadyEnrolledException
├── repository/  ← EnrollmentRepository
├── security/    ← HeaderAuthenticationFilter
└── service/     ← EnrollmentService
```

---

## Сущности (JPA / PostgreSQL)

### `Enrollment`
Таблица `enrollment.enrollments`.

| Поле | Тип | Описание |
|------|-----|----------|
| `id` | Long | PK, auto-increment |
| `userId` | Long | ID студента |
| `courseId` | String (24) | ID курса (MongoDB ObjectId) |
| `status` | `EnrollmentStatus` | `ACTIVE`, `COMPLETED`, `CANCELLED` |
| `enrolledAt` | Instant | Время записи |
| `updatedAt` | Instant | Время обновления |

Уникальное ограничение: `(userId, courseId)` — один студент не может записаться на один курс дважды.

---

## Репозиторий

### `EnrollmentRepository`
Расширяет `JpaRepository<Enrollment, Long>`.

| Метод | Описание |
|-------|----------|
| `existsByUserIdAndCourseId(userId, courseId)` | Проверка дубля перед записью |
| `findByUserId(userId)` | Все курсы пользователя |
| `findByCourseId(courseId)` | Все студенты курса |
| `findByUserIdAndCourseId(userId, courseId)` | Конкретная запись |

---

## Сервис

### `EnrollmentService`

**`subscribe(request)`:**
1. Проверяет `existsByUserIdAndCourseId` — если дубль → `AlreadyEnrolledException`
2. Создаёт `Enrollment` со статусом `ACTIVE`
3. Сохраняет в PostgreSQL
4. Публикует Spring `ApplicationEvent` (`EnrollmentCreatedEvent`)

**`findByUser(userId)`** — список всех записей пользователя.  
**`findByCourse(courseId)`** — список всех студентов курса.

---

## Kafka

### `EnrollmentCreatedEvent`
Spring `ApplicationEvent`. Содержит сохранённый объект `Enrollment`. Публикуется `EnrollmentService` сразу после сохранения в БД.

### `EnrollmentKafkaPublisher`
Слушает `EnrollmentCreatedEvent` через `@TransactionalEventListener(AFTER_COMMIT)`.

Почему `AFTER_COMMIT`: гарантирует, что Kafka-сообщение отправится только после того, как транзакция БД успешно зафиксирована. Если транзакция откатится — событие не будет опубликовано.

**Алгоритм:**
1. Преобразует `Enrollment` в `StudentEnrolledEvent`
2. Отправляет в топик `course-enrollments` (ключ = `userId.toString()`)
3. Конфигурация: `acks=all`, `retries=3`, `enable.idempotence=true` — гарантия exactly-once delivery

### `KafkaTopicConfig`
Объявляет топик `course-enrollments`: 3 партиции, 1 реплика.

### `KafkaProducerConfig`
Конфигурирует `ProducerFactory<String, StudentEnrolledEvent>` и `KafkaTemplate`. Явно отключает type-заголовки (`spring.json.add.type.headers = false`), чтобы consumer мог десериализовать без ссылок на классы producer.

---

## Контроллер

### `EnrollmentController` — `/api/enrollments`

| Метод | Путь | Описание |
|-------|------|----------|
| `POST` | `/api/enrollments/subscribe` | Записать студента на курс |
| `GET` | `/api/enrollments/user/{userId}` | Все записи пользователя |
| `GET` | `/api/enrollments/course/{courseId}` | Все студенты курса |

### `GlobalExceptionHandler`

| Исключение | HTTP | Описание |
|------------|------|----------|
| `AlreadyEnrolledException` | 409 | Студент уже записан на этот курс |
| `MethodArgumentNotValidException` | 400 | Ошибки валидации (пустой courseId, отрицательный userId) |

---

## DTO

| Класс | Направление | Описание |
|-------|-------------|----------|
| `SubscribeRequest` | Запрос | `userId` (@Positive), `courseId` (@NotBlank) |
| `EnrollmentResponse` | Ответ | `id`, `userId`, `courseId`, `status`, `enrolledAt` |
| `EnrollmentEventDto` | Внутренний | Промежуточный DTO при маппинге перед отправкой в Kafka |
| `StudentEnrolledEvent` | Kafka payload | `enrollmentId`, `userId`, `courseId`, `enrolledAt`, `occurredAt`. Статический фабричный метод `of(Enrollment)` |

---

## Безопасность

### `HeaderAuthenticationFilter`
Стандартный паттерн: читает `X-User-Name` и `X-User-Roles` из заголовков Gateway.

### `SecurityConfig`
Stateless. `/actuator/health` — открыто. Все остальные endpoints — требуют аутентификации.

---

## Поток записи на курс

```
POST /api/enrollments/subscribe
        │
        ▼
EnrollmentService.subscribe()
   ├─ existsByUserIdAndCourseId() → 409 если дубль
   ├─ save(enrollment) → PostgreSQL (транзакция)
   └─ publishEvent(EnrollmentCreatedEvent)
                │
                ▼ (только после COMMIT)
EnrollmentKafkaPublisher
   └─ kafkaTemplate.send("course-enrollments", userId, StudentEnrolledEvent)
                │
        ┌───────┴───────┐
        ▼               ▼
progress-service   notification-service
(инициализация     (приветственное
 прогресса)         уведомление)
```
