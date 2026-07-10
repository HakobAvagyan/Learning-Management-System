export interface LessonDto {
  id: string;
  title: string;
  order: number;
  durationMinutes?: number;
  videoUrl?: string;
  content?: string;
  attachmentUrls?: string[];
}

export interface ModuleDto {
  id: string;
  title: string;
  order: number;
  lessons: LessonDto[];
}

export interface CourseDto {
  id: string;
  title: string;
  description?: string;
  instructorId: string;
  category?: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  modules: ModuleDto[];
  createdAt: string;
  updatedAt: string;
}

export interface CoursePage {
  content: CourseDto[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}