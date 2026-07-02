export type LessonStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
export type ProgressStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';

export interface LessonProgress {
  lessonId: string;
  moduleId: string;
  lessonTitle: string;
  moduleTitle: string;
  order: number;
  status: LessonStatus;
  completedAt?: string;
}

export interface ProgressResponse {
  id: string;
  userId: number;
  courseId: string;
  status: ProgressStatus;
  completedLessonsCount: number;
  totalLessons: number;
  progressPercent: number;
  lessonProgress: Record<string, LessonProgress>;
  startedAt: string;
  lastActivityAt: string;
  completedAt?: string;
}

export interface ModuleGroup {
  moduleId: string;
  moduleTitle: string;
  lessons: LessonProgress[];
}

export interface CompleteLessonRequest {
  userId: number;
  courseId: string;
  lessonId: string;
}