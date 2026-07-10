import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CourseService } from '../../core/services/course.service';
import { MediaService } from '../../core/services/media.service';
import { Lesson } from '../../core/models/lesson.model';

export interface ModuleView {
  id: string;
  title: string;
  lessons: Lesson[];
}

const MOCK_MODULES: ModuleView[] = [
  {
    id: 'mock-m1',
    title: 'Введение в курс',
    lessons: [
      {
        id: 'mock-1',
        title: 'Обзор курса и цели обучения',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        description:
          'В этом вводном уроке мы познакомимся со структурой курса, его целями и ожидаемыми ' +
          'результатами. Вы узнаете, какие навыки получите по завершении программы, как организован ' +
          'учебный процесс и на что обратить особое внимание. Урок даёт общее представление о ' +
          'предметной области и подготавливает к дальнейшему изучению материала.',
      },
      {
        id: 'mock-2',
        title: 'Ключевые понятия и термины',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        description:
          'Разбираем базовую терминологию дисциплины. Понимание ключевых понятий — фундамент ' +
          'для освоения всех последующих тем. В ходе урока мы рассмотрим определения, ' +
          'проследим связи между терминами и на конкретных примерах закрепим понятийный аппарат, ' +
          'которым будем пользоваться на протяжении всего курса.',
      },
    ],
  },
  {
    id: 'mock-m2',
    title: 'Практика',
    lessons: [
      {
        id: 'mock-3',
        title: 'Практическое применение знаний',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        description:
          'На этом уроке мы переходим от теории к практике. Вы выполните несколько упражнений, ' +
          'которые закрепят изученный материал и покажут, как применять полученные знания в ' +
          'реальных задачах. Особый акцент сделан на разборе типичных ошибок и способах их ' +
          'предотвращения в профессиональной деятельности.',
      },
    ],
  },
];

@Component({
  selector: 'app-course-view',
  standalone: true,
  imports: [
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
  ],
  templateUrl: './course-view.component.html',
  styleUrls: ['./course-view.component.scss'],
})
export class CourseViewComponent implements OnInit {
  private readonly route        = inject(ActivatedRoute);
  private readonly courseService = inject(CourseService);
  private readonly mediaSvc     = inject(MediaService);

  readonly loading          = signal(true);
  readonly courseTitle      = signal('');
  readonly courseId         = signal('');
  readonly modules          = signal<ModuleView[]>([]);
  readonly selectedLesson   = signal<Lesson | null>(null);
  readonly selectedVideoUrl = signal<string | null>(null);
  readonly loadingVideo     = signal(false);

  /** lessonId → raw MinIO key (needs presigned URL) */
  private readonly minioKeys = new Map<string, string>();

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('courseId')!;
    this.courseId.set(id);

    this.courseService.getById(id).subscribe({
      next: course => {
        this.courseTitle.set(course.title);
        this.modules.set(
          course.modules.map(m => ({
            id: m.id,
            title: m.title,
            lessons: m.lessons.map(l => {
              if (l.videoUrl) this.minioKeys.set(l.id, l.videoUrl);
              return {
                id:          l.id,
                title:       l.title,
                videoUrl:    l.videoUrl ?? '',
                description: l.content  ?? '',
              };
            }),
          }))
        );
        this.loading.set(false);
      },
      error: () => {
        this.courseTitle.set('Демо-курс');
        this.modules.set(MOCK_MODULES);
        this.loading.set(false);
      },
    });
  }

  selectLesson(lesson: Lesson): void {
    this.selectedLesson.set(lesson);
    this.selectedVideoUrl.set(null);

    const minioKey = this.minioKeys.get(lesson.id);

    if (!minioKey) {
      // Mock lesson — videoUrl is a direct http link
      this.selectedVideoUrl.set(lesson.videoUrl || null);
      return;
    }

    this.loadingVideo.set(true);
    this.mediaSvc.presignedUrl(minioKey, 120).subscribe({
      next: res => {
        this.selectedVideoUrl.set(res.url);
        this.loadingVideo.set(false);
      },
      error: () => this.loadingVideo.set(false),
    });
  }

  totalLessons(): number {
    return this.modules().reduce((sum, m) => sum + m.lessons.length, 0);
  }
}