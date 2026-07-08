db = db.getSiblingDB("lms_assessments");
db.quizzes.drop();

function opt(id, text, isCorrect) {
  return { id: id, text: text, correct: isCorrect };
}

function q(id, text, type, options, order) {
  return { id: id, text: text, type: type, options: options, order: order, points: 1 };
}

db.quizzes.insertMany([


{
  "_id": "quiz-backend-m1",
  "courseId": "course-backend",
  "lessonId": "be-m1-l2",
  "title": "Квиз: Основы Spring Boot 3",
  "description": "Проверь знания по Maven, конфигурации и профилям",
  "timeLimitMinutes": 10,
  "passingScore": 70,
  "status": "PUBLISHED",
  "createdBy": "instructor1",
  "questions": [
    q("qb1-1", "Какой файл является основным файлом конфигурации в Spring Boot проекте?", "SINGLE_CHOICE", [
      opt("a","pom.xml",false), opt("b","application.yml",true), opt("c","web.xml",false), opt("d","beans.xml",false)
    ], 1),
    q("qb1-2", "Какая аннотация используется для инъекции значения из application.yml в поле класса?", "SINGLE_CHOICE", [
      opt("a","@Autowired",false), opt("b","@Resource",false), opt("c","@Value",true), opt("d","@Property",false)
    ], 2),
    q("qb1-3", "Какая команда запускает Spring Boot приложение локально через Maven?", "SINGLE_CHOICE", [
      opt("a","mvn compile",false), opt("b","mvn test",false), opt("c","mvn spring-boot:run",true), opt("d","mvn deploy",false)
    ], 3),
    q("qb1-4", "Какой стартер подключает Tomcat, Spring MVC и Jackson одной зависимостью?", "SINGLE_CHOICE", [
      opt("a","spring-boot-starter-data-jpa",false), opt("b","spring-boot-starter-web",true), opt("c","spring-boot-starter-security",false), opt("d","spring-boot-starter-actuator",false)
    ], 4),
    q("qb1-5", "Как активировать профиль 'prod' при запуске Spring Boot?", "SINGLE_CHOICE", [
      opt("a","--spring.profile=prod",false), opt("b","--spring.profiles.active=prod",true), opt("c","--env=prod",false), opt("d","--profile=prod",false)
    ], 5)
  ]
},
{
  "_id": "quiz-backend-m2",
  "courseId": "course-backend",
  "lessonId": "be-m2-l2",
  "title": "Квиз: Spring Data JPA",
  "description": "Транзакции, N+1, репозитории и оптимизация запросов",
  "timeLimitMinutes": 12,
  "passingScore": 70,
  "status": "PUBLISHED",
  "createdBy": "instructor1",
  "questions": [
    q("qb2-1", "Что вызывает проблему N+1 в Spring Data JPA?", "SINGLE_CHOICE", [
      opt("a","Использование @Transactional",false), opt("b","Lazy-загрузка связанных коллекций в цикле",true), opt("c","Применение @Query",false), opt("d","Создание нескольких репозиториев",false)
    ], 1),
    q("qb2-2", "Какой параметр @Transactional оптимизирует производительность SELECT-запросов?", "SINGLE_CHOICE", [
      opt("a","propagation=REQUIRES_NEW",false), opt("b","isolation=READ_COMMITTED",false), opt("c","readOnly=true",true), opt("d","timeout=30",false)
    ], 2),
    q("qb2-3", "Какие из перечисленных способов решают проблему N+1? (выбери все верные)", "MULTIPLE_CHOICE", [
      opt("a","@EntityGraph",true), opt("b","JOIN FETCH в @Query",true), opt("c","@Lazy на репозитории",false), opt("d","FetchType.EAGER на @OneToMany",false)
    ], 3),
    q("qb2-4", "Как получить страницу результатов из Spring Data репозитория?", "SINGLE_CHOICE", [
      opt("a","Вернуть List<T> с аннотацией @Page",false), opt("b","Объявить метод findAll(Pageable) → Page<T>",true), opt("c","Использовать @Paginate над методом",false), opt("d","Вызвать findAll().subList(0, 20)",false)
    ], 4),
    q("qb2-5", "Когда @Transactional откатывает транзакцию по умолчанию?", "SINGLE_CHOICE", [
      opt("a","При любом исключении",false), opt("b","Только при SQLException",false), opt("c","При RuntimeException или Error",true), opt("d","Никогда — только при явном rollback()",false)
    ], 5)
  ]
},
{
  "_id": "quiz-backend-m3",
  "courseId": "course-backend",
  "lessonId": "be-m3-l2",
  "title": "Квиз: Security и деплой",
  "description": "JWT, Spring Security 6, Actuator и Docker",
  "timeLimitMinutes": 12,
  "passingScore": 70,
  "status": "PUBLISHED",
  "createdBy": "instructor1",
  "questions": [
    q("qb3-1", "Из каких трёх частей состоит JWT токен?", "SINGLE_CHOICE", [
      opt("a","Header.Payload.Signature",true), opt("b","Claims.Header.Expiry",false), opt("c","Username.Roles.Hash",false), opt("d","Public.Private.Secret",false)
    ], 1),
    q("qb3-2", "Какая политика сессий используется для stateless JWT-аутентификации в Spring Security?", "SINGLE_CHOICE", [
      opt("a","SessionCreationPolicy.ALWAYS",false), opt("b","SessionCreationPolicy.IF_REQUIRED",false), opt("c","SessionCreationPolicy.STATELESS",true), opt("d","SessionCreationPolicy.NEVER",false)
    ], 2),
    q("qb3-3", "Какой эндпоинт Actuator используется для проверки работоспособности сервиса?", "SINGLE_CHOICE", [
      opt("a","/actuator/info",false), opt("b","/actuator/health",true), opt("c","/actuator/status",false), opt("d","/actuator/ping",false)
    ], 3),
    q("qb3-4", "Зачем используется многоэтапная сборка (multi-stage build) в Dockerfile?", "SINGLE_CHOICE", [
      opt("a","Для ускорения работы контейнера",false), opt("b","Для уменьшения итогового образа — Maven не попадает в prod-образ",true), opt("c","Для параллельного запуска нескольких JVM",false), opt("d","Для поддержки нескольких версий Java",false)
    ], 4),
    q("qb3-5", "Какая аннотация Spring Security позволяет защищать методы через выражения?", "SINGLE_CHOICE", [
      opt("a","@EnableWebSecurity",false), opt("b","@Secured",false), opt("c","@PreAuthorize (требует @EnableMethodSecurity)",true), opt("d","@RolesAllowed",false)
    ], 5)
  ]
},


{
  "_id": "quiz-frontend-m1",
  "courseId": "course-frontend",
  "lessonId": "fe-m1-l2",
  "title": "Квиз: Angular 17 — Основы",
  "description": "Компоненты, шаблоны, директивы и Signals API",
  "timeLimitMinutes": 10,
  "passingScore": 70,
  "status": "PUBLISHED",
  "createdBy": "instructor2",
  "questions": [
    q("qf1-1", "Какой синтаксис условного рендеринга используется в Angular 17+ вместо *ngIf?", "SINGLE_CHOICE", [
      opt("a","[ngIf]='condition'",false), opt("b","@if(condition){...}",true), opt("c","#if(condition)",false), opt("d","v-if='condition'",false)
    ], 1),
    q("qf1-2", "Как создать реактивный сигнал со начальным значением 0 в Angular?", "SINGLE_CHOICE", [
      opt("a","new Signal(0)",false), opt("b","reactive(0)",false), opt("c","signal(0)",true), opt("d","ref(0)",false)
    ], 2),
    q("qf1-3", "Что такое computed() в Signals API?", "SINGLE_CHOICE", [
      opt("a","Сигнал для хранения результата HTTP-запроса",false), opt("b","Производный сигнал, автоматически пересчитываемый при изменении зависимостей",true), opt("c","Аналог ngOnInit для сигналов",false), opt("d","Сигнал с задержкой обновления",false)
    ], 3),
    q("qf1-4", "Какие привязки данных поддерживает Angular? (выбери все верные)", "MULTIPLE_CHOICE", [
      opt("a","{{ value }} — интерполяция",true), opt("b","[property]='expr' — property binding",true), opt("c","(event)='handler()' — event binding",true), opt("d","#var — двустороннее binding",false)
    ], 4),
    q("qf1-5", "Какой декоратор передаёт данные от родительского компонента к дочернему?", "SINGLE_CHOICE", [
      opt("a","@Output()",false), opt("b","@ViewChild()",false), opt("c","@Input()",true), opt("d","@HostBinding()",false)
    ], 5)
  ]
},
{
  "_id": "quiz-frontend-m2",
  "courseId": "course-frontend",
  "lessonId": "fe-m2-l2",
  "title": "Квиз: RxJS и HttpClient",
  "description": "Реактивные потоки, операторы и HTTP-коммуникация",
  "timeLimitMinutes": 12,
  "passingScore": 70,
  "status": "PUBLISHED",
  "createdBy": "instructor2",
  "questions": [
    q("qf2-1", "Какой RxJS оператор отменяет предыдущий HTTP-запрос при получении нового значения?", "SINGLE_CHOICE", [
      opt("a","mergeMap",false), opt("b","concatMap",false), opt("c","switchMap",true), opt("d","exhaustMap",false)
    ], 1),
    q("qf2-2", "Чем BehaviorSubject отличается от обычного Subject?", "SINGLE_CHOICE", [
      opt("a","Он горячий, а Subject — холодный",false), opt("b","Он хранит последнее значение и отдаёт его новым подписчикам",true), opt("c","Он не может иметь подписчиков",false), opt("d","Он автоматически завершается",false)
    ], 2),
    q("qf2-3", "Что делает оператор exhaustMap?", "SINGLE_CHOICE", [
      opt("a","Запускает все внутренние Observable параллельно",false), opt("b","Ставит в очередь и выполняет последовательно",false), opt("c","Игнорирует новые значения пока активен текущий внутренний Observable",true), opt("d","Отменяет текущий при получении нового",false)
    ], 3),
    q("qf2-4", "Как правильно указать тип ответа при HTTP-запросе в Angular?", "SINGLE_CHOICE", [
      opt("a","http.get('/api/users') as Observable<User[]>",false), opt("b","http.get<User[]>('/api/users')",true), opt("c","http.get('/api/users').cast<User[]>()",false), opt("d","http.get('/api/users').pipe(map(r => r as User[]))",false)
    ], 4),
    q("qf2-5", "Какой хук Angular позволяет автоматически отписаться от Observable без ngOnDestroy?", "SINGLE_CHOICE", [
      opt("a","untilDestroyed()",false), opt("b","takeUntilDestroyed()",true), opt("c","autoUnsubscribe()",false), opt("d","destroyRef()",false)
    ], 5)
  ]
},
{
  "_id": "quiz-frontend-m3",
  "courseId": "course-frontend",
  "lessonId": "fe-m3-l2",
  "title": "Квиз: Архитектура и тестирование Angular",
  "description": "Маршрутизация, Guards, Lazy Loading и автотесты",
  "timeLimitMinutes": 12,
  "passingScore": 70,
  "status": "PUBLISHED",
  "createdBy": "instructor2",
  "questions": [
    q("qf3-1", "Что такое Lazy Loading в Angular Router?", "SINGLE_CHOICE", [
      opt("a","Отложенная инициализация сервисов",false), opt("b","Загрузка модуля/компонента отдельным JS-чанком при первом обращении",true), opt("c","Кэширование HTTP-ответов",false), opt("d","Предзагрузка всех маршрутов при старте",false)
    ], 1),
    q("qf3-2", "Что возвращает CanActivateFn Guard для блокировки маршрута?", "SINGLE_CHOICE", [
      opt("a","null",false), opt("b","Observable<false> или UrlTree для редиректа",true), opt("c","new Error('Unauthorized')",false), opt("d","void",false)
    ], 2),
    q("qf3-3", "Зачем использовать Resolver в Angular Router?", "SINGLE_CHOICE", [
      opt("a","Для защиты маршрута от неавторизованного доступа",false), opt("b","Для предзагрузки данных до активации компонента маршрута",true), opt("c","Для перехвата HTTP-запросов",false), opt("d","Для лениво загружаемых модулей",false)
    ], 3),
    q("qf3-4", "Какой метод нужно вызвать в unit-тесте Angular, чтобы запустить Change Detection?", "SINGLE_CHOICE", [
      opt("a","fixture.update()",false), opt("b","fixture.refresh()",false), opt("c","fixture.detectChanges()",true), opt("d","fixture.runChangeDetection()",false)
    ], 4),
    q("qf3-5", "Как создать мок для сервиса в TestBed?", "SINGLE_CHOICE", [
      opt("a","providers: [SomeService]",false), opt("b","providers: [{ provide: SomeService, useValue: mockService }]",true), opt("c","providers: [mock(SomeService)]",false), opt("d","imports: [MockModule(SomeService)]",false)
    ], 5)
  ]
},


{
  "_id": "quiz-qa-m1",
  "courseId": "course-qa",
  "lessonId": "qa-m1-l2",
  "title": "Квиз: Теория тестирования",
  "description": "Виды тестирования, техники тест-дизайна и документация",
  "timeLimitMinutes": 10,
  "passingScore": 70,
  "status": "PUBLISHED",
  "createdBy": "instructor3",
  "questions": [
    q("qq1-1", "Что такое граничное значение (boundary value)?", "SINGLE_CHOICE", [
      opt("a","Значение в середине допустимого диапазона",false), opt("b","Значение на границе допустимого диапазона или рядом с ней",true), opt("c","Значение, вызывающее исключение",false), opt("d","Значение, которое тестируется первым",false)
    ], 1),
    q("qq1-2", "Какой статус бага означает, что исправление проверено и проблема устранена?", "SINGLE_CHOICE", [
      opt("a","Fixed",false), opt("b","Resolved",false), opt("c","Closed",true), opt("d","Verified",false)
    ], 2),
    q("qq1-3", "Какие из перечисленных техник тест-дизайна используют разбиение входных данных?", "MULTIPLE_CHOICE", [
      opt("a","Эквивалентное разбиение",true), opt("b","Граничные значения",true), opt("c","Таблица решений",false), opt("d","Попарное тестирование (Pairwise)",false)
    ], 3),
    q("qq1-4", "Что обязательно должно быть в хорошем баг-репорте?", "MULTIPLE_CHOICE", [
      opt("a","Шаги воспроизведения",true), opt("b","Ожидаемый и фактический результат",true), opt("c","Имя автора кода, содержащего баг",false), opt("d","Информация об окружении",true)
    ], 4),
    q("qq1-5", "Что такое Severity в контексте баг-репорта?", "SINGLE_CHOICE", [
      opt("a","Приоритет исправления с точки зрения бизнеса",false), opt("b","Влияние дефекта на функциональность системы",true), opt("c","Время, затраченное на воспроизведение",false), opt("d","Количество затронутых пользователей",false)
    ], 5)
  ]
},
{
  "_id": "quiz-qa-m2",
  "courseId": "course-qa",
  "lessonId": "qa-m2-l2",
  "title": "Квиз: API-тестирование",
  "description": "REST API, Postman, Newman и RestAssured",
  "timeLimitMinutes": 12,
  "passingScore": 70,
  "status": "PUBLISHED",
  "createdBy": "instructor3",
  "questions": [
    q("qq2-1", "Какой HTTP-статус возвращается при успешном создании ресурса?", "SINGLE_CHOICE", [
      opt("a","200 OK",false), opt("b","201 Created",true), opt("c","202 Accepted",false), opt("d","204 No Content",false)
    ], 1),
    q("qq2-2", "Что означает статус 403 Forbidden?", "SINGLE_CHOICE", [
      opt("a","Ресурс не найден",false), opt("b","Необходима аутентификация",false), opt("c","Аутентифицирован, но нет прав доступа",true), opt("d","Внутренняя ошибка сервера",false)
    ], 2),
    q("qq2-3", "Как в Postman Tests проверить, что статус ответа 200?", "SINGLE_CHOICE", [
      opt("a","assert(response.status === 200)",false), opt("b","pm.test('OK', () => pm.response.to.have.status(200))",true), opt("c","expect(response).status(200)",false), opt("d","pm.assert.statusCode(200)",false)
    ], 3),
    q("qq2-4", "Какую Postman-аннотацию используют для авторизации Bearer Token в коллекции?", "SINGLE_CHOICE", [
      opt("a","{{Authorization}}",false), opt("b","Authorization: Bearer {{token}} в заголовках или Auth Tab → Bearer Token",true), opt("c","pm.request.auth('bearer')",false), opt("d","pm.setToken('{{token}}')",false)
    ], 4),
    q("qq2-5", "Что делает RestAssured DSL-метод given().when().then()?", "SINGLE_CHOICE", [
      opt("a","Настраивает, отправляет запрос и проверяет ответ в читаемом fluent стиле",true), opt("b","Создаёт тестовый план, запускает и очищает данные",false), opt("c","Генерирует тест-кейсы автоматически",false), opt("d","Управляет жизненным циклом Postman-коллекции",false)
    ], 5)
  ]
},
{
  "_id": "quiz-qa-m3",
  "courseId": "course-qa",
  "lessonId": "qa-m3-l2",
  "title": "Квиз: UI-автоматизация",
  "description": "Selenium, Page Object Model, TestNG и Allure",
  "timeLimitMinutes": 12,
  "passingScore": 70,
  "status": "PUBLISHED",
  "createdBy": "instructor3",
  "questions": [
    q("qq3-1", "Какой метод Selenium ожидает, пока элемент не станет кликабельным?", "SINGLE_CHOICE", [
      opt("a","driver.waitForElement(By.id('btn'))",false), opt("b","new WebDriverWait(driver, Duration.ofSeconds(10)).until(ExpectedConditions.elementToBeClickable(locator))",true), opt("c","driver.findElement(By.id('btn')).waitUntilClickable()",false), opt("d","ExpectedConditions.wait(driver, By.id('btn'), 10)",false)
    ], 1),
    q("qq3-2", "В чём главная цель паттерна Page Object Model?", "SINGLE_CHOICE", [
      opt("a","Ускорить выполнение тестов",false), opt("b","Инкапсулировать локаторы и методы страницы, отделив их от тестовой логики",true), opt("c","Генерировать тест-данные автоматически",false), opt("d","Запускать тесты параллельно",false)
    ], 2),
    q("qq3-3", "Какая аннотация TestNG настраивает параллельный запуск тестов?", "SINGLE_CHOICE", [
      opt("a","@Parallel(threads=4)",false), opt("b","parallel='methods' count='4' в testng.xml",true), opt("c","@RunWith(Parallel.class)",false), opt("d","@TestNG(parallel=true)",false)
    ], 3),
    q("qq3-4", "Какие аннотации Allure 2 добавляют структуру в отчёт? (выбери все верные)", "MULTIPLE_CHOICE", [
      opt("a","@Feature",true), opt("b","@Story",true), opt("c","@Step",true), opt("d","@Module",false)
    ], 4),
    q("qq3-5", "Какой CSS-локатор Selenium находит элемент по атрибуту data-testid?", "SINGLE_CHOICE", [
      opt("a","By.cssSelector('#data-testid')",false), opt("b","By.cssSelector('[data-testid=submit-btn]')",true), opt("c","By.attribute('data-testid', 'submit-btn')",false), opt("d","By.xpath('data-testid=submit-btn')",false)
    ], 5)
  ]
}

]);

print("Quizzes inserted: " + db.quizzes.countDocuments());