import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  QuizDto,
  QuizResponse,
  QuizResultResponse,
  QuizSummary,
  SubmitQuizRequest,
} from '../models/quiz.model';

export interface OptionRequest {
  text: string;
  isCorrect: boolean;
}

export interface QuestionRequest {
  text: string;
  type: 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE';
  options: OptionRequest[];
  order: number;
  points: number;
}

export interface QuizRequest {
  courseId: string;
  lessonId?: string | null;
  title: string;
  description?: string | null;
  questions: QuestionRequest[];
  timeLimitMinutes?: number | null;
  passingScore: number;
  status: 'DRAFT' | 'PUBLISHED';
}

@Injectable({ providedIn: 'root' })
export class AssessmentService {
  private readonly http      = inject(HttpClient);
  private readonly quizBase  = 'http://localhost:8080/api/quizzes';
  private readonly adminBase = 'http://localhost:8080/api/assessments';

  getQuiz(quizId: string): Observable<QuizDto> {
    return this.http.get<QuizDto>(`${this.quizBase}/${quizId}`);
  }

  submitQuiz(quizId: string, request: SubmitQuizRequest): Observable<QuizResultResponse> {
    return this.http.post<QuizResultResponse>(`${this.quizBase}/${quizId}/submit`, request);
  }

  getQuizzesForCourse(courseId: string): Observable<QuizSummary[]> {
    const params = new HttpParams()
      .set('courseId', courseId)
      .set('status', 'PUBLISHED')
      .set('size', '100');
    return this.http
      .get<{ content: QuizSummary[] }>(`${this.adminBase}`, { params })
      .pipe(map(page => page.content));
  }

  listByCourse(courseId: string, status?: string): Observable<QuizResponse[]> {
    let params = new HttpParams().set('courseId', courseId).set('size', '100');
    if (status) params = params.set('status', status);
    return this.http
      .get<{ content: QuizResponse[] }>(`${this.adminBase}`, { params })
      .pipe(map(page => page.content));
  }

  getByLesson(lessonId: string): Observable<QuizResponse[]> {
    const params = new HttpParams().set('lessonId', lessonId);
    return this.http.get<QuizResponse[]>(`${this.adminBase}/by-lesson`, { params });
  }

  getById(id: string): Observable<QuizResponse> {
    return this.http.get<QuizResponse>(`${this.adminBase}/${id}`);
  }

  create(req: QuizRequest): Observable<QuizResponse> {
    return this.http.post<QuizResponse>(`${this.adminBase}`, req);
  }

  update(id: string, req: QuizRequest): Observable<QuizResponse> {
    return this.http.put<QuizResponse>(`${this.adminBase}/${id}`, req);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.adminBase}/${id}`);
  }
}