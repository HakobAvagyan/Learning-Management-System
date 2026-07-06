# User Service

Микросервис аутентификации и управления пользователями. Единственный сервис в системе, который выдаёт JWT-токены и работает напрямую с JWT (остальные сервисы читают заголовки от Gateway).

**Порт:** `8081` · **БД:** PostgreSQL (`lms_db`) · **Миграции:** Liquibase · **Брокер:** нет

---

## Архитектура пакетов

```
com.lms.userservice
├── config/      ← SecurityConfig, DataInitializer
├── controller/  ← AuthController, UserController, GlobalExceptionHandler
├── dto/         ← Request / Response DTO
├── entity/      ← User, Role
├── repository/  ← UserRepository, RoleRepository
├── security/    ← JwtService, JwtAuthenticationFilter, UserDetailsServiceImpl
└── service/     ← AuthService, UserService
```

---

## Сущности (JPA / PostgreSQL)

### `User`
Таблица `users`.

| Поле | Тип | Описание |
|------|-----|----------|
| `id` | Long | PK, auto-increment |
| `username` | String (50) | Уникальный логин |
| `email` | String (255) | Уникальный email |
| `passwordHash` | String | BCrypt-хеш пароля |
| `firstName` / `lastName` | String | Имя и фамилия |
| `enabled` | boolean | Активен ли аккаунт (по умолчанию `true`) |
| `createdAt` / `updatedAt` | Instant | Временные метки |
| `roles` | `Set<Role>` | ManyToMany EAGER, таблица связи `user_roles` |

### `Role`
Таблица `roles`.

| Поле | Тип | Описание |
|------|-----|----------|
| `id` | Long | PK |
| `name` | String (50) | Например `ROLE_STUDENT`, `ROLE_INSTRUCTOR`, `ROLE_ADMIN` |

---

## Репозитории

### `UserRepository`
Расширяет `JpaRepository<User, Long>`.

| Метод | Описание |
|-------|----------|
| `findByUsername(username)` | Поиск для аутентификации |
| `findByEmail(email)` | Проверка уникальности email |
| `existsByUsername(username)` | Быстрая проверка при регистрации |
| `existsByEmail(email)` | Быстрая проверка при регистрации |
| `searchUsers(search, role, pageable)` | JPQL: поиск по username/email/имени и фильтр по роли. Пустые параметры = без фильтра |

### `RoleRepository`
Расширяет `JpaRepository<Role, Long>`.

| Метод | Описание |
|-------|----------|
| `findByName(name)` | Получить роль по имени (напр. `ROLE_STUDENT`) |

---

## Безопасность

### `JwtService`
**Компонент** генерации и валидации JWT. Работает с HMAC-SHA ключом из `application.yml`.

| Метод | Описание |
|-------|----------|
| `generateToken(user)` | Создаёт JWT: subject=username, claims: roles (список), userId. Срок действия: 24 часа |
| `extractUsername(token)` | Извлекает subject из токена |
| `isTokenValid(token, userDetails)` | Проверяет подпись, срок действия и соответствие username |

### `JwtAuthenticationFilter`
Расширяет `OncePerRequestFilter`. Стандартный JWT-фильтр (только в этом сервисе — все остальные читают заголовки Gateway).

**Алгоритм:**
1. Извлекает `Authorization: Bearer <token>`
2. Если токен есть — загружает пользователя через `UserDetailsServiceImpl`
3. Валидирует токен через `JwtService.isTokenValid()`
4. При успехе записывает `UsernamePasswordAuthenticationToken` в `SecurityContextHolder`

### `UserDetailsServiceImpl`
Реализует `UserDetailsService`. Загружает `User` из БД по username, маппит роли в `SimpleGrantedAuthority`.

### `SecurityConfig`
`@EnableWebSecurity` + `@EnableMethodSecurity`.

| Правило | Доступ |
|---------|--------|
| `POST /api/auth/**` | Открыто (регистрация, логин) |
| `/actuator/health` | Открыто |
| Всё остальное | Требует JWT |

Конфигурирует `DaoAuthenticationProvider` с `BCryptPasswordEncoder` и `UserDetailsServiceImpl`.

---

## Сервисы

### `AuthService`
Бизнес-логика регистрации и входа.

**`register(RegisterRequest)`:**
1. Проверяет уникальность username и email (кидает `IllegalArgumentException` при дубле)
2. Хеширует пароль BCrypt
3. Назначает роль `ROLE_STUDENT`
4. Сохраняет пользователя
5. Генерирует JWT и возвращает `AuthResponse`

**`login(LoginRequest)`:**
1. Делегирует проверку пароля `AuthenticationManager`
2. При успехе генерирует JWT через `JwtService`
3. Возвращает `AuthResponse`

### `UserService`
Операции над профилями.

| Метод | Роль | Описание |
|-------|------|----------|
| `getProfile(username)` | Свой | Профиль текущего пользователя |
| `updateProfile(username, request)` | Свой | Обновить имя / фамилию / email |
| `changePassword(username, request)` | Свой | Проверить старый пароль → сохранить новый BCrypt-хеш |
| `listUsers(search, role, pageable)` | ADMIN | Пагинированный поиск пользователей |
| `getUserById(id)` | ADMIN | Получить пользователя по ID |
| `updateRoles(id, request)` | ADMIN | Заменить набор ролей пользователя |
| `toggleEnabled(id)` | ADMIN | Включить / отключить аккаунт |

---

## Контроллеры

### `AuthController` — `/api/auth`

| Метод | Путь | Описание |
|-------|------|----------|
| `POST` | `/api/auth/register` | Регистрация нового пользователя |
| `POST` | `/api/auth/login` | Вход, возвращает JWT |

### `UserController` — `/api/users`

| Метод | Путь | Роли | Описание |
|-------|------|------|----------|
| `GET` | `/api/users/me` | Свой | Профиль текущего пользователя |
| `PUT` | `/api/users/me` | Свой | Обновить профиль |
| `PUT` | `/api/users/me/password` | Свой | Сменить пароль |
| `GET` | `/api/users` | ADMIN | Список пользователей (search, role, pageable) |
| `GET` | `/api/users/{id}` | ADMIN | Пользователь по ID |
| `PUT` | `/api/users/{id}/roles` | ADMIN | Установить роли |
| `PUT` | `/api/users/{id}/toggle-enabled` | ADMIN | Включить / отключить |

### `GlobalExceptionHandler`

| Исключение | HTTP | Описание |
|------------|------|----------|
| `MethodArgumentNotValidException` | 400 | Ошибки валидации |
| `IllegalArgumentException` | 409 | Дублирующийся username / email |
| `BadCredentialsException` | 401 | Неверный пароль при логине |

---

## DTO

| Класс | Направление | Описание |
|-------|-------------|----------|
| `RegisterRequest` | Запрос | `username` (3–50), `email`, `password` (8–100), `firstName`, `lastName` |
| `LoginRequest` | Запрос | `username`, `password` |
| `AuthResponse` | Ответ | `id`, `token`, `username`, `email`, `roles` |
| `UserProfileResponse` | Ответ | Полный профиль: `id`, `username`, `email`, `firstName`, `lastName`, `roles`, `enabled`, `createdAt` |
| `UpdateProfileRequest` | Запрос | `firstName`, `lastName`, `email` (все необязательные с валидацией) |
| `ChangePasswordRequest` | Запрос | `currentPassword`, `newPassword` (мин. 6 символов) |
| `UpdateRolesRequest` | Запрос | `roles` (Set, @NotEmpty) |

---

## Конфигурация

### `DataInitializer`
`ApplicationRunner` — засевает тестовые данные при первом старте, если таблица `users` пуста.

| Username | Роль | Пароль |
|----------|------|--------|
| admin1 | ADMIN | `Password123!` |
| instructor1 | INSTRUCTOR | `Password123!` |
| instructor2 | INSTRUCTOR | `Password123!` |
| student1 | STUDENT | `Password123!` |
| student2 | STUDENT | `Password123!` |
| student3 | STUDENT | `Password123!` |
