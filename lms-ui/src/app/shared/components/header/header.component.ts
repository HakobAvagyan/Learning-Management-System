import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    RouterLink, DatePipe,
    MatToolbarModule, MatButtonModule, MatIconModule,
    MatMenuModule, MatDividerModule, MatBadgeModule, MatTooltipModule,
  ],
  styles: [`
    .notif-panel { width: 360px; max-height: 480px; overflow-y: auto; }
    .notif-header { display: flex; align-items: center; justify-content: space-between;
                    padding: 12px 16px 8px; position: sticky; top: 0;
                    background: white; z-index: 1; border-bottom: 1px solid #eee; }
    .notif-header h3 { margin: 0; font-size: 15px; font-weight: 600; }
    .notif-item { display: flex; flex-direction: column; padding: 12px 16px;
                  border-bottom: 1px solid #f0f0f0; cursor: pointer;
                  transition: background 0.15s; }
    .notif-item:hover { background: #f5f5f5; }
    .notif-item.unread { background: #f0f7ff; }
    .notif-item.unread:hover { background: #e3f0ff; }
    .notif-title { font-size: 13px; font-weight: 600; display: flex; align-items: center; gap: 6px; }
    .notif-msg   { font-size: 12px; color: #555; margin-top: 3px; }
    .notif-time  { font-size: 11px; color: #aaa; margin-top: 4px; }
    .notif-dot   { width: 8px; height: 8px; border-radius: 50%; background: #1976d2; flex-shrink: 0; }
    .notif-empty { padding: 32px 16px; text-align: center; color: #aaa; font-size: 13px; }
    .notif-icon  { font-size: 18px; height: 18px; width: 18px; }
  `],
  template: `
    <mat-toolbar color="primary">
      <a routerLink="/home" style="text-decoration: none; color: inherit; display: flex; align-items: center;">
        <mat-icon>school</mat-icon>
        <span style="margin-left: 8px; font-weight: 500;">LMS Platform</span>
      </a>

      <span style="flex: 1;"></span>

      @if (auth.isLoggedIn()) {
        <button mat-button routerLink="/courses" style="margin-right: 8px;">
          <mat-icon>explore</mat-icon>
          Каталог
        </button>

        <button mat-icon-button
                [matMenuTriggerFor]="notifMenu"
                (menuOpened)="notif.refresh()"
                matTooltip="Уведомления"
                style="margin-right: 4px;">
          <mat-icon
            [matBadge]="notif.unreadCount() > 0 ? notif.unreadCount() : null"
            matBadgeColor="warn"
            matBadgeSize="small">
            notifications
          </mat-icon>
        </button>

        <mat-menu #notifMenu="matMenu" class="notif-panel-menu">
          <div class="notif-panel" (click)="$event.stopPropagation()">
            <div class="notif-header">
              <h3>Уведомления</h3>
              @if (notif.unreadCount() > 0) {
                <button mat-button color="primary" style="font-size: 12px; min-width: 0; padding: 0 8px;"
                        (click)="notif.markAllRead()">
                  Прочитать все
                </button>
              }
            </div>

            @if (notif.notifications().length === 0) {
              <div class="notif-empty">
                <mat-icon style="font-size: 36px; height: 36px; width: 36px; color: #ddd;">notifications_none</mat-icon>
                <p style="margin: 8px 0 0;">Уведомлений нет</p>
              </div>
            } @else {
              @for (n of notif.notifications(); track n.id) {
                <div class="notif-item" [class.unread]="!n.read"
                     (click)="notif.markRead(n.id)">
                  <div class="notif-title">
                    @if (!n.read) { <span class="notif-dot"></span> }
                    <mat-icon class="notif-icon" [style.color]="n.type === 'QUIZ_PASSED' ? '#4caf50' : '#1976d2'">
                      {{ n.type === 'QUIZ_PASSED' ? 'emoji_events' : 'school' }}
                    </mat-icon>
                    {{ n.title }}
                  </div>
                  <div class="notif-msg">{{ n.message }}</div>
                  <div class="notif-time">{{ n.createdAt | date:'dd.MM.yyyy HH:mm' }}</div>
                </div>
              }
            }
          </div>
        </mat-menu>

        <!-- Аватар / меню пользователя -->
        <span style="margin-right: 16px; font-size: 14px;">
          {{ auth.currentUser()?.username }}
        </span>
        <button mat-icon-button [matMenuTriggerFor]="userMenu" aria-label="User menu">
          <mat-icon>account_circle</mat-icon>
        </button>
        <mat-menu #userMenu="matMenu">
          <button mat-menu-item routerLink="/home">
            <mat-icon>home</mat-icon>
            <span>Главная</span>
          </button>
          <button mat-menu-item routerLink="/courses">
            <mat-icon>explore</mat-icon>
            <span>Каталог курсов</span>
          </button>
          <button mat-menu-item routerLink="/profile">
            <mat-icon>manage_accounts</mat-icon>
            <span>Мой профиль</span>
          </button>
          @if (isAdmin()) {
            <mat-divider></mat-divider>
            <button mat-menu-item routerLink="/admin">
              <mat-icon>admin_panel_settings</mat-icon>
              <span>Администрирование</span>
            </button>
          }
          <mat-divider></mat-divider>
          <button mat-menu-item (click)="auth.logout()">
            <mat-icon>logout</mat-icon>
            <span>Выйти</span>
          </button>
        </mat-menu>
      } @else {
        <button mat-button routerLink="/login">
          <mat-icon>login</mat-icon>
          Войти
        </button>
        <button mat-raised-button routerLink="/register" style="margin-left: 8px;">
          Регистрация
        </button>
      }
    </mat-toolbar>
  `,
})
export class HeaderComponent {
  readonly auth  = inject(AuthService);
  readonly notif = inject(NotificationService);

  isAdmin() {
    return this.auth.currentUser()?.roles?.includes('ROLE_ADMIN') ?? false;
  }
}