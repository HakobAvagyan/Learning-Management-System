import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface UserProfile {
  id: number;
  username: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  roles: string[];
  enabled: boolean;
  createdAt: string;
}

export interface UserPage {
  content: UserProfile[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly base = 'http://localhost:8080/api/users';

  getMe(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.base}/me`);
  }

  updateMe(req: UpdateProfileRequest): Observable<UserProfile> {
    return this.http.put<UserProfile>(`${this.base}/me`, req);
  }

  changePassword(req: ChangePasswordRequest): Observable<void> {
    return this.http.put<void>(`${this.base}/me/password`, req);
  }

  listUsers(search: string, role: string, page: number, size: number): Observable<UserPage> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (search) params = params.set('search', search);
    if (role)   params = params.set('role', role);
    return this.http.get<UserPage>(this.base, { params });
  }

  updateRoles(id: number, roles: string[]): Observable<UserProfile> {
    return this.http.put<UserProfile>(`${this.base}/${id}/roles`, { roles });
  }

  toggleEnabled(id: number): Observable<UserProfile> {
    return this.http.put<UserProfile>(`${this.base}/${id}/toggle-enabled`, {});
  }

  getById(id: number): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.base}/${id}`);
  }
}