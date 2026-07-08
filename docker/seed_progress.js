db = db.getSiblingDB("lms_progress");

var now = new Date();

function makeLesson(id, moduleId, title, moduleTitle, order) {
  return {
    lessonId: id,
    moduleId: moduleId,
    lessonTitle: title,
    moduleTitle: moduleTitle,
    order: order,
    status: "NOT_STARTED",
    completedAt: null
  };
}

// course-java: 3 модуля по 2 урока = 6 уроков
var javaLessons = {
  "sb-m1-l1": makeLesson("sb-m1-l1", "sb-m1", "Инверсия управления и DI", "Основы Spring Framework", 1),
  "sb-m1-l2": makeLesson("sb-m1-l2", "sb-m1", "Spring Boot Auto-configuration", "Основы Spring Framework", 2),
  "sb-m2-l1": makeLesson("sb-m2-l1", "sb-m2", "JPA и Spring Data JPA", "Spring Data и базы данных", 3),
  "sb-m2-l2": makeLesson("sb-m2-l2", "sb-m2", "Spring Data MongoDB", "Spring Data и базы данных", 4),
  "sb-m3-l1": makeLesson("sb-m3-l1", "sb-m3", "Построение RESTful API", "REST API и Spring Security", 5),
  "sb-m3-l2": makeLesson("sb-m3-l2", "sb-m3", "Spring Security 6 и JWT", "REST API и Spring Security", 6)
};

// course-web: 3 модуля по 2 урока = 6 уроков
var webLessons = {
  "ng-m1-l1": makeLesson("ng-m1-l1", "ng-m1", "Standalone-компоненты и @if/@for", "Фундамент Angular 17", 1),
  "ng-m1-l2": makeLesson("ng-m1-l2", "ng-m1", "Signals: реактивность без RxJS", "Фундамент Angular 17", 2),
  "ng-m2-l1": makeLesson("ng-m2-l1", "ng-m2", "RxJS: Observable, Subject, операторы", "RxJS и HttpClient", 3),
  "ng-m2-l2": makeLesson("ng-m2-l2", "ng-m2", "HttpClient и Interceptors", "RxJS и HttpClient", 4),
  "ng-m3-l1": makeLesson("ng-m3-l1", "ng-m3", "Angular Router: Guards и Resolvers", "Маршрутизация и оптимизация", 5),
  "ng-m3-l2": makeLesson("ng-m3-l2", "ng-m3", "Lazy Loading и производительность", "Маршрутизация и оптимизация", 6)
};

// course-devops: 3 модуля по 2 урока = 6 уроков
var devopsLessons = {
  "do-m1-l1": makeLesson("do-m1-l1", "do-m1", "Dockerfile и многоэтапная сборка", "Контейнеризация с Docker", 1),
  "do-m1-l2": makeLesson("do-m1-l2", "do-m1", "Docker Compose для разработки", "Контейнеризация с Docker", 2),
  "do-m2-l1": makeLesson("do-m2-l1", "do-m2", "Структура .gitlab-ci.yml", "GitLab CI/CD", 3),
  "do-m2-l2": makeLesson("do-m2-l2", "do-m2", "Сборка образов и публикация в Registry", "GitLab CI/CD", 4),
  "do-m3-l1": makeLesson("do-m3-l1", "do-m3", "Prometheus: метрики из Spring Boot", "Мониторинг с Prometheus и Grafana", 5),
  "do-m3-l2": makeLesson("do-m3-l2", "do-m3", "Grafana: дашборды и алерты", "Мониторинг с Prometheus и Grafana", 6)
};

db.progress.insertMany([
  {
    userId: NumberLong(1),
    courseId: "course-java",
    status: "NOT_STARTED",
    lessonProgress: javaLessons,
    totalLessons: 6,
    progressPercent: 0.0,
    startedAt: now,
    lastActivityAt: now,
    completedAt: null
  },
  {
    userId: NumberLong(1),
    courseId: "course-web",
    status: "NOT_STARTED",
    lessonProgress: webLessons,
    totalLessons: 6,
    progressPercent: 0.0,
    startedAt: now,
    lastActivityAt: now,
    completedAt: null
  },
  {
    userId: NumberLong(1),
    courseId: "course-devops",
    status: "NOT_STARTED",
    lessonProgress: devopsLessons,
    totalLessons: 6,
    progressPercent: 0.0,
    startedAt: now,
    lastActivityAt: now,
    completedAt: null
  }
]);

print("Progress records inserted: " + db.progress.countDocuments());
