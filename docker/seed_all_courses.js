// Updates ONLY the content field of each lesson — does NOT touch videoUrl or other fields.
// Matches lessons by title across all courses in the database.
db = db.getSiblingDB("lms_courses");

const contentByTitle = {
  // ── course-java / course-backend ────────────────────────────────────────
  "Инверсия управления и DI":
    "IoC — принцип, при котором объект получает зависимости извне. Spring реализует его через ApplicationContext. Бины объявляются через @Component, @Service, @Repository или @Bean в @Configuration-классе. Конструкторное внедрение (@RequiredArgsConstructor) предпочтительно: гарантирует неизменяемость и упрощает тестирование без Spring-контекста. @Autowired на поле — антипаттерн: скрывает зависимости и ломает юнит-тесты.",

  "Spring Boot Auto-configuration":
    "Spring Boot автонастраивает бины через META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports. Каждый класс содержит @ConditionalOnClass, @ConditionalOnMissingBean, @ConditionalOnProperty и другие условия. Флаг --debug при запуске выводит Conditions Report с причинами включения и исключения каждого бина. Переопределить автоконфигурацию можно объявив собственный бин того же типа.",

  "JPA и Spring Data JPA":
    "JPA — стандарт ORM для Java. Spring Data JPA автоматически генерирует реализацию репозитория по интерфейсу JpaRepository<Entity, ID>. Методы именования: findByUsernameAndEnabled(), findByCreatedAtBetween(). @Query — JPQL-запрос вручную. Пагинация: Page<T> findAll(Pageable p) + PageRequest.of(0, 20, Sort.by(\"createdAt\").descending()). @Modifying + @Transactional для UPDATE/DELETE запросов.",

  "Spring Data MongoDB":
    "Документы аннотируются @Document(collection=\"name\"). @Id маппится на _id MongoDB. MongoRepository предоставляет стандартный CRUD. Для сложных запросов — MongoTemplate с Criteria.where(\"field\").is(val). Агрегации: Aggregation.newAggregation(match, group, project). Индексы: @Indexed(unique=true), @CompoundIndex. Аудит: @CreatedDate + @EnableMongoAuditing.",

  "Построение RESTful API":
    "@RestController = @Controller + @ResponseBody. Маппинг: @GetMapping, @PostMapping, @PutMapping, @DeleteMapping, @PatchMapping. Извлечение данных: @PathVariable для /api/users/{id}, @RequestParam для ?page=0&size=10, @RequestBody для JSON-тела запроса. ResponseEntity<T> даёт полный контроль над кодом ответа и заголовками. ControllerAdvice + @ExceptionHandler — централизованная обработка ошибок.",

  "Spring Security 6 и JWT":
    "Spring Security 6 использует lambda DSL: http.authorizeHttpRequests(auth -> auth.requestMatchers(\"/public\").permitAll().anyRequest().authenticated()). Stateless JWT: SessionCreationPolicy.STATELESS и OncePerRequestFilter. JWT состоит из Base64(Header).Base64(Payload).Signature — подпись проверяется секретным ключом HMAC-SHA256. @PreAuthorize(\"hasRole('ADMIN')\") + @EnableMethodSecurity для авторизации на уровне методов.",

  // ── course-backend ───────────────────────────────────────────────────────
  "Maven, структура проекта и стартеры":
    "Spring Boot проект создаётся через start.spring.io. Структура: src/main/java (исходники), src/main/resources (конфигурация), src/test (тесты). Стартеры — наборы зависимостей: spring-boot-starter-web включает Tomcat, Spring MVC и Jackson. pom.xml наследует spring-boot-starter-parent, который управляет версиями всех зависимостей. Команда mvn spring-boot:run запускает приложение локально.",

  "Конфигурация приложения и профили":
    "application.yml — главный файл конфигурации: server.port, spring.datasource.url, кастомные свойства. Профили: application-dev.yml, application-prod.yml. Активация: spring.profiles.active=dev или переменная окружения SPRING_PROFILES_ACTIVE. @Value('${property}') инжектирует отдельное значение. @ConfigurationProperties(prefix='app') маппирует группу свойств в типизированный бин. @ConditionalOnProperty условно активирует бины.",

  "Spring Data JPA: репозитории и запросы":
    "JPA-сущность: @Entity, @Table(name), @Id, @GeneratedValue(strategy=IDENTITY). Связи: @OneToMany(mappedBy, cascade=ALL), @ManyToOne, @JoinColumn. JpaRepository<Entity, ID> предоставляет findAll, findById, save, deleteById и производные методы. @Query с JPQL: SELECT u FROM User u WHERE u.email = :email. Page<T> findAll(Pageable) — пагинация. PageRequest.of(0, 20, Sort.by('createdAt').descending()).",

  "Транзакции, N+1 и кеш второго уровня":
    "Проблема N+1: при LAZY-загрузке @OneToMany для N объектов выполняется 1+N SELECT-запросов. Решения: JOIN FETCH в @Query или @EntityGraph(attributePaths={'items'}). @Transactional(readOnly=true) на сервисном методе оптимизирует SELECT — Hibernate не отслеживает изменения. @Transactional откатывает при непроверяемых исключениях (RuntimeException). Кеш второго уровня: Caffeine через spring.cache.type=caffeine + @Cacheable.",

  "Spring Security 6 и JWT-аутентификация":
    "Spring Security 6 использует функциональный DSL: SecurityFilterChain bean. Stateless JWT: SessionCreationPolicy.STATELESS. OncePerRequestFilter читает JWT из заголовка Authorization: Bearer, валидирует подпись и помещает Authentication в SecurityContextHolder. JWT = Base64(Header) + '.' + Base64(Payload) + '.' + Signature. Подпись HMAC-SHA256 предотвращает подделку токена. @PreAuthorize через @EnableMethodSecurity.",

  "Actuator, метрики и Docker-деплой":
    "Spring Boot Actuator: /actuator/health (статус), /actuator/metrics (JVM-метрики), /actuator/prometheus (для Prometheus). Многоэтапный Dockerfile: FROM maven AS builder; RUN mvn package -DskipTests; FROM eclipse-temurin:21-jre-alpine; COPY --from=builder *.jar app.jar. HEALTHCHECK CMD curl --fail http://localhost:8080/actuator/health. docker compose up -d запускает все сервисы. Переменные из environment переопределяют application.yml.",

  // ── course-web / course-frontend ─────────────────────────────────────────
  "Standalone-компоненты и @if/@for":
    "С Angular 17 standalone: true является значением по умолчанию. Компонент сам импортирует зависимости через массив imports — NgModule больше не нужен. Новый синтаксис шаблонов: @if(condition) { ... } @else { ... } вместо *ngIf, @for(item of items; track item.id) { ... } вместо *ngFor. Параметр track обязателен: Angular использует его для идентификации элементов при обновлении DOM, что на 30–40% быстрее предыдущего алгоритма.",

  "Signals: реактивность без RxJS":
    "Signals — примитивы реактивности Angular 17. signal<T>(initValue) создаёт реактивное значение. Чтение: value(). Запись: value.set(newVal). Обновление: value.update(v => v + 1). computed(() => a() + b()) автоматически пересчитывается только при изменении зависимостей. effect(() => { console.log(value()) }, { allowSignalWrites: true }) — для сайд-эффектов. toSignal(observable$) конвертирует RxJS Observable в Signal.",

  "RxJS: Observable, Subject, операторы":
    "Observable — холодный поток: выполняется отдельно для каждого подписчика. Subject — горячий: одно выполнение для всех подписчиков. BehaviorSubject(initVal) хранит последнее значение и отдаёт его новым подписчикам. Ключевые операторы: map преобразует, filter отбирает, switchMap отменяет предыдущий внутренний поток (идеален для HTTP-запросов при вводе), debounceTime(300) задерживает, distinctUntilChanged пропускает дубли. takeUntilDestroyed() — автоматическая отписка Angular 16+.",

  "HttpClient и Interceptors":
    "provideHttpClient(withInterceptors([authInterceptor])) регистрирует функциональные интерцепторы в main.ts. Интерцептор — чистая функция: (req, next) => next(req.clone({ setHeaders: { Authorization: 'Bearer ' + token } })). Типичные сценарии: добавление JWT-заголовка, глобальная обработка ошибок с catchError, индикатор загрузки через tap. Загрузка файлов: http.post(url, formData, { reportProgress: true, observe: 'events' }) + HttpEventType.UploadProgress.",

  "Angular Router: Guards и Resolvers":
    "CanActivateFn — функциональный Guard, возвращает boolean или UrlTree для редиректа: inject(Router).createUrlTree(['/login']). Resolver предзагружает данные до отображения маршрута: resolve: { course: courseResolver }. Данные доступны через ActivatedRoute.data. RouterLink — декларативная навигация в шаблоне. Router.navigate(['/courses', id]) — программная навигация. ActivatedRoute.paramMap — реактивное получение параметров URL.",

  "Lazy Loading и производительность":
    "Lazy loading: loadComponent: () => import('./feature/feature.component').then(m => m.FeatureComponent) — Angular создаёт отдельный JS-chunk, загружаемый только при переходе на маршрут. ChangeDetectionStrategy.OnPush с Signals устраняет лишние проверки: компонент обновляется только при изменении @Input() или сигнала. track в @for предотвращает пересоздание DOM. Angular DevTools в Chrome показывает время Change Detection каждого компонента.",

  // ── course-frontend ──────────────────────────────────────────────────────
  "Компоненты, шаблоны и привязки данных":
    "Компонент — основной строительный блок Angular. @Component({ selector, template, standalone: true, imports: [] }). Привязки: {{ value }} — интерполяция, [property]='expr' — property binding, (event)='handler()' — event binding, [(ngModel)]='field' — двусторонняя. @Input() принимают данные от родителя. @Output() EventEmitter — события дочернего компонента. Жизненный цикл: ngOnInit (инициализация), ngOnChanges (изменение @Input), ngOnDestroy (очистка).",

  "Директивы, пайпы и Signals API":
    "Новый синтаксис Angular 17: @if(cond){...}@else{...} вместо *ngIf, @for(item of list; track item.id){...} вместо *ngFor, @switch/@case для множественных условий. Пайпы: {{ price | currency:'RUB':'symbol':'1.0-0' }}, {{ date | date:'dd.MM.yyyy HH:mm' }}, {{ text | uppercase }}. Кастомный пайп: @Pipe({ name: 'shorten', pure: true }). Signals: signal<T>(init), computed(), effect({ allowSignalWrites: true }), toSignal(obs$).",

  "Реактивное программирование с RxJS":
    "Observable — холодный поток, выполнение начинается при подписке. Subject — горячий, значение идёт всем подписчикам сразу. BehaviorSubject(initValue) хранит последнее значение и отдаёт его новому подписчику немедленно. Операторы: map, filter, switchMap (отменяет предыдущий — идеал для HTTP), mergeMap (параллельно), concatMap (по очереди), exhaustMap (игнорирует новые пока активен). combineLatest([a$, b$]) — последние значения всех потоков. takeUntilDestroyed() — автоматическая отписка Angular 16+.",

  "HttpClient, интерцепторы и обработка ошибок":
    "provideHttpClient(withInterceptors([authInterceptor])). HttpClient возвращает холодный Observable — запрос выполняется только при подписке. Типизация: http.get<Course[]>('/api/courses'). Функциональный интерцептор: (req, next) => next(req.clone({ setHeaders: { Authorization: 'Bearer ' + token } })). Обработка ошибок: catchError((err) => { if(err.status===401) router.navigate(['/login']); return throwError(() => err); }). Загрузка файлов с прогрессом: http.post(url, formData, { reportProgress: true, observe: 'events' }).",

  "Маршрутизация, Guards и Lazy Loading":
    "Lazy loading: loadComponent: () => import('./feature.component').then(m => m.FeatureComponent) — Angular собирает отдельный JS-чанк, загружаемый только при необходимости. CanActivateFn — функциональный Guard: inject(AuthService).isLoggedIn() ? true : inject(Router).createUrlTree(['/login']). Resolver предзагружает данные: resolve: { course: courseResolver }, данные доступны через route.data['course']. ActivatedRoute.paramMap — реактивные параметры URL.",

  "Тестирование Angular: Jasmine, Jest и Cypress":
    "Unit-тесты: TestBed.configureTestingModule({ imports: [ComponentUnderTest], providers: [{ provide: SomeService, useValue: mockService }] }). fixture.detectChanges() запускает Change Detection. Spy: spyOn(service, 'method').and.returnValue(of(data)). Expect: expect(component.title).toBe('expected'). E2E с Cypress: cy.visit('/login'); cy.get('[data-testid=username]').type('admin1'); cy.get('[type=submit]').click(); cy.url().should('include', '/home'). cy.intercept для мокирования API.",

  // ── course-devops ────────────────────────────────────────────────────────
  "Dockerfile и многоэтапная сборка":
    "Каждая инструкция Dockerfile создаёт новый кешируемый слой. Порядок важен: COPY pom.xml . → RUN mvn dependency:resolve кешируют зависимости отдельно от исходного кода. Multi-stage build: FROM maven:3.9-eclipse-temurin-21 AS builder; RUN mvn package -DskipTests; FROM eclipse-temurin:21-jre-alpine; COPY --from=builder target/*.jar app.jar. Итоговый образ — около 180 МБ вместо 700 МБ. HEALTHCHECK CMD curl --fail http://localhost:8080/actuator/health.",

  "Docker Compose для разработки":
    "docker-compose.yml описывает services, networks и volumes. depends_on с condition: service_healthy гарантирует порядок запуска через healthcheck. environment задаёт переменные окружения, env_file подгружает .env-файл. Основные команды: docker compose up -d (запуск в фоне), logs -f service (потоковые логи), exec service sh (shell внутри контейнера), down -v (остановка с удалением volumes). profiles позволяют условно включать сервисы для dev/prod.",

  "Структура .gitlab-ci.yml":
    "stages определяет порядок этапов: [build, test, docker, deploy]. Jobs назначаются этапам через stage. cache сохраняет .m2 между запусками: cache: { paths: ['.m2/repository'] }. artifacts сохраняет артефакты между stages: artifacts: { paths: ['target/*.jar'] }. needs создаёт DAG-зависимости: job стартует сразу после указанных jobs, не дожидаясь всего stage. rules заменяет only/except: условия запуска через if/changes/exists.",

  "Сборка образов и публикация в Registry":
    "GitLab Container Registry доступен по адресу registry.gitlab.com/group/project:tag. Переменные CI_REGISTRY, CI_REGISTRY_USER, CI_REGISTRY_PASSWORD предоставляются автоматически. Логин: docker login -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD $CI_REGISTRY. Стратегия тегирования: :latest для main-ветки, :$CI_COMMIT_SHORT_SHA для точного воспроизведения, :$CI_COMMIT_TAG для релизов. Docker BuildKit: DOCKER_BUILDKIT=1 ускоряет сборку через параллельные слои.",

  "Prometheus: метрики из Spring Boot":
    "Prometheus работает по pull-модели: сам опрашивает /actuator/prometheus каждые N секунд согласно конфигу. Micrometer экспортирует JVM-метрики (heap, GC, threads) и HTTP-метрики автоматически. PromQL: rate(http_server_requests_seconds_count{status='200'}[5m]) — RPS успешных запросов. histogram_quantile(0.99, rate(http_server_requests_seconds_bucket[5m])) — p99 задержки. Запись правил: recording rules агрегируют тяжёлые запросы заранее.",

  "Grafana: дашборды и алерты":
    "Grafana объединяет три столпа наблюдаемости: Prometheus (метрики), Loki (логи), Tempo (трассировки). Готовые дашборды импортируются по ID: 4701 для JVM Micrometer, 12900 для Spring Boot 3.x. Alerting: правило на PromQL → Contact Point (Slack, Telegram) → Notification Policy. Loki LogQL для поиска по логам: {container=\"lms-api-gateway\"} |= \"ERROR\". Provisioning через YAML позволяет хранить дашборды в Git.",

  // ── course-qa ────────────────────────────────────────────────────────────
  "Виды тестирования и жизненный цикл бага":
    "Функциональное тестирование — проверяет поведение согласно требованиям. Нефункциональное: нагрузочное (JMeter, Gatling), безопасность (OWASP ZAP, Burp Suite), usability, совместимость. По уровню: unit (изолированный метод), интеграционное (взаимодействие компонентов), системное (сквозной сценарий), приёмочное UAT. Жизненный цикл бага: New → Assigned → In Progress → Fixed → Retest → Closed (или Reopened). Хороший баг-репорт: чёткое название, шаги воспроизведения, ожидаемый/фактический результат, среда, скриншот. Severity: Critical, Major, Minor, Trivial.",

  "Техники тест-дизайна и документация":
    "Эквивалентное разбиение: входные данные делятся на классы с одинаковым поведением — достаточно одного значения из каждого класса. Граничные значения: тестируем на границах диапазона (min-1, min, min+1, max-1, max, max+1). Таблица решений — матрица условий и действий для сложных бизнес-правил. Попарное тестирование (Pairwise): охватывает все пары параметров вместо полного перебора. Чек-лист — краткий список проверок. Тест-кейс: ID, название, preconditions, шаги, expected result, priority. Тест-план: scope, ресурсы, критерии входа/выхода, риски.",

  "REST API: методы, статусы и коллекции Postman":
    "HTTP-методы: GET (чтение, идемпотентен), POST (создание, не идемпотентен), PUT (полное обновление, идемпотентен), PATCH (частичное обновление), DELETE (удаление, идемпотентен). Статус-коды: 200 OK, 201 Created, 204 No Content, 400 Bad Request (ошибка клиента), 401 Unauthorized (нет токена), 403 Forbidden (нет прав), 404 Not Found, 409 Conflict, 500 Internal Server Error. Postman: коллекции, Environments ({{baseUrl}}, {{token}}), pre-request Scripts. Tests: pm.test('201', () => pm.response.to.have.status(201)); pm.environment.set('userId', pm.response.json().id).",

  "Автоматизация API с Newman и RestAssured":
    "Newman CLI запускает Postman-коллекции в CI: newman run collection.json -e env.json --reporters cli,htmlextra. RestAssured DSL: given().header(\"Authorization\", \"Bearer \"+token).contentType(ContentType.JSON).body(requestBody).when().post(\"/api/courses\").then().statusCode(201).body(\"title\", equalTo(\"Spring Boot\")). JsonPath для извлечения: response.jsonPath().getString(\"data.id\"). Allure-аннотации: @Feature(\"Courses API\"), @Story(\"Create course\"), @Step(\"POST /api/courses\") для структурированных HTML-отчётов.",

  "Selenium WebDriver: локаторы и Page Object":
    "WebDriver управляет браузером через W3C WebDriver Protocol. Браузеры: ChromeDriver, FirefoxDriver, EdgeDriver. Локаторы (от надёжного к хрупкому): By.id, By.cssSelector, By.xpath — XPath последний выбор. CSS-примеры: #submit-btn, .form-input, [data-testid='username'], button[type='submit']. Явное ожидание: new WebDriverWait(driver, Duration.ofSeconds(10)).until(ExpectedConditions.elementToBeClickable(locator)). Page Object Model: класс страницы инкапсулирует локаторы (@FindBy) и методы. PageFactory.initElements(driver, this) инициализирует поля.",

  "TestNG, Allure-отчёты и CI-интеграция":
    "TestNG: @Test(priority, groups, dataProvider), @BeforeSuite, @AfterSuite, @BeforeMethod (создание драйвера), @AfterMethod (снимок экрана при падении). Параллельный запуск: <suite parallel='methods' thread-count='4'>. DataProvider: @DataProvider(name='loginData') возвращает Object[][] — параметризованные тесты из Excel или JSON. Allure 2: @Feature, @Story, @Step, Allure.addAttachment(\"Screenshot\", screenshot). Команды: allure generate target/allure-results --clean; allure open. Maven Surefire запускает TestNG в CI. Allure Jenkins Plugin публикует интерактивный отчёт.",
};

let updated = 0;

db.courses.find().forEach(course => {
  course.modules.forEach((mod, mi) => {
    mod.lessons.forEach((lesson, li) => {
      const newContent = contentByTitle[lesson.title];
      if (newContent && (!lesson.content || lesson.content.trim() === "")) {
        db.courses.updateOne(
          { _id: course._id },
          { $set: { [`modules.${mi}.lessons.${li}.content`]: newContent } }
        );
        updated++;
      }
    });
  });
});

print("Lessons updated with content: " + updated);
print("Total courses: " + db.courses.countDocuments());
