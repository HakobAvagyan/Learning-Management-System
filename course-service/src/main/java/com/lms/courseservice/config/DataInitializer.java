package com.lms.courseservice.config;

import com.lms.courseservice.document.Course;
import com.lms.courseservice.document.Lesson;
import com.lms.courseservice.document.Module;
import com.lms.courseservice.repository.CourseRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements ApplicationRunner {

    private final CourseRepository courseRepository;

    @Override
    public void run(ApplicationArguments args) {
        if (courseRepository.count() > 0) {
            log.info("Course seed data already present, skipping.");
            return;
        }

        courseRepository.saveAll(List.of(
                buildCourse(
                        "Введение в Java", "instructor1", "Программирование",
                        "Полный курс для новичков: от Hello World до коллекций и ООП.",
                        List.of(
                                buildModule("Основы языка", 1, List.of(
                                        lesson("Установка JDK и IDE", 1, 20),
                                        lesson("Переменные и типы данных", 2, 30),
                                        lesson("Условия и циклы", 3, 35)
                                )),
                                buildModule("ООП в Java", 2, List.of(
                                        lesson("Классы и объекты", 1, 40),
                                        lesson("Наследование", 2, 35),
                                        lesson("Интерфейсы и абстракция", 3, 30)
                                )),
                                buildModule("Коллекции", 3, List.of(
                                        lesson("List и ArrayList", 1, 25),
                                        lesson("Map и HashMap", 2, 25),
                                        lesson("Stream API", 3, 40)
                                ))
                        )
                ),
                buildCourse(
                        "Spring Boot для начинающих", "instructor1", "Программирование",
                        "Создаём REST API с нуля: Spring MVC, Data JPA, Security.",
                        List.of(
                                buildModule("Spring Core", 1, List.of(
                                        lesson("IoC и Dependency Injection", 1, 30),
                                        lesson("Аннотации и конфигурация", 2, 25),
                                        lesson("Spring Boot Starter", 3, 20)
                                )),
                                buildModule("REST API", 2, List.of(
                                        lesson("@RestController и маршруты", 1, 30),
                                        lesson("Валидация данных", 2, 25),
                                        lesson("Обработка ошибок", 3, 20)
                                )),
                                buildModule("Spring Data JPA", 3, List.of(
                                        lesson("Entity и Repository", 1, 35),
                                        lesson("Запросы JPQL и @Query", 2, 30),
                                        lesson("Транзакции", 3, 25)
                                ))
                        )
                ),
                buildCourse(
                        "Основы веб-дизайна", "instructor2", "Дизайн",
                        "HTML, CSS и принципы UI/UX для разработчиков.",
                        List.of(
                                buildModule("HTML5", 1, List.of(
                                        lesson("Структура HTML-документа", 1, 20),
                                        lesson("Формы и валидация", 2, 25),
                                        lesson("Семантические теги", 3, 20)
                                )),
                                buildModule("CSS3", 2, List.of(
                                        lesson("Селекторы и специфичность", 1, 25),
                                        lesson("Flexbox", 2, 30),
                                        lesson("CSS Grid", 3, 30),
                                        lesson("Анимации и переходы", 4, 20)
                                )),
                                buildModule("UI/UX принципы", 3, List.of(
                                        lesson("Типографика и цвет", 1, 25),
                                        lesson("Адаптивный дизайн", 2, 30)
                                ))
                        )
                ),
                buildCourse(
                        "Микросервисы на практике", "instructor2", "Архитектура",
                        "Docker, Kafka, Spring Cloud — строим production-ready систему.",
                        List.of(
                                buildModule("Docker и контейнеры", 1, List.of(
                                        lesson("Что такое Docker", 1, 20),
                                        lesson("Dockerfile и образы", 2, 30),
                                        lesson("Docker Compose", 3, 35)
                                )),
                                buildModule("Apache Kafka", 2, List.of(
                                        lesson("Архитектура Kafka", 1, 30),
                                        lesson("Producer и Consumer", 2, 35),
                                        lesson("KRaft режим без Zookeeper", 3, 25)
                                )),
                                buildModule("Spring Cloud Gateway", 3, List.of(
                                        lesson("API Gateway паттерн", 1, 25),
                                        lesson("Роутинг и фильтры", 2, 30),
                                        lesson("JWT-аутентификация в шлюзе", 3, 35)
                                ))
                        )
                )
                ,
                buildCourse(
                        "Python для начинающих", "instructor1", "Программирование",
                        "От первой строки кода до работы с файлами и API на Python.",
                        List.of(
                                buildModule("Основы Python", 1, List.of(
                                        lesson("Установка и первая программа", 1, 15),
                                        lesson("Переменные и типы данных", 2, 25),
                                        lesson("Условия и циклы", 3, 30),
                                        lesson("Функции", 4, 30)
                                )),
                                buildModule("Структуры данных", 2, List.of(
                                        lesson("Списки и кортежи", 1, 25),
                                        lesson("Словари и множества", 2, 25),
                                        lesson("List comprehension", 3, 20)
                                )),
                                buildModule("Работа с файлами и API", 3, List.of(
                                        lesson("Чтение и запись файлов", 1, 25),
                                        lesson("JSON и CSV", 2, 20),
                                        lesson("HTTP-запросы с requests", 3, 30)
                                ))
                        )
                ),
                buildCourse(
                        "Алгоритмы и структуры данных", "instructor2", "Computer Science",
                        "Фундаментальные алгоритмы и структуры данных для технических интервью.",
                        List.of(
                                buildModule("Сложность алгоритмов", 1, List.of(
                                        lesson("Big O нотация", 1, 30),
                                        lesson("Временная и пространственная сложность", 2, 25),
                                        lesson("Анализ рекурсии", 3, 30)
                                )),
                                buildModule("Базовые структуры данных", 2, List.of(
                                        lesson("Массивы и связные списки", 1, 35),
                                        lesson("Стек и очередь", 2, 30),
                                        lesson("Хеш-таблицы", 3, 30)
                                )),
                                buildModule("Алгоритмы сортировки и поиска", 3, List.of(
                                        lesson("Пузырьковая и сортировка вставкой", 1, 30),
                                        lesson("Быстрая сортировка и Merge Sort", 2, 40),
                                        lesson("Бинарный поиск", 3, 25)
                                )),
                                buildModule("Деревья и графы", 4, List.of(
                                        lesson("Бинарные деревья поиска", 1, 35),
                                        lesson("Обходы DFS и BFS", 2, 35),
                                        lesson("Алгоритм Дейкстры", 3, 40)
                                ))
                        )
                ),
                buildCourse(
                        "React + TypeScript", "instructor1", "Программирование",
                        "Современная разработка фронтенда: хуки, контекст, TypeScript, тестирование.",
                        List.of(
                                buildModule("React основы", 1, List.of(
                                        lesson("JSX и компоненты", 1, 25),
                                        lesson("Props и State", 2, 30),
                                        lesson("Хуки: useState и useEffect", 3, 35)
                                )),
                                buildModule("TypeScript в React", 2, List.of(
                                        lesson("Типизация пропсов", 1, 25),
                                        lesson("Generics и утилитарные типы", 2, 30),
                                        lesson("Типизация хуков", 3, 25)
                                )),
                                buildModule("Управление состоянием", 3, List.of(
                                        lesson("useContext и useReducer", 1, 30),
                                        lesson("Zustand", 2, 25),
                                        lesson("React Query", 3, 35)
                                ))
                        )
                ),
                buildCourse(
                        "DevOps: CI/CD и автоматизация", "instructor2", "DevOps",
                        "GitHub Actions, Docker, Kubernetes и мониторинг продакшн-систем.",
                        List.of(
                                buildModule("GitHub Actions", 1, List.of(
                                        lesson("Что такое CI/CD", 1, 20),
                                        lesson("Создание первого workflow", 2, 30),
                                        lesson("Тесты и деплой в pipeline", 3, 35)
                                )),
                                buildModule("Kubernetes", 2, List.of(
                                        lesson("Архитектура K8s", 1, 30),
                                        lesson("Pod, Deployment, Service", 2, 35),
                                        lesson("ConfigMap и Secrets", 3, 25),
                                        lesson("Helm charts", 4, 30)
                                )),
                                buildModule("Мониторинг", 3, List.of(
                                        lesson("Prometheus и Grafana", 1, 35),
                                        lesson("Логирование с ELK Stack", 2, 30),
                                        lesson("Алёрты и on-call", 3, 25)
                                ))
                        )
                )
        ));

        log.info("8 seed courses created.");
    }

    private Course buildCourse(String title, String instructorId, String category,
                                String description, List<Module> modules) {
        return Course.builder()
                .title(title)
                .instructorId(instructorId)
                .category(category)
                .description(description)
                .status(Course.CourseStatus.PUBLISHED)
                .modules(modules)
                .build();
    }

    private Module buildModule(String title, int order, List<Lesson> lessons) {
        return Module.builder()
                .id(UUID.randomUUID().toString())
                .title(title)
                .order(order)
                .lessons(lessons)
                .build();
    }

    private Lesson lesson(String title, int order, int durationMinutes) {
        return Lesson.builder()
                .id(UUID.randomUUID().toString())
                .title(title)
                .order(order)
                .durationMinutes(durationMinutes)
                .build();
    }
}