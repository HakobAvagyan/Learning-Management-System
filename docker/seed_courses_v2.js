db = db.getSiblingDB("lms_courses");
db.courses.drop();

db.courses.insertMany([
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
          "videoUrl": "http://localhost:9000/lms-media/courses/course-backend/be-m1-l1.mp4", "attachmentUrls": [], "durationMinutes": 30, "order": 1 },
        { "id": "be-m1-l2", "title": "Конфигурация приложения и профили",
          "content": "application.yml — главный файл конфигурации: server.port, spring.datasource.url, кастомные свойства. Профили: application-dev.yml, application-prod.yml. Активация: spring.profiles.active=dev. @Value('${property}') инжектирует значение. @ConfigurationProperties(prefix='app') маппирует группу свойств в типизированный бин. @ConditionalOnProperty условно активирует бины.",
          "videoUrl": "http://localhost:9000/lms-media/courses/course-backend/be-m1-l2.mp4", "attachmentUrls": [], "durationMinutes": 28, "order": 2 }
      ]
    },
    {
      "id": "be-m2", "title": "Spring Data и персистентность",
      "description": "JPA, Hibernate, репозитории, транзакции и оптимизация запросов", "order": 2,
      "lessons": [
        { "id": "be-m2-l1", "title": "Spring Data JPA: репозитории и запросы",
          "content": "JPA-сущность: @Entity, @Table, @Id, @GeneratedValue. Связи: @OneToMany, @ManyToOne. JpaRepository<Entity, ID> предоставляет findAll, findById, save, deleteById и производные методы: findByUsernameAndEnabled(). @Query — JPQL-запрос. Page<T> findAll(Pageable) — пагинация. PageRequest.of(0, 20, Sort.by('createdAt').descending()).",
          "videoUrl": "http://localhost:9000/lms-media/courses/course-backend/be-m2-l1.mp4", "attachmentUrls": [], "durationMinutes": 38, "order": 1 },
        { "id": "be-m2-l2", "title": "Транзакции, N+1 и кеш второго уровня",
          "content": "Проблема N+1: при LAZY-загрузке @OneToMany для N объектов выполняется 1+N запросов. Решения: @EntityGraph, JOIN FETCH в @Query. @Transactional(readOnly=true) оптимизирует SELECT. @Transactional откатывает при RuntimeException. Кеш второго уровня: Ehcache, Caffeine — @Cache(usage=READ_WRITE) на сущности.",
          "videoUrl": "http://localhost:9000/lms-media/courses/course-backend/be-m2-l2.mp4", "attachmentUrls": [], "durationMinutes": 42, "order": 2 }
      ]
    },
    {
      "id": "be-m3", "title": "Безопасность и деплой",
      "description": "Spring Security 6, JWT, Actuator и Docker", "order": 3,
      "lessons": [
        { "id": "be-m3-l1", "title": "Spring Security 6 и JWT-аутентификация",
          "content": "Spring Security 6 использует функциональный DSL: SecurityFilterChain bean. Stateless JWT: SessionCreationPolicy.STATELESS. OncePerRequestFilter читает JWT из заголовка Authorization: Bearer, валидирует подпись и помещает Authentication в SecurityContext. JWT = Base64(Header) + '.' + Base64(Payload) + '.' + Signature. @PreAuthorize через @EnableMethodSecurity.",
          "videoUrl": "http://localhost:9000/lms-media/courses/course-backend/be-m3-l1.mp4", "attachmentUrls": [], "durationMinutes": 40, "order": 1 },
        { "id": "be-m3-l2", "title": "Actuator, метрики и Docker-деплой",
          "content": "Spring Boot Actuator: /actuator/health, /actuator/metrics, /actuator/prometheus. Dockerfile — многоэтапная сборка: FROM maven AS builder; RUN mvn package; FROM eclipse-temurin:21-jre-alpine; COPY --from=builder *.jar app.jar. HEALTHCHECK CMD curl --fail http://localhost:8080/actuator/health. docker compose up -d запускает все сервисы.",
          "videoUrl": "http://localhost:9000/lms-media/courses/course-backend/be-m3-l2.mp4", "attachmentUrls": [], "durationMinutes": 35, "order": 2 }
      ]
    }
  ],
  "createdAt": new Date("2025-09-01T08:00:00Z"), "updatedAt": new Date("2025-09-20T12:00:00Z")
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
          "content": "Компонент — основной строительный блок Angular. @Component({ selector, template, standalone: true, imports: [] }). Привязки: {{ value }} — интерполяция, [property]='expr' — property binding, (event)='handler()' — event binding. @Input() передаются от родителя. @Output() EventEmitter — события дочернего компонента. Жизненный цикл: ngOnInit, ngOnChanges, ngOnDestroy.",
          "videoUrl": "http://localhost:9000/lms-media/courses/course-frontend/fe-m1-l1.mp4", "attachmentUrls": [], "durationMinutes": 32, "order": 1 },
        { "id": "fe-m1-l2", "title": "Директивы, пайпы и Signals API",
          "content": "Новый синтаксис Angular 17: @if(cond){...}@else{...} вместо *ngIf, @for(item of list; track item.id){...} вместо *ngFor. Пайпы: {{ price | currency:'RUB' }}, {{ date | date:'dd.MM.yyyy' }}. Signals: signal<T>(init), signal.set(val), signal.update(fn), computed(() => expr), effect(() => sideEffect). toSignal(obs$) конвертирует Observable в Signal.",
          "videoUrl": "http://localhost:9000/lms-media/courses/course-frontend/fe-m1-l2.mp4", "attachmentUrls": [], "durationMinutes": 30, "order": 2 }
      ]
    },
    {
      "id": "fe-m2", "title": "RxJS и HTTP-коммуникация",
      "description": "Реактивные потоки, операторы и Angular HttpClient", "order": 2,
      "lessons": [
        { "id": "fe-m2-l1", "title": "Реактивное программирование с RxJS",
          "content": "Observable — холодный поток. Subject — горячий. BehaviorSubject(initValue) хранит последнее значение. Операторы: map, filter, switchMap (отменяет предыдущий запрос — идеал для HTTP), mergeMap (параллельно), concatMap (по очереди), exhaustMap (игнорирует новые пока активен). combineLatest([a$, b$]). takeUntilDestroyed() — автоматическая отписка Angular 16+.",
          "videoUrl": "http://localhost:9000/lms-media/courses/course-frontend/fe-m2-l1.mp4", "attachmentUrls": [], "durationMinutes": 45, "order": 1 },
        { "id": "fe-m2-l2", "title": "HttpClient, интерцепторы и обработка ошибок",
          "content": "provideHttpClient(withInterceptors([authInterceptor])). HttpClient возвращает Observable. Типизация: http.get<Course[]>('/api/courses'). Функциональный интерцептор: (req, next) => next(req.clone({setHeaders: {Authorization: 'Bearer ' + token}})). Обработка ошибок: catchError. Загрузка файлов: http.post(url, formData, {reportProgress: true, observe: 'events'}) + HttpEventType.UploadProgress.",
          "videoUrl": "http://localhost:9000/lms-media/courses/course-frontend/fe-m2-l2.mp4", "attachmentUrls": [], "durationMinutes": 36, "order": 2 }
      ]
    },
    {
      "id": "fe-m3", "title": "Архитектура и тестирование",
      "description": "Маршрутизация, Guards, Lazy Loading и автотесты", "order": 3,
      "lessons": [
        { "id": "fe-m3-l1", "title": "Маршрутизация, Guards и Lazy Loading",
          "content": "Lazy loading: loadComponent: () => import('./feature.component').then(m => m.FeatureComponent) — отдельный JS-чанк. CanActivateFn — функциональный Guard: inject(AuthService).isLoggedIn() ? true : redirect('/login'). Resolver предзагружает данные: resolve: { course: courseResolver }. ActivatedRoute.paramMap — реактивные параметры URL.",
          "videoUrl": "http://localhost:9000/lms-media/courses/course-frontend/fe-m3-l1.mp4", "attachmentUrls": [], "durationMinutes": 34, "order": 1 },
        { "id": "fe-m3-l2", "title": "Тестирование Angular: Jasmine, Jest и Cypress",
          "content": "Unit-тесты: TestBed.configureTestingModule({ imports: [ComponentUnderTest], providers: [{ provide: SomeService, useValue: mockService }] }). fixture.detectChanges() запускает Change Detection. Spy: spyOn(service, 'method').and.returnValue(of(data)). E2E с Cypress: cy.visit('/login'); cy.get('[data-testid=username]').type('admin1'); cy.get('button[type=submit]').click(); cy.url().should('include', '/home').",
          "videoUrl": "http://localhost:9000/lms-media/courses/course-frontend/fe-m3-l2.mp4", "attachmentUrls": [], "durationMinutes": 38, "order": 2 }
      ]
    }
  ],
  "createdAt": new Date("2025-10-01T09:00:00Z"), "updatedAt": new Date("2025-10-22T15:00:00Z")
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
          "content": "Функциональное тестирование — проверяет поведение согласно требованиям. Нефункциональное: нагрузочное (JMeter), безопасность (OWASP ZAP). По уровню: unit, интеграционное, системное, приёмочное (UAT). Жизненный цикл бага: New → Assigned → In Progress → Fixed → Retest → Closed. Хороший баг-репорт: название, шаги воспроизведения, ожидаемый/фактический результат, окружение. Severity: Critical, Major, Minor, Trivial.",
          "videoUrl": "http://localhost:9000/lms-media/courses/course-qa/qa-m1-l1.mp4", "attachmentUrls": [], "durationMinutes": 35, "order": 1 },
        { "id": "qa-m1-l2", "title": "Техники тест-дизайна и документация",
          "content": "Эквивалентное разбиение: разбиваем входные данные на классы с одинаковым поведением, тестируем по одному из каждого. Граничные значения: тестируем на границах диапазона (мин-1, мин, мин+1, макс-1, макс, макс+1). Таблица решений — матрица условий и действий. Чек-лист — краткий список проверок. Тест-кейс — preconditions, steps, expected result. Тест-план — scope, ресурсы, риски.",
          "videoUrl": "http://localhost:9000/lms-media/courses/course-qa/qa-m1-l2.mp4", "attachmentUrls": [], "durationMinutes": 32, "order": 2 }
      ]
    },
    {
      "id": "qa-m2", "title": "API-тестирование",
      "description": "REST API: ручное тестирование, Postman и RestAssured", "order": 2,
      "lessons": [
        { "id": "qa-m2-l1", "title": "REST API: методы, статусы и коллекции Postman",
          "content": "HTTP-методы: GET (чтение), POST (создание), PUT (полное обновление), PATCH (частичное), DELETE. Статус-коды: 200 OK, 201 Created, 204 No Content, 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 409 Conflict. Postman: коллекции, Environments ({{baseUrl}}, {{token}}). Tests: pm.test('Status 200', () => pm.response.to.have.status(200)). Авторизация: Bearer Token, Basic Auth.",
          "videoUrl": "http://localhost:9000/lms-media/courses/course-qa/qa-m2-l1.mp4", "attachmentUrls": [], "durationMinutes": 40, "order": 1 },
        { "id": "qa-m2-l2", "title": "Автоматизация API с Newman и RestAssured",
          "content": "Newman CLI: newman run collection.json -e env.json --reporters cli,htmlextra. RestAssured DSL: given().header('Authorization', 'Bearer '+token).when().get('/api/users/1').then().statusCode(200).body('username', equalTo('admin1')). JsonPath для извлечения: response.jsonPath().getString('data.id'). Allure-аннотации: @Feature, @Story, @Step для структурированных отчётов.",
          "videoUrl": "http://localhost:9000/lms-media/courses/course-qa/qa-m2-l2.mp4", "attachmentUrls": [], "durationMinutes": 38, "order": 2 }
      ]
    },
    {
      "id": "qa-m3", "title": "UI-автоматизация",
      "description": "Selenium WebDriver, Page Object Model, TestNG и Allure", "order": 3,
      "lessons": [
        { "id": "qa-m3-l1", "title": "Selenium WebDriver: локаторы и Page Object",
          "content": "WebDriver управляет браузером через W3C WebDriver. Локаторы: By.id, By.cssSelector, By.xpath. CSS: #id, .class, [data-testid='btn']. Явное ожидание: new WebDriverWait(driver, Duration.ofSeconds(10)).until(ExpectedConditions.elementToBeClickable(By.id('submit'))). Page Object Model (POM): класс страницы инкапсулирует локаторы (@FindBy) и методы. PageFactory.initElements(driver, this).",
          "videoUrl": "http://localhost:9000/lms-media/courses/course-qa/qa-m3-l1.mp4", "attachmentUrls": [], "durationMinutes": 42, "order": 1 },
        { "id": "qa-m3-l2", "title": "TestNG, Allure-отчёты и CI-интеграция",
          "content": "TestNG: @Test, @BeforeSuite, @AfterSuite, @BeforeMethod. Параллельный запуск: parallel='methods' count='4'. DataProvider: @DataProvider(name='users') + Object[][] — параметризованные тесты. Allure 2: @Feature, @Story, @Step, Allure.attachment. allure generate allure-results --clean. Maven Surefire Plugin запускает TestNG в CI. Allure Jenkins Plugin публикует отчёт.",
          "videoUrl": "http://localhost:9000/lms-media/courses/course-qa/qa-m3-l2.mp4", "attachmentUrls": [], "durationMinutes": 40, "order": 2 }
      ]
    }
  ],
  "createdAt": new Date("2025-11-01T10:00:00Z"), "updatedAt": new Date("2025-11-25T16:00:00Z")
}
]);

print("Courses inserted: " + db.courses.countDocuments());