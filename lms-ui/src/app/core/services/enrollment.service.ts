import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface SubscribeRequest {
  userId: number;
  courseId: string;
}

export interface EnrollmentResponse {
  id: number;
  userId: number;
  courseId: string;
  status: string;
  enrolledAt: string;
}

@Injectable({ providedIn: 'root' })
export class EnrollmentService {
  private readonly http = inject(HttpClient);
  private readonly base = '/api/enrollments';

  subscribe(req: SubscribeRequest): Observable<EnrollmentResponse> {
    return this.http.post<EnrollmentResponse>(`${this.base}/subscribe`, req);
  }

  getByUser(userId: number): Observable<EnrollmentResponse[]> {
    return this.http.get<EnrollmentResponse[]>(`${this.base}/user/${userId}`);
  }

  getByCourse(courseId: string): Observable<EnrollmentResponse[]> {
    return this.http.get<EnrollmentResponse[]>(`${this.base}/course/${courseId}`);
  }
}