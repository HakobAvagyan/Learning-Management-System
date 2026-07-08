import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { interval } from 'rxjs';
import { startWith, switchMap } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AppNotification } from '../models/notification.model';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly base = '/api/notifications';

  readonly notifications = signal<AppNotification[]>([]);
  readonly unreadCount   = signal(0);

  constructor() {
    interval(30_000).pipe(
      startWith(0),
      switchMap(() => {
        if (!this.auth.isLoggedIn()) return [];
        return this.http.get<AppNotification[]>(this.base);
      }),
      takeUntilDestroyed(),
    ).subscribe(list => {
      this.notifications.set(list);
      this.unreadCount.set(list.filter(n => !n.read).length);
    });
  }

  markRead(id: string): void {
    this.http.patch<AppNotification>(`${this.base}/${id}/read`, {}).subscribe(updated => {
      this.notifications.update(list =>
        list.map(n => n.id === id ? updated : n)
      );
      this.unreadCount.set(this.notifications().filter(n => !n.read).length);
    });
  }

  markAllRead(): void {
    this.http.patch(`${this.base}/read-all`, {}).subscribe(() => {
      this.notifications.update(list => list.map(n => ({ ...n, read: true })));
      this.unreadCount.set(0);
    });
  }

  refresh(): void {
    if (!this.auth.isLoggedIn()) return;
    this.http.get<AppNotification[]>(this.base).subscribe(list => {
      this.notifications.set(list);
      this.unreadCount.set(list.filter(n => !n.read).length);
    });
  }
}