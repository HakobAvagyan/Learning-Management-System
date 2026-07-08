const now = new Date();

function uid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}

db = db.getSiblingDB('lms_assessments');

db.quizzes.insertMany([

  {
    courseId: "6a4e21e835c9363e2a900d19",
    lessonId: "5dbd1d1e-5ee0-49c8-a1e6-097ffc5de0bd", // Переменные и типы данных
    title: "Тест: Переменные и типы данных в Java",
    description: "Проверьте знания о базовых типах данных и переменных в Java",
    questions: [
      {
        id: uid(), text: "Какой из следующих типов данных является примитивным в Java?",
        type: "SINGLE_CHOICE", order: 1, points: 1,
        options: [
          { id: uid(), text: "String",    correct: false },
          { id: uid(), text: "int",       correct: true  },
          { id: uid(), text: "Integer",   correct: false },
          { id: uid(), text: "ArrayList", correct: false }
        ]
      },
      {
        id: uid(), text: "Каков размер типа long в Java?",
        type: "SINGLE_CHOICE", order: 2, points: 1,
        options: [
          { id: uid(), text: "16 бит",  correct: false },
          { id: uid(), text: "32 бита", correct: false },
          { id: uid(), text: "64 бита", correct: true  },
          { id: uid(), text: "128 бит", correct: false }
        ]
      },
      {
        id: uid(), text: "Что выведет System.out.println(10 / 3) в Java?",
        type: "SINGLE_CHOICE", order: 3, points: 1,
        options: [
          { id: uid(), text: "3.33", correct: false },
          { id: uid(), text: "3",    correct: true  },
          { id: uid(), text: "4",    correct: false },
          { id: uid(), text: "3.0",  correct: false }
        ]
      },
      {
        id: uid(), text: "Какое ключевое слово используется для объявления константы в Java?",
        type: "SINGLE_CHOICE", order: 4, points: 1,
        options: [
          { id: uid(), text: "const",  correct: false },
          { id: uid(), text: "static", correct: false },
          { id: uid(), text: "final",  correct: true  },
          { id: uid(), text: "fixed",  correct: false }
        ]
      }
    ],
    timeLimitMinutes: 10, passingScore: 70, status: "PUBLISHED",
    createdBy: "admin", createdAt: now, updatedAt: now
  },

  {
    courseId: "6a4e21e835c9363e2a900d19",
    lessonId: "348c6d40-45fd-411b-9d69-c0ba27cbde12", // Условия и циклы
    title: "Тест: Условия и циклы в Java",
    description: "Проверьте знания об операторах ветвления и циклах",
    questions: [
      {
        id: uid(), text: "Какой цикл в Java гарантированно выполняется хотя бы один раз?",
        type: "SINGLE_CHOICE", order: 1, points: 1,
        options: [
          { id: uid(), text: "for",      correct: false },
          { id: uid(), text: "while",    correct: false },
          { id: uid(), text: "do-while", correct: true  },
          { id: uid(), text: "forEach",  correct: false }
        ]
      },
      {
        id: uid(), text: "Что делает оператор break в цикле?",
        type: "SINGLE_CHOICE", order: 2, points: 1,
        options: [
          { id: uid(), text: "Пропускает текущую итерацию",   correct: false },
          { id: uid(), text: "Прерывает выполнение цикла",    correct: true  },
          { id: uid(), text: "Перезапускает цикл с начала",   correct: false },
          { id: uid(), text: "Выбрасывает исключение",        correct: false }
        ]
      },
      {
        id: uid(), text: "Что выведет: for(int i=0;i<3;i++) { if(i==1) continue; System.out.print(i); }",
        type: "SINGLE_CHOICE", order: 3, points: 1,
        options: [
          { id: uid(), text: "012", correct: false },
          { id: uid(), text: "02",  correct: true  },
          { id: uid(), text: "01",  correct: false },
          { id: uid(), text: "12",  correct: false }
        ]
      }
    ],
    timeLimitMinutes: 10, passingScore: 70, status: "PUBLISHED",
    createdBy: "admin", createdAt: now, updatedAt: now
  },

  {
    courseId: "6a4e21e835c9363e2a900d19",
    lessonId: "e38ed657-47be-4d2a-9354-24a518dad991", // Классы и объекты
    title: "Тест: Классы и объекты",
    description: "ООП: классы, объекты, конструкторы",
    questions: [
      {
        id: uid(), text: "Какое ключевое слово используется для создания объекта в Java?",
        type: "SINGLE_CHOICE", order: 1, points: 1,
        options: [
          { id: uid(), text: "create", correct: false },
          { id: uid(), text: "new",    correct: true  },
          { id: uid(), text: "make",   correct: false },
          { id: uid(), text: "init",   correct: false }
        ]
      },
      {
        id: uid(), text: "Что такое конструктор в Java?",
        type: "SINGLE_CHOICE", order: 2, points: 1,
        options: [
          { id: uid(), text: "Метод для удаления объекта",                       correct: false },
          { id: uid(), text: "Специальный метод для инициализации объекта",      correct: true  },
          { id: uid(), text: "Метод, возвращающий тип void",                     correct: false },
          { id: uid(), text: "Статический метод класса",                         correct: false }
        ]
      },
      {
        id: uid(), text: "Что такое инкапсуляция?",
        type: "SINGLE_CHOICE", order: 3, points: 1,
        options: [
          { id: uid(), text: "Наследование свойств родительского класса",        correct: false },
          { id: uid(), text: "Скрытие внутренней реализации класса",             correct: true  },
          { id: uid(), text: "Создание множества методов с одинаковым именем",  correct: false },
          { id: uid(), text: "Способность объекта принимать разные формы",      correct: false }
        ]
      }
    ],
    timeLimitMinutes: 10, passingScore: 70, status: "PUBLISHED",
    createdBy: "admin", createdAt: now, updatedAt: now
  },

  
  {
    courseId: "6a4e21e835c9363e2a900d1a",
    lessonId: "ef3128f7-28ac-4bf0-a181-a95449045939", // IoC и Dependency Injection
    title: "Тест: IoC и Dependency Injection",
    description: "Принципы инверсии управления и внедрения зависимостей в Spring",
    questions: [
      {
        id: uid(), text: "Что означает IoC в контексте Spring?",
        type: "SINGLE_CHOICE", order: 1, points: 1,
        options: [
          { id: uid(), text: "Input/Output Control",      correct: false },
          { id: uid(), text: "Inversion of Control",      correct: true  },
          { id: uid(), text: "Integration of Components", correct: false },
          { id: uid(), text: "Internal Object Container", correct: false }
        ]
      },
      {
        id: uid(), text: "Какая аннотация используется для внедрения зависимостей в Spring?",
        type: "SINGLE_CHOICE", order: 2, points: 1,
        options: [
          { id: uid(), text: "@Inject",    correct: false },
          { id: uid(), text: "@Autowired", correct: true  },
          { id: uid(), text: "@Resource",  correct: false },
          { id: uid(), text: "@Component", correct: false }
        ]
      },
      {
        id: uid(), text: "Какой тип внедрения зависимостей считается предпочтительным в Spring?",
        type: "SINGLE_CHOICE", order: 3, points: 1,
        options: [
          { id: uid(), text: "Field injection (через поле)",         correct: false },
          { id: uid(), text: "Setter injection (через сеттер)",      correct: false },
          { id: uid(), text: "Constructor injection (через конструктор)", correct: true },
          { id: uid(), text: "Method injection (через метод)",       correct: false }
        ]
      },
      {
        id: uid(), text: "Что такое Spring Bean?",
        type: "SINGLE_CHOICE", order: 4, points: 1,
        options: [
          { id: uid(), text: "Объект, управляемый Spring IoC контейнером", correct: true  },
          { id: uid(), text: "Интерфейс для работы с базой данных",        correct: false },
          { id: uid(), text: "Аннотация для маркировки контроллеров",      correct: false },
          { id: uid(), text: "Конфигурационный файл Spring",               correct: false }
        ]
      }
    ],
    timeLimitMinutes: 10, passingScore: 70, status: "PUBLISHED",
    createdBy: "admin", createdAt: now, updatedAt: now
  },

  {
    courseId: "6a4e21e835c9363e2a900d1a",
    lessonId: "e91fb82e-963a-42b6-b878-5f7195256400", // @RestController и маршруты
    title: "Тест: REST контроллеры в Spring Boot",
    description: "Аннотации для построения REST API",
    questions: [
      {
        id: uid(), text: "Какая аннотация объединяет @Controller и @ResponseBody?",
        type: "SINGLE_CHOICE", order: 1, points: 1,
        options: [
          { id: uid(), text: "@Service",        correct: false },
          { id: uid(), text: "@RestController", correct: true  },
          { id: uid(), text: "@Component",      correct: false },
          { id: uid(), text: "@Repository",     correct: false }
        ]
      },
      {
        id: uid(), text: "Какой HTTP-метод используется аннотацией @PostMapping?",
        type: "SINGLE_CHOICE", order: 2, points: 1,
        options: [
          { id: uid(), text: "GET",    correct: false },
          { id: uid(), text: "POST",   correct: true  },
          { id: uid(), text: "PUT",    correct: false },
          { id: uid(), text: "DELETE", correct: false }
        ]
      },
      {
        id: uid(), text: "Для чего используется аннотация @PathVariable?",
        type: "SINGLE_CHOICE", order: 3, points: 1,
        options: [
          { id: uid(), text: "Извлечение параметра из строки запроса (?key=value)",    correct: false },
          { id: uid(), text: "Извлечение переменной из пути URL (/users/{id})",        correct: true  },
          { id: uid(), text: "Получение тела запроса в формате JSON",                  correct: false },
          { id: uid(), text: "Маппинг заголовка HTTP запроса",                         correct: false }
        ]
      }
    ],
    timeLimitMinutes: 10, passingScore: 70, status: "PUBLISHED",
    createdBy: "admin", createdAt: now, updatedAt: now
  },

  
  {
    courseId: "6a4e21e835c9363e2a900d1b",
    lessonId: "862f9dec-36c5-48bf-85b7-07e2fa6862a6", // Flexbox
    title: "Тест: CSS Flexbox",
    description: "Проверьте знания о флекс-контейнерах и флекс-элементах",
    questions: [
      {
        id: uid(), text: "Какое CSS-свойство делает элемент флекс-контейнером?",
        type: "SINGLE_CHOICE", order: 1, points: 1,
        options: [
          { id: uid(), text: "display: block",  correct: false },
          { id: uid(), text: "display: flex",   correct: true  },
          { id: uid(), text: "display: grid",   correct: false },
          { id: uid(), text: "flex-wrap: wrap", correct: false }
        ]
      },
      {
        id: uid(), text: "Какое свойство выравнивает флекс-элементы по главной оси?",
        type: "SINGLE_CHOICE", order: 2, points: 1,
        options: [
          { id: uid(), text: "align-items",     correct: false },
          { id: uid(), text: "justify-content", correct: true  },
          { id: uid(), text: "align-content",   correct: false },
          { id: uid(), text: "flex-direction",  correct: false }
        ]
      },
      {
        id: uid(), text: "Значение justify-content: space-between...",
        type: "SINGLE_CHOICE", order: 3, points: 1,
        options: [
          { id: uid(), text: "Размещает элементы с равными отступами вокруг",           correct: false },
          { id: uid(), text: "Размещает первый и последний по краям, остальные равномерно", correct: true },
          { id: uid(), text: "Группирует все элементы по центру",                        correct: false },
          { id: uid(), text: "Растягивает элементы на всю ширину",                      correct: false }
        ]
      },
      {
        id: uid(), text: "Что делает свойство flex: 1?",
        type: "SINGLE_CHOICE", order: 4, points: 1,
        options: [
          { id: uid(), text: "Фиксирует ширину элемента в 1px",                          correct: false },
          { id: uid(), text: "Позволяет элементу занять всё доступное пространство",     correct: true  },
          { id: uid(), text: "Ограничивает количество элементов в строке до 1",          correct: false },
          { id: uid(), text: "Устанавливает порядок элемента равным 1",                  correct: false }
        ]
      }
    ],
    timeLimitMinutes: 10, passingScore: 70, status: "PUBLISHED",
    createdBy: "admin", createdAt: now, updatedAt: now
  },

  {
    courseId: "6a4e21e835c9363e2a900d1b",
    lessonId: "120971a8-1e2f-4f39-a886-8db7576ee46b", // CSS Grid
    title: "Тест: CSS Grid",
    description: "Двумерная сеточная разметка с CSS Grid",
    questions: [
      {
        id: uid(), text: "Как определить Grid-контейнер с 3 колонками одинаковой ширины?",
        type: "SINGLE_CHOICE", order: 1, points: 1,
        options: [
          { id: uid(), text: "grid-template-columns: 1fr 1fr 1fr", correct: true  },
          { id: uid(), text: "grid-columns: 3",                     correct: false },
          { id: uid(), text: "columns: repeat(3)",                  correct: false },
          { id: uid(), text: "display: grid(3)",                    correct: false }
        ]
      },
      {
        id: uid(), text: "Что означает единица fr в CSS Grid?",
        type: "SINGLE_CHOICE", order: 2, points: 1,
        options: [
          { id: uid(), text: "fixed ratio — фиксированное соотношение",   correct: false },
          { id: uid(), text: "fractional unit — дробная единица",          correct: true  },
          { id: uid(), text: "flex row — флекс строка",                    correct: false },
          { id: uid(), text: "font ratio — соотношение шрифта",            correct: false }
        ]
      },
      {
        id: uid(), text: "Какое свойство растягивает элемент на 2 колонки в Grid?",
        type: "SINGLE_CHOICE", order: 3, points: 1,
        options: [
          { id: uid(), text: "grid-column: span 2",  correct: true  },
          { id: uid(), text: "colspan: 2",            correct: false },
          { id: uid(), text: "grid-width: 2",         correct: false },
          { id: uid(), text: "column-span: 2",        correct: false }
        ]
      }
    ],
    timeLimitMinutes: 10, passingScore: 70, status: "PUBLISHED",
    createdBy: "admin", createdAt: now, updatedAt: now
  },

  
  {
    courseId: "6a4e21e835c9363e2a900d1c",
    lessonId: "24294b55-8c3d-421a-8ea0-9dd5c86d2dcf", // Что такое Docker
    title: "Тест: Основы Docker",
    description: "Базовые концепции контейнеризации с Docker",
    questions: [
      {
        id: uid(), text: "Что такое Docker-образ (image)?",
        type: "SINGLE_CHOICE", order: 1, points: 1,
        options: [
          { id: uid(), text: "Запущенный экземпляр приложения",                          correct: false },
          { id: uid(), text: "Неизменяемый шаблон для создания контейнеров",             correct: true  },
          { id: uid(), text: "Файл с переменными окружения",                             correct: false },
          { id: uid(), text: "Виртуальная машина",                                       correct: false }
        ]
      },
      {
        id: uid(), text: "Какая команда запускает контейнер из образа?",
        type: "SINGLE_CHOICE", order: 2, points: 1,
        options: [
          { id: uid(), text: "docker build",  correct: false },
          { id: uid(), text: "docker start",  correct: false },
          { id: uid(), text: "docker run",    correct: true  },
          { id: uid(), text: "docker create", correct: false }
        ]
      },
      {
        id: uid(), text: "В чём главное отличие контейнера от виртуальной машины?",
        type: "SINGLE_CHOICE", order: 3, points: 1,
        options: [
          { id: uid(), text: "Контейнер включает полноценную ОС",                         correct: false },
          { id: uid(), text: "Контейнер использует ядро хостовой ОС, не виртуализирует железо", correct: true },
          { id: uid(), text: "Контейнер медленнее виртуальной машины",                   correct: false },
          { id: uid(), text: "Контейнер не может иметь сетевых настроек",                correct: false }
        ]
      },
      {
        id: uid(), text: "Что такое Dockerfile?",
        type: "SINGLE_CHOICE", order: 4, points: 1,
        options: [
          { id: uid(), text: "Лог-файл запущенного контейнера",                          correct: false },
          { id: uid(), text: "Файл инструкций для сборки Docker-образа",                 correct: true  },
          { id: uid(), text: "Конфигурация Docker daemon",                               correct: false },
          { id: uid(), text: "Файл для хранения переменных окружения",                   correct: false }
        ]
      }
    ],
    timeLimitMinutes: 10, passingScore: 70, status: "PUBLISHED",
    createdBy: "admin", createdAt: now, updatedAt: now
  },

  {
    courseId: "6a4e21e835c9363e2a900d1c",
    lessonId: "60527564-a6a3-4ae5-b203-9e90f77a4fb4", // Архитектура Kafka
    title: "Тест: Apache Kafka",
    description: "Архитектура и концепции Apache Kafka",
    questions: [
      {
        id: uid(), text: "Что такое топик (topic) в Kafka?",
        type: "SINGLE_CHOICE", order: 1, points: 1,
        options: [
          { id: uid(), text: "Сервер Kafka",                                 correct: false },
          { id: uid(), text: "Именованный канал для хранения сообщений",    correct: true  },
          { id: uid(), text: "Группа потребителей",                          correct: false },
          { id: uid(), text: "Алгоритм репликации",                          correct: false }
        ]
      },
      {
        id: uid(), text: "Как называется отправитель сообщений в Kafka?",
        type: "SINGLE_CHOICE", order: 2, points: 1,
        options: [
          { id: uid(), text: "Consumer",  correct: false },
          { id: uid(), text: "Broker",    correct: false },
          { id: uid(), text: "Producer",  correct: true  },
          { id: uid(), text: "Publisher", correct: false }
        ]
      },
      {
        id: uid(), text: "Что такое Consumer Group?",
        type: "SINGLE_CHOICE", order: 3, points: 1,
        options: [
          { id: uid(), text: "Группа брокеров Kafka",                                        correct: false },
          { id: uid(), text: "Набор потребителей, совместно читающих один топик",             correct: true  },
          { id: uid(), text: "Список топиков для одного приложения",                          correct: false },
          { id: uid(), text: "Механизм шифрования сообщений",                                 correct: false }
        ]
      }
    ],
    timeLimitMinutes: 10, passingScore: 70, status: "PUBLISHED",
    createdBy: "admin", createdAt: now, updatedAt: now
  },

  {
    courseId: "6a4e21e835c9363e2a900d1d",
    lessonId: "c10b5a7f-6ea5-436d-84e6-feaa503c571e", // Переменные и типы данных
    title: "Тест: Переменные и типы данных в Python",
    description: "Базовые типы данных Python",
    questions: [
      {
        id: uid(), text: "Какой тип данных у значения 3.14 в Python?",
        type: "SINGLE_CHOICE", order: 1, points: 1,
        options: [
          { id: uid(), text: "int",    correct: false },
          { id: uid(), text: "float",  correct: true  },
          { id: uid(), text: "double", correct: false },
          { id: uid(), text: "str",    correct: false }
        ]
      },
      {
        id: uid(), text: "Как проверить тип переменной в Python?",
        type: "SINGLE_CHOICE", order: 2, points: 1,
        options: [
          { id: uid(), text: "typeof(x)",  correct: false },
          { id: uid(), text: "x.getType()", correct: false },
          { id: uid(), text: "type(x)",    correct: true  },
          { id: uid(), text: "typeOf x",   correct: false }
        ]
      },
      {
        id: uid(), text: "Что выведет print(type(True))?",
        type: "SINGLE_CHOICE", order: 3, points: 1,
        options: [
          { id: uid(), text: "<class 'boolean'>", correct: false },
          { id: uid(), text: "<class 'bool'>",    correct: true  },
          { id: uid(), text: "<class 'int'>",     correct: false },
          { id: uid(), text: "True",              correct: false }
        ]
      },
      {
        id: uid(), text: "Как Python относится к объявлению типа переменной?",
        type: "SINGLE_CHOICE", order: 4, points: 1,
        options: [
          { id: uid(), text: "Тип обязательно указывать явно",                   correct: false },
          { id: uid(), text: "Тип определяется автоматически (динамическая типизация)", correct: true },
          { id: uid(), text: "Все переменные имеют тип object",                  correct: false },
          { id: uid(), text: "Тип указывается только для чисел",                 correct: false }
        ]
      }
    ],
    timeLimitMinutes: 10, passingScore: 70, status: "PUBLISHED",
    createdBy: "admin", createdAt: now, updatedAt: now
  },

  {
    courseId: "6a4e21e835c9363e2a900d1d",
    lessonId: "643ab482-c06a-42d1-8c73-6385a577ea7a", // Списки и кортежи
    title: "Тест: Списки и кортежи в Python",
    description: "Работа со списками и кортежами",
    questions: [
      {
        id: uid(), text: "Чем кортеж (tuple) отличается от списка (list) в Python?",
        type: "SINGLE_CHOICE", order: 1, points: 1,
        options: [
          { id: uid(), text: "Кортеж может хранить только числа",      correct: false },
          { id: uid(), text: "Кортеж неизменяемый (immutable)",        correct: true  },
          { id: uid(), text: "Кортеж не поддерживает индексацию",      correct: false },
          { id: uid(), text: "Кортеж быстрее при записи",              correct: false }
        ]
      },
      {
        id: uid(), text: "Как добавить элемент в конец списка?",
        type: "SINGLE_CHOICE", order: 2, points: 1,
        options: [
          { id: uid(), text: "list.add(x)",    correct: false },
          { id: uid(), text: "list.push(x)",   correct: false },
          { id: uid(), text: "list.append(x)", correct: true  },
          { id: uid(), text: "list.insert(x)", correct: false }
        ]
      },
      {
        id: uid(), text: "Что вернёт [1,2,3,4,5][1:3]?",
        type: "SINGLE_CHOICE", order: 3, points: 1,
        options: [
          { id: uid(), text: "[1, 2, 3]", correct: false },
          { id: uid(), text: "[2, 3]",    correct: true  },
          { id: uid(), text: "[2, 3, 4]", correct: false },
          { id: uid(), text: "[1, 2]",    correct: false }
        ]
      }
    ],
    timeLimitMinutes: 10, passingScore: 70, status: "PUBLISHED",
    createdBy: "admin", createdAt: now, updatedAt: now
  },

  {
    courseId: "6a4e21e835c9363e2a900d1e",
    lessonId: "eb21baab-61a0-43a4-9b5b-ba12d6068822", // Big O нотация
    title: "Тест: Big O нотация",
    description: "Оценка сложности алгоритмов",
    questions: [
      {
        id: uid(), text: "Какова сложность линейного поиска в массиве из N элементов?",
        type: "SINGLE_CHOICE", order: 1, points: 1,
        options: [
          { id: uid(), text: "O(1)",      correct: false },
          { id: uid(), text: "O(log N)",  correct: false },
          { id: uid(), text: "O(N)",      correct: true  },
          { id: uid(), text: "O(N²)",     correct: false }
        ]
      },
      {
        id: uid(), text: "Какова временная сложность доступа к элементу массива по индексу?",
        type: "SINGLE_CHOICE", order: 2, points: 1,
        options: [
          { id: uid(), text: "O(1)",    correct: true  },
          { id: uid(), text: "O(N)",    correct: false },
          { id: uid(), text: "O(N²)",   correct: false },
          { id: uid(), text: "O(logN)", correct: false }
        ]
      },
      {
        id: uid(), text: "Алгоритм имеет сложность O(N²). Что произойдёт при увеличении N в 3 раза?",
        type: "SINGLE_CHOICE", order: 3, points: 1,
        options: [
          { id: uid(), text: "Время увеличится в 3 раза",  correct: false },
          { id: uid(), text: "Время увеличится в 6 раз",   correct: false },
          { id: uid(), text: "Время увеличится в 9 раз",   correct: true  },
          { id: uid(), text: "Время не изменится",          correct: false }
        ]
      },
      {
        id: uid(), text: "Какова сложность бинарного поиска?",
        type: "SINGLE_CHOICE", order: 4, points: 1,
        options: [
          { id: uid(), text: "O(1)",      correct: false },
          { id: uid(), text: "O(log N)",  correct: true  },
          { id: uid(), text: "O(N)",      correct: false },
          { id: uid(), text: "O(N log N)", correct: false }
        ]
      }
    ],
    timeLimitMinutes: 15, passingScore: 70, status: "PUBLISHED",
    createdBy: "admin", createdAt: now, updatedAt: now
  },

  {
    courseId: "6a4e21e835c9363e2a900d1e",
    lessonId: "da36767d-4475-4998-bbe4-4e9358684314", // Сортировки
    title: "Тест: Алгоритмы сортировки",
    description: "Пузырьковая сортировка и сортировка вставкой",
    questions: [
      {
        id: uid(), text: "Какова временная сложность пузырьковой сортировки в худшем случае?",
        type: "SINGLE_CHOICE", order: 1, points: 1,
        options: [
          { id: uid(), text: "O(N)",      correct: false },
          { id: uid(), text: "O(N log N)", correct: false },
          { id: uid(), text: "O(N²)",     correct: true  },
          { id: uid(), text: "O(log N)",  correct: false }
        ]
      },
      {
        id: uid(), text: "Сортировка вставкой эффективна для...",
        type: "SINGLE_CHOICE", order: 2, points: 1,
        options: [
          { id: uid(), text: "Больших случайных массивов",           correct: false },
          { id: uid(), text: "Почти отсортированных массивов",       correct: true  },
          { id: uid(), text: "Массивов с большим числом дубликатов", correct: false },
          { id: uid(), text: "Обратно отсортированных массивов",     correct: false }
        ]
      },
      {
        id: uid(), text: "Сколько проходов нужно пузырьковой сортировке для массива [5,1,4,2,8]?",
        type: "SINGLE_CHOICE", order: 3, points: 1,
        options: [
          { id: uid(), text: "2", correct: false },
          { id: uid(), text: "3", correct: false },
          { id: uid(), text: "4", correct: true  },
          { id: uid(), text: "5", correct: false }
        ]
      }
    ],
    timeLimitMinutes: 10, passingScore: 70, status: "PUBLISHED",
    createdBy: "admin", createdAt: now, updatedAt: now
  },

  
  {
    courseId: "6a4e21e835c9363e2a900d1f",
    lessonId: "e224197b-fa65-48a6-9a79-3d55d136830f", // JSX и компоненты
    title: "Тест: JSX и компоненты React",
    description: "Основы компонентного подхода в React",
    questions: [
      {
        id: uid(), text: "Что такое JSX?",
        type: "SINGLE_CHOICE", order: 1, points: 1,
        options: [
          { id: uid(), text: "Новый язык программирования от Facebook",          correct: false },
          { id: uid(), text: "Синтаксическое расширение JavaScript для описания UI", correct: true },
          { id: uid(), text: "Шаблонизатор HTML",                                correct: false },
          { id: uid(), text: "Библиотека для работы с DOM",                      correct: false }
        ]
      },
      {
        id: uid(), text: "Как называется функциональный компонент в React?",
        type: "SINGLE_CHOICE", order: 2, points: 1,
        options: [
          { id: uid(), text: "Функция, возвращающая JSX",                         correct: true  },
          { id: uid(), text: "Класс, расширяющий HTMLElement",                    correct: false },
          { id: uid(), text: "Объект с методом render()",                         correct: false },
          { id: uid(), text: "Файл с расширением .jsx",                           correct: false }
        ]
      },
      {
        id: uid(), text: "Как передать данные от родительского компонента к дочернему?",
        type: "SINGLE_CHOICE", order: 3, points: 1,
        options: [
          { id: uid(), text: "Через глобальные переменные",  correct: false },
          { id: uid(), text: "Через props",                   correct: true  },
          { id: uid(), text: "Через state дочернего",         correct: false },
          { id: uid(), text: "Через localStorage",            correct: false }
        ]
      }
    ],
    timeLimitMinutes: 10, passingScore: 70, status: "PUBLISHED",
    createdBy: "admin", createdAt: now, updatedAt: now
  },

  {
    courseId: "6a4e21e835c9363e2a900d1f",
    lessonId: "e653c1c5-658c-4251-a940-01e39d9f921b", // Хуки useState и useEffect
    title: "Тест: Хуки useState и useEffect",
    description: "Управление состоянием и побочными эффектами в React",
    questions: [
      {
        id: uid(), text: "Что возвращает хук useState?",
        type: "SINGLE_CHOICE", order: 1, points: 1,
        options: [
          { id: uid(), text: "Только текущее значение состояния",                correct: false },
          { id: uid(), text: "Массив [текущее значение, функция обновления]",    correct: true  },
          { id: uid(), text: "Объект с полями value и setValue",                  correct: false },
          { id: uid(), text: "Promise с текущим состоянием",                     correct: false }
        ]
      },
      {
        id: uid(), text: "Когда выполняется useEffect с пустым массивом зависимостей []?",
        type: "SINGLE_CHOICE", order: 2, points: 1,
        options: [
          { id: uid(), text: "При каждом рендере",                          correct: false },
          { id: uid(), text: "Только при первом монтировании компонента",   correct: true  },
          { id: uid(), text: "Только при размонтировании компонента",       correct: false },
          { id: uid(), text: "Никогда не выполняется",                      correct: false }
        ]
      },
      {
        id: uid(), text: "Как избежать бесконечного цикла при использовании useEffect?",
        type: "SINGLE_CHOICE", order: 3, points: 1,
        options: [
          { id: uid(), text: "Не обновлять state внутри useEffect",                          correct: false },
          { id: uid(), text: "Указать правильный массив зависимостей",                       correct: true  },
          { id: uid(), text: "Использовать setTimeout перед обновлением state",              correct: false },
          { id: uid(), text: "Вызывать useEffect только один раз на компонент",              correct: false }
        ]
      },
      {
        id: uid(), text: "Для чего используется функция очистки (cleanup) в useEffect?",
        type: "SINGLE_CHOICE", order: 4, points: 1,
        options: [
          { id: uid(), text: "Для сброса state при обновлении",                              correct: false },
          { id: uid(), text: "Для отмены подписок и таймеров при размонтировании",          correct: true  },
          { id: uid(), text: "Для инициализации начального состояния",                      correct: false },
          { id: uid(), text: "Для форматирования данных перед рендером",                    correct: false }
        ]
      }
    ],
    timeLimitMinutes: 10, passingScore: 70, status: "PUBLISHED",
    createdBy: "admin", createdAt: now, updatedAt: now
  },

  {
    courseId: "6a4e21e835c9363e2a900d20",
    lessonId: "2fb182dd-ccdb-4e5a-9cac-9651a0447ad4", // Что такое CI/CD
    title: "Тест: Основы CI/CD",
    description: "Принципы непрерывной интеграции и доставки",
    questions: [
      {
        id: uid(), text: "Что означает CI в DevOps?",
        type: "SINGLE_CHOICE", order: 1, points: 1,
        options: [
          { id: uid(), text: "Container Integration",   correct: false },
          { id: uid(), text: "Continuous Integration",  correct: true  },
          { id: uid(), text: "Code Inspection",         correct: false },
          { id: uid(), text: "Continuous Improvement",  correct: false }
        ]
      },
      {
        id: uid(), text: "Какова главная цель CI/CD пайплайна?",
        type: "SINGLE_CHOICE", order: 2, points: 1,
        options: [
          { id: uid(), text: "Ускорить написание кода разработчиками",                       correct: false },
          { id: uid(), text: "Автоматизировать сборку, тестирование и доставку ПО",         correct: true  },
          { id: uid(), text: "Заменить ручное code review",                                  correct: false },
          { id: uid(), text: "Управлять командой разработчиков",                             correct: false }
        ]
      },
      {
        id: uid(), text: "Что такое CD (Continuous Delivery)?",
        type: "SINGLE_CHOICE", order: 3, points: 1,
        options: [
          { id: uid(), text: "Автоматический деплой в продакшн без участия человека",       correct: false },
          { id: uid(), text: "Практика поддержки кода в состоянии готовности к деплою",     correct: true  },
          { id: uid(), text: "Непрерывное тестирование кода",                               correct: false },
          { id: uid(), text: "Система мониторинга производительности",                      correct: false }
        ]
      }
    ],
    timeLimitMinutes: 10, passingScore: 70, status: "PUBLISHED",
    createdBy: "admin", createdAt: now, updatedAt: now
  },

  {
    courseId: "6a4e21e835c9363e2a900d20",
    lessonId: "ee1d7c22-e795-495b-9039-1a204437b395", // Архитектура K8s
    title: "Тест: Kubernetes основы",
    description: "Архитектура и компоненты Kubernetes",
    questions: [
      {
        id: uid(), text: "Что такое Pod в Kubernetes?",
        type: "SINGLE_CHOICE", order: 1, points: 1,
        options: [
          { id: uid(), text: "Физический сервер в кластере",                        correct: false },
          { id: uid(), text: "Минимальная единица развёртывания, группа контейнеров", correct: true },
          { id: uid(), text: "Сервис балансировки нагрузки",                        correct: false },
          { id: uid(), text: "Хранилище конфигурации",                              correct: false }
        ]
      },
      {
        id: uid(), text: "Какой объект K8s обеспечивает сетевой доступ к Pod-ам?",
        type: "SINGLE_CHOICE", order: 2, points: 1,
        options: [
          { id: uid(), text: "Deployment", correct: false },
          { id: uid(), text: "ConfigMap",  correct: false },
          { id: uid(), text: "Service",    correct: true  },
          { id: uid(), text: "Ingress",    correct: false }
        ]
      },
      {
        id: uid(), text: "Для чего используется ConfigMap в Kubernetes?",
        type: "SINGLE_CHOICE", order: 3, points: 1,
        options: [
          { id: uid(), text: "Хранение секретных данных (пароли, токены)",          correct: false },
          { id: uid(), text: "Хранение незащищённых конфигурационных данных",       correct: true  },
          { id: uid(), text: "Описание желаемого состояния деплоя",                 correct: false },
          { id: uid(), text: "Управление сетевыми политиками",                      correct: false }
        ]
      }
    ],
    timeLimitMinutes: 10, passingScore: 70, status: "PUBLISHED",
    createdBy: "admin", createdAt: now, updatedAt: now
  }

]);

print("✓ Inserted " + db.quizzes.countDocuments() + " quizzes into lms_assessments.quizzes");