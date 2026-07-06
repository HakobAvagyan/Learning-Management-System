# LMS UI

Angular 17 SPA-приложение для платформы управления обучением. Standalone-компоненты, Angular Signals, Angular Material.

**Порт:** `4200` (dev) · **API:** `http://localhost:8080` (через Gateway)

---

## Структура приложения

```
src/app/
├── app.config.ts          ← Bootstrap: Router, HttpClient + authInterceptor, Animations
├── app.routes.ts          ← Таблица маршрутов с lazy loading
├── core/
│   ├── guards/            ← authGuard, instructorGuard, adminGuard
│   ├── interceptors/      ← authInterceptor
│   ├── models/            ← TypeScript-интерфейсы (Course, Quiz, Progress, Notification)
│   └── services/          ← AuthService, CourseService, AssessmentService, и др.
├── features/
│   ├── auth/              ← LoginComponent, RegisterComponent
│   ├── catalog/           ← CatalogComponent (каталог курсов)
│   ├── courses/           ← CreateCourseComponent, CourseStudentsDialogComponent
│   ├── home/              ← HomeComponent
│   ├── profile/           ← ProfileComponent
│   ├── progress/          ← CourseProgressComponent
│   ├── quiz/              ← QuizTakeComponent, QuizManageComponent
│   └── admin/             ← AdminUsersComponent, RolesDialogComponent, UserDetailDialogComponent
└── shared/
    ├── components/header/ ← HeaderComponent
    ├── confirm-dialog/    ← ConfirmDialogComponent
    └── file-upload/       ← FileUploadComponent
```

---

## Конфигурация (`app.config.ts`)

Инициализирует приложение в standalone-режиме (без NgModule):
- `provideRouter(routes)` — маршрутизация
- `provideAnimationsAsync()` — Angular Material анимации
- `provideHttpClient(withInterceptors([authInterceptor]))` — HTTP с JWT-интерцептором

---

## Маршруты (`app.routes.ts`)

Все компоненты загружаются через **lazy loading** (`loadComponent`).

| Путь | Компонент | Guards |
|------|-----------|--------|
| `/home` | `HomeComponent` | `authGuard` |
| `/login` | `LoginComponent` | — |
| `/register` | `RegisterComponent` | — |
| `/courses` | `CatalogComponent` | `authGuard` |
| `/courses/create` | `CreateCourseComponent` | `authGuard`, `instructorGuard` |
| `/courses/:courseId/quizzes` | `QuizManageComponent` | `authGuard`, `instructorGuard` |
| `/progress/course/:courseId` | `CourseProgressComponent` | `authGuard` |
| `/quiz/:quizId` | `QuizTakeComponent` | `authGuard` |
| `/profile` | `ProfileComponent` | `authGuard` |
| `/admin` | `AdminUsersComponent` | `authGuard`, `adminGuard` |
| `**` | redirect → `/home` | — |

---

## Guards

### `authGuard`
Функциональный guard (`CanActivateFn`). Проверяет `AuthService.isLoggedIn()`. При неудаче — редирект на `/login`.

### `instructorGuard`
Проверяет наличие роли `ROLE_INSTRUCTOR` или `ROLE_ADMIN` в `AuthService.currentUser().roles`. При неудаче — редирект на `/home`.

### `adminGuard`
Проверяет наличие роли `ROLE_ADMIN`. При неудаче — редирект на `/home`.

---

## Interceptors

### `authInterceptor`
Функциональный интерцептор (`HttpInterceptorFn`). Читает JWT-токен из `AuthService.getToken()` и добавляет заголовок `Authorization: Bearer <token>` к каждому HTTP-запросу автоматически.

---

## Сервисы (`core/services/`)

### `AuthService`
Управляет сессией пользователя.

- Хранит данные в `localStorage` (`lms_token`, `lms_user`)
- Реактивное состояние через `Signal<AuthResponse | null>` — `currentUser`
- `login(request)` — POST `/api/auth/login`, сохраняет токен и пользователя
- `register(request)` — POST `/api/auth/register`, сохраняет токен
- `logout()` — очищает localStorage, сбрасывает signal, перенаправляет на `/login`
- `getToken()` — возвращает JWT из localStorage
- `isLoggedIn()` — `currentUser() !== null`

### `CourseService`
HTTP-клиент к `GET /api/courses` (course-service через Gateway).

| Метод | Описание |
|-------|----------|
| `getAll(page, size)` | Список PUBLISHED курсов с пагинацией |
| `getById(id)` | Один курс по ID |
| `create(body)` | POST — создать курс |
| `update(id, body)` | PUT — обновить курс |
| `delete(id)` | DELETE — удалить курс |

### `AssessmentService`
HTTP-клиент к assessment-service (два base URL: `/api/quizzes` для студентов, `/api/assessments` для инструкторов).

| Метод | Описание |
|-------|----------|
| `getQuiz(quizId)` | GET студенческий вид квиза (без правильных ответов) |
| `submitQuiz(quizId, request)` | POST — отправить ответы, получить результат |
| `getQuizzesForCourse(courseId)` | GET PUBLISHED квизы курса |
| `listByCourse(courseId, status?)` | GET квизы курса (для инструктора) |
| `create(req)` | POST — создать квиз |
| `update(id, req)` | PUT — обновить квиз |
| `delete(id)` | DELETE — удалить квиз |

### `NotificationService`
Реактивный сервис уведомлений.

- `notifications = signal<AppNotification[]>([])` — список уведомлений
- `unreadCount = signal(0)` — количество непрочитанных
- Автоматический polling каждые **30 секунд** через `interval(30_000)` + `takeUntilDestroyed()`
- `markRead(id)` — PATCH отдельного уведомления
- `markAllRead()` — PATCH `/read-all`
- `refresh()` — принудительное обновление (вызывается при открытии меню)

### `EnrollmentService`
HTTP-клиент к enrollment-service.

| Метод | Описание |
|-------|----------|
| `subscribe(req)` | POST `/api/enrollments/subscribe` — записаться на курс |
| `getByUser(userId)` | GET записи пользователя |
| `getByCourse(courseId)` | GET студенты курса |

### `ProgressService`
HTTP-клиент к progress-service.

| Метод | Описание |
|-------|----------|
| `getProgress(userId, courseId)` | GET прогресс по одному курсу |
| `getAllProgressForUser(userId)` | GET прогресс по всем курсам |
| `completeLesson(request)` | POST — отметить урок завершённым |
| `groupByModule(lessonProgress)` | Клиентский хелпер: группирует уроки по модулям (Map → `ModuleGroup[]`) |

### `UserService`
HTTP-клиент к user-service.

| Метод | Описание |
|-------|----------|
| `getMe()` | GET профиль текущего пользователя |
| `updateMe(req)` | PUT обновить профиль |
| `changePassword(req)` | PUT сменить пароль |
| `listUsers(search, role, page, size)` | GET пагинированный список (только ADMIN) |
| `updateRoles(id, roles)` | PUT заменить роли пользователя |
| `toggleEnabled(id)` | PUT включить/отключить аккаунт |
| `getById(id)` | GET пользователь по ID |

### `MediaService`
HTTP-клиент к media-service. Загрузка файлов и получение presigned URL.

---

## Компоненты (`features/`)

### `LoginComponent`
Форма входа с полями username и password. При успехе навигирует на `/home`.

### `RegisterComponent`
Форма регистрации: username, email, password, firstName, lastName. Автоматически входит после регистрации.

### `HomeComponent`
Главная страница после логина. Показывает записанные курсы с прогрессом, быстрые ссылки на активные квизы.

### `CatalogComponent`
Каталог всех PUBLISHED курсов. Ключевые возможности:
- Сетка карточек курсов (CSS Grid)
- Отображает «Вы записаны» (зелёный badge) для курсов, где у пользователя есть запись (через `progressService.getAllProgressForUser`)
- Кнопка «Записаться» — вызывает `enrollmentService.subscribe()`, при успехе навигирует на `/progress/course/:id`
- Инструкторы/Admins видят иконки: «Студенты курса», «Управление квизами», «Удалить» с подтверждением через `ConfirmDialogComponent`
- Реактивное состояние через signals: `loading`, `courses`, `enrolledIds`, `enrolling`

### `CreateCourseComponent`
Форма создания курса для инструкторов. `ReactiveFormsModule` с `FormArray`:
- Основная информация: название, описание, категория, статус
- Динамические модули (FormArray) — каждый модуль содержит FormArray уроков
- Кнопка сохранения показывает «Опубликовать» или «Сохранить черновик» в зависимости от статуса

### `CourseStudentsDialogComponent`
Mat Dialog. Показывает список студентов, записанных на курс. Принимает `courseId` через `MAT_DIALOG_DATA`.

### `CourseProgressComponent`
Страница детального прогресса по одному курсу. Отображает модули, уроки, процент завершения. Позволяет отметить урок завершённым.

### `QuizTakeComponent`
Страница прохождения квиза студентом. Три режима:
1. **Загрузка** — spinner
2. **Прохождение** — карточки вопросов. `SINGLE_CHOICE` → `mat-radio-group`, `MULTIPLE_CHOICE` → чекбоксы. Состояние ответов в signals (`singleAnswers`, `multiAnswers` — Maps). `answeredCount` — computed signal
3. **Результат** — карточка с процентом (зелёная если сдан, красная если нет) + детальный разбор каждого вопроса с цветовой маркировкой вариантов

### `QuizManageComponent`
CRUD-интерфейс квизов для инструкторов. Два режима — список и форма (переключаются через `showForm` signal).
- Список квизов курса с иконками Edit / Delete
- Форма создания/редактирования: вложенный `FormArray` вопросов, внутри каждого — `FormArray` вариантов ответа с чекбоксом «Правильный»
- Загружает курс и квизы параллельно через `forkJoin`

### `AdminUsersComponent`
Панель управления пользователями (только ADMIN). Таблица `mat-table`:
- Поиск с дебаунсом 400 мс, фильтр по роли
- `MatPaginator` — серверная пагинация
- Toggle `enabled`/disabled прямо в строке
- Кнопки: «Просмотр» → `UserDetailDialogComponent`, «Изменить роли» → `RolesDialogComponent`

### `RolesDialogComponent`
Mat Dialog для изменения ролей пользователя. Группа чекбоксов ADMIN / INSTRUCTOR / STUDENT. Возвращает массив выбранных ролей через `dialogRef.close(roles)`.

### `UserDetailDialogComponent`
Mat Dialog с полным профилем пользователя (read-only).

### `ProfileComponent`
Страница личного профиля. Формы: обновление данных (firstName, lastName, email), смена пароля.

---

## Shared компоненты

### `HeaderComponent`
Верхняя навигационная панель (Angular Material Toolbar). Всегда видна.

- Логотип «LMS Platform» → `/home`
- Кнопка «Каталог» → `/courses`
- Иконка уведомлений с Badge (счётчик непрочитанных). При открытии меню вызывает `NotificationService.refresh()`. Клик по уведомлению → `markRead()`
- Меню пользователя: Главная, Каталог, Мой профиль, (Администрирование — только ADMIN), Выйти
- Если не залогинен: кнопки «Войти» и «Регистрация»

### `ConfirmDialogComponent`
Универсальный диалог подтверждения. Принимает `title`, `message`, `confirmLabel` через `MAT_DIALOG_DATA`. Возвращает `true` при подтверждении, `false` при отмене.

### `FileUploadComponent`
Компонент загрузки файлов через `MediaService`. Используется инструкторами для загрузки видео/материалов урока.

---

## Модели (`core/models/`)

| Файл | Интерфейсы |
|------|-----------|
| `course.model.ts` | `CourseDto`, `CoursePage`, `ModuleDto`, `LessonDto` |
| `quiz.model.ts` | `QuizDto`, `QuizResponse`, `QuizResultResponse`, `QuizSummary`, `SubmitQuizRequest`, `AnswerResultDto`, `QuestionDto`, `OptionDto` |
| `progress.model.ts` | `ProgressResponse`, `LessonProgressDto`, `CompleteLessonRequest`, `ModuleGroup` |
| `notification.model.ts` | `AppNotification` |

---

## Технологии

| Технология | Версия / Описание |
|-----------|------------------|
| Angular | 17 — standalone components, новый Control Flow (`@if`, `@for`) |
| Angular Material | UI компоненты (mat-table, mat-dialog, mat-snackbar и др.) |
| Angular Signals | Реактивное состояние вместо RxJS `Subject` в компонентах |
| RxJS | HTTP-запросы, polling уведомлений, debouncedSearch |
| TypeScript | Строгая типизация DTO, Guards, Interceptors |
