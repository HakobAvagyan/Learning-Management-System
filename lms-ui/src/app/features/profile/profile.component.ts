import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { AuthService } from '../../core/services/auth.service';
import { UserService, UserProfile } from '../../core/services/user.service';
import { ProgressService } from '../../core/services/progress.service';
import { EnrollmentService, EnrollmentResponse } from '../../core/services/enrollment.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    DatePipe,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTabsModule,
    MatTableModule,
    MatChipsModule,
  ],
  styles: [`
    .profile-page { max-width: 760px; margin: 32px auto; padding: 0 16px 48px; }

    .avatar-card { margin-bottom: 20px; }
    .avatar-row { display: flex; align-items: center; gap: 24px; padding: 8px 0; }

    .avatar-circle {
      width: 80px; height: 80px; border-radius: 50%;
      background: #3f51b5; color: white;
      display: flex; align-items: center; justify-content: center;
      font-size: 2rem; font-weight: 600; flex-shrink: 0;
    }

    .avatar-info h2 { margin: 0 0 4px; font-size: 1.4rem; font-weight: 500; }
    .avatar-info p  { margin: 0; color: #666; font-size: 14px; }

    .role-badges { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 8px; }
    .role-badge {
      font-size: 11px; font-weight: 600; border-radius: 10px;
      padding: 3px 10px; display: inline-block;
    }
    .role-badge.ROLE_ADMIN      { background: #fce4ec; color: #c62828; }
    .role-badge.ROLE_INSTRUCTOR { background: #fff3e0; color: #e65100; }
    .role-badge.ROLE_STUDENT    { background: #e8eaf6; color: #3f51b5; }

    .stats-row { display: flex; gap: 16px; flex-wrap: wrap; margin-bottom: 20px; }
    .stat-card {
      flex: 1; min-width: 140px; text-align: center; padding: 16px 12px;
      border-radius: 10px; background: #f5f5f5;
    }
    .stat-card mat-icon { font-size: 28px; height: 28px; width: 28px; color: #3f51b5; }
    .stat-num  { font-size: 1.8rem; font-weight: 700; color: #3f51b5; line-height: 1.2; }
    .stat-label { font-size: 12px; color: #777; margin-top: 2px; }

    mat-form-field { width: 100%; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .save-row  { display: flex; justify-content: flex-end; margin-top: 8px; }

    .center { display: flex; justify-content: center; padding: 60px; }
    .member-since { font-size: 12px; color: #999; margin-top: 4px; }

    .status-chip {
      padding: 2px 10px; border-radius: 12px; font-size: 11px; font-weight: 600;
    }
  `],
  template: `
    @if (loading()) {
      <div class="center"><mat-spinner diameter="48" /></div>
    } @else if (profile()) {
      <div class="profile-page">

        <!-- Шапка профиля -->
        <mat-card class="avatar-card">
          <mat-card-content>
            <div class="avatar-row">
              <div class="avatar-circle">{{ initials() }}</div>
              <div class="avatar-info">
                <h2>{{ profile()!.firstName ?? '' }} {{ profile()!.lastName ?? '' }}</h2>
                <p>&#64;{{ profile()!.username }} · {{ profile()!.email }}</p>
                <div class="role-badges">
                  @for (role of profile()!.roles; track role) {
                    <span [class]="'role-badge ' + role">{{ roleLabel(role) }}</span>
                  }
                </div>
                <p class="member-since">
                  В системе с {{ profile()!.createdAt | date:'d MMMM yyyy':'':'ru' }}
                </p>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Статистика -->
        <div class="stats-row">
          <div class="stat-card">
            <mat-icon>school</mat-icon>
            <div class="stat-num">{{ totalEnrolled() }}</div>
            <div class="stat-label">Курсов записано</div>
          </div>
          <div class="stat-card">
            <mat-icon>verified</mat-icon>
            <div class="stat-num">{{ totalCompleted() }}</div>
            <div class="stat-label">Курсов завершено</div>
          </div>
          <div class="stat-card">
            <mat-icon>checklist</mat-icon>
            <div class="stat-num">{{ totalLessons() }}</div>
            <div class="stat-label">Уроков пройдено</div>
          </div>
          <div class="stat-card">
            <mat-icon>trending_up</mat-icon>
            <div class="stat-num">{{ avgProgress() }}%</div>
            <div class="stat-label">Средний прогресс</div>
          </div>
        </div>

        <!-- Вкладки -->
        <mat-card>
          <mat-card-content style="padding-top: 0;">
            <mat-tab-group>

              <!-- Мои курсы -->
              <mat-tab label="Мои курсы">
                <div style="padding: 16px 0;">
                  @if (enrollmentsLoading()) {
                    <div class="center"><mat-spinner diameter="32" /></div>
                  } @else if (enrollments().length === 0) {
                    <p style="color:#888; text-align:center; padding:32px 0;">
                      Вы ещё не записаны ни на один курс.
                    </p>
                  } @else {
                    <table mat-table [dataSource]="enrollments()" style="width:100%;">

                      <ng-container matColumnDef="courseId">
                        <th mat-header-cell *matHeaderCellDef>Курс</th>
                        <td mat-cell *matCellDef="let e" style="font-family:monospace; font-size:13px;">
                          {{ e.courseId }}
                        </td>
                      </ng-container>

                      <ng-container matColumnDef="status">
                        <th mat-header-cell *matHeaderCellDef>Статус</th>
                        <td mat-cell *matCellDef="let e">
                          <span class="status-chip" [style]="enrollStatusStyle(e.status)">
                            {{ enrollStatusLabel(e.status) }}
                          </span>
                        </td>
                      </ng-container>

                      <ng-container matColumnDef="enrolledAt">
                        <th mat-header-cell *matHeaderCellDef>Дата записи</th>
                        <td mat-cell *matCellDef="let e">
                          {{ e.enrolledAt | date:'d MMM yyyy':'':'ru' }}
                        </td>
                      </ng-container>

                      <ng-container matColumnDef="actions">
                        <th mat-header-cell *matHeaderCellDef></th>
                        <td mat-cell *matCellDef="let e">
                          <button mat-stroked-button
                                  [routerLink]="['/progress/course', e.courseId]"
                                  style="font-size:12px;">
                            <mat-icon>play_arrow</mat-icon>
                            Перейти
                          </button>
                        </td>
                      </ng-container>

                      <tr mat-header-row *matHeaderRowDef="enrollCols"></tr>
                      <tr mat-row *matRowDef="let row; columns: enrollCols;"></tr>
                    </table>
                  }
                </div>
              </mat-tab>

              <!-- Редактировать профиль -->
              <mat-tab label="Редактировать профиль">
                <div style="padding: 20px 0;">
                  <form [formGroup]="profileForm" (ngSubmit)="saveProfile()">
                    <div class="form-row">
                      <mat-form-field appearance="outline">
                        <mat-label>Имя</mat-label>
                        <input matInput formControlName="firstName">
                      </mat-form-field>
                      <mat-form-field appearance="outline">
                        <mat-label>Фамилия</mat-label>
                        <input matInput formControlName="lastName">
                      </mat-form-field>
                    </div>
                    <mat-form-field appearance="outline">
                      <mat-label>Email</mat-label>
                      <input matInput formControlName="email" type="email">
                      @if (profileForm.get('email')?.hasError('email')) {
                        <mat-error>Введите корректный email</mat-error>
                      }
                    </mat-form-field>
                    <mat-form-field appearance="outline">
                      <mat-label>Имя пользователя</mat-label>
                      <input matInput [value]="profile()!.username" disabled>
                      <mat-hint>Имя пользователя изменить нельзя</mat-hint>
                    </mat-form-field>
                    <div class="save-row">
                      <button mat-flat-button color="primary" type="submit"
                              [disabled]="profileForm.invalid || savingProfile()">
                        @if (savingProfile()) {
                          <mat-spinner diameter="18" style="display:inline-block;margin-right:6px;" />
                        } @else {
                          <mat-icon>save</mat-icon>
                        }
                        Сохранить
                      </button>
                    </div>
                  </form>
                </div>
              </mat-tab>

              <!-- Смена пароля -->
              <mat-tab label="Сменить пароль">
                <div style="padding: 20px 0;">
                  <form [formGroup]="passwordForm" (ngSubmit)="changePassword()">
                    <mat-form-field appearance="outline">
                      <mat-label>Текущий пароль</mat-label>
                      <input matInput formControlName="currentPassword" type="password">
                      @if (passwordForm.get('currentPassword')?.hasError('required') && passwordForm.get('currentPassword')?.touched) {
                        <mat-error>Введите текущий пароль</mat-error>
                      }
                    </mat-form-field>
                    <mat-form-field appearance="outline">
                      <mat-label>Новый пароль</mat-label>
                      <input matInput formControlName="newPassword" type="password">
                      @if (passwordForm.get('newPassword')?.hasError('minlength')) {
                        <mat-error>Минимум 6 символов</mat-error>
                      }
                    </mat-form-field>
                    <mat-form-field appearance="outline">
                      <mat-label>Повторите новый пароль</mat-label>
                      <input matInput formControlName="confirmPassword" type="password">
                      @if (passwordForm.hasError('mismatch') && passwordForm.get('confirmPassword')?.touched) {
                        <mat-error>Пароли не совпадают</mat-error>
                      }
                    </mat-form-field>
                    <div class="save-row">
                      <button mat-flat-button color="warn" type="submit"
                              [disabled]="passwordForm.invalid || savingPassword()">
                        @if (savingPassword()) {
                          <mat-spinner diameter="18" style="display:inline-block;margin-right:6px;" />
                        } @else {
                          <mat-icon>lock_reset</mat-icon>
                        }
                        Сменить пароль
                      </button>
                    </div>
                  </form>
                </div>
              </mat-tab>

            </mat-tab-group>
          </mat-card-content>
        </mat-card>

      </div>
    }
  `,
})
export class ProfileComponent implements OnInit {
  private readonly auth          = inject(AuthService);
  private readonly userSvc       = inject(UserService);
  private readonly progressSvc   = inject(ProgressService);
  private readonly enrollSvc     = inject(EnrollmentService);
  private readonly fb            = inject(FormBuilder);
  private readonly snack         = inject(MatSnackBar);

  readonly loading            = signal(true);
  readonly profile            = signal<UserProfile | null>(null);
  readonly savingProfile      = signal(false);
  readonly savingPassword     = signal(false);
  readonly enrollments        = signal<EnrollmentResponse[]>([]);
  readonly enrollmentsLoading = signal(false);

  readonly enrollCols = ['courseId', 'status', 'enrolledAt', 'actions'];

  private readonly progressList = signal<{ status: string; completedLessonsCount: number; progressPercent: number }[]>([]);

  readonly totalEnrolled  = computed(() => this.progressList().length);
  readonly totalCompleted = computed(() => this.progressList().filter(p => p.status === 'COMPLETED').length);
  readonly totalLessons   = computed(() => this.progressList().reduce((s, p) => s + p.completedLessonsCount, 0));
  readonly avgProgress    = computed(() => {
    const list = this.progressList();
    if (!list.length) return 0;
    return Math.round(list.reduce((s, p) => s + p.progressPercent, 0) / list.length);
  });

  readonly initials = computed(() => {
    const p = this.profile();
    if (!p) return '?';
    const f = p.firstName?.[0] ?? '';
    const l = p.lastName?.[0]  ?? '';
    return (f + l).toUpperCase() || p.username[0].toUpperCase();
  });

  profileForm = this.fb.group({
    firstName: [''],
    lastName:  [''],
    email:     ['', [Validators.email]],
  });

  passwordForm = this.fb.group(
    {
      currentPassword: ['', Validators.required],
      newPassword:     ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
    },
    { validators: (g) => g.get('newPassword')?.value === g.get('confirmPassword')?.value ? null : { mismatch: true } }
  );

  ngOnInit(): void {
    const userId = this.auth.currentUser()?.id;

    this.userSvc.getMe().subscribe({
      next: p => {
        this.profile.set(p);
        this.profileForm.patchValue({ firstName: p.firstName ?? '', lastName: p.lastName ?? '', email: p.email });
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });

    if (userId) {
      this.progressSvc.getAllProgressForUser(userId).subscribe({
        next: list => this.progressList.set(list),
      });

      this.enrollmentsLoading.set(true);
      this.enrollSvc.getByUser(userId).subscribe({
        next: list => { this.enrollments.set(list); this.enrollmentsLoading.set(false); },
        error: ()   => this.enrollmentsLoading.set(false),
      });
    }
  }

  saveProfile(): void {
    if (this.profileForm.invalid) return;
    this.savingProfile.set(true);
    const v = this.profileForm.getRawValue();
    this.userSvc.updateMe({
      firstName: v.firstName ?? undefined,
      lastName:  v.lastName  ?? undefined,
      email:     v.email     ?? undefined,
    }).subscribe({
      next: updated => {
        this.profile.set(updated);
        this.savingProfile.set(false);
        this.snack.open('Профиль обновлён!', 'OK', { duration: 2500 });
      },
      error: err => {
        this.savingProfile.set(false);
        this.snack.open(err.error?.detail ?? 'Ошибка сохранения', 'Закрыть', { duration: 3000 });
      },
    });
  }

  changePassword(): void {
    if (this.passwordForm.invalid) return;
    this.savingPassword.set(true);
    const { currentPassword, newPassword } = this.passwordForm.getRawValue();
    this.userSvc.changePassword({ currentPassword: currentPassword!, newPassword: newPassword! }).subscribe({
      next: () => {
        this.savingPassword.set(false);
        this.passwordForm.reset();
        this.snack.open('Пароль успешно изменён!', 'OK', { duration: 2500 });
      },
      error: err => {
        this.savingPassword.set(false);
        this.snack.open(err.error?.detail ?? 'Неверный текущий пароль', 'Закрыть', { duration: 3000 });
      },
    });
  }

  roleLabel(role: string): string {
    return ({ ROLE_ADMIN: 'Администратор', ROLE_INSTRUCTOR: 'Преподаватель', ROLE_STUDENT: 'Студент' })[role] ?? role;
  }

  enrollStatusLabel(status: string): string {
    return ({ ACTIVE: 'Активна', COMPLETED: 'Завершена', CANCELLED: 'Отменена' })[status] ?? status;
  }

  enrollStatusStyle(status: string): string {
    const map: Record<string, string> = {
      ACTIVE:    'background:#e8eaf6;color:#3f51b5',
      COMPLETED: 'background:#e8f5e9;color:#2e7d32',
      CANCELLED: 'background:#ffebee;color:#c62828',
    };
    return map[status] ?? 'background:#f5f5f5;color:#555';
  }
}