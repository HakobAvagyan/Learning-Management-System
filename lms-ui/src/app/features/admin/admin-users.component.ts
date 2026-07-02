import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTooltipModule } from '@angular/material/tooltip';
import { UserService, UserProfile } from '../../core/services/user.service';
import { RolesDialogComponent } from './roles-dialog.component';
import { UserDetailDialogComponent } from './user-detail-dialog.component';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatTableModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatIconModule, MatChipsModule,
    MatSlideToggleModule, MatProgressSpinnerModule,
    MatCardModule, MatPaginatorModule, MatDialogModule,
    MatFormFieldModule, MatTooltipModule,
  ],
  template: `
    <div style="padding: 24px; max-width: 1200px; margin: 0 auto;">
      <h1 style="margin-bottom: 24px; font-size: 24px; font-weight: 500;">
        <mat-icon style="vertical-align: middle; margin-right: 8px;">admin_panel_settings</mat-icon>
        Управление пользователями
      </h1>

      <!-- Filters -->
      <mat-card style="margin-bottom: 24px; padding: 16px;">
        <div style="display: flex; gap: 16px; flex-wrap: wrap; align-items: center;">
          <mat-form-field style="flex: 1; min-width: 200px;">
            <mat-label>Поиск</mat-label>
            <mat-icon matPrefix>search</mat-icon>
            <input matInput [formControl]="searchCtrl" placeholder="Имя, логин, email...">
          </mat-form-field>

          <mat-form-field style="width: 200px;">
            <mat-label>Роль</mat-label>
            <mat-select [formControl]="roleCtrl">
              <mat-option value="">Все роли</mat-option>
              <mat-option value="ROLE_ADMIN">Администратор</mat-option>
              <mat-option value="ROLE_INSTRUCTOR">Инструктор</mat-option>
              <mat-option value="ROLE_STUDENT">Студент</mat-option>
            </mat-select>
          </mat-form-field>

          <button mat-stroked-button (click)="resetFilters()">
            <mat-icon>clear</mat-icon>
            Сбросить
          </button>
        </div>
      </mat-card>

      @if (loading()) {
        <div style="text-align: center; padding: 48px;">
          <mat-spinner></mat-spinner>
        </div>
      } @else {
        <!-- Table -->
        <mat-card>
          <table mat-table [dataSource]="users()" style="width: 100%;">

            <!-- ID -->
            <ng-container matColumnDef="id">
              <th mat-header-cell *matHeaderCellDef style="width: 60px;">#</th>
              <td mat-cell *matCellDef="let u">{{ u.id }}</td>
            </ng-container>

            <!-- Name -->
            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef>Имя</th>
              <td mat-cell *matCellDef="let u">
                <div style="font-weight: 500;">{{ u.firstName ?? '' }} {{ u.lastName ?? '' }}</div>
                <div style="font-size: 12px; color: #666;">{{ u.username }}</div>
              </td>
            </ng-container>

            <!-- Email -->
            <ng-container matColumnDef="email">
              <th mat-header-cell *matHeaderCellDef>Email</th>
              <td mat-cell *matCellDef="let u">{{ u.email }}</td>
            </ng-container>

            <!-- Roles -->
            <ng-container matColumnDef="roles">
              <th mat-header-cell *matHeaderCellDef>Роли</th>
              <td mat-cell *matCellDef="let u">
                <div style="display: flex; gap: 4px; flex-wrap: wrap;">
                  @for (role of u.roles; track role) {
                    <span [style]="chipStyle(role)">{{ roleLabel(role) }}</span>
                  }
                </div>
              </td>
            </ng-container>

            <!-- Status -->
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Статус</th>
              <td mat-cell *matCellDef="let u">
                <mat-slide-toggle
                  [checked]="u.enabled"
                  (change)="toggleEnabled(u)"
                  [color]="'primary'">
                  {{ u.enabled ? 'Активен' : 'Отключён' }}
                </mat-slide-toggle>
              </td>
            </ng-container>

            <!-- Actions -->
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Действия</th>
              <td mat-cell *matCellDef="let u">
                <button mat-icon-button (click)="openDetailDialog(u)" matTooltip="Просмотр профиля">
                  <mat-icon>visibility</mat-icon>
                </button>
                <button mat-icon-button (click)="openRolesDialog(u)" matTooltip="Изменить роли">
                  <mat-icon>manage_accounts</mat-icon>
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"
                [style.opacity]="row.enabled ? 1 : 0.5"></tr>
          </table>

          <mat-paginator
            [length]="totalElements()"
            [pageSize]="pageSize"
            [pageSizeOptions]="[10, 20, 50]"
            [pageIndex]="pageIndex()"
            (page)="onPage($event)"
            showFirstLastButtons>
          </mat-paginator>
        </mat-card>
      }
    </div>
  `,
})
export class AdminUsersComponent implements OnInit {
  private readonly svc    = inject(UserService);
  private readonly dialog = inject(MatDialog);

  readonly displayedColumns = ['id', 'name', 'email', 'roles', 'status', 'actions'];
  readonly pageSize = 20;

  searchCtrl = new FormControl('');
  roleCtrl   = new FormControl('');

  users         = signal<UserProfile[]>([]);
  totalElements = signal(0);
  pageIndex     = signal(0);
  loading       = signal(false);

  ngOnInit() {
    this.load();

    this.searchCtrl.valueChanges.pipe(debounceTime(400), distinctUntilChanged()).subscribe(() => {
      this.pageIndex.set(0);
      this.load();
    });

    this.roleCtrl.valueChanges.subscribe(() => {
      this.pageIndex.set(0);
      this.load();
    });
  }

  load() {
    this.loading.set(true);
    this.svc.listUsers(
      this.searchCtrl.value ?? '',
      this.roleCtrl.value ?? '',
      this.pageIndex(),
      this.pageSize
    ).subscribe({
      next: page => {
        this.users.set(page.content);
        this.totalElements.set(page.totalElements);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  onPage(event: PageEvent) {
    this.pageIndex.set(event.pageIndex);
    this.load();
  }

  resetFilters() {
    this.searchCtrl.setValue('');
    this.roleCtrl.setValue('');
  }

  toggleEnabled(user: UserProfile) {
    this.svc.toggleEnabled(user.id).subscribe(updated => {
      this.users.update(list => list.map(u => u.id === updated.id ? updated : u));
    });
  }

  openDetailDialog(user: UserProfile) {
    this.dialog.open(UserDetailDialogComponent, {
      width: '480px',
      data: { userId: user.id },
    });
  }

  openRolesDialog(user: UserProfile) {
    const ref = this.dialog.open(RolesDialogComponent, {
      width: '400px',
      data: { user },
    });
    ref.afterClosed().subscribe((roles: string[] | undefined) => {
      if (!roles) return;
      this.svc.updateRoles(user.id, roles).subscribe(updated => {
        this.users.update(list => list.map(u => u.id === updated.id ? updated : u));
      });
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
    const base = 'padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 500;';
    return base + (colors[role] ?? 'background:#9e9e9e;color:#fff');
  }
}