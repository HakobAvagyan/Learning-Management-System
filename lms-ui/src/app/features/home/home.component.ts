import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../core/services/auth.service';
import { ProgressService } from '../../core/services/progress.service';
import { CourseService } from '../../core/services/course.service';
import { ProgressResponse } from '../../core/models/progress.model';
import { CourseDto } from '../../core/models/course.model';

interface EnrolledCourse {
  progress: ProgressResponse;
  course: CourseDto | null;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    RouterLink,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
  ],
  styles: [`
    .home-page { max-width: 960px; margin: 0 auto; padding: 32px 16px; }

    h1 { font-size: 1.7rem; font-weight: 500; color: #3f51b5; margin-bottom: 4px; }
    .subtitle { color: #777; font-size: 14px; margin-bottom: 28px; }

    .section-header {
      display: flex; align-items: center; justify-content: space-between;
      margin-bottom: 16px;
    }
    .section-title {
      font-size: 1.1rem; font-weight: 600; color: #333;
      display: flex; align-items: center; gap: 8px;
    }

    .course-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 20px;
      margin-bottom: 36px;
    }

    mat-card { cursor: pointer; transition: box-shadow .2s; }
    mat-card:hover { box-shadow: 0 4px 16px rgba(63,81,181,.15); }

    mat-card-content { padding-top: 12px !important; }

    .course-title { font-size: 15px; font-weight: 500; line-height: 1.3; }
    .course-category { font-size: 12px; color: #888; margin-top: 2px; }

    .progress-row {
      display: flex; align-items: center; gap: 10px; margin-top: 12px;
    }
    .progress-row mat-progress-bar { flex: 1; }
    .progress-pct { font-size: 13px; font-weight: 600; color: #3f51b5; min-width: 38px; text-align: right; }

    .stats-row { display: flex; gap: 8px; align-items: center; margin-top: 8px; font-size: 12px; color: #666; }
    .stats-row mat-icon { font-size: 14px; height: 14px; width: 14px; }

    .status-chip {
      font-size: 11px; font-weight: 500; border-radius: 10px;
      padding: 2px 8px; display: inline-block; margin-top: 6px;
    }
    .status-chip.NOT_STARTED { background: #f5f5f5; color: #777; }
    .status-chip.IN_PROGRESS { background: #e3f2fd; color: #1565c0; }
    .status-chip.COMPLETED   { background: #e8f5e9; color: #2e7d32; }

    .empty-state { text-align: center; color: #999; padding: 60px 0; }
    .empty-state mat-icon { font-size: 64px; height: 64px; width: 64px; color: #ddd; }
    .empty-state p { margin-top: 12px; font-size: 15px; }

    .center { display: flex; justify-content: center; padding: 60px; }
  `],
  template: `
    <div class="home-page">
      <h1>Добро пожаловать, {{ user?.username }}!</h1>
      <p class="subtitle">Продолжите обучение с того места, где остановились.</p>

      <div class="section-header">
        <div class="section-title">
          <mat-icon color="primary">menu_book</mat-icon>
          Мои курсы
        </div>
        <button mat-stroked-button color="primary" routerLink="/courses">
          <mat-icon>explore</mat-icon>
          Каталог курсов
        </button>
      </div>

      @if (loading()) {
        <div class="center"><mat-spinner diameter="40" /></div>
      } @else if (items().length === 0) {
        <div class="empty-state">
          <mat-icon>school</mat-icon>
          <p>Вы ещё не записались ни на один курс.</p>
          <button mat-flat-button color="primary" routerLink="/courses" style="margin-top:16px;">
            <mat-icon>explore</mat-icon>
            Перейти в каталог
          </button>
        </div>
      } @else {
        <div class="course-grid">
          @for (item of items(); track item.progress.id) {
            <mat-card [routerLink]="['/progress/course', item.progress.courseId]">
              <mat-card-header>
                <mat-icon
                  mat-card-avatar
                  [style.color]="item.progress.status === 'COMPLETED' ? '#2e7d32' : '#3f51b5'"
                >
                  {{ item.progress.status === 'COMPLETED' ? 'verified' : 'auto_stories' }}
                </mat-icon>
                <mat-card-title>
                  <div class="course-title">{{ item.course?.title ?? item.progress.courseId }}</div>
                  <div class="course-category">{{ item.course?.category ?? '' }}</div>
                </mat-card-title>
              </mat-card-header>

              <mat-card-content>
                <div class="stats-row">
                  <mat-icon>checklist</mat-icon>
                  {{ item.progress.completedLessonsCount }} / {{ item.progress.totalLessons }} уроков
                </div>
                <div class="progress-row">
                  <mat-progress-bar
                    mode="determinate"
                    [value]="item.progress.progressPercent"
                    [color]="item.progress.status === 'COMPLETED' ? 'accent' : 'primary'"
                  />
                  <span class="progress-pct">{{ item.progress.progressPercent.toFixed(0) }}%</span>
                </div>
                <span [class]="'status-chip ' + item.progress.status">
                  {{ statusLabel(item.progress.status) }}
                </span>
              </mat-card-content>

              <mat-card-actions>
                <button mat-button color="primary"
                        [routerLink]="['/progress/course', item.progress.courseId]">
                  {{ item.progress.status === 'COMPLETED' ? 'Просмотреть' : 'Продолжить' }}
                  <mat-icon>arrow_forward</mat-icon>
                </button>
              </mat-card-actions>
            </mat-card>
          }
        </div>
      }
    </div>
  `,
})
export class HomeComponent implements OnInit {
  private readonly authService   = inject(AuthService);
  private readonly progressSvc   = inject(ProgressService);
  private readonly courseService = inject(CourseService);

  readonly user    = this.authService.currentUser();
  readonly loading = signal(true);
  readonly items   = signal<EnrolledCourse[]>([]);

  ngOnInit(): void {
    const userId = this.user?.id;
    if (!userId) { this.loading.set(false); return; }

    this.progressSvc.getAllProgressForUser(userId).subscribe({
      next: progressList => {
        if (progressList.length === 0) { this.loading.set(false); return; }

        const courseRequests = progressList.map(p =>
          this.courseService.getById(p.courseId).pipe(catchError(() => of(null)))
        );

        forkJoin(courseRequests).subscribe(courses => {
          this.items.set(
            progressList.map((p, i) => ({ progress: p, course: courses[i] }))
          );
          this.loading.set(false);
        });
      },
      error: () => this.loading.set(false),
    });
  }

  statusLabel(status: string): string {
    return ({ NOT_STARTED: 'Не начат', IN_PROGRESS: 'В процессе', COMPLETED: 'Завершён' })[status] ?? status;
  }
}