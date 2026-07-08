import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CourseDto, CoursePage } from '../models/course.model';

@Injectable({ providedIn: 'root' })
export class CourseService {
  private readonly http = inject(HttpClient);
  private readonly base = '/api/courses';

  getAll(page = 0, size = 20): Observable<CoursePage> {
    const params = new HttpParams().set('page', page).set('size', size).set('status', 'PUBLISHED');
    return this.http.get<CoursePage>(this.base, { params });
  }

  getById(id: string): Observable<CourseDto> {
    return this.http.get<CourseDto>(`${this.base}/${id}`);
  }

  create(body: CourseCreateRequest): Observable<CourseDto> {
    return this.http.post<CourseDto>(this.base, body);
  }

  update(id: string, body: CourseCreateRequest): Observable<CourseDto> {
    return this.http.put<CourseDto>(`${this.base}/${id}`, body);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}

export interface LessonRequest {
  title: string;
  content?: string;
  videoUrl?: string;
  durationMinutes?: number;
  order: number;
}

export interface ModuleRequest {
  title: string;
  description?: string;
  order: number;
  lessons: LessonRequest[];
}

export interface CourseCreateRequest {
  title: string;
  description?: string;
  instructorId: string;
  category?: string;
  status: 'DRAFT' | 'PUBLISHED';
  modules: ModuleRequest[];
}