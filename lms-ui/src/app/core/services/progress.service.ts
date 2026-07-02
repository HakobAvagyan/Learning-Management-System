import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  CompleteLessonRequest,
  ModuleGroup,
  ProgressResponse,
} from '../models/progress.model';

@Injectable({ providedIn: 'root' })
export class ProgressService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:8080/api/progress';

  getProgress(userId: number, courseId: string): Observable<ProgressResponse> {
    return this.http.get<ProgressResponse>(
      `${this.baseUrl}/user/${userId}/course/${courseId}`
    );
  }

  getAllProgressForUser(userId: number): Observable<ProgressResponse[]> {
    return this.http.get<ProgressResponse[]>(`${this.baseUrl}/user/${userId}`);
  }

  completeLesson(request: CompleteLessonRequest): Observable<ProgressResponse> {
    return this.http.post<ProgressResponse>(
      `${this.baseUrl}/complete-lesson`,
      request
    );
  }

  groupByModule(lessonProgress: ProgressResponse['lessonProgress']): ModuleGroup[] {
    const groups = new Map<string, ModuleGroup>();

    Object.values(lessonProgress)
      .sort((a, b) => a.order - b.order)
      .forEach(lesson => {
        if (!groups.has(lesson.moduleId)) {
          groups.set(lesson.moduleId, {
            moduleId: lesson.moduleId,
            moduleTitle: lesson.moduleTitle,
            lessons: [],
          });
        }
        groups.get(lesson.moduleId)!.lessons.push(lesson);
      });

    return Array.from(groups.values());
  }
}