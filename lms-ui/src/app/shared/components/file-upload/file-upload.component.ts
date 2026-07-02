import {
  Component, inject, signal, input, output, ElementRef, ViewChild,
} from '@angular/core';
import { HttpEventType } from '@angular/common/http';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MediaService, UploadResponse } from '../../../core/services/media.service';

export type UploadState = 'idle' | 'uploading' | 'done' | 'error';

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [MatProgressBarModule, MatButtonModule, MatIconModule, MatSnackBarModule],
  styles: [`
    .drop-zone {
      border: 2px dashed #90caf9;
      border-radius: 8px;
      padding: 20px 16px;
      text-align: center;
      cursor: pointer;
      transition: background 0.2s, border-color 0.2s;
      background: #f8fbff;
    }
    .drop-zone:hover, .drop-zone.drag-over {
      background: #e3f2fd;
      border-color: #1976d2;
    }
    .drop-zone.done  { border-color: #43a047; background: #f1f8e9; }
    .drop-zone.error { border-color: #e53935; background: #fff5f5; }

    .drop-hint { font-size: 13px; color: #666; margin: 6px 0 0; }

    .progress-wrap { margin-top: 10px; }
    .progress-label {
      display: flex; justify-content: space-between;
      font-size: 12px; color: #555; margin-bottom: 4px;
    }

    .success-info {
      margin-top: 8px; font-size: 12px; color: #2e7d32;
      word-break: break-all;
    }
    .filename { font-weight: 500; color: #333; margin-left: 4px; }
  `],
  template: `
    <div
      class="drop-zone"
      [class.drag-over]="dragging()"
      [class.done]="state() === 'done'"
      [class.error]="state() === 'error'"
      (click)="fileInput.click()"
      (dragover)="$event.preventDefault(); dragging.set(true)"
      (dragleave)="dragging.set(false)"
      (drop)="onDrop($event)"
    >
      <mat-icon [style.color]="iconColor()">{{ iconName() }}</mat-icon>

      @if (state() === 'idle' || state() === 'uploading') {
        <div>
          <strong>{{ label() }}</strong>
          <div class="drop-hint">Перетащите файл или нажмите для выбора</div>
          @if (accept()) {
            <div class="drop-hint" style="font-size:11px;">{{ accept() }}</div>
          }
        </div>
      }

      @if (state() === 'done') {
        <div class="success-info">
          <mat-icon style="font-size:16px;vertical-align:middle;color:#43a047;">check_circle</mat-icon>
          Загружено:<span class="filename">{{ uploadedResult()?.originalFilename }}</span>
          <br>
          <span style="color:#888;">{{ formatSize(uploadedResult()?.sizeBytes) }}</span>
        </div>
      }

      @if (state() === 'error') {
        <div style="color:#e53935;font-size:13px;">Ошибка загрузки. Попробуйте ещё раз.</div>
      }
    </div>

    @if (state() === 'uploading') {
      <div class="progress-wrap">
        <div class="progress-label">
          <span>Загрузка...</span>
          <span>{{ progress() }}%</span>
        </div>
        <mat-progress-bar mode="determinate" [value]="progress()" color="primary" />
      </div>
    }

    @if (state() === 'done') {
      <div style="margin-top:8px;display:flex;gap:8px;">
        <button mat-stroked-button color="warn" style="font-size:12px;" (click)="reset($event)">
          <mat-icon>delete</mat-icon> Удалить
        </button>
      </div>
    }

    <input #fileInput type="file" [accept]="accept()" style="display:none"
           (change)="onFileSelected($event)">
  `,
})
export class FileUploadComponent {
  private readonly mediaSvc = inject(MediaService);
  private readonly snack    = inject(MatSnackBar);

  readonly label  = input('Загрузить файл');
  readonly accept = input('');

  /** Эмитит key объекта в MinIO после успешной загрузки */
  readonly uploaded = output<string>();
  /** Эмитит null при удалении файла */
  readonly removed  = output<void>();

  @ViewChild('fileInput') fileInputRef!: ElementRef<HTMLInputElement>;

  readonly state          = signal<UploadState>('idle');
  readonly progress       = signal(0);
  readonly dragging       = signal(false);
  readonly uploadedResult = signal<UploadResponse | null>(null);

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.dragging.set(false);
    const file = event.dataTransfer?.files?.[0];
    if (file) this.startUpload(file);
  }

  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) this.startUpload(file);
  }

  private startUpload(file: File) {
    this.state.set('uploading');
    this.progress.set(0);

    this.mediaSvc.upload(file).subscribe({
      next: event => {
        if (event.type === HttpEventType.UploadProgress && event.total) {
          this.progress.set(Math.round(100 * event.loaded / event.total));
        }
        if (event.type === HttpEventType.Response && event.body) {
          this.state.set('done');
          this.progress.set(100);
          this.uploadedResult.set(event.body);
          this.uploaded.emit(event.body.key);
        }
      },
      error: () => {
        this.state.set('error');
        this.snack.open('Ошибка загрузки файла', 'Закрыть', { duration: 3000 });
      },
    });
  }

  reset(event: MouseEvent) {
    event.stopPropagation();
    this.state.set('idle');
    this.progress.set(0);
    this.uploadedResult.set(null);
    if (this.fileInputRef) this.fileInputRef.nativeElement.value = '';
    this.removed.emit();
  }

  iconName(): string {
    return ({ idle: 'cloud_upload', uploading: 'cloud_upload', done: 'cloud_done', error: 'error_outline' })[this.state()] ?? 'cloud_upload';
  }

  iconColor(): string {
    return ({ idle: '#90caf9', uploading: '#1976d2', done: '#43a047', error: '#e53935' })[this.state()] ?? '#90caf9';
  }

  formatSize(bytes?: number): string {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  }
}