import { Component, inject, signal, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { UserService, UserProfile } from '../../core/services/user.service';

@Component({
  selector: 'app-user-detail-dialog',
  standalone: true,
  imports: [
    MatDialogModule, MatButtonModule, MatIconModule,
    MatProgressSpinnerModule, MatDividerModule, MatChipsModule,
  ],
  styles: [`
    .field { margin-bottom: 16px; }
    .label { font-size: 11px; color: #888; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 2px; }
    .value { font-size: 15px; color: #212121; }
    .chip {
      display: inline-block; padding: 2px 10px; border-radius: 12px;
      font-size: 12px; font-weight: 500; margin-right: 4px;
    }
  `],
  template: `
    <h2 mat-dialog-title style="display:flex;align-items:center;gap:8px;">
      <mat-icon>account_circle</mat-icon>
      Профиль пользователя
    </h2>

    <mat-dialog-content style="min-width:360px; padding-top:8px;">
      @if (loading()) {
        <div style="text-align:center; padding:32px;">
          <mat-spinner diameter="36"></mat-spinner>
        </div>
      } @else if (error()) {
        <p style="color:#f44336;">Не удалось загрузить данные пользователя.</p>
      } @else if (user()) {
        <div class="field">
          <div class="label">ID</div>
          <div class="value">{{ user()!.id }}</div>
        </div>
        <mat-divider style="margin-bottom:16px;"></mat-divider>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:16px;">
          <div class="field" style="margin:0">
            <div class="label">Имя</div>
            <div class="value">{{ user()!.firstName || '—' }}</div>
          </div>
          <div class="field" style="margin:0">
            <div class="label">Фамилия</div>
            <div class="value">{{ user()!.lastName || '—' }}</div>
          </div>
        </div>

        <div class="field">
          <div class="label">Логин</div>
          <div class="value">{{ user()!.username }}</div>
        </div>

        <div class="field">
          <div class="label">Email</div>
          <div class="value">{{ user()!.email }}</div>
        </div>

        <div class="field">
          <div class="label">Роли</div>
          <div style="margin-top:4px;">
            @for (role of user()!.roles; track role) {
              <span class="chip" [style]="chipStyle(role)">{{ roleLabel(role) }}</span>
            }
          </div>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px;">
          <div class="field" style="margin:0">
            <div class="label">Статус</div>
            <div class="value" [style.color]="user()!.enabled ? '#4caf50' : '#f44336'">
              <mat-icon style="vertical-align:middle; font-size:16px; height:16px; width:16px;">
                {{ user()!.enabled ? 'check_circle' : 'cancel' }}
              </mat-icon>
              {{ user()!.enabled ? 'Активен' : 'Отключён' }}
            </div>
          </div>
          <div class="field" style="margin:0">
            <div class="label">Зарегистрирован</div>
            <div class="value">{{ formatDate(user()!.createdAt) }}</div>
          </div>
        </div>
      }
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Закрыть</button>
    </mat-dialog-actions>
  `,
})
export class UserDetailDialogComponent implements OnInit {
  private readonly svc    = inject(UserService);
  private readonly data   = inject<{ userId: number }>(MAT_DIALOG_DATA);

  user    = signal<UserProfile | null>(null);
  loading = signal(true);
  error   = signal(false);

  ngOnInit() {
    this.svc.getById(this.data.userId).subscribe({
      next: u  => { this.user.set(u); this.loading.set(false); },
      error: () => { this.error.set(true); this.loading.set(false); },
    });
  }

  roleLabel(role: string): string {
    const map: Record<string, string> = {
      ROLE_ADMIN: 'Админ',
      ROLE_INSTRUCTOR: 'Инструктор',
      ROLE_STUDENT: 'Студент',
    };
    return map[role] ?? role;
  }

  chipStyle(role: string): string {
    const colors: Record<string, string> = {
      ROLE_ADMIN: 'background:#f44336;color:#fff',
      ROLE_INSTRUCTOR: 'background:#2196f3;color:#fff',
      ROLE_STUDENT: 'background:#4caf50;color:#fff',
    };
    return colors[role] ?? 'background:#9e9e9e;color:#fff';
  }

  formatDate(iso: string): string {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('ru-RU', {
      year: 'numeric', month: 'long', day: 'numeric',
    });
  }
}