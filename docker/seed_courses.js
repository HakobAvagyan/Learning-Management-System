db = db.getSiblingDB("lms_courses");

db.courses.insertMany([
  {
    "_id": "course-java",
    "title": "Разработка на Spring Boot 3.x",
    "description": "Практический курс по созданию production-ready микросервисов на Spring Boot 3 и Java 21.",
    "instructorId": "admin1",
    "category": "Backend-разработка",
    "status": "PUBLISHED",
    "modules": [
      {
        "id": "sb-m1", "title": "Основы Spring Framework", "description": "IoC, DI и автоконфигурация", "order": 1,
        "lessons": [
          { "id": "sb-m1-l1", "title": "Инверсия управления и DI", "content": "IoC — принцип, при котором объект получает зависимости извне. Spring реализует его через ApplicationContext. Бины объявляются через @Component, @Service, @Repository или @Bean. Конструкторное внедрение предпочтительно: гарантирует immutability и упрощает тестирование.", "videoUrl": "http://localhost:9000/lms-media/courses/course-java/sb-m1-l1.mp4", "attachmentUrls": [], "durationMinutes": 28, "order": 1 },
          { "id": "sb-m1-l2", "title": "Spring Boot Auto-configuration", "content": "Spring Boot автонастраивает бины через @EnableAutoConfiguration. Каждый класс содержит @ConditionalOn* аннотации. Флаг --debug выводит Conditions Report с причинами включения или исключения бинов.", "videoUrl": "http://localhost:9000/lms-media/courses/course-java/sb-m1-l2.mp4", "attachmentUrls": [], "durationMinutes": 22, "order": 2 }
        ]
      },
      {
        "id": "sb-m2", "title": "Spring Data и базы данных", "description": "JPA, Hibernate, транзакции и MongoDB", "order": 2,
        "lessons": [
          { "id": "sb-m2-l1", "title": "JPA и Spring Data JPA", "content": "JPA — стандарт ORM. Spring Data JPA генерирует реализацию Repository по интерфейсу. Запросы: по имени метода, @Query с JPQL, Criteria API. @Transactional обеспечивает атомарность операций.", "videoUrl": "http://localhost:9000/lms-media/courses/course-java/sb-m2-l1.mp4", "attachmentUrls": [], "durationMinutes": 35, "order": 1 },
          { "id": "sb-m2-l2", "title": "Spring Data MongoDB", "content": "Документы аннотируются @Document. MongoRepository предоставляет CRUD. Для сложных запросов — MongoTemplate с Criteria. Индексы через @Indexed, аудит через @CreatedDate с @EnableMongoAuditing.", "videoUrl": "http://localhost:9000/lms-media/courses/course-java/sb-m2-l2.mp4", "attachmentUrls": [], "durationMinutes": 30, "order": 2 }
        ]
      },
      {
        "id": "sb-m3", "title": "REST API и Spring Security с JWT", "description": "Проектирование REST, Security 6 и stateless JWT", "order": 3,
        "lessons": [
          { "id": "sb-m3-l1", "title": "Построение RESTful API", "content": "@RestController объединяет @Controller и @ResponseBody. @GetMapping/@PostMapping/@PutMapping/@DeleteMapping маппят HTTP-методы. @PathVariable, @RequestParam, @RequestBody извлекают данные. ResponseEntity контролирует статус-коды и заголовки ответа.", "videoUrl": "http://localhost:9000/lms-media/courses/course-java/sb-m3-l1.mp4", "attachmentUrls": [], "durationMinutes": 32, "order": 1 },
          { "id": "sb-m3-l2", "title": "Spring Security 6 и JWT", "content": "SecurityFilterChain — основной бин конфигурации безопасности. Для JWT: SessionCreationPolicy.STATELESS и OncePerRequestFilter. JWT состоит из Header, Payload и Signature. @PreAuthorize с @EnableMethodSecurity для метод-уровневой авторизации.", "videoUrl": "http://localhost:9000/lms-media/courses/course-java/sb-m3-l2.mp4", "attachmentUrls": [], "durationMinutes": 38, "order": 2 }
        ]
      }
    ],
    "createdAt": new Date("2025-09-01T08:00:00Z"),
    "updatedAt": new Date("2025-09-15T12:00:00Z")
  },
  {
    "_id": "course-web",
    "title": "Архитектура Angular и RxJS",
    "description": "Angular 17+: standalone-компоненты, сигналы, RxJS и Angular Material для масштабируемых SPA.",
    "instructorId": "admin1",
    "category": "Frontend-разработка",
    "status": "PUBLISHED",
    "modules": [
      {
        "id": "ng-m1", "title": "Фундамент Angular 17", "description": "Standalone-компоненты, сигналы и новый шаблонный синтаксис", "order": 1,
        "lessons": [
          { "id": "ng-m1-l1", "title": "Standalone-компоненты и @if/@for", "content": "С Angular 17 standalone: true по умолчанию. Компонент сам импортирует зависимости через массив imports. Новый синтаксис: @if(cond) вместо *ngIf, @for(item of items; track item.id) вместо *ngFor. Параметр track обязателен для производительности DOM-рендеринга.", "videoUrl": "http://localhost:9000/lms-media/courses/course-web/ng-m1-l1.mp4", "attachmentUrls": [], "durationMinutes": 26, "order": 1 },
          { "id": "ng-m1-l2", "title": "Signals: реактивность без RxJS", "content": "signal<T>(val) создаёт реактивное значение. Чтение: val(). Запись: val.set(x). Обновление: val.update(v => v + 1). computed() создаёт производное значение, пересчитываемое только при изменении зависимостей. effect() выполняет сайд-эффекты. toSignal(obs$) конвертирует Observable в Signal.", "videoUrl": "http://localhost:9000/lms-media/courses/course-web/ng-m1-l2.mp4", "attachmentUrls": [], "durationMinutes": 24, "order": 2 }
        ]
      },
      {
        "id": "ng-m2", "title": "RxJS и HttpClient", "description": "Реактивные потоки, операторы и HTTP-коммуникация", "order": 2,
        "lessons": [
          { "id": "ng-m2-l1", "title": "RxJS: Observable, Subject, операторы", "content": "Observable — холодный поток, выполнение начинается при подписке. Subject — горячий, значение идёт всем подписчикам. BehaviorSubject хранит последнее значение. Ключевые операторы: map, filter, switchMap отменяет предыдущий запрос, debounceTime для поиска, distinctUntilChanged пропускает дубли. takeUntilDestroyed() — автоматическая отписка в Angular.", "videoUrl": "http://localhost:9000/lms-media/courses/course-web/ng-m2-l1.mp4", "attachmentUrls": [], "durationMinutes": 40, "order": 1 },
          { "id": "ng-m2-l2", "title": "HttpClient и Interceptors", "content": "provideHttpClient(withInterceptors([fn])) регистрирует функциональные интерцепторы. Интерцептор: (req, next) => next(req.clone({headers:...})). Типичные сценарии: добавление JWT-заголовка, глобальная обработка ошибок, индикатор загрузки. HttpEventType.UploadProgress для прогресса загрузки файлов.", "videoUrl": "http://localhost:9000/lms-media/courses/course-web/ng-m2-l2.mp4", "attachmentUrls": [], "durationMinutes": 33, "order": 2 }
        ]
      },
      {
        "id": "ng-m3", "title": "Маршрутизация и оптимизация", "description": "Router, Guards, Lazy Loading и производительность", "order": 3,
        "lessons": [
          { "id": "ng-m3-l1", "title": "Angular Router: Guards и Resolvers", "content": "CanActivateFn — функциональный Guard, возвращает true/false/UrlTree для редиректа. Resolver предзагружает данные до активации маршрута: resolve: { course: resolver }. RouterLink — декларативная навигация. ActivatedRoute.paramMap — реактивное получение параметров URL.", "videoUrl": "http://localhost:9000/lms-media/courses/course-web/ng-m3-l1.mp4", "attachmentUrls": [], "durationMinutes": 29, "order": 1 },
          { "id": "ng-m3-l2", "title": "Lazy Loading и производительность", "content": "loadComponent: () => import('./path').then(m => m.Component) создаёт отдельный JS-chunk. ChangeDetectionStrategy.OnPush и signals устраняют лишние проверки. track в @for предотвращает пересоздание DOM-элементов. Angular DevTools показывает время Change Detection каждого компонента.", "videoUrl": "http://localhost:9000/lms-media/courses/course-web/ng-m3-l2.mp4", "attachmentUrls": [], "durationMinutes": 27, "order": 2 }
        ]
      }
    ],
    "createdAt": new Date("2025-10-01T09:00:00Z"),
    "updatedAt": new Date("2025-10-20T14:30:00Z")
  },
  {
    "_id": "course-devops",
    "title": "CI/CD пайплайны в Docker и GitLab",
    "description": "Полный DevOps-цикл: Docker, GitLab CI/CD, Docker Compose и мониторинг с Prometheus и Grafana.",
    "instructorId": "admin1",
    "category": "DevOps и инфраструктура",
    "status": "PUBLISHED",
    "modules": [
      {
        "id": "do-m1", "title": "Контейнеризация с Docker", "description": "Образы, Dockerfile и Docker Compose", "order": 1,
        "lessons": [
          { "id": "do-m1-l1", "title": "Dockerfile и многоэтапная сборка", "content": "Каждая инструкция Dockerfile создаёт новый кешируемый слой. Порядок важен: COPY pom.xml и RUN mvn dependency:resolve до COPY src, чтобы кешировать зависимости. Multi-stage build: FROM maven AS builder, затем FROM eclipse-temurin:21-jre-alpine. Итоговый образ 180 МБ вместо 700 МБ. HEALTHCHECK проверяет работоспособность контейнера.", "videoUrl": "http://localhost:9000/lms-media/courses/course-devops/do-m1-l1.mp4", "attachmentUrls": [], "durationMinutes": 34, "order": 1 },
          { "id": "do-m1-l2", "title": "Docker Compose для разработки", "content": "docker-compose.yml описывает services, networks и volumes. depends_on с condition: service_healthy гарантирует порядок запуска. profiles позволяют условно включать сервисы. Основные команды: up -d (фон), logs -f service (стриминг логов), exec service sh (shell в контейнере), down -v (удалить всё включая volumes).", "videoUrl": "http://localhost:9000/lms-media/courses/course-devops/do-m1-l2.mp4", "attachmentUrls": [], "durationMinutes": 31, "order": 2 }
        ]
      },
      {
        "id": "do-m2", "title": "GitLab CI/CD", "description": "Пайплайны, stages, jobs и Container Registry", "order": 2,
        "lessons": [
          { "id": "do-m2-l1", "title": "Структура .gitlab-ci.yml", "content": "stages задаёт порядок этапов: build, test, docker, deploy. Jobs назначаются этапам через stage. cache сохраняет каталог .m2 между запусками. artifacts сохраняет JAR-файлы между stages. needs создаёт DAG — job стартует сразу после нужных jobs без ожидания всего stage.", "videoUrl": "http://localhost:9000/lms-media/courses/course-devops/do-m2-l1.mp4", "attachmentUrls": [], "durationMinutes": 36, "order": 1 },
          { "id": "do-m2-l2", "title": "Сборка образов и публикация в Registry", "content": "GitLab Container Registry доступен по адресу registry.gitlab.com/group/project. Переменные CI_REGISTRY, CI_REGISTRY_USER, CI_REGISTRY_PASSWORD предоставляются автоматически. Стратегия тегирования: latest для main, CI_COMMIT_SHA для точного воспроизведения, CI_COMMIT_TAG для релизов.", "videoUrl": "http://localhost:9000/lms-media/courses/course-devops/do-m2-l2.mp4", "attachmentUrls": [], "durationMinutes": 28, "order": 2 }
        ]
      },
      {
        "id": "do-m3", "title": "Мониторинг с Prometheus и Grafana", "description": "Сбор метрик, дашборды и алерты", "order": 3,
        "lessons": [
          { "id": "do-m3-l1", "title": "Prometheus: метрики из Spring Boot", "content": "Prometheus работает по pull-модели: опрашивает /actuator/prometheus каждые N секунд. Micrometer экспортирует JVM-метрики и HTTP-метрики автоматически. PromQL: rate(http_server_requests_seconds_count[5m]) — RPS. histogram_quantile(0.99, rate(bucket[5m])) — 99-й перцентиль задержки.", "videoUrl": "http://localhost:9000/lms-media/courses/course-devops/do-m3-l1.mp4", "attachmentUrls": [], "durationMinutes": 38, "order": 1 },
          { "id": "do-m3-l2", "title": "Grafana: дашборды и алерты", "content": "Data Sources: Prometheus, Loki и Tempo — три столпа наблюдаемости. Готовые дашборды импортируются по ID: 4701 для JVM Micrometer, 12900 для Spring Boot 3.x. Alerting настраивается на PromQL с уведомлениями в Slack или Telegram. Loki для поиска по логам: фильтр по приложению и уровню ошибки.", "videoUrl": "http://localhost:9000/lms-media/courses/course-devops/do-m3-l2.mp4", "attachmentUrls": [], "durationMinutes": 32, "order": 2 }
        ]
      }
    ],
    "createdAt": new Date("2025-11-01T10:00:00Z"),
    "updatedAt": new Date("2025-11-18T16:00:00Z")
  }
]);

print("Courses inserted: " + db.courses.countDocuments());