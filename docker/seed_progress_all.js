var enrollments = [
  { userId: "4", username: "admin1",        courseId: "course-backend"  },
  { userId: "4", username: "admin1",        courseId: "course-frontend" },
  { userId: "5", username: "ivan.ivanov",   courseId: "course-backend"  },
  { userId: "5", username: "ivan.ivanov",   courseId: "course-qa"       },
  { userId: "6", username: "anna.smirnova", courseId: "course-backend"  },
  { userId: "6", username: "anna.smirnova", courseId: "course-frontend" },
  { userId: "7", username: "sergey.volkov", courseId: "course-frontend" },
  { userId: "7", username: "sergey.volkov", courseId: "course-qa"       },
  { userId: "8", username: "kate.novikova", courseId: "course-backend"  },
  { userId: "8", username: "kate.novikova", courseId: "course-qa"       },
];

var coursesDb  = db.getSiblingDB("lms_courses");
var progressDb = db.getSiblingDB("lms_progress");

var courseCache = {};

function getCourse(courseId) {
  if (!courseCache[courseId]) {
    courseCache[courseId] = coursesDb.courses.findOne({ _id: courseId });
  }
  return courseCache[courseId];
}

function buildLessonProgress(course) {
  var lessonProgressMap = {};
  var order = 1;

  if (!course.modules) return lessonProgressMap;

  var sortedModules = course.modules.slice().sort(function(a, b) {
    return (a.order || 0) - (b.order || 0);
  });

  sortedModules.forEach(function(module) {
    if (!module.lessons) return;

    var sortedLessons = module.lessons.slice().sort(function(a, b) {
      return (a.order || 0) - (b.order || 0);
    });

    sortedLessons.forEach(function(lesson) {
      lessonProgressMap[lesson.id] = {
        lessonId:    lesson.id,
        moduleId:    module.id,
        lessonTitle: lesson.title,
        moduleTitle: module.title,
        order:       order++,
        status:      "NOT_STARTED",
        completedAt: null
      };
    });
  });

  return lessonProgressMap;
}

progressDb.progress.deleteMany({});
print("Cleared existing progress records.");

var now = new Date();
var inserted = 0;
var errors   = 0;

enrollments.forEach(function(enroll) {
  var userIdLong = NumberLong(enroll.userId);

  var course = getCourse(enroll.courseId);
  if (!course) {
    print("WARN  [" + enroll.username + " / " + enroll.courseId + "] — курс не найден в lms_courses, пропускаем");
    errors++;
    return;
  }

  var lessonProgressMap = buildLessonProgress(course);
  var totalLessons = Object.keys(lessonProgressMap).length;

  progressDb.progress.insertOne({
    userId:          userIdLong,
    courseId:        enroll.courseId,
    status:          "NOT_STARTED",
    lessonProgress:  lessonProgressMap,
    totalLessons:    totalLessons,
    progressPercent: 0.0,
    startedAt:       now,
    lastActivityAt:  now,
    completedAt:     null
  });

  print("OK    [" + enroll.username + " id=" + enroll.userId + " / " + enroll.courseId + "] — " + totalLessons + " уроков");
  inserted++;
});

print("");
print("═══════════════════════════════════════════");
print("Вставлено:  " + inserted);
print("Не найдено: " + errors  + " (курс отсутствует в MongoDB)");
print("Итого в коллекции: " + progressDb.progress.countDocuments());
print("═══════════════════════════════════════════");