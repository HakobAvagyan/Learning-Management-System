import { Component, inject, signal, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { EnrollmentService, EnrollmentResponse } from '../../core/services/enrollment.service';

@Component({
  selector: 'app-course-students-dialog',
  standalone: true,
  imports: [
    DatePipe,
    MatDialogModule, MatButtonModule, MatIconModule,
    MatProgressSpinnerModule, MatTableModule,
  ],
  styles: [`
    .status-chip {
      padding: 2px 10px; border-radius: 12px; font-size: 11px; font-weight: 600;
    }
  `],
  template: `
    <h2 mat-dialog-title style="display:flex;align-items:center;gap:8px;">
      <mat-icon>group</mat-icon>
      Студенты курса
      @if (!loading()) {
        <span style="font-size:14px;color:#888;font-weight:400;">({{ enrollments().length }})</span>
      }
    </h2>

    <mat-dialog-content style="min-width:480px; max-height:480px;">
      @if (loading()) {
        <div style="text-align:center; padding:32px;">
          <mat-spinner diameter="36"></mat-spinner>
        </div>
      } @else if (error()) {
        <p style="color:#f44336;">Не удалось загрузить список студентов.</p>
      } @else if (enrollments().length === 0) {
        <p style="color:#888; text-align:center; padding:32px 0;">
          На этот курс ещё никто не записан.
        </p>
      } @else {
        <table mat-table [dataSource]="enrollments()" style="width:100%;">

          <ng-container matColumnDef="userId">
            <th mat-header-cell *matHeaderCellDef>ID пользователя</th>
            <td mat-cell *matCellDef="let e">{{ e.userId }}</td>
          </ng-container>

          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef>Статус</th>
            <td mat-cell *matCellDef="let e">
              <span class="status-chip" [style]="statusStyle(e.status)">
                {{ statusLabel(e.status) }}
              </span>
            </td>
          </ng-container>

          <ng-container matColumnDef="enrolledAt">
            <th mat-header-cell *matHeaderCellDef>Дата записи</th>
            <td mat-cell *matCellDef="let e">
              {{ e.enrolledAt | date:'d MMM yyyy':'':'ru' }}
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="cols; sticky: true"></tr>
          <tr mat-row *matRowDef="let row; columns: cols;"></tr>
        </table>
      }
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Закрыть</button>
    </mat-dialog-actions>
  `,
})
export class CourseStudentsDialogComponent implements OnInit {
  private readonly svc  = inject(EnrollmentService);
  private readonly data = inject<{ courseId: string }>(MAT_DIALOG_DATA);

  enrollments = signal<EnrollmentResponse[]>([]);
  loading     = signal(true);
  error       = signal(false);

  readonly cols = ['userId', 'status', 'enrolledAt'];

  ngOnInit() {
    this.svc.getByCourse(this.data.courseId).subscribe({
      next: list => { this.enrollments.set(list); this.loading.set(false); },
      error: ()   => { this.error.set(true); this.loading.set(false); },
    });
  }

  statusLabel(status: string): string {
    return ({ ACTIVE: 'Активна', COMPLETED: 'Завершена', CANCELLED: 'Отменена' })[status] ?? status;
  }

  statusStyle(status: string): string {
    const map: Record<string, string> = {
      ACTIVE:    'background:#e8eaf6;color:#3f51b5',
      COMPLETED: 'background:#e8f5e9;color:#2e7d32',
      CANCELLED: 'background:#ffebee;color:#c62828',
    };
    return map[status] ?? 'background:#f5f5f5;color:#555';
  }
}