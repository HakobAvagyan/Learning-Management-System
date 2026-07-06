# API Gateway

Единая точка входа для всех клиентских запросов. Валидирует JWT-токены, проверяет роли, перенаправляет трафик к нужным микросервисам и проксирует заголовки идентификации пользователя.

**Порт:** `8080` · **БД:** нет · **Брокер:** нет

---

## Архитектура пакетов

```
com.lms.apigateway
├── config/    ← CorsConfig, HealthCheckProperties
├── filter/    ← JwtAuthenticationGatewayFilterFactory, HealthCheckGlobalFilter
├── health/    ← DownstreamHealthChecker
└── security/  ← JwtUtil
```

---

## Классы

### `ApiGatewayApplication`
Точка входа Spring Boot. Включает `@EnableScheduling` для периодической проверки здоровья сервисов и биндит конфигурацию `HealthCheckProperties`.

---

### `JwtUtil`
**Компонент** для работы с JWT-токенами.

Читает секрет из `application.yml` (`jwt.secret`), декодирует его из Base64 и строит HMAC-SHA ключ.

| Метод | Описание |
|-------|----------|
| `extractAllClaims(token)` | Парсит JWT и возвращает все claims |
| `isValid(token)` | Возвращает `true` если подпись валидна и токен не просрочен |

Используется исключительно в `JwtAuthenticationGatewayFilterFactory`.

---

### `JwtAuthenticationGatewayFilterFactory`
**Кастомный Gateway Filter Factory** — главный механизм аутентификации и авторизации.

Применяется на маршрутах через конфигурацию `application.yml`:
```yaml
filters:
  - name: JwtAuthentication
    args:
      requiredRoles: "ROLE_INSTRUCTOR,ROLE_ADMIN"
```

**Алгоритм при каждом запросе:**
1. Извлекает `Authorization: Bearer <token>` из заголовка
2. Вызывает `JwtUtil.isValid()` — если токен невалиден → HTTP 401
3. Извлекает `username`, `roles` (список), `userId` из claims токена
4. Если у маршрута задан `requiredRoles` — проверяет наличие хотя бы одной нужной роли → HTTP 403 при несоответствии
5. Добавляет заголовки к downstream-запросу: `X-User-Name`, `X-User-Roles` (через запятую), `X-User-Id`
6. Удаляет исходный `Authorization` заголовок — downstream-сервисы не видят JWT

---

### `HealthCheckProperties`
**`@ConfigurationProperties`** класс. Биндит из `application.yml`:

```yaml
downstream:
  health-check:
    interval: 15000
    services:
      user-service: http://localhost:8081
      course-service: http://localhost:8082
      ...
```

Хранит `interval` (мс) и `Map<serviceName, baseUrl>` для всех сервисов.

---

### `DownstreamHealthChecker`
**`@Component`** с методом `@Scheduled`. Каждые 15 секунд опрашивает `/actuator/health` каждого сервиса из `HealthCheckProperties`.

- Результаты кешируются в `ConcurrentHashMap<String, Boolean>` (ключ = базовый URL)
- При изменении статуса (UP → DOWN или наоборот) пишет лог
- Карта доступна `HealthCheckGlobalFilter` для принятия решений о маршрутизации

---

### `HealthCheckGlobalFilter`
**`GlobalFilter`** с порядком `-10001` (выполняется раньше маршрутизации). Реализует circuit-breaker без библиотек.

**Алгоритм:**
1. Определяет целевой URL запроса из атрибутов Spring Cloud Gateway
2. Проверяет кеш `DownstreamHealthChecker`
3. Если сервис помечен как DOWN → немедленно возвращает HTTP 503 с JSON-телом `{"error": "Service unavailable", "service": "..."}`, не перенаправляя запрос

---

### `CorsConfig`
**`@Configuration`**. Регистрирует Spring-бин `CorsWebFilter` (реактивный).

Разрешает все заголовки и HTTP-методы с источника `http://localhost:4200` (Angular dev-сервер) с `allowCredentials = true`.

---

## Таблица маршрутов

| Путь | Сервис | Порт | Auth |
|------|--------|------|------|
| `/api/auth/**` | user-service | 8081 | Нет |
| `/api/users/**` | user-service | 8081 | JWT |
| `GET /api/courses/**` | course-service | 8082 | JWT |
| `POST/PUT/DELETE /api/courses/**` | course-service | 8082 | JWT + INSTRUCTOR или ADMIN |
| `/api/enrollments/**` | enrollment-service | 8083 | JWT |
| `/api/notifications/**` | notification-service | 8084 | JWT |
| `/api/progress/**` | progress-service | 8085 | JWT |
| `/api/media/**` | media-service | 8086 | JWT |
| `/api/assessments/**` | assessment-service | 8087 | JWT |
| `/api/quizzes/**` | assessment-service | 8087 | JWT |

---

## Поток запроса

```
Клиент (Angular)
      │
      ▼
API Gateway :8080
  ├─ CorsConfig            — CORS заголовки
  ├─ HealthCheckGlobalFilter — проверка доступности сервиса (→ 503 если DOWN)
  ├─ JwtAuthenticationGatewayFilterFactory
  │      ├─ Проверить Bearer token (→ 401)
  │      ├─ Проверить роли (→ 403)
  │      └─ Добавить X-User-Name / X-User-Roles / X-User-Id
  └─ Маршрутизация → Downstream-сервис
```
