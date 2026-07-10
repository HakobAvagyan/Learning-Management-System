// Upsert all courses — safe to run multiple times, never drops existing data
db = db.getSiblingDB("lms_courses");

const courses = [
  {
    "_id": "course-java",
    "title": "Разработка на Spring Boot 3.x",
    "description": "Практический курс по созданию production-ready микросервисов на Spring Boot 3 и Java 21.",
    "instructorId": "admin1",
    "category": "Backend-разработка",
    "status": "PUBLISHED",
    "modules": [
      {
        "id": "sb-m1", "title": "Основы Spring Framework",
        "description": "IoC, DI и автоконфигурация", "order": 1,
        "lessons": [
          { "id": "sb-m1-l1", "title": "Инверсия управления и DI",
            "content": "IoC — принцип, при котором объект получает зависимости извне. Spring реализует его через ApplicationContext. Бины объявляются через @Component, @Service, @Repository или @Bean в @Configuration-классе. Конструкторное внедрение (@RequiredArgsConstructor) предпочтительно: гарантирует неизменяемость и упрощает тестирование без Spring-контекста. @Autowired на поле — антипаттерн: скрывает зависимости и ломает юнит-тесты.",
            "videoUrl": "", "attachmentUrls": [], "durationMinutes": 28, "order": 1 },
          { "id": "sb-m1-l2", "title": "Spring Boot Auto-configuration",
            "content": "Spring Boot автонастраивает бины через META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports. Каждый класс содержит @ConditionalOnClass, @ConditionalOnMissingBean, @ConditionalOnProperty и другие условия. Флаг --debug при запуске выводит Conditions Report с причинами включения и исключения каждого бина. Переопределить автоконфигурацию можно объявив собственный бин того же типа.",
            "videoUrl": "", "attachmentUrls": [], "durationMinutes": 22, "order": 2 }
        ]
      },
      {
        "id": "sb-m2", "title": "Spring Data и базы данных",
        "description": "JPA, Hibernate, транзакции и MongoDB", "order": 2,
        "lessons": [
          { "id": "sb-m2-l1", "title": "JPA и Spring Data JPA",
            "content": "JPA — стандарт ORM для Java. Spring Data JPA автоматически генерирует реализацию репозитория по интерфейсу JpaRepository<Entity, ID>. Методы именования: findByUsernameAndEnabled(), findByCreatedAtBetween(). @Query — JPQL-запрос вручную. Пагинация: Page<T> findAll(Pageable p) + PageRequest.of(0, 20, Sort.by(\"createdAt\").descending()). @Modifying + @Transactional для UPDATE/DELETE запросов.",
            "videoUrl": "", "attachmentUrls": [], "durationMinutes": 35, "order": 1 },
          { "id": "sb-m2-l2", "title": "Spring Data MongoDB",
            "content": "Документы аннотируются @Document(collection=\"name\"). @Id маппится на _id MongoDB. MongoRepository предоставляет стандартный CRUD. Для сложных запросов — MongoTemplate с Criteria.where(\"field\").is(val). Агрегации: Aggregation.newAggregation(match, group, project). Индексы: @Indexed(unique=true), @CompoundIndex. Аудит: @CreatedDate + @EnableMongoAuditing.",
            "videoUrl": "", "attachmentUrls": [], "durationMinutes": 30, "order": 2 }
        ]
      },
      {
        "id": "sb-m3", "title": "REST API и Spring Security с JWT",
        "description": "Проектирование REST, Security 6 и stateless JWT", "order": 3,
        "lessons": [
          { "id": "sb-m3-l1", "title": "Построение RESTful API",
            "content": "@RestController = @Controller + @ResponseBody. Маппинг: @GetMapping, @PostMapping, @PutMapping, @DeleteMapping, @PatchMapping. Извлечение данных: @PathVariable для /api/users/{id}, @RequestParam для ?page=0&size=10, @RequestBody для JSON-тела запроса. ResponseEntity<T> даёт полный контроль над кодом ответа и заголовками. ControllerAdvice + @ExceptionHandler — централизованная обработка ошибок.",
            "videoUrl": "", "attachmentUrls": [], "durationMinutes": 32, "order": 1 },
          { "id": "sb-m3-l2", "title": "Spring Security 6 и JWT",
            "content": "Spring Security 6 использует lambda DSL: http.authorizeHttpRequests(auth -> auth.requestMatchers(\"/public\").permitAll().anyRequest().authenticated()). Stateless JWT: SessionCreationPolicy.STATELESS и OncePerRequestFilter. JWT состоит из Base64(Header).Base64(Payload).Signature — подпись проверяется секретным ключом HMAC-SHA256. @PreAuthorize(\"hasRole('ADMIN')\") + @EnableMethodSecurity для авторизации на уровне методов.",
            "videoUrl": "", "attachmentUrls": [], "durationMinutes": 38, "order": 2 }
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
        "id": "ng-m1", "title": "Фундамент Angular 17",
        "description": "Standalone-компоненты, сигналы и новый шаблонный синтаксис", "order": 1,
        "lessons": [
          { "id": "ng-m1-l1", "title": "Standalone-компоненты и @if/@for",
            "content": "С Angular 17 standalone: true является значением по умолчанию. Компонент сам импортирует зависимости через массив imports — NgModule больше не нужен. Новый синтаксис шаблонов: @if(condition) { ... } @else { ... } вместо *ngIf, @for(item of items; track item.id) { ... } вместо *ngFor. Параметр track обязателен: Angular использует его для идентификации элементов при обновлении DOM, что на 30–40% быстрее предыдущего алгоритма.",
            "videoUrl": "", "attachmentUrls": [], "durationMinutes": 26, "order": 1 },
          { "id": "ng-m1-l2", "title": "Signals: реактивность без RxJS",
            "content": "Signals — примитивы реактивности Angular 17. signal<T>(initValue) создаёт реактивное значение. Чтение: value(). Запись: value.set(newVal). Обновление: value.update(v => v + 1). computed(() => a() + b()) автоматически пересчитывается только при изменении зависимостей. effect(() => { console.log(value()) }, { allowSignalWrites: true }) — для сайд-эффектов. toSignal(observable$) конвертирует RxJS Observable в Signal.",
            "videoUrl": "", "attachmentUrls": [], "durationMinutes": 24, "order": 2 }
        ]
      },
      {
        "id": "ng-m2", "title": "RxJS и HttpClient",
        "description": "Реактивные потоки, операторы и HTTP-коммуникация", "order": 2,
        "lessons": [
          { "id": "ng-m2-l1", "title": "RxJS: Observable, Subject, операторы",
            "content": "Observable — холодный поток: выполняется отдельно для каждого подписчика. Subject — горячий: одно выполнение для всех подписчиков. BehaviorSubject(initVal) хранит последнее значение и отдаёт его новым подписчикам. Ключевые операторы: map преобразует, filter отбирает, switchMap отменяет предыдущий внутренний поток (идеален для HTTP-запросов при вводе), debounceTime(300) задерживает, distinctUntilChanged пропускает дубли. takeUntilDestroyed() — автоматическая отписка Angular 16+.",
            "videoUrl": "", "attachmentUrls": [], "durationMinutes": 40, "order": 1 },
          { "id": "ng-m2-l2", "title": "HttpClient и Interceptors",
            "content": "provideHttpClient(withInterceptors([authInterceptor])) регистрирует функциональные интерцепторы в main.ts. Интерцептор — чистая функция: (req, next) => next(req.clone({ setHeaders: { Authorization: 'Bearer ' + token } })). Типичные сценарии: добавление JWT-заголовка, глобальная обработка ошибок с catchError, индикатор загрузки через tap. Загрузка файлов: http.post(url, formData, { reportProgress: true, observe: 'events' }) + HttpEventType.UploadProgress.",
            "videoUrl": "", "attachmentUrls": [], "durationMinutes": 33, "order": 2 }
        ]
      },
      {
        "id": "ng-m3", "title": "Маршрутизация и оптимизация",
        "description": "Router, Guards, Lazy Loading и производительность", "order": 3,
        "lessons": [
          { "id": "ng-m3-l1", "title": "Angular Router: Guards и Resolvers",
            "content": "CanActivateFn — функциональный Guard, возвращает boolean или UrlTree для редиректа: inject(Router).createUrlTree(['/login']). Resolver предзагружает данные до отображения маршрута: resolve: { course: courseResolver }. Данные доступны через ActivatedRoute.data. RouterLink — декларативная навигация в шаблоне. Router.navigate(['/courses', id]) — программная навигация. ActivatedRoute.paramMap — реактивное получение параметров URL.",
            "videoUrl": "", "attachmentUrls": [], "durationMinutes": 29, "order": 1 },
          { "id": "ng-m3-l2", "title": "Lazy Loading и производительность",
            "content": "Lazy loading: loadComponent: () => import('./feature/feature.component').then(m => m.FeatureComponent) — Angular создаёт отдельный JS-chunk, загружаемый только при переходе на маршрут. ChangeDetectionStrategy.OnPush с Signals устраняет лишние проверки: компонент обновляется только при изменении @Input() или сигнала. track в @for предотвращает пересоздание DOM. Angular DevTools в Chrome показывает время Change Detection каждого компонента.",
            "videoUrl": "", "attachmentUrls": [], "durationMinutes": 27, "order": 2 }
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
        "id": "do-m1", "title": "Контейнеризация с Docker",
        "description": "Образы, Dockerfile и Docker Compose", "order": 1,
        "lessons": [
          { "id": "do-m1-l1", "title": "Dockerfile и многоэтапная сборка",
            "content": "Каждая инструкция Dockerfile создаёт новый кешируемый слой. Порядок важен: COPY pom.xml . → RUN mvn dependency:resolve кешируют зависимости отдельно от исходного кода. Multi-stage build: FROM maven:3.9-eclipse-temurin-21 AS builder; RUN mvn package -DskipTests; FROM eclipse-temurin:21-jre-alpine; COPY --from=builder target/*.jar app.jar. Итоговый образ — около 180 МБ вместо 700 МБ. HEALTHCHECK CMD curl --fail http://localhost:8080/actuator/health.",
            "videoUrl": "", "attachmentUrls": [], "durationMinutes": 34, "order": 1 },
          { "id": "do-m1-l2", "title": "Docker Compose для разработки",
            "content": "docker-compose.yml описывает services, networks и volumes. depends_on с condition: service_healthy гарантирует порядок запуска через healthcheck. environment задаёт переменные окружения, env_file подгружает .env-файл. Основные команды: docker compose up -d (запуск в фоне), logs -f service (потоковые логи), exec service sh (shell внутри контейнера), down -v (остановка с удалением volumes). profiles позволяют условно включать сервисы для dev/prod.",
            "videoUrl": "", "attachmentUrls": [], "durationMinutes": 31, "order": 2 }
        ]
      },
      {
        "id": "do-m2", "title": "GitLab CI/CD",
        "description": "Пайплайны, stages, jobs и Container Registry", "order": 2,
        "lessons": [
          { "id": "do-m2-l1", "title": "Структура .gitlab-ci.yml",
            "content": "stages определяет порядок этапов: [build, test, docker, deploy]. Jobs назначаются этапам через stage. cache сохраняет .m2 между запусками: cache: { paths: ['.m2/repository'] }. artifacts сохраняет артефакты между stages: artifacts: { paths: ['target/*.jar'] }. needs создаёт DAG-зависимости: job стартует сразу после указанных jobs, не дожидаясь всего stage. rules заменяет only/except: условия запуска через if/changes/exists.",
            "videoUrl": "", "attachmentUrls": [], "durationMinutes": 36, "order": 1 },
          { "id": "do-m2-l2", "title": "Сборка образов и публикация в Registry",
            "content": "GitLab Container Registry доступен по адресу registry.gitlab.com/group/project:tag. Переменные CI_REGISTRY, CI_REGISTRY_USER, CI_REGISTRY_PASSWORD предоставляются автоматически. Логин: docker login -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD $CI_REGISTRY. Стратегия тегирования: :latest для main-ветки, :$CI_COMMIT_SHORT_SHA для точного воспроизведения, :$CI_COMMIT_TAG для релизов. Docker BuildKit: DOCKER_BUILDKIT=1 ускоряет сборку через параллельные слои.",
            "videoUrl": "", "attachmentUrls": [], "durationMinutes": 28, "order": 2 }
        ]
      },
      {
        "id": "do-m3", "title": "Мониторинг с Prometheus и Grafana",
        "description": "Сбор метрик, дашборды и алерты", "order": 3,
        "lessons": [
          { "id": "do-m3-l1", "title": "Prometheus: метрики из Spring Boot",
            "content": "Prometheus работает по pull-модели: сам опрашивает /actuator/prometheus каждые N секунд согласно конфигу. Micrometer экспортирует JVM-метрики (heap, GC, threads) и HTTP-метрики автоматически. PromQL: rate(http_server_requests_seconds_count{status='200'}[5m]) — RPS успешных запросов. histogram_quantile(0.99, rate(http_server_requests_seconds_bucket[5m])) — p99 задержки. Запись правил: recording rules агрегируют тяжёлые запросы заранее.",
            "videoUrl": "", "attachmentUrls": [], "durationMinutes": 38, "order": 1 },
          { "id": "do-m3-l2", "title": "Grafana: дашборды и алерты",
            "content": "Grafana объединяет три столпа наблюдаемости: Prometheus (метрики), Loki (логи), Tempo (трассировки). Готовые дашборды импортируются по ID: 4701 для JVM Micrometer, 12900 для Spring Boot 3.x. Alerting: правило на PromQL → Contact Point (Slack, Telegram) → Notification Policy. Loki LogQL для поиска по логам: {container=\"lms-api-gateway\"} |= \"ERROR\". Provisioning через YAML позволяет хранить дашборды в Git.",
            "videoUrl": "", "attachmentUrls": [], "durationMinutes": 32, "order": 2 }
        ]
      }
    ],
    "createdAt": new Date("2025-11-01T10:00:00Z"),
    "updatedAt": new Date("2025-11-18T16:00:00Z")
  },
  {
    "_id": "course-backend",
    "title": "Backend-разработка на Spring Boot 3",
    "description": "Полный курс по созданию production-ready REST API на Spring Boot 3, Java 21 и PostgreSQL. От структуры проекта до контейнеризации и мониторинга.",
    "instructorId": "instructor1",
    "category": "Backend-разработка",
    "status": "PUBLISHED",
    "modules": [
      {
        "id": "be-m1", "title": "Основы Spring Boot 3",
        "description": "Maven, стартеры, автоконфигурация и профили", "order": 1,
        "lessons": [
          { "id": "be-m1-l1", "title": "Maven, структура проекта и стартеры",
            "content": "Spring Boot проект создаётся через start.spring.io. Структура: src/main/java (исходники), src/main/resources (конфигурация), src/test (тесты). Стартеры — наборы зависимостей: spring-boot-starter-web включает Tomcat, Spring MVC и Jackson. pom.xml наследует spring-boot-starter-parent, который управляет версиями всех зависимостей. Команда mvn spring-boot:run запускает приложение локально.",
            "videoUrl": "", "attachmentUrls": [], "durationMinutes": 30, "order": 1 },
          { "id": "be-m1-l2", "title": "Конфигурация приложения и профили",
            "content": "application.yml — главный файл конфигурации: server.port, spring.datasource.url, кастомные свойства. Профили: application-dev.yml, application-prod.yml. Активация: spring.profiles.active=dev или переменная окружения SPRING_PROFILES_ACTIVE. @Value('${property}') инжектирует отдельное значение. @ConfigurationProperties(prefix='app') маппирует группу свойств в типизированный бин. @ConditionalOnProperty условно активирует бины.",
            "videoUrl": "", "attachmentUrls": [], "durationMinutes": 28, "order": 2 }
        ]
      },
      {
        "id": "be-m2", "title": "Spring Data и персистентность",
        "description": "JPA, Hibernate, репозитории, транзакции и оптимизация запросов", "order": 2,
        "lessons": [
          { "id": "be-m2-l1", "title": "Spring Data JPA: репозитории и запросы",
            "content": "JPA-сущность: @Entity, @Table(name), @Id, @GeneratedValue(strategy=IDENTITY). Связи: @OneToMany(mappedBy, cascade=ALL), @ManyToOne, @JoinColumn. JpaRepository<Entity, ID> предоставляет findAll, findById, save, deleteById и производные методы. @Query с JPQL: SELECT u FROM User u WHERE u.email = :email. Page<T> findAll(Pageable) — пагинация. PageRequest.of(0, 20, Sort.by('createdAt').descending()).",
            "videoUrl": "", "attachmentUrls": [], "durationMinutes": 38, "order": 1 },
          { "id": "be-m2-l2", "title": "Транзакции, N+1 и кеш второго уровня",
            "content": "Проблема N+1: при LAZY-загрузке @OneToMany для N объектов выполняется 1+N SELECT-запросов. Решения: JOIN FETCH в @Query или @EntityGraph(attributePaths={'items'}). @Transactional(readOnly=true) на сервисном методе оптимизирует SELECT — Hibernate не отслеживает изменения. @Transactional откатывает при непроверяемых исключениях (RuntimeException). Кеш второго уровня: Caffeine через spring.cache.type=caffeine + @Cacheable.",
            "videoUrl": "", "attachmentUrls": [], "durationMinutes": 42, "order": 2 }
        ]
      },
      {
        "id": "be-m3", "title": "Безопасность и деплой",
        "description": "Spring Security 6, JWT, Actuator и Docker", "order": 3,
        "lessons": [
          { "id": "be-m3-l1", "title": "Spring Security 6 и JWT-аутентификация",
            "content": "Spring Security 6 использует функциональный DSL: SecurityFilterChain bean. Stateless JWT: SessionCreationPolicy.STATELESS. OncePerRequestFilter читает JWT из заголовка Authorization: Bearer, валидирует подпись и помещает Authentication в SecurityContextHolder. JWT = Base64(Header) + '.' + Base64(Payload) + '.' + Signature. Подпись HMAC-SHA256 предотвращает подделку токена. @PreAuthorize через @EnableMethodSecurity.",
            "videoUrl": "", "attachmentUrls": [], "durationMinutes": 40, "order": 1 },
          { "id": "be-m3-l2", "title": "Actuator, метрики и Docker-деплой",
            "content": "Spring Boot Actuator: /actuator/health (статус), /actuator/metrics (JVM-метрики), /actuator/prometheus (для Prometheus). Многоэтапный Dockerfile: FROM maven AS builder; RUN mvn package -DskipTests; FROM eclipse-temurin:21-jre-alpine; COPY --from=builder *.jar app.jar. HEALTHCHECK CMD curl --fail http://localhost:8080/actuator/health. docker compose up -d запускает все сервисы. Переменные из environment переопределяют application.yml.",
            "videoUrl": "", "attachmentUrls": [], "durationMinutes": 35, "order": 2 }
        ]
      }
    ],
    "createdAt": new Date("2025-09-01T08:00:00Z"),
    "updatedAt": new Date("2025-09-20T12:00:00Z")
  },
  {
    "_id": "course-frontend",
    "title": "Frontend-разработка на Angular 17",
    "description": "Современный Angular 17+: standalone-компоненты, Signals API, RxJS, Angular Material и архитектурные паттерны для масштабируемых SPA-приложений.",
    "instructorId": "instructor2",
    "category": "Frontend-разработка",
    "status": "PUBLISHED",
    "modules": [
      {
        "id": "fe-m1", "title": "Angular 17: Основы",
        "description": "Компоненты, шаблоны, директивы и Signals API", "order": 1,
        "lessons": [
          { "id": "fe-m1-l1", "title": "Компоненты, шаблоны и привязки данных",
            "content": "Компонент — основной строительный блок Angular. @Component({ selector, template, standalone: true, imports: [] }). Привязки: {{ value }} — интерполяция, [property]='expr' — property binding, (event)='handler()' — event binding, [(ngModel)]='field' — двусторонняя. @Input() принимают данные от родителя. @Output() EventEmitter — события дочернего компонента. Жизненный цикл: ngOnInit (инициализация), ngOnChanges (изменение @Input), ngOnDestroy (очистка).",
            "videoUrl": "", "attachmentUrls": [], "durationMinutes": 32, "order": 1 },
          { "id": "fe-m1-l2", "title": "Директивы, пайпы и Signals API",
            "content": "Новый синтаксис Angular 17: @if(cond){...}@else{...} вместо *ngIf, @for(item of list; track item.id){...} вместо *ngFor, @switch/@case для множественных условий. Пайпы: {{ price | currency:'RUB':'symbol':'1.0-0' }}, {{ date | date:'dd.MM.yyyy HH:mm' }}, {{ text | uppercase }}. Кастомный пайп: @Pipe({ name: 'shorten', pure: true }). Signals: signal<T>(init), computed(), effect({ allowSignalWrites: true }), toSignal(obs$).",
            "videoUrl": "", "attachmentUrls": [], "durationMinutes": 30, "order": 2 }
        ]
      },
      {
        "id": "fe-m2", "title": "RxJS и HTTP-коммуникация",
        "description": "Реактивные потоки, операторы и Angular HttpClient", "order": 2,
        "lessons": [
          { "id": "fe-m2-l1", "title": "Реактивное программирование с RxJS",
            "content": "Observable — холодный поток, выполнение начинается при подписке. Subject — горячий, значение идёт всем подписчикам сразу. BehaviorSubject(initValue) хранит последнее значение и отдаёт его новому подписчику немедленно. Операторы: map, filter, switchMap (отменяет предыдущий — идеал для HTTP), mergeMap (параллельно), concatMap (по очереди), exhaustMap (игнорирует новые пока активен). combineLatest([a$, b$]) — последние значения всех потоков. takeUntilDestroyed() — автоматическая отписка Angular 16+.",
            "videoUrl": "", "attachmentUrls": [], "durationMinutes": 45, "order": 1 },
          { "id": "fe-m2-l2", "title": "HttpClient, интерцепторы и обработка ошибок",
            "content": "provideHttpClient(withInterceptors([authInterceptor])). HttpClient возвращает холодный Observable — запрос выполняется только при подписке. Типизация: http.get<Course[]>('/api/courses'). Функциональный интерцептор: (req, next) => next(req.clone({ setHeaders: { Authorization: 'Bearer ' + token } })). Обработка ошибок: catchError((err) => { if(err.status===401) router.navigate(['/login']); return throwError(() => err); }). Загрузка файлов: http.post(url, formData, { reportProgress: true, observe: 'events' }) + HttpEventType.UploadProgress.",
            "videoUrl": "", "attachmentUrls": [], "durationMinutes": 36, "order": 2 }
        ]
      },
      {
        "id": "fe-m3", "title": "Архитектура и тестирование",
        "description": "Маршрутизация, Guards, Lazy Loading и автотесты", "order": 3,
        "lessons": [
          { "id": "fe-m3-l1", "title": "Маршрутизация, Guards и Lazy Loading",
            "content": "Lazy loading: loadComponent: () => import('./feature.component').then(m => m.FeatureComponent) — Angular собирает отдельный JS-чанк, загружаемый только при необходимости. CanActivateFn — функциональный Guard: inject(AuthService).isLoggedIn() ? true : inject(Router).createUrlTree(['/login']). Resolver предзагружает данные: resolve: { course: courseResolver }, данные доступны через route.data['course']. ActivatedRoute.paramMap — реактивные параметры URL.",
            "videoUrl": "", "attachmentUrls": [], "durationMinutes": 34, "order": 1 },
          { "id": "fe-m3-l2", "title": "Тестирование Angular: Jasmine, Jest и Cypress",
            "content": "Unit-тесты: TestBed.configureTestingModule({ imports: [ComponentUnderTest], providers: [{ provide: SomeService, useValue: mockService }] }). fixture.detectChanges() запускает Change Detection. Spy: spyOn(service, 'method').and.returnValue(of(data)). Expect: expect(component.title).toBe('expected'). E2E с Cypress: cy.visit('/login'); cy.get('[data-testid=username]').type('admin1'); cy.get('[type=submit]').click(); cy.url().should('include', '/home'). cy.intercept для мокирования API.",
            "videoUrl": "", "attachmentUrls": [], "durationMinutes": 38, "order": 2 }
        ]
      }
    ],
    "createdAt": new Date("2025-10-01T09:00:00Z"),
    "updatedAt": new Date("2025-10-22T15:00:00Z")
  },
  {
    "_id": "course-qa",
    "title": "QA-инженерия и тест-автоматизация",
    "description": "Полный курс QA: теория тестирования, тест-дизайн, API-тестирование с Postman/RestAssured и UI-автоматизация с Selenium + TestNG + Allure.",
    "instructorId": "instructor3",
    "category": "QA и тестирование",
    "status": "PUBLISHED",
    "modules": [
      {
        "id": "qa-m1", "title": "Теория тестирования",
        "description": "Виды тестирования, жизненный цикл бага и техники тест-дизайна", "order": 1,
        "lessons": [
          { "id": "qa-m1-l1", "title": "Виды тестирования и жизненный цикл бага",
            "content": "Функциональное тестирование — проверяет поведение согласно требованиям. Нефункциональное: нагрузочное (JMeter, Gatling), безопасность (OWASP ZAP, Burp Suite), usability, совместимость. По уровню: unit (изолированный метод), интеграционное (взаимодействие компонентов), системное (сквозной сценарий), приёмочное UAT. Жизненный цикл бага: New → Assigned → In Progress → Fixed → Retest → Closed (или Reopened). Хороший баг-репорт: чёткое название, шаги воспроизведения, ожидаемый/фактический результат, среда, скриншот. Severity: Critical, Major, Minor, Trivial.",
            "videoUrl": "", "attachmentUrls": [], "durationMinutes": 35, "order": 1 },
          { "id": "qa-m1-l2", "title": "Техники тест-дизайна и документация",
            "content": "Эквивалентное разбиение: входные данные делятся на классы с одинаковым поведением — достаточно одного значения из каждого класса. Граничные значения: тестируем на границах диапазона (min-1, min, min+1, max-1, max, max+1). Таблица решений — матрица условий и действий для сложных бизнес-правил. Попарное тестирование (Pairwise): охватывает все пары параметров вместо полного перебора. Чек-лист — краткий список проверок. Тест-кейс: ID, название, preconditions, шаги, expected result, priority. Тест-план: scope, ресурсы, критерии входа/выхода, риски.",
            "videoUrl": "", "attachmentUrls": [], "durationMinutes": 32, "order": 2 }
        ]
      },
      {
        "id": "qa-m2", "title": "API-тестирование",
        "description": "REST API: ручное тестирование, Postman и RestAssured", "order": 2,
        "lessons": [
          { "id": "qa-m2-l1", "title": "REST API: методы, статусы и коллекции Postman",
            "content": "HTTP-методы: GET (чтение, идемпотентен), POST (создание, не идемпотентен), PUT (полное обновление, идемпотентен), PATCH (частичное обновление), DELETE (удаление, идемпотентен). Статус-коды: 200 OK, 201 Created, 204 No Content, 400 Bad Request (ошибка клиента), 401 Unauthorized (нет токена), 403 Forbidden (нет прав), 404 Not Found, 409 Conflict, 500 Internal Server Error. Postman: коллекции, Environments ({{baseUrl}}, {{token}}), pre-request Scripts. Tests: pm.test('201', () => pm.response.to.have.status(201)); pm.environment.set('userId', pm.response.json().id).",
            "videoUrl": "", "attachmentUrls": [], "durationMinutes": 40, "order": 1 },
          { "id": "qa-m2-l2", "title": "Автоматизация API с Newman и RestAssured",
            "content": "Newman CLI запускает Postman-коллекции в CI: newman run collection.json -e env.json --reporters cli,htmlextra. RestAssured DSL: given().header(\"Authorization\", \"Bearer \"+token).contentType(ContentType.JSON).body(requestBody).when().post(\"/api/courses\").then().statusCode(201).body(\"title\", equalTo(\"Spring Boot\")). JsonPath для извлечения: response.jsonPath().getString(\"data.id\"). Allure-аннотации: @Feature(\"Courses API\"), @Story(\"Create course\"), @Step(\"POST /api/courses\") для структурированных HTML-отчётов.",
            "videoUrl": "", "attachmentUrls": [], "durationMinutes": 38, "order": 2 }
        ]
      },
      {
        "id": "qa-m3", "title": "UI-автоматизация",
        "description": "Selenium WebDriver, Page Object Model, TestNG и Allure", "order": 3,
        "lessons": [
          { "id": "qa-m3-l1", "title": "Selenium WebDriver: локаторы и Page Object",
            "content": "WebDriver управляет браузером через W3C WebDriver Protocol. Браузеры: ChromeDriver, FirefoxDriver, EdgeDriver. Локаторы (от надёжного к хрупкому): By.id, By.cssSelector, By.xpath — XPath последний выбор. CSS-примеры: #submit-btn, .form-input, [data-testid='username'], button[type='submit']. Явное ожидание: new WebDriverWait(driver, Duration.ofSeconds(10)).until(ExpectedConditions.elementToBeClickable(locator)). Page Object Model: класс страницы инкапсулирует локаторы (@FindBy) и методы. PageFactory.initElements(driver, this) инициализирует поля.",
            "videoUrl": "", "attachmentUrls": [], "durationMinutes": 42, "order": 1 },
          { "id": "qa-m3-l2", "title": "TestNG, Allure-отчёты и CI-интеграция",
            "content": "TestNG: @Test(priority, groups, dataProvider), @BeforeSuite, @AfterSuite, @BeforeMethod (создание драйвера), @AfterMethod (снимок экрана при падении). Параллельный запуск: <suite parallel='methods' thread-count='4'>. DataProvider: @DataProvider(name='loginData') возвращает Object[][] — параметризованные тесты из Excel или JSON. Allure 2: @Feature, @Story, @Step, Allure.addAttachment(\"Screenshot\", screenshot). Команды: allure generate target/allure-results --clean; allure open. Maven Surefire запускает TestNG в CI. Allure Jenkins Plugin публикует интерактивный отчёт.",
            "videoUrl": "", "attachmentUrls": [], "durationMinutes": 40, "order": 2 }
        ]
      }
    ],
    "createdAt": new Date("2025-11-01T10:00:00Z"),
    "updatedAt": new Date("2025-11-25T16:00:00Z")
  }
];

let inserted = 0, updated = 0;
courses.forEach(course => {
  const result = db.courses.replaceOne({ _id: course._id }, course, { upsert: true });
  if (result.upsertedCount) inserted++;
  else updated++;
});

print("Done — inserted: " + inserted + ", updated: " + updated + ", total: " + db.courses.countDocuments());
