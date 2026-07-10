import {
  Component, OnInit, inject, signal, computed, Pipe, PipeTransform,
} from '@angular/core';
import { ActivatedRoute, Router, RouterLink, RouterModule } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../../core/services/auth.service';
import { ProgressService } from '../../core/services/progress.service';
import { CourseService } from '../../core/services/course.service';
import { MediaService } from '../../core/services/media.service';
import { AssessmentService } from '../../core/services/assessment.service';
import { LessonProgress, ModuleGroup, ProgressResponse } from '../../core/models/progress.model';
import { LessonDto } from '../../core/models/course.model';

@Pipe({ name: 'progressPercent', standalone: true })
export class ProgressPercentPipe implements PipeTransform {
  transform(value: number): string { return value.toFixed(1); }
}

@Component({
  selector: 'app-course-progress',
  standalone: true,
  imports: [
    RouterLink,
    MatCardModule, MatProgressBarModule, MatButtonModule, MatIconModule,
    MatDividerModule, MatChipsModule, MatProgressSpinnerModule, MatTooltipModule,
    ProgressPercentPipe,
  ],
  styles: [`
    .progress-page { max-width: 860px; margin: 32px auto; padding: 0 16px; }

    .progress-header { margin-bottom: 28px; }
    .progress-header h1 { font-size: 1.6rem; font-weight: 500; color: #3f51b5; margin-bottom: 4px; }

    .progress-meta {
      display: flex; align-items: center; gap: 16px;
      font-size: 14px; color: #666; margin-bottom: 12px;
    }

    .progress-bar-wrap { position: relative; }
    .progress-bar-wrap mat-progress-bar { height: 10px; border-radius: 5px; }
    .progress-label {
      display: flex; justify-content: space-between;
      font-size: 13px; color: #555; margin-top: 6px;
    }
    .progress-percent { font-weight: 600; color: #3f51b5; font-size: 15px; }

    .status-chip {
      font-size: 12px; font-weight: 500; border-radius: 12px;
      padding: 2px 10px; display: inline-block;
    }
    .status-chip.NOT_STARTED { background: #e0e0e0; color: #555; }
    .status-chip.IN_PROGRESS { background: #e3f2fd; color: #1565c0; }
    .status-chip.COMPLETED   { background: #e8f5e9; color: #2e7d32; }

    .module-card { margin-bottom: 20px; }
    .module-title {
      font-weight: 600; font-size: 1rem; color: #333;
      display: flex; align-items: center; gap: 8px;
    }

    .lesson-row {
      display: flex; align-items: center;
      gap: 12px; padding: 10px 0;
      border-bottom: 1px solid #f0f0f0;
      flex-wrap: wrap;
    }
    .lesson-row:last-child { border-bottom: none; }

    .lesson-icon { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; }
    .lesson-icon.completed   { color: #2e7d32; }
    .lesson-icon.not-started { color: #bdbdbd; }

    .lesson-title {
      flex: 1; font-size: 14px; min-width: 0;
      cursor: pointer; transition: color 0.15s;
    }
    .lesson-title:hover { color: #3f51b5; text-decoration: underline; }
    .lesson-title.completed { text-decoration: line-through; color: #888; cursor: default; }
    .lesson-title.completed:hover { color: #888; text-decoration: line-through; }

    .complete-btn { white-space: nowrap; }

    /* Видеоплеер */
    .video-panel {
      width: 100%; margin-top: 12px; background: #000;
      border-radius: 8px; overflow: hidden;
    }
    .video-panel video {
      width: 100%; max-height: 420px;
      display: block; background: #000;
    }
    .video-loading {
      display: flex; align-items: center; justify-content: center;
      gap: 10px; padding: 16px; font-size: 13px; color: #555;
      background: #f5f5f5; border-radius: 8px; margin-top: 12px;
    }

    .attachments { margin-top: 10px; }
    .attachment-link {
      display: inline-flex; align-items: center; gap: 4px;
      font-size: 13px; color: #1976d2; text-decoration: none;
      margin-right: 12px; margin-bottom: 4px;
    }
    .attachment-link:hover { text-decoration: underline; }

    .center { display: flex; justify-content: center; align-items: center; padding: 60px; }
    .error-msg { color: #c62828; text-align: center; padding: 40px; }
  `],
  template: `
    @if (loading()) {
      <div class="center"><mat-spinner diameter="48" /></div>
    } @else if (error()) {
      <div class="error-msg">
        <mat-icon style="font-size:48px;height:48px;width:48px;">error_outline</mat-icon>
        <p>{{ error() }}</p>
        <button mat-stroked-button routerLink="/home">На главную</button>
      </div>
    } @else if (progress()) {
      <div class="progress-page">

        <div class="progress-header">
          <button mat-button routerLink="/home" style="margin-bottom:8px;">
            <mat-icon>arrow_back</mat-icon> К списку курсов
          </button>

          <h1>Прогресс курса</h1>

          <div class="progress-meta">
            <span>
              <mat-icon style="font-size:16px;vertical-align:middle;">book</mat-icon>
              {{ progress()!.completedLessonsCount }} / {{ progress()!.totalLessons }} уроков пройдено
            </span>
            <span [class]="'status-chip ' + progress()!.status">
              {{ statusLabel(progress()!.status) }}
            </span>
          </div>

          <div class="progress-bar-wrap">
            <mat-progress-bar
              mode="determinate"
              [value]="progress()!.progressPercent"
              [color]="progress()!.status === 'COMPLETED' ? 'accent' : 'primary'"
            />
            <div class="progress-label">
              <span>0%</span>
              <span class="progress-percent">
                {{ progress()!.progressPercent | progressPercent }}%
              </span>
              <span>100%</span>
            </div>
          </div>
        </div>

        @for (module of modules(); track module.moduleId) {
          <mat-card class="module-card">
            <mat-card-header>
              <mat-card-title>
                <span class="module-title">
                  <mat-icon color="primary">folder_open</mat-icon>
                  {{ module.moduleTitle }}
                </span>
              </mat-card-title>
            </mat-card-header>

            <mat-card-content>
              @for (lesson of module.lessons; track lesson.lessonId) {
                <div>
                  <div class="lesson-row">

                    <div class="lesson-icon"
                         [class.completed]="lesson.status === 'COMPLETED'"
                         [class.not-started]="lesson.status !== 'COMPLETED'">
                      <mat-icon>
                        {{ lesson.status === 'COMPLETED' ? 'check_circle' : 'radio_button_unchecked' }}
                      </mat-icon>
                    </div>

                    <span
                      class="lesson-title"
                      [class.completed]="lesson.status === 'COMPLETED'"
                      (click)="lesson.status !== 'COMPLETED' && openLesson(lesson.lessonId)"
                      [title]="lesson.status !== 'COMPLETED' ? 'Открыть материалы урока' : ''"
                    >
                      {{ lesson.lessonTitle }}
                    </span>

                    <!-- Кнопка просмотра видео (если оно есть) -->
                    @if (hasVideo(lesson.lessonId)) {
                      <button
                        mat-icon-button
                        color="primary"
                        matTooltip="{{ expandedLesson() === lesson.lessonId ? 'Скрыть видео' : 'Смотреть видео' }}"
                        (click)="toggleVideo(lesson.lessonId)"
                      >
                        <mat-icon>
                          {{ expandedLesson() === lesson.lessonId ? 'expand_less' : 'play_circle' }}
                        </mat-icon>
                      </button>
                    }

                    <!-- Кнопка прохождения теста (если тест привязан к уроку) -->
                    @if (hasQuiz(lesson.lessonId)) {
                      <button
                        mat-stroked-button
                        color="accent"
                        matTooltip="Пройти тест по уроку"
                        (click)="openQuiz(lesson.lessonId)"
                        style="white-space:nowrap;"
                      >
                        <mat-icon>quiz</mat-icon>
                        Тест
                      </button>
                    }

                    @if (lesson.status !== 'COMPLETED') {
                      <button
                        mat-stroked-button
                        color="primary"
                        class="complete-btn"
                        [disabled]="completingLesson() === lesson.lessonId"
                        (click)="completeLesson(lesson)"
                        matTooltip="Отметить урок как пройденный"
                      >
                        @if (completingLesson() === lesson.lessonId) {
                          <mat-spinner diameter="18" style="display:inline-block;" />
                        } @else {
                          <mat-icon>done</mat-icon>
                        }
                        Завершить
                      </button>
                    } @else {
                      <span style="font-size:12px;color:#2e7d32;white-space:nowrap;">
                        <mat-icon style="font-size:14px;vertical-align:middle;">check</mat-icon>
                        Пройдено
                      </span>
                    }
                  </div>

                  <!-- Видеоплеер (раскрывается по клику) -->
                  @if (expandedLesson() === lesson.lessonId) {
                    @if (loadingVideo() === lesson.lessonId) {
                      <div class="video-loading">
                        <mat-spinner diameter="24"></mat-spinner>
                        Получение ссылки на видео...
                      </div>
                    } @else if (videoUrl(lesson.lessonId)) {
                      <div class="video-panel">
                        <video
                          controls
                          autoplay
                          preload="metadata"
                          [src]="videoUrl(lesson.lessonId)!"
                        >
                          Ваш браузер не поддерживает воспроизведение видео.
                        </video>
                      </div>

                      <!-- Вложения урока -->
                      @if (lessonAttachments(lesson.lessonId).length > 0) {
                        <div class="attachments">
                          <div style="font-size:12px;color:#666;margin-bottom:4px;">
                            <mat-icon style="font-size:14px;vertical-align:middle;">attach_file</mat-icon>
                            Материалы:
                          </div>
                          @for (attKey of lessonAttachments(lesson.lessonId); track attKey) {
                            <a class="attachment-link" [href]="attKey" target="_blank" rel="noopener">
                              <mat-icon style="font-size:14px;">download</mat-icon>
                              {{ filenameFromKey(attKey) }}
                            </a>
                          }
                        </div>
                      }
                    }
                  }
                </div>
              }
            </mat-card-content>
          </mat-card>
        }

        @if (progress()!.status === 'COMPLETED') {
          <mat-card style="background:#e8f5e9;text-align:center;padding:24px;">
            <mat-icon style="font-size:48px;height:48px;width:48px;color:#2e7d32;">emoji_events</mat-icon>
            <h2 style="color:#2e7d32;margin:8px 0 4px;">Курс завершён!</h2>
            <p style="color:#555;">Поздравляем с прохождением курса.</p>
          </mat-card>
        }

      </div>
    }
  `,
})
export class CourseProgressComponent implements OnInit {
  private readonly route           = inject(ActivatedRoute);
  private readonly router          = inject(Router);
  private readonly authService     = inject(AuthService);
  private readonly progressService = inject(ProgressService);
  private readonly courseService   = inject(CourseService);
  private readonly mediaSvc        = inject(MediaService);
  private readonly assessmentSvc   = inject(AssessmentService);

  readonly loading          = signal(true);
  readonly error            = signal<string | null>(null);
  readonly progress         = signal<ProgressResponse | null>(null);
  readonly completingLesson = signal<string | null>(null);

  /** lessonId → videoKey в MinIO */
  private readonly lessonVideoKeys  = signal<Map<string, string>>(new Map());
  /** lessonId → список ключей вложений */
  private readonly lessonAttachKeys = signal<Map<string, string[]>>(new Map());
  /** lessonId → quizId */
  private readonly lessonQuizMap    = signal<Map<string, string>>(new Map());

  /** presigned URL-ы, загруженные по требованию */
  private readonly presignedUrls = signal<Map<string, string>>(new Map());

  readonly expandedLesson = signal<string | null>(null);
  readonly loadingVideo   = signal<string | null>(null);

  readonly modules = computed<ModuleGroup[]>(() => {
    const p = this.progress();
    return p ? this.progressService.groupByModule(p.lessonProgress) : [];
  });

  ngOnInit(): void {
    const courseId = this.route.snapshot.paramMap.get('courseId')!;
    const userId   = this.authService.currentUser()?.id;

    if (!userId) {
      this.error.set('Пользователь не авторизован');
      this.loading.set(false);
      return;
    }

    forkJoin({
      progress: this.progressService.getProgress(userId, courseId),
      course:   this.courseService.getById(courseId).pipe(catchError(() => of(null))),
      quizzes:  this.assessmentSvc.getQuizzesForCourse(courseId).pipe(catchError(() => of([]))),
    }).subscribe({
      next: ({ progress, course, quizzes }) => {
        this.progress.set(progress);

        if (course) {
          const videoMap  = new Map<string, string>();
          const attachMap = new Map<string, string[]>();
          course.modules.forEach(m =>
            m.lessons.forEach((l: LessonDto) => {
              if (l.videoUrl) videoMap.set(l.id, l.videoUrl);
              if (l.attachmentUrls?.length) attachMap.set(l.id, l.attachmentUrls);
            })
          );
          this.lessonVideoKeys.set(videoMap);
          this.lessonAttachKeys.set(attachMap);
        }

        if (quizzes.length) {
          const quizMap = new Map<string, string>();
          quizzes.forEach(q => { if (q.lessonId) quizMap.set(q.lessonId, q.id); });
          this.lessonQuizMap.set(quizMap);
        }

        this.loading.set(false);
      },
      error: err => {
        this.error.set(
          err.status === 404
            ? 'Прогресс не найден. Возможно, вы ещё не записались на этот курс.'
            : 'Ошибка загрузки прогресса.'
        );
        this.loading.set(false);
      },
    });
  }

  openLesson(lessonId: string): void {
    const courseId = this.progress()?.courseId;
    if (courseId) this.router.navigate(['/courses', courseId, 'view']);
  }

  hasVideo(lessonId: string): boolean {
    return this.lessonVideoKeys().has(lessonId);
  }

  hasQuiz(lessonId: string): boolean {
    return this.lessonQuizMap().has(lessonId);
  }

  openQuiz(lessonId: string): void {
    const quizId = this.lessonQuizMap().get(lessonId);
    if (quizId) this.router.navigate(['/quiz', quizId]);
  }

  videoUrl(lessonId: string): string | undefined {
    return this.presignedUrls().get(lessonId);
  }

  lessonAttachments(lessonId: string): string[] {
    return this.lessonAttachKeys().get(lessonId) ?? [];
  }

  toggleVideo(lessonId: string): void {
    if (this.expandedLesson() === lessonId) {
      this.expandedLesson.set(null);
      return;
    }

    this.expandedLesson.set(lessonId);

    if (this.presignedUrls().has(lessonId)) return;

    const key = this.lessonVideoKeys().get(lessonId)!;
    this.loadingVideo.set(lessonId);

    this.mediaSvc.presignedUrl(key, 120).subscribe({
      next: res => {
        this.presignedUrls.update(m => new Map(m).set(lessonId, res.url));
        this.loadingVideo.set(null);
      },
      error: () => {
        this.loadingVideo.set(null);
        this.expandedLesson.set(null);
      },
    });
  }

  filenameFromKey(key: string): string {
    return key.split('/').pop() ?? key;
  }

  completeLesson(lesson: LessonProgress): void {
    const userId   = this.authService.currentUser()?.id;
    const courseId = this.progress()?.courseId;
    if (!userId || !courseId) return;

    this.completingLesson.set(lesson.lessonId);

    this.progressService.completeLesson({ userId, courseId, lessonId: lesson.lessonId }).subscribe({
      next: updated => {
        this.progress.set(updated);
        this.completingLesson.set(null);
      },
      error: () => this.completingLesson.set(null),
    });
  }

  statusLabel(status: string): string {
    return ({ NOT_STARTED: 'Не начат', IN_PROGRESS: 'В процессе', COMPLETED: 'Завершён' })[status] ?? status;
  }
}