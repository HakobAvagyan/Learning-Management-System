// Updates content for every lesson that has empty/missing content.
// Primary: lookup by lesson title. Fallback: generate from title.
// Never touches videoUrl or other fields.
db = db.getSiblingDB("lms_courses");

const contentByTitle = {
  "Инверсия управления и DI":
    "IoC — принцип, при котором объект получает зависимости извне. Spring реализует его через ApplicationContext. Бины объявляются через @Component, @Service, @Repository или @Bean в @Configuration-классе. Конструкторное внедрение (@RequiredArgsConstructor) предпочтительно: гарантирует неизменяемость и упрощает тестирование без Spring-контекста. @Autowired на поле — антипаттерн: скрывает зависимости и ломает юнит-тесты.",
  "Spring Boot Auto-configuration":
    "Spring Boot автонастраивает бины через META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports. Каждый класс содержит @ConditionalOnClass, @ConditionalOnMissingBean, @ConditionalOnProperty и другие условия. Флаг --debug при запуске выводит Conditions Report с причинами включения и исключения каждого бина. Переопределить автоконфигурацию можно объявив собственный бин того же типа.",
  "JPA и Spring Data JPA":
    "JPA — стандарт ORM для Java. Spring Data JPA генерирует реализацию репозитория по интерфейсу JpaRepository<Entity, ID>. Методы именования: findByUsernameAndEnabled(), findByCreatedAtBetween(). @Query — JPQL вручную. Пагинация: PageRequest.of(0, 20, Sort.by(\"createdAt\").descending()). @Modifying + @Transactional для UPDATE/DELETE запросов.",
  "Spring Data MongoDB":
    "Документы аннотируются @Document(collection=\"name\"). @Id маппится на _id MongoDB. MongoRepository предоставляет стандартный CRUD. Для сложных запросов — MongoTemplate с Criteria.where(\"field\").is(val). Агрегации: Aggregation.newAggregation(match, group, project). Индексы: @Indexed(unique=true), @CompoundIndex. Аудит: @CreatedDate + @EnableMongoAuditing.",
  "Построение RESTful API":
    "@RestController = @Controller + @ResponseBody. Маппинг: @GetMapping, @PostMapping, @PutMapping, @DeleteMapping. Извлечение данных: @PathVariable для /api/users/{id}, @RequestParam для ?page=0&size=10, @RequestBody для JSON-тела запроса. ResponseEntity<T> — полный контроль над кодом ответа. @ControllerAdvice + @ExceptionHandler — централизованная обработка ошибок.",
  "Spring Security 6 и JWT":
    "Spring Security 6 использует lambda DSL: SecurityFilterChain bean. Stateless JWT: SessionCreationPolicy.STATELESS + OncePerRequestFilter. JWT = Base64(Header).Base64(Payload).Signature — подпись проверяется HMAC-SHA256. @PreAuthorize(\"hasRole('ADMIN')\") + @EnableMethodSecurity для авторизации на уровне методов.",
  "Maven, структура проекта и стартеры":
    "Spring Boot проект создаётся через start.spring.io. Структура: src/main/java (исходники), src/main/resources (конфигурация), src/test (тесты). Стартеры — наборы зависимостей: spring-boot-starter-web включает Tomcat, Spring MVC и Jackson. pom.xml наследует spring-boot-starter-parent, который управляет версиями всех зависимостей.",
  "Конфигурация приложения и профили":
    "application.yml — главный файл конфигурации. Профили: application-dev.yml, application-prod.yml. Активация через SPRING_PROFILES_ACTIVE. @Value('${property}') инжектирует значение. @ConfigurationProperties(prefix='app') маппирует группу свойств в типизированный бин. @ConditionalOnProperty условно активирует бины.",
  "Spring Data JPA: репозитории и запросы":
    "JPA-сущность: @Entity, @Table, @Id, @GeneratedValue(strategy=IDENTITY). Связи: @OneToMany(mappedBy, cascade=ALL), @ManyToOne, @JoinColumn. JpaRepository предоставляет findAll, findById, save, deleteById. @Query с JPQL: SELECT u FROM User u WHERE u.email = :email. Пагинация: PageRequest.of(0, 20, Sort.by('createdAt').descending()).",
  "Транзакции, N+1 и кеш второго уровня":
    "Проблема N+1: при LAZY-загрузке @OneToMany для N объектов выполняется 1+N SELECT-запросов. Решения: JOIN FETCH в @Query или @EntityGraph(attributePaths={'items'}). @Transactional(readOnly=true) оптимизирует SELECT. Кеш второго уровня: Caffeine через spring.cache.type=caffeine + @Cacheable.",
  "Spring Security 6 и JWT-аутентификация":
    "SecurityFilterChain bean с lambda DSL. SessionCreationPolicy.STATELESS + OncePerRequestFilter читает JWT из Authorization: Bearer заголовка. JWT = Base64(Header).Base64(Payload).Signature. HMAC-SHA256 предотвращает подделку токена. @PreAuthorize через @EnableMethodSecurity.",
  "Actuator, метрики и Docker-деплой":
    "Spring Boot Actuator: /actuator/health, /actuator/metrics, /actuator/prometheus. Многоэтапный Dockerfile: FROM maven AS builder; RUN mvn package; FROM eclipse-temurin:21-jre-alpine; COPY --from=builder *.jar app.jar. HEALTHCHECK CMD curl --fail http://localhost:8080/actuator/health. docker compose up -d запускает все сервисы.",
  "Standalone-компоненты и @if/@for":
    "С Angular 17 standalone: true по умолчанию. Компонент сам импортирует зависимости через imports. Новый синтаксис: @if(condition){...}@else{...} вместо *ngIf, @for(item of items; track item.id){...} вместо *ngFor. track обязателен — ускоряет DOM-рендеринг на 30–40%.",
  "Signals: реактивность без RxJS":
    "signal<T>(initValue) создаёт реактивное значение. Чтение: value(). Запись: value.set(newVal). Обновление: value.update(v => v + 1). computed(() => a() + b()) пересчитывается только при изменении зависимостей. effect(() => { ... }, { allowSignalWrites: true }) — для сайд-эффектов. toSignal(obs$) конвертирует Observable.",
  "RxJS: Observable, Subject, операторы":
    "Observable — холодный поток. Subject — горячий. BehaviorSubject(initVal) хранит последнее значение. Операторы: map, filter, switchMap (отменяет предыдущий запрос), debounceTime(300), distinctUntilChanged. takeUntilDestroyed() — автоматическая отписка Angular 16+.",
  "HttpClient и Interceptors":
    "provideHttpClient(withInterceptors([fn])). Интерцептор: (req, next) => next(req.clone({ setHeaders: { Authorization: 'Bearer ' + token } })). Сценарии: JWT-заголовок, глобальная обработка ошибок, индикатор загрузки. Загрузка файлов: http.post(url, formData, { reportProgress: true, observe: 'events' }).",
  "Angular Router: Guards и Resolvers":
    "CanActivateFn возвращает boolean или UrlTree для редиректа. Resolver предзагружает данные: resolve: { course: courseResolver }. RouterLink — декларативная навигация. Router.navigate(['/courses', id]) — программная. ActivatedRoute.paramMap — реактивные параметры URL.",
  "Lazy Loading и производительность":
    "loadComponent: () => import('./feature.component').then(m => m.FeatureComponent) — отдельный JS-chunk. ChangeDetectionStrategy.OnPush + Signals устраняют лишние проверки. track в @for предотвращает пересоздание DOM. Angular DevTools показывает время Change Detection каждого компонента.",
  "Компоненты, шаблоны и привязки данных":
    "@Component({ selector, template, standalone: true, imports: [] }). Привязки: {{ value }} интерполяция, [property]='expr' property binding, (event)='handler()' event binding, [(ngModel)]='field' двусторонняя. @Input() от родителя, @Output() EventEmitter — события дочернего. Жизненный цикл: ngOnInit, ngOnChanges, ngOnDestroy.",
  "Директивы, пайпы и Signals API":
    "@if(cond){...} @else{...}, @for(item of list; track item.id){...}, @switch/@case. Пайпы: {{ price | currency:'RUB' }}, {{ date | date:'dd.MM.yyyy' }}, {{ text | uppercase }}. Кастомный: @Pipe({ name: 'shorten', pure: true }). Signals: signal(), computed(), effect({ allowSignalWrites: true }), toSignal(obs$).",
  "Реактивное программирование с RxJS":
    "Observable холодный, Subject горячий. BehaviorSubject хранит последнее значение. switchMap отменяет предыдущий запрос (идеал для HTTP при вводе). mergeMap параллельно, concatMap по очереди, exhaustMap игнорирует новые пока активен. combineLatest([a$, b$]) — последние значения всех потоков.",
  "HttpClient, интерцепторы и обработка ошибок":
    "provideHttpClient(withInterceptors([authInterceptor])). HttpClient возвращает холодный Observable. Типизация: http.get<Course[]>('/api/courses'). catchError обрабатывает ошибки глобально. Загрузка файлов с прогрессом: { reportProgress: true, observe: 'events' } + HttpEventType.UploadProgress.",
  "Маршрутизация, Guards и Lazy Loading":
    "Lazy loading создаёт отдельный JS-чанк. CanActivateFn: inject(AuthService).isLoggedIn() ? true : inject(Router).createUrlTree(['/login']). Resolver: resolve: { course: courseResolver }, данные через route.data['course']. ActivatedRoute.paramMap — реактивные параметры.",
  "Тестирование Angular: Jasmine, Jest и Cypress":
    "TestBed.configureTestingModule({ imports: [Component], providers: [{ provide: Service, useValue: mock }] }). fixture.detectChanges() запускает Change Detection. spyOn(service, 'method').and.returnValue(of(data)). Cypress: cy.visit('/'); cy.get('[data-testid=btn]').click(); cy.url().should('include', '/home'). cy.intercept мокирует API.",
  "Dockerfile и многоэтапная сборка":
    "Каждая инструкция создаёт кешируемый слой. Multi-stage: FROM maven AS builder; RUN mvn package -DskipTests; FROM eclipse-temurin:21-jre-alpine; COPY --from=builder target/*.jar app.jar. Итог — 180 МБ вместо 700 МБ. HEALTHCHECK CMD curl --fail http://localhost:8080/actuator/health.",
  "Docker Compose для разработки":
    "services, networks, volumes. depends_on с condition: service_healthy. Команды: docker compose up -d, logs -f service, exec service sh, down -v. profiles — условно включают сервисы. restart: unless-stopped держит контейнер в живых после перезагрузки сервера.",
  "Структура .gitlab-ci.yml":
    "stages: [build, test, docker, deploy]. cache сохраняет .m2 между запусками. artifacts сохраняет JAR между stages. needs создаёт DAG — job стартует сразу после нужных. rules заменяет only/except: условия через if/changes/exists.",
  "Сборка образов и публикация в Registry":
    "CI_REGISTRY, CI_REGISTRY_USER, CI_REGISTRY_PASSWORD предоставляются автоматически. Логин: docker login -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD $CI_REGISTRY. Теги: :latest для main, :$CI_COMMIT_SHORT_SHA для точного воспроизведения, :$CI_COMMIT_TAG для релизов.",
  "Prometheus: метрики из Spring Boot":
    "Pull-модель: Prometheus опрашивает /actuator/prometheus. Micrometer экспортирует JVM и HTTP метрики. PromQL: rate(http_server_requests_seconds_count[5m]) — RPS. histogram_quantile(0.99, rate(bucket[5m])) — p99 задержки. Recording rules агрегируют тяжёлые запросы заранее.",
  "Grafana: дашборды и алерты":
    "Три столпа: Prometheus (метрики), Loki (логи), Tempo (трассировки). Дашборды по ID: 4701 для JVM Micrometer, 12900 для Spring Boot 3.x. Alerting: PromQL → Contact Point (Slack/Telegram) → Notification Policy. Loki LogQL: {container=\"lms-api-gateway\"} |= \"ERROR\".",
  "Виды тестирования и жизненный цикл бага":
    "Функциональное — проверяет поведение. Нефункциональное: нагрузочное (JMeter), безопасность (OWASP ZAP). Уровни: unit, интеграционное, системное, UAT. Жизненный цикл: New → Assigned → In Progress → Fixed → Retest → Closed. Баг-репорт: название, шаги, ожидаемый/фактический результат, среда, скриншот.",
  "Техники тест-дизайна и документация":
    "Эквивалентное разбиение: по одному значению из каждого класса. Граничные значения: min-1, min, min+1, max-1, max, max+1. Таблица решений — матрица условий и действий. Попарное тестирование (Pairwise) охватывает все пары параметров. Тест-кейс: preconditions, шаги, expected result. Тест-план: scope, риски, критерии.",
  "REST API: методы, статусы и коллекции Postman":
    "GET идемпотентен, POST создаёт, PUT полное обновление, PATCH частичное, DELETE удаляет. Статусы: 200 OK, 201 Created, 204 No Content, 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 409 Conflict. Postman: Environments ({{baseUrl}}), Tests: pm.test('201', () => pm.response.to.have.status(201)).",
  "Автоматизация API с Newman и RestAssured":
    "Newman: newman run collection.json -e env.json --reporters cli,htmlextra. RestAssured: given().header(\"Authorization\", \"Bearer \"+token).when().post(\"/api/courses\").then().statusCode(201).body(\"title\", equalTo(\"Spring Boot\")). JsonPath: response.jsonPath().getString(\"data.id\"). Allure: @Feature, @Story, @Step.",
  "Selenium WebDriver: локаторы и Page Object":
    "Локаторы (от надёжного к хрупкому): By.id, By.cssSelector, By.xpath. CSS: #id, .class, [data-testid='btn'], button[type='submit']. WebDriverWait: until(ExpectedConditions.elementToBeClickable(locator)). Page Object: класс инкапсулирует локаторы (@FindBy) и методы. PageFactory.initElements(driver, this).",
  "TestNG, Allure-отчёты и CI-интеграция":
    "TestNG: @Test, @BeforeMethod (создание драйвера), @AfterMethod (скриншот при падении). Параллельный запуск: parallel='methods' thread-count='4'. DataProvider возвращает Object[][]. Allure: @Feature, @Story, @Step, Allure.addAttachment. allure generate --clean; allure open. Maven Surefire запускает TestNG в CI.",
};

let updated = 0;
let skipped = 0;
let notFound = 0;

db.courses.find().forEach(course => {
  print("Course: " + course._id + " — " + course.title);
  course.modules.forEach((mod, mi) => {
    mod.lessons.forEach((lesson, li) => {
      const hasContent = lesson.content && lesson.content.trim() !== "";
      if (hasContent) {
        print("  SKIP (has content): " + lesson.title);
        skipped++;
        return;
      }

      let newContent = contentByTitle[lesson.title];
      if (!newContent) {
        // Fallback: generate content from the lesson title
        newContent = "В этом уроке рассматривается тема: «" + lesson.title + "». " +
          "Изучите ключевые концепции, принципы и практические примеры по данной теме. " +
          "Обратите внимание на детали реализации и типичные сценарии применения в реальных проектах. " +
          "После изучения материала вы сможете уверенно применять полученные знания на практике.";
        notFound++;
        print("  FALLBACK: " + lesson.title);
      } else {
        print("  UPDATE: " + lesson.title);
      }

      db.courses.updateOne(
        { _id: course._id },
        { $set: { ["modules." + mi + ".lessons." + li + ".content"]: newContent } }
      );
      updated++;
    });
  });
});

print("=== DONE ===");
print("Updated: " + updated + " | Skipped (had content): " + skipped + " | Fallback used: " + notFound);
print("Total courses: " + db.courses.countDocuments());
