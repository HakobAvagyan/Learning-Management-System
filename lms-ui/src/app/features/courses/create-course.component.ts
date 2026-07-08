import {
  Component, inject, signal,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../core/services/auth.service';
import { CourseService } from '../../core/services/course.service';
import { FileUploadComponent } from '../../shared/components/file-upload/file-upload.component';

@Component({
  selector: 'app-create-course',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatExpansionModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatDividerModule,
    FileUploadComponent,
  ],
  styles: [`
    .page { max-width: 860px; margin: 32px auto; padding: 0 16px 64px; }

    h1 { font-size: 1.6rem; font-weight: 500; color: #3f51b5; margin-bottom: 4px; }
    .subtitle { color: #777; font-size: 14px; margin-bottom: 28px; }

    .section-title {
      font-size: 1rem; font-weight: 600; color: #333;
      display: flex; align-items: center; gap: 8px; margin: 24px 0 12px;
    }

    .row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    mat-form-field { width: 100%; }

    .module-card { margin-bottom: 16px; border: 1px solid #e0e0e0; border-radius: 8px; }
    .module-header {
      display: flex; align-items: center; gap: 8px;
      padding: 12px 16px; background: #f5f5f5; border-radius: 8px 8px 0 0;
    }
    .module-header mat-form-field { flex: 1; margin-bottom: -1.25em; }
    .module-body { padding: 16px; }

    .lesson-row {
      display: grid; grid-template-columns: 1fr auto 40px 40px; gap: 8px;
      align-items: center; margin-bottom: 4px;
    }
    .lesson-row mat-form-field { margin-bottom: -1.25em; }
    .lesson-duration { width: 100px; }

    .video-upload-zone { margin: 4px 0 12px; padding: 0 4px; }
    .video-key-label { font-size: 11px; color: #2e7d32; margin-top: 4px; word-break: break-all; }

    .add-btn { margin-top: 8px; }

    .actions {
      display: flex; gap: 12px; justify-content: flex-end;
      margin-top: 32px; padding-top: 16px; border-top: 1px solid #e0e0e0;
    }

    .module-num {
      background: #3f51b5; color: white; border-radius: 50%;
      width: 24px; height: 24px; display: flex; align-items: center;
      justify-content: center; font-size: 12px; font-weight: 600; flex-shrink: 0;
    }
  `],
  template: `
    <div class="page">
      <button mat-button routerLink="/courses" style="margin-bottom:8px;">
        <mat-icon>arrow_back</mat-icon> К каталогу
      </button>
      <h1>Создание курса</h1>
      <p class="subtitle">Заполните информацию о курсе и добавьте модули с уроками</p>

      <form [formGroup]="form" (ngSubmit)="submit()">

        <!-- ── Основная информация ── -->
        <mat-card style="padding: 20px; margin-bottom: 16px;">
          <div class="section-title">
            <mat-icon color="primary">info</mat-icon>
            Основная информация
          </div>

          <mat-form-field appearance="outline">
            <mat-label>Название курса</mat-label>
            <input matInput formControlName="title" placeholder="Например: Введение в Python">
            @if (form.get('title')?.hasError('required') && form.get('title')?.touched) {
              <mat-error>Название обязательно</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Описание</mat-label>
            <textarea matInput formControlName="description" rows="3"
                      placeholder="Что студент узнает на этом курсе?"></textarea>
          </mat-form-field>

          <div class="row-2">
            <mat-form-field appearance="outline">
              <mat-label>Категория</mat-label>
              <input matInput formControlName="category" placeholder="Программирование, Дизайн...">
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Статус</mat-label>
              <mat-select formControlName="status">
                <mat-option value="DRAFT">Черновик</mat-option>
                <mat-option value="PUBLISHED">Опубликован</mat-option>
              </mat-select>
            </mat-form-field>
          </div>
        </mat-card>

        <!-- ── Модули ── -->
        <div class="section-title">
          <mat-icon color="primary">layers</mat-icon>
          Модули и уроки
        </div>

        @for (mod of modules.controls; track mod; let mi = $index) {
          <div class="module-card">
            <div class="module-header">
              <div class="module-num">{{ mi + 1 }}</div>
              <mat-form-field appearance="outline" [formGroup]="asGroup(mod)">
                <mat-label>Название модуля</mat-label>
                <input matInput formControlName="title" placeholder="Модуль {{ mi + 1 }}">
                @if (asGroup(mod).get('title')?.hasError('required') && asGroup(mod).get('title')?.touched) {
                  <mat-error>Название модуля обязательно</mat-error>
                }
              </mat-form-field>
              <button mat-icon-button type="button" color="warn"
                      matTooltip="Удалить модуль"
                      [disabled]="modules.length === 1"
                      (click)="removeModule(mi)">
                <mat-icon>delete</mat-icon>
              </button>
            </div>

            <div class="module-body">
              <!-- Уроки -->
              @for (les of getLessons(mi).controls; track les; let li = $index) {
                <div>
                  <div class="lesson-row" [formGroup]="asGroup(les)">
                    <mat-form-field appearance="outline">
                      <mat-label>Урок {{ li + 1 }}</mat-label>
                      <input matInput formControlName="title" placeholder="Название урока">
                      @if (asGroup(les).get('title')?.hasError('required') && asGroup(les).get('title')?.touched) {
                        <mat-error>Название урока обязательно</mat-error>
                      }
                    </mat-form-field>
                    <mat-form-field appearance="outline" class="lesson-duration">
                      <mat-label>Мин.</mat-label>
                      <input matInput type="number" formControlName="durationMinutes" min="1">
                    </mat-form-field>
                    <button mat-icon-button type="button"
                            [color]="asGroup(les).get('videoUrl')?.value ? 'accent' : 'primary'"
                            [matTooltip]="asGroup(les).get('videoUrl')?.value ? 'Видео загружено' : 'Загрузить видео'"
                            (click)="toggleVideoUpload(mi, li)">
                      <mat-icon>{{ asGroup(les).get('videoUrl')?.value ? 'videocam' : 'video_call' }}</mat-icon>
                    </button>
                    <button mat-icon-button type="button" color="warn"
                            [disabled]="getLessons(mi).length === 1"
                            (click)="removeLesson(mi, li)">
                      <mat-icon>remove_circle_outline</mat-icon>
                    </button>
                  </div>

                  @if (videoUploadOpen(mi, li)) {
                    <div class="video-upload-zone">
                      <app-file-upload
                        label="Загрузить видео урока"
                        accept="video/*"
                        (uploaded)="onVideoUploaded(mi, li, $event)"
                        (removed)="onVideoRemoved(mi, li)"
                      />
                      @if (asGroup(les).get('videoUrl')?.value) {
                        <div class="video-key-label">
                          <mat-icon style="font-size:13px;vertical-align:middle;color:#2e7d32;">check_circle</mat-icon>
                          {{ asGroup(les).get('videoUrl')?.value }}
                        </div>
                      }
                    </div>
                  }
                </div>
              }

              <button mat-stroked-button type="button" class="add-btn"
                      (click)="addLesson(mi)">
                <mat-icon>add</mat-icon> Добавить урок
              </button>
            </div>
          </div>
        }

        <button mat-stroked-button color="primary" type="button"
                style="width:100%;margin-top:4px;" (click)="addModule()">
          <mat-icon>add</mat-icon> Добавить модуль
        </button>

        <!-- ── Кнопки ── -->
        <div class="actions">
          <button mat-stroked-button type="button" routerLink="/courses">Отмена</button>
          <button mat-flat-button color="primary" type="submit"
                  [disabled]="saving()">
            @if (saving()) {
              <mat-spinner diameter="18" style="display:inline-block;margin-right:6px;" />
            } @else {
              <mat-icon>save</mat-icon>
            }
            {{ form.get('status')?.value === 'PUBLISHED' ? 'Опубликовать' : 'Сохранить черновик' }}
          </button>
        </div>

      </form>
    </div>
  `,
})
export class CreateCourseComponent {
  private readonly fb      = inject(FormBuilder);
  private readonly auth    = inject(AuthService);
  private readonly svc     = inject(CourseService);
  private readonly snack   = inject(MatSnackBar);
  private readonly router  = inject(Router);

  readonly saving = signal(false);

  /** Set of 'mi-li' keys for open video upload panels */
  private readonly openVideoUploads = signal<Set<string>>(new Set());

  videoUploadOpen(mi: number, li: number): boolean {
    return this.openVideoUploads().has(`${mi}-${li}`);
  }

  toggleVideoUpload(mi: number, li: number): void {
    this.openVideoUploads.update(s => {
      const next = new Set(s);
      const key = `${mi}-${li}`;
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }

  onVideoUploaded(mi: number, li: number, key: string): void {
    this.getLessons(mi).at(li).patchValue({ videoUrl: key });
  }

  onVideoRemoved(mi: number, li: number): void {
    this.getLessons(mi).at(li).patchValue({ videoUrl: null });
  }

  form = this.fb.group({
    title:       ['', Validators.required],
    description: [''],
    category:    [''],
    status:      ['PUBLISHED' as 'DRAFT' | 'PUBLISHED'],
    modules:     this.fb.array([this.makeModule()]),
  });

  get modules() { return this.form.get('modules') as FormArray; }

  getLessons(mi: number) {
    return (this.modules.at(mi) as FormGroup).get('lessons') as FormArray;
  }

  asGroup(ctrl: any): FormGroup { return ctrl as FormGroup; }

  makeModule(): FormGroup {
    return this.fb.group({
      title:   ['', Validators.required],
      lessons: this.fb.array([this.makeLesson()]),
    });
  }

  makeLesson(): FormGroup {
    return this.fb.group({
      title:           ['', Validators.required],
      durationMinutes: [null as number | null],
      videoUrl:        [null as string | null],
    });
  }

  addModule()              { this.modules.push(this.makeModule()); }
  removeModule(i: number)  { this.modules.removeAt(i); }
  addLesson(mi: number)    { this.getLessons(mi).push(this.makeLesson()); }
  removeLesson(mi: number, li: number) { this.getLessons(mi).removeAt(li); }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    const v   = this.form.getRawValue();
    const username = this.auth.currentUser()?.username ?? '';

    const body = {
      title:       v.title!,
      description: v.description ?? undefined,
      instructorId: username,
      category:    v.category ?? undefined,
      status:      v.status as 'DRAFT' | 'PUBLISHED',
      modules:     (v.modules ?? []).map((m: any, mi: number) => ({
        title:  m.title,
        order:  mi + 1,
        lessons: (m.lessons ?? []).map((l: any, li: number) => ({
          title:           l.title,
          durationMinutes: l.durationMinutes ?? undefined,
          videoUrl:        l.videoUrl ?? undefined,
          order:           li + 1,
        })),
      })),
    };

    this.saving.set(true);
    this.svc.create(body).subscribe({
      next: course => {
        this.snack.open(`Курс «${course.title}» создан!`, 'OK', { duration: 3000 });
        this.router.navigate(['/courses']);
      },
      error: () => {
        this.snack.open('Ошибка при создании курса', 'Закрыть', { duration: 3000 });
        this.saving.set(false);
      },
    });
  }
}