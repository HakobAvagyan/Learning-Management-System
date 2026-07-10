import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../../core/services/auth.service';
import { CourseService } from '../../core/services/course.service';
import { EnrollmentService } from '../../core/services/enrollment.service';
import { ProgressService } from '../../core/services/progress.service';
import { CourseDto } from '../../core/models/course.model';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog.component';
import { CourseStudentsDialogComponent } from '../courses/course-students-dialog.component';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatBadgeModule,
    MatDialogModule,
    MatTooltipModule,
  ],
  styles: [`
    .catalog-page { max-width: 960px; margin: 0 auto; padding: 32px 16px; }

    h1 { font-size: 1.7rem; font-weight: 500; color: #3f51b5; margin-bottom: 4px; }
    .subtitle { color: #777; font-size: 14px; margin-bottom: 28px; }

    .course-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
      gap: 20px;
    }

    mat-card { display: flex; flex-direction: column; height: 100%; }
    mat-card-content { flex: 1; }

    .category-chip {
      font-size: 11px; background: #e8eaf6; color: #3f51b5;
      border-radius: 10px; padding: 2px 10px; display: inline-block;
      margin-bottom: 10px;
    }

    .description {
      font-size: 13px; color: #555; line-height: 1.5;
      display: -webkit-box; -webkit-line-clamp: 3;
      -webkit-box-orient: vertical; overflow: hidden;
      margin-bottom: 12px;
    }

    .meta { display: flex; gap: 16px; font-size: 12px; color: #888; flex-wrap: wrap; }
    .meta span { display: flex; align-items: center; gap: 4px; }
    .meta mat-icon { font-size: 14px; height: 14px; width: 14px; }

    .center { display: flex; justify-content: center; padding: 80px; }

    .enrolled-badge {
      font-size: 11px; background: #e8f5e9; color: #2e7d32;
      border-radius: 10px; padding: 2px 8px; display: inline-flex;
      align-items: center; gap: 4px;
    }
    .enrolled-badge mat-icon { font-size: 12px; height: 12px; width: 12px; }
  `],
  template: `
    <div class="catalog-page">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;">
        <h1 style="margin:0;">Каталог курсов</h1>
        @if (isInstructor()) {
          <button mat-flat-button color="primary" routerLink="/courses/create">
            <mat-icon>add</mat-icon>
            Создать курс
          </button>
        }
      </div>
      <p class="subtitle">Выберите курс и начните обучение прямо сейчас</p>

      @if (loading()) {
        <div class="center"><mat-spinner diameter="48" /></div>
      } @else {
        <div class="course-grid">
          @for (course of courses(); track course.id) {
            <mat-card>
              <mat-card-header>
                <mat-icon mat-card-avatar color="primary">menu_book</mat-icon>
                <mat-card-title style="font-size: 15px; line-height: 1.3;">
                  {{ course.title }}
                </mat-card-title>
                <mat-card-subtitle>
                  @if (enrolledIds().has(course.id)) {
                    <span class="enrolled-badge">
                      <mat-icon>check_circle</mat-icon> Вы записаны
                    </span>
                  } @else {
                    <span class="category-chip">{{ course.category ?? 'Общее' }}</span>
                  }
                </mat-card-subtitle>
              </mat-card-header>

              <mat-card-content style="padding-top: 12px;">
                @if (course.description) {
                  <p class="description">{{ course.description }}</p>
                }
                <div class="meta">
                  <span>
                    <mat-icon>person</mat-icon>
                    {{ course.instructorId }}
                  </span>
                  <span>
                    <mat-icon>layers</mat-icon>
                    {{ course.modules.length }} модулей
                  </span>
                  <span>
                    <mat-icon>play_lesson</mat-icon>
                    {{ totalLessons(course) }} уроков
                  </span>
                </div>
              </mat-card-content>

              <mat-card-actions style="padding: 8px 16px 16px; display:flex; gap:8px; align-items:center;">
                @if (enrolledIds().has(course.id)) {
                  <button mat-flat-button color="primary"
                          [routerLink]="['/progress/course', course.id]">
                    <mat-icon>play_arrow</mat-icon>
                    Продолжить
                  </button>
                  <button mat-stroked-button color="primary"
                          [routerLink]="['/courses', course.id, 'view']"
                          matTooltip="Смотреть материалы курса">
                    <mat-icon>menu_book</mat-icon>
                    Материалы
                  </button>
                } @else {
                  <button mat-flat-button color="accent"
                          [disabled]="enrolling() === course.id"
                          (click)="enroll(course)">
                    @if (enrolling() === course.id) {
                      <mat-spinner diameter="18" style="display:inline-block;margin-right:6px;" />
                    } @else {
                      <mat-icon>add</mat-icon>
                    }
                    Записаться
                  </button>
                }

                @if (canDelete(course)) {
                  <button mat-icon-button color="primary"
                          matTooltip="Студенты курса"
                          (click)="openStudents(course)">
                    <mat-icon>group</mat-icon>
                  </button>
                  <button mat-icon-button color="primary"
                          matTooltip="Управление квизами"
                          [routerLink]="['/courses', course.id, 'quizzes']">
                    <mat-icon>quiz</mat-icon>
                  </button>
                  <button mat-icon-button color="warn"
                          matTooltip="Удалить курс"
                          (click)="confirmDelete(course)">
                    <mat-icon>delete</mat-icon>
                  </button>
                }
              </mat-card-actions>
            </mat-card>
          }
        </div>
      }
    </div>
  `,
})
export class CatalogComponent implements OnInit {
  private readonly authService   = inject(AuthService);
  private readonly courseService = inject(CourseService);
  private readonly enrollService = inject(EnrollmentService);
  private readonly progressSvc   = inject(ProgressService);
  private readonly snack         = inject(MatSnackBar);
  private readonly router        = inject(Router);
  private readonly dialog        = inject(MatDialog);

  readonly loading     = signal(true);
  readonly courses     = signal<CourseDto[]>([]);
  readonly enrolledIds = signal<Set<string>>(new Set());
  readonly enrolling   = signal<string | null>(null);

  isInstructor(): boolean {
    const roles = this.authService.currentUser()?.roles ?? [];
    return roles.includes('ROLE_INSTRUCTOR') || roles.includes('ROLE_ADMIN');
  }

  canDelete(course: CourseDto): boolean {
    const user = this.authService.currentUser();
    if (!user) return false;
    if (user.roles.includes('ROLE_ADMIN')) return true;
    return user.roles.includes('ROLE_INSTRUCTOR') && course.instructorId === user.username;
  }

  ngOnInit(): void {
    const userId = this.authService.currentUser()?.id;

    this.courseService.getAll().subscribe({
      next: page => {
        this.courses.set(page.content);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });

    if (userId) {
      this.progressSvc.getAllProgressForUser(userId).subscribe({
        next: list => this.enrolledIds.set(new Set(list.map(p => p.courseId))),
      });
    }
  }

  enroll(course: CourseDto): void {
    const userId = this.authService.currentUser()?.id;
    if (!userId) return;

    this.enrolling.set(course.id);

    this.enrollService.subscribe({ userId, courseId: course.id }).subscribe({
      next: () => {
        this.enrolledIds.update(s => new Set([...s, course.id]));
        this.enrolling.set(null);
        this.snack.open(`Вы записаны на курс «${course.title}»!`, 'OK', {
          duration: 3000, panelClass: 'snack-success',
        });
        this.router.navigate(['/progress/course', course.id]);
      },
      error: err => {
        this.enrolling.set(null);
        const msg = err.status === 409
          ? 'Вы уже записаны на этот курс.'
          : 'Ошибка при записи на курс.';
        this.snack.open(msg, 'Закрыть', { duration: 3000 });
      },
    });
  }

  openStudents(course: CourseDto): void {
    this.dialog.open(CourseStudentsDialogComponent, {
      width: '560px',
      data: { courseId: course.id },
    });
  }

  confirmDelete(course: CourseDto): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '380px',
      data: {
        title: 'Удалить курс?',
        message: `Курс «${course.title}» будет удалён без возможности восстановления.`,
        confirmLabel: 'Удалить',
      },
    });

    ref.afterClosed().subscribe(confirmed => {
      if (!confirmed) return;
      this.courseService.delete(course.id).subscribe({
        next: () => {
          this.courses.update(list => list.filter(c => c.id !== course.id));
          this.snack.open(`Курс «${course.title}» удалён.`, 'OK', { duration: 3000 });
        },
        error: () => this.snack.open('Ошибка при удалении курса.', 'Закрыть', { duration: 3000 }),
      });
    });
  }

  totalLessons(course: CourseDto): number {
    return course.modules.reduce((sum, m) => sum + m.lessons.length, 0);
  }
}