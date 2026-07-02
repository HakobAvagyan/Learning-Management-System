import { Component, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { UserProfile } from '../../core/services/user.service';

const ALL_ROLES = [
  { value: 'ROLE_ADMIN',      label: 'Администратор' },
  { value: 'ROLE_INSTRUCTOR', label: 'Инструктор' },
  { value: 'ROLE_STUDENT',    label: 'Студент' },
];

@Component({
  selector: 'app-roles-dialog',
  standalone: true,
  imports: [ReactiveFormsModule, MatDialogModule, MatButtonModule, MatCheckboxModule, MatIconModule],
  template: `
    <h2 mat-dialog-title>
      <mat-icon style="vertical-align: middle; margin-right: 8px;">manage_accounts</mat-icon>
      Роли: {{ data.user.username }}
    </h2>
    <mat-dialog-content style="padding: 16px 24px;">
      @for (role of allRoles; track role.value) {
        <div style="margin-bottom: 8px;">
          <mat-checkbox [checked]="isSelected(role.value)" (change)="toggle(role.value, $event.checked)">
            {{ role.label }}
          </mat-checkbox>
        </div>
      }
      @if (selected.size === 0) {
        <p style="color: #f44336; font-size: 13px;">Нужно выбрать хотя бы одну роль</p>
      }
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Отмена</button>
      <button mat-raised-button color="primary" [disabled]="selected.size === 0" (click)="save()">
        Сохранить
      </button>
    </mat-dialog-actions>
  `,
})
export class RolesDialogComponent {
  readonly data    = inject<{ user: UserProfile }>(MAT_DIALOG_DATA);
  readonly dialogRef = inject(MatDialogRef<RolesDialogComponent>);

  readonly allRoles = ALL_ROLES;
  selected = new Set<string>(this.data.user.roles);

  isSelected(role: string) { return this.selected.has(role); }

  toggle(role: string, checked: boolean) {
    checked ? this.selected.add(role) : this.selected.delete(role);
  }

  save() {
    this.dialogRef.close([...this.selected]);
  }
}