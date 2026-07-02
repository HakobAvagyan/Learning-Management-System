import {
  Component, OnInit, inject, signal, computed,
} from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators,
} from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { forkJoin } from 'rxjs';
import { AssessmentService, QuizRequest } from '../../core/services/assessment.service';
import { CourseService } from '../../core/services/course.service';
import { AuthService } from '../../core/services/auth.service';
import { CourseDto, LessonDto } from '../../core/models/course.model';
import { QuizResponse } from '../../core/models/quiz.model';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog.component';

@Component({
  selector: 'app-quiz-manage',
  standalone: true,
  imports: [
    RouterLink, ReactiveFormsModule,
    MatCardModule, MatButtonModule, MatIconModule,
    MatProgressSpinnerModule, MatSnackBarModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatCheckboxModule, MatDividerModule, MatTooltipModule,
    MatExpansionModule, MatDialogModule,
  ],
  styles: [`
    .page { max-width: 960px; margin: 32px auto; padding: 0 16px 64px; }
    h1 { font-size: 1.5rem; font-weight: 500; color: #3f51b5; margin-bottom: 4px; }
    .subtitle { color: #777; font-size: 14px; margin-bottom: 24px; }

    .quiz-card { margin-bottom: 16px; }
    .quiz-header {
      display: flex; align-items: center; justify-content: space-between;
      gap: 8px;
    }
    .quiz-title { font-size: 15px; font-weight: 500; }
    .quiz-meta { font-size: 12px; color: #888; margin-top: 4px; }

    .status-chip {
      padding: 2px 10px; border-radius: 12px; font-size: 11px; font-weight: 600;
    }

    .form-section { margin-bottom: 16px; }
    .form-section h3 {
      font-size: 13px; font-weight: 600; color: #555; text-transform: uppercase;
      letter-spacing: 0.5px; margin: 0 0 12px;
    }

    .question-block {
      border: 1px solid #e0e0e0; border-radius: 8px;
      padding: 16px; margin-bottom: 12px; background: #fafafa;
    }
    .question-header {
      display: flex; align-items: center; gap: 8px; margin-bottom: 12px;
    }
    .q-num {
      background: #3f51b5; color: #fff; border-radius: 50%;
      width: 24px; height: 24px; display: flex; align-items: center;
      justify-content: center; font-size: 12px; font-weight: 600; flex-shrink: 0;
    }
    .option-row {
      display: flex; align-items: center; gap: 8px; margin-bottom: 8px;
    }
    .option-row mat-form-field { flex: 1; margin-bottom: -1.25em; }

    mat-form-field { width: 100%; }
    .row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .row-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; }

    .actions-bar {
      display: flex; gap: 12px; justify-content: flex-end;
      padding-top: 16px; border-top: 1px solid #e0e0e0; margin-top: 16px;
    }
  `],
  template: `
    <div class="page">
      <button mat-button routerLink="/courses" style="margin-bottom:8px;">
        <mat-icon>arrow_back</mat-icon> К каталогу
      </button>

      @if (loading()) {
        <div style="text-align:center;padding:64px;"><mat-spinner diameter="48"></mat-spinner></div>
      } @else {
        <h1>Управление квизами</h1>
        <p class="subtitle">
          Курс: <strong>{{ course()?.title ?? courseId }}</strong>
        </p>

        <!-- Список квизов -->
        @if (!showForm()) {
          <div style="display:flex;justify-content:flex-end;margin-bottom:16px;">
            <button mat-flat-button color="primary" (click)="startCreate()">
              <mat-icon>add</mat-icon>
              Создать квиз
            </button>
          </div>

          @if (quizzes().length === 0) {
            <mat-card style="padding:32px;text-align:center;">
              <mat-icon style="font-size:48px;height:48px;width:48px;color:#ccc;">quiz</mat-icon>
              <p style="color:#888;margin-top:12px;">Квизов пока нет. Создайте первый!</p>
            </mat-card>
          }

          @for (quiz of quizzes(); track quiz.id) {
            <mat-card class="quiz-card">
              <mat-card-content>
                <div class="quiz-header">
                  <div>
                    <div class="quiz-title">{{ quiz.title }}</div>
                    <div class="quiz-meta">
                      {{ quiz.totalQuestions }} вопросов · {{ quiz.totalPoints }} баллов ·
                      Порог: {{ quiz.passingScore }}%
                      @if (quiz.lessonId) { · Урок: {{ lessonTitle(quiz.lessonId) }} }
                    </div>
                  </div>
                  <div style="display:flex;align-items:center;gap:8px;">
                    <span class="status-chip" [style]="statusStyle(quiz.status)">
                      {{ statusLabel(quiz.status) }}
                    </span>
                    <button mat-icon-button matTooltip="Редактировать" (click)="startEdit(quiz)">
                      <mat-icon>edit</mat-icon>
                    </button>
                    @if (isAdmin()) {
                      <button mat-icon-button color="warn" matTooltip="Удалить" (click)="confirmDelete(quiz)">
                        <mat-icon>delete</mat-icon>
                      </button>
                    }
                  </div>
                </div>
              </mat-card-content>
            </mat-card>
          }
        }

        <!-- Форма создания/редактирования -->
        @if (showForm()) {
          <mat-card style="padding:20px;">
            <h2 style="margin:0 0 20px;font-size:1.1rem;font-weight:500;">
              {{ editingId() ? 'Редактировать квиз' : 'Новый квиз' }}
            </h2>

            <form [formGroup]="form" (ngSubmit)="submitForm()">

              <!-- Основная информация -->
              <div class="form-section">
                <h3>Основное</h3>
                <mat-form-field appearance="outline">
                  <mat-label>Название квиза</mat-label>
                  <input matInput formControlName="title">
                  @if (form.get('title')?.hasError('required') && form.get('title')?.touched) {
                    <mat-error>Обязательное поле</mat-error>
                  }
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Описание (необязательно)</mat-label>
                  <textarea matInput formControlName="description" rows="2"></textarea>
                </mat-form-field>

                <div class="row-3">
                  <mat-form-field appearance="outline">
                    <mat-label>Урок (необязательно)</mat-label>
                    <mat-select formControlName="lessonId">
                      <mat-option [value]="null">— Без урока —</mat-option>
                      @for (lesson of allLessons(); track lesson.id) {
                        <mat-option [value]="lesson.id">{{ lesson.title }}</mat-option>
                      }
                    </mat-select>
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Лимит (минут)</mat-label>
                    <input matInput type="number" formControlName="timeLimitMinutes" min="1">
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Порог прохождения (%)</mat-label>
                    <input matInput type="number" formControlName="passingScore" min="0" max="100">
                  </mat-form-field>
                </div>

                <div class="row-2">
                  <mat-form-field appearance="outline">
                    <mat-label>Статус</mat-label>
                    <mat-select formControlName="status">
                      <mat-option value="DRAFT">Черновик</mat-option>
                      <mat-option value="PUBLISHED">Опубликован</mat-option>
                    </mat-select>
                  </mat-form-field>
                </div>
              </div>

              <mat-divider style="margin-bottom:20px;"></mat-divider>

              <!-- Вопросы -->
              <div class="form-section">
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
                  <h3 style="margin:0;">Вопросы ({{ questions.length }})</h3>
                  <button mat-stroked-button type="button" (click)="addQuestion()">
                    <mat-icon>add</mat-icon> Добавить вопрос
                  </button>
                </div>

                @for (q of questions.controls; track q; let qi = $index) {
                  <div class="question-block" [formGroup]="asGroup(q)">
                    <div class="question-header">
                      <div class="q-num">{{ qi + 1 }}</div>
                      <mat-form-field appearance="outline" style="flex:1; margin-bottom:-1.25em;">
                        <mat-label>Текст вопроса</mat-label>
                        <input matInput formControlName="text">
                      </mat-form-field>
                      <mat-form-field appearance="outline" style="width:180px; margin-bottom:-1.25em;">
                        <mat-label>Тип</mat-label>
                        <mat-select formControlName="type">
                          <mat-option value="SINGLE_CHOICE">Один ответ</mat-option>
                          <mat-option value="MULTIPLE_CHOICE">Несколько ответов</mat-option>
                        </mat-select>
                      </mat-form-field>
                      <mat-form-field appearance="outline" style="width:80px; margin-bottom:-1.25em;">
                        <mat-label>Баллы</mat-label>
                        <input matInput type="number" formControlName="points" min="1">
                      </mat-form-field>
                      <button mat-icon-button type="button" color="warn"
                              [disabled]="questions.length === 1"
                              (click)="removeQuestion(qi)">
                        <mat-icon>remove_circle</mat-icon>
                      </button>
                    </div>

                    <!-- Варианты ответов -->
                    <div style="padding-left:32px;">
                      @for (opt of getOptions(qi).controls; track opt; let oi = $index) {
                        <div class="option-row" [formGroup]="asGroup(opt)">
                          <mat-checkbox formControlName="correct" color="primary"
                                        [matTooltip]="'Правильный ответ'"></mat-checkbox>
                          <mat-form-field appearance="outline">
                            <mat-label>Вариант {{ oi + 1 }}</mat-label>
                            <input matInput formControlName="text">
                          </mat-form-field>
                          <button mat-icon-button type="button" color="warn"
                                  [disabled]="getOptions(qi).length <= 2"
                                  (click)="removeOption(qi, oi)">
                            <mat-icon>close</mat-icon>
                          </button>
                        </div>
                      }
                      <button mat-stroked-button type="button" (click)="addOption(qi)"
                              style="margin-top:4px; font-size:12px;">
                        <mat-icon>add</mat-icon> Добавить вариант
                      </button>
                    </div>
                  </div>
                }
              </div>

              <div class="actions-bar">
                <button mat-stroked-button type="button" (click)="cancelForm()">Отмена</button>
                <button mat-flat-button color="primary" type="submit"
                        [disabled]="saving()">
                  @if (saving()) {
                    <mat-spinner diameter="18" style="display:inline-block;margin-right:6px;"></mat-spinner>
                  } @else {
                    <mat-icon>save</mat-icon>
                  }
                  {{ editingId() ? 'Сохранить' : 'Создать' }}
                </button>
              </div>

            </form>
          </mat-card>
        }
      }
    </div>
  `,
})
export class QuizManageComponent implements OnInit {
  private readonly route   = inject(ActivatedRoute);
  private readonly svc     = inject(AssessmentService);
  private readonly courseSvc = inject(CourseService);
  private readonly auth    = inject(AuthService);
  private readonly snack   = inject(MatSnackBar);
  private readonly dialog  = inject(MatDialog);
  private readonly fb      = inject(FormBuilder);

  readonly courseId = this.route.snapshot.paramMap.get('courseId')!;

  loading   = signal(true);
  saving    = signal(false);
  showForm  = signal(false);
  editingId = signal<string | null>(null);
  quizzes   = signal<QuizResponse[]>([]);
  course    = signal<CourseDto | null>(null);

  readonly allLessons = computed<LessonDto[]>(() => {
    const c = this.course();
    if (!c) return [];
    return c.modules.flatMap(m => m.lessons);
  });

  isAdmin(): boolean {
    return this.auth.currentUser()?.roles.includes('ROLE_ADMIN') ?? false;
  }

  form = this.fb.group({
    title:             ['', Validators.required],
    description:       [null as string | null],
    lessonId:          [null as string | null],
    timeLimitMinutes:  [null as number | null],
    passingScore:      [60, [Validators.required, Validators.min(0), Validators.max(100)]],
    status:            ['DRAFT' as 'DRAFT' | 'PUBLISHED'],
    questions:         this.fb.array([this.makeQuestion()]),
  });

  get questions() { return this.form.get('questions') as FormArray; }
  getOptions(qi: number) { return (this.questions.at(qi) as FormGroup).get('options') as FormArray; }
  asGroup(c: any): FormGroup { return c as FormGroup; }

  makeQuestion(): FormGroup {
    return this.fb.group({
      text:    ['', Validators.required],
      type:    ['SINGLE_CHOICE'],
      points:  [1],
      options: this.fb.array([this.makeOption(false), this.makeOption(true)]),
    });
  }

  makeOption(correct = false): FormGroup {
    return this.fb.group({ text: ['', Validators.required], correct: [correct] });
  }

  addQuestion()              { this.questions.push(this.makeQuestion()); }
  removeQuestion(i: number)  { this.questions.removeAt(i); }
  addOption(qi: number)      { this.getOptions(qi).push(this.makeOption()); }
  removeOption(qi: number, oi: number) { this.getOptions(qi).removeAt(oi); }

  ngOnInit() {
    forkJoin([
      this.svc.listByCourse(this.courseId),
      this.courseSvc.getById(this.courseId),
    ]).subscribe({
      next: ([quizzes, course]) => {
        this.quizzes.set(quizzes);
        this.course.set(course);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  startCreate() {
    this.editingId.set(null);
    this.form.reset({
      title: '', description: null, lessonId: null,
      timeLimitMinutes: null, passingScore: 60, status: 'DRAFT',
    });
    while (this.questions.length) this.questions.removeAt(0);
    this.questions.push(this.makeQuestion());
    this.showForm.set(true);
  }

  startEdit(quiz: QuizResponse) {
    this.editingId.set(quiz.id);
    while (this.questions.length) this.questions.removeAt(0);

    quiz.questions
      .slice()
      .sort((a, b) => a.order - b.order)
      .forEach(q => {
        const optFA = this.fb.array(
          q.options.map(o => this.fb.group({ text: [o.text, Validators.required], correct: [o.isCorrect] }))
        );
        this.questions.push(this.fb.group({
          text:    [q.text, Validators.required],
          type:    [q.type],
          points:  [q.points],
          options: optFA,
        }));
      });

    this.form.patchValue({
      title:            quiz.title,
      description:      quiz.description,
      lessonId:         quiz.lessonId,
      timeLimitMinutes: quiz.timeLimitMinutes,
      passingScore:     quiz.passingScore,
      status:           quiz.status as 'DRAFT' | 'PUBLISHED',
    });
    this.showForm.set(true);
  }

  cancelForm() {
    this.showForm.set(false);
    this.editingId.set(null);
  }

  submitForm() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const v = this.form.getRawValue();

    const req: QuizRequest = {
      courseId:          this.courseId,
      lessonId:          v.lessonId ?? null,
      title:             v.title!,
      description:       v.description ?? null,
      timeLimitMinutes:  v.timeLimitMinutes ?? null,
      passingScore:      v.passingScore ?? 60,
      status:            v.status as 'DRAFT' | 'PUBLISHED',
      questions:         (v.questions ?? []).map((q: any, i: number) => ({
        text:    q.text,
        type:    q.type,
        points:  q.points ?? 1,
        order:   i + 1,
        options: (q.options ?? []).map((o: any) => ({ text: o.text, isCorrect: o.correct })),
      })),
    };

    this.saving.set(true);
    const id = this.editingId();
    const call = id ? this.svc.update(id, req) : this.svc.create(req);

    call.subscribe({
      next: saved => {
        if (id) {
          this.quizzes.update(list => list.map(q => q.id === id ? saved : q));
          this.snack.open('Квиз обновлён!', 'OK', { duration: 2500 });
        } else {
          this.quizzes.update(list => [...list, saved]);
          this.snack.open('Квиз создан!', 'OK', { duration: 2500 });
        }
        this.saving.set(false);
        this.showForm.set(false);
        this.editingId.set(null);
      },
      error: () => {
        this.snack.open('Ошибка при сохранении', 'Закрыть', { duration: 3000 });
        this.saving.set(false);
      },
    });
  }

  confirmDelete(quiz: QuizResponse) {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '360px',
      data: {
        title: 'Удалить квиз?',
        message: `Квиз «${quiz.title}» будет удалён без возможности восстановления.`,
        confirmLabel: 'Удалить',
      },
    });

    ref.afterClosed().subscribe(confirmed => {
      if (!confirmed) return;
      this.svc.delete(quiz.id).subscribe({
        next: () => {
          this.quizzes.update(list => list.filter(q => q.id !== quiz.id));
          this.snack.open(`Квиз удалён.`, 'OK', { duration: 2500 });
        },
        error: () => this.snack.open('Ошибка при удалении.', 'Закрыть', { duration: 3000 }),
      });
    });
  }

  lessonTitle(lessonId: string): string {
    return this.allLessons().find(l => l.id === lessonId)?.title ?? lessonId;
  }

  statusLabel(status: string): string {
    return status === 'PUBLISHED' ? 'Опубликован' : 'Черновик';
  }

  statusStyle(status: string): string {
    return status === 'PUBLISHED'
      ? 'background:#e8f5e9;color:#2e7d32'
      : 'background:#f5f5f5;color:#757575';
  }
}