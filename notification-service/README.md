# Notification Service

Микросервис уведомлений. Потребляет события из Kafka (запись на курс, успешная сдача квиза), создаёт уведомления в MongoDB и предоставляет API для получения / отметки прочитанными.

**Порт:** `8084` · **БД:** MongoDB (`lms_notifications`) · **Брокер:** Kafka (consumer)

---

## Архитектура пакетов

```
com.lms.notificationservice
├── config/     ← SecurityConfig, KafkaConsumerConfig
├── controller/ ← NotificationController
├── document/   ← Notification
├── dto/        ← NotificationResponse, StudentEnrolledEvent, QuizPassedEvent
├── listener/   ← EnrollmentEventListener, QuizPassedNotificationListener
├── repository/ ← NotificationRepository
├── security/   ← HeaderAuthenticationFilter
└── service/    ← NotificationService (интерфейс), MongoNotificationService
```

---

## Документ MongoDB

### `Notification`
Коллекция `notifications`.

| Поле | Тип | Описание |
|------|-----|----------|
| `id` | String | MongoDB `_id` |
| `userId` | Long | ID получателя (индекс) |
| `type` | `NotificationType` | `ENROLLMENT` или `QUIZ_PASSED` |
| `title` | String | Заголовок уведомления |
| `message` | String | Текст уведомления |
| `read` | boolean | Прочитано ли (по умолчанию `false`) |
| `createdAt` | Instant | `@CreatedDate` |

---

## Репозиторий

### `NotificationRepository`
Расширяет `MongoRepository<Notification, String>`.

| Метод | Описание |
|-------|----------|
| `findByUserIdOrderByCreatedAtDesc(userId)` | Все уведомления пользователя (новые первыми) |
| `countByUserIdAndReadFalse(userId)` | Количество непрочитанных |

---

## Сервис

### `NotificationService` (интерфейс)
Определяет контракт:
- `sendEnrollmentConfirmation(StudentEnrolledEvent)` — создать уведомление о записи на курс
- `sendQuizPassedNotification(QuizPassedEvent)` — создать уведомление об успешной сдаче квиза
- `getForUser(userId)` — получить все уведомления пользователя
- `getUnreadCount(userId)` — количество непрочитанных
- `markRead(notificationId)` — отметить одно уведомление прочитанным
- `markAllRead(userId)` — отметить все уведомления пользователя прочитанными

### `MongoNotificationService`
Реализация интерфейса (`@Service`, `@Primary`). Сохраняет и читает данные из MongoDB.

**`sendEnrollmentConfirmation`** создаёт документ:
- title: «Вы записаны на курс!»
- message: «Вы успешно записались на курс {courseId}. Начните обучение прямо сейчас!»

**`sendQuizPassedNotification`** создаёт документ:
- title: «Квиз пройден!»
- message: «Вы успешно прошли квиз с результатом {percentage}%»

---

## Kafka Listeners

### `EnrollmentEventListener`
Слушает топик `course-enrollments`, группа `notification-service`.

- Десериализует `StudentEnrolledEvent`
- Вызывает `notificationService.sendEnrollmentConfirmation()`
- Подтверждает сообщение вручную (`Acknowledgment.acknowledge()`)
- При ошибке — пробрасывает исключение (активирует retry через `FixedBackOff`)

### `QuizPassedNotificationListener`
Слушает топик `quiz-passed`, группа `notification-service-quiz`.

- Десериализует `QuizPassedEvent`
- Вызывает `notificationService.sendQuizPassedNotification()`
- Ручное подтверждение

### `KafkaConsumerConfig`
Создаёт **два независимых** `ConsumerFactory` и `ConcurrentKafkaListenerContainerFactory` — по одному для каждого типа события.

Настройки обоих:
- Режим подтверждения: `MANUAL_IMMEDIATE`
- Обработчик ошибок: `DefaultErrorHandler` с `FixedBackOff(2000ms, 3 попытки)`

---

## Контроллер

### `NotificationController` — `/api/notifications`

| Метод | Путь | Описание |
|-------|------|----------|
| `GET` | `/api/notifications` | Все уведомления для текущего пользователя (из заголовка `X-User-Id`) |
| `GET` | `/api/notifications/unread-count` | `{"count": N}` — количество непрочитанных |
| `PATCH` | `/api/notifications/{id}/read` | Отметить одно уведомление как прочитанное |
| `PATCH` | `/api/notifications/read-all` | Отметить все уведомления пользователя как прочитанные |

Все endpoints читают ID пользователя из заголовка `X-User-Id` (проставляется Gateway).

---

## DTO

| Класс | Направление | Описание |
|-------|-------------|----------|
| `NotificationResponse` | Ответ | `id`, `type`, `title`, `message`, `read`, `createdAt`. Статический фабричный метод `from(Notification)` |
| `StudentEnrolledEvent` | Kafka (входящий) | `enrollmentId`, `userId`, `courseId`, `enrolledAt`, `occurredAt` |
| `QuizPassedEvent` | Kafka (входящий) | `userId`, `courseId`, `lessonId`, `quizId`, `score`, `maxScore`, `percentage`, `occurredAt` |

---

## Безопасность

### `HeaderAuthenticationFilter`
Стандартный паттерн: читает `X-User-Name` и `X-User-Roles` из заголовков Gateway.

### `SecurityConfig`
Stateless. Actuator открыт, всё остальное требует аутентификации. `@EnableMethodSecurity` **не включён** — в контроллере нет `@PreAuthorize`.

---

## Поток уведомлений

```
enrollment-service               assessment-service
       │                                │
       │ Kafka: course-enrollments      │ Kafka: quiz-passed
       ▼                                ▼
EnrollmentEventListener    QuizPassedNotificationListener
       │                                │
       └────────────┬───────────────────┘
                    ▼
          MongoNotificationService
                    │
                    ▼
            MongoDB: notifications
                    │
                    ▼
   GET /api/notifications  ←  Angular UI (polling или push)
```
