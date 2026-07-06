# Media Service

Микросервис управления медиафайлами. Принимает загрузки от инструкторов, сохраняет в MinIO (S3-совместимое хранилище) и генерирует presigned URL для временного доступа к файлам.

**Порт:** `8086` · **БД:** нет · **Хранилище:** MinIO (S3 API, bucket `lms-media`) · **Брокер:** нет

---

## Архитектура пакетов

```
com.lms.mediaservice
├── config/     ← SecurityConfig, S3Config
├── controller/ ← MediaController
├── dto/        ← UploadResponse, PresignedUrlResponse
├── security/   ← HeaderAuthenticationFilter
└── service/    ← MediaService
```

---

## Классы

### `MediaService`
Основная бизнес-логика работы с S3/MinIO.

**`upload(file)`:**
1. Генерирует уникальный ключ: `UUID + "/" + оригинальное имя файла`
2. Вызывает `S3Client.putObject()` с `RequestBody.fromInputStream()`
3. Возвращает `UploadResponse` с ключом, bucket, именем файла, размером и MIME-типом

**`presign(key, expiresInMinutes)`:**
1. Строит `GetObjectRequest` для заданного ключа
2. Создаёт `GetObjectPresignRequest` с указанным временем жизни (по умолчанию 60 минут)
3. Вызывает `S3Presigner.presignGetObject()` и возвращает `PresignedUrlResponse` с URL и временем истечения

---

### `MediaController` — `/api/media`

| Метод | Путь | Роли | Описание |
|-------|------|------|----------|
| `POST` | `/api/media/upload` | INSTRUCTOR, ADMIN | Загрузить файл (multipart/form-data). Возвращает `UploadResponse` |
| `GET` | `/api/media/presigned?key=&expiresInMinutes=` | Все авторизованные | Получить presigned URL для скачивания |

Максимальный размер файла: **500 MB** (настроено в `application.yml`: `spring.servlet.multipart.max-file-size=500MB`).

---

### `S3Config`
`@Configuration`. Создаёт два Spring-бина, направленных на MinIO.

**`S3Client`** — для операций записи (`putObject`).  
**`S3Presigner`** — для генерации presigned URL.

Оба настроены с:
- `endpointOverride` = `http://localhost:9000` (MinIO)
- Статические credentials: `lms_minio` / `lms_minio_secret`
- `pathStyleAccessEnabled(true)` — MinIO требует path-style, а не virtual-hosted

---

### `SecurityConfig`
`@EnableWebSecurity` + `@EnableMethodSecurity`.

- `/actuator/**` — открыто
- Всё остальное — требует аутентификации
- `@PreAuthorize("hasAnyAuthority('ROLE_INSTRUCTOR','ROLE_ADMIN')")` на `upload` endpoint в контроллере

### `HeaderAuthenticationFilter`
Стандартный паттерн: читает `X-User-Name` и `X-User-Roles` из заголовков Gateway.

---

## DTO

### `UploadResponse`
```
key              — путь к объекту в S3 (например "uuid/lecture.mp4")
bucket           — имя bucket ("lms-media")
originalFilename — исходное имя файла
sizeBytes        — размер в байтах
contentType      — MIME-тип (например "video/mp4")
```

### `PresignedUrlResponse`
```
url        — подписанный URL для скачивания файла
key        — путь к объекту
expiresAt  — Instant, время истечения URL
```

---

## Типичный сценарий использования

```
1. Инструктор загружает видеолекцию:
   POST /api/media/upload (multipart)
   → UploadResponse { key: "abc123/lecture.mp4" }

2. Сохранить key в курсе (поле Lesson.videoUrl)

3. При просмотре урока получить временную ссылку:
   GET /api/media/presigned?key=abc123/lecture.mp4&expiresInMinutes=60
   → PresignedUrlResponse { url: "http://localhost:9000/lms-media/abc123/lecture.mp4?X-Amz-Signature=..." }

4. Клиент использует URL напрямую до MinIO (без прокси через Gateway)
```
