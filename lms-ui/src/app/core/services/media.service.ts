import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpEvent, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface UploadResponse {
  key: string;
  bucket: string;
  originalFilename: string;
  sizeBytes: number;
  contentType: string;
}

export interface PresignedUrlResponse {
  url: string;
  key: string;
  expiresAt: string;
}

@Injectable({ providedIn: 'root' })
export class MediaService {
  private readonly http = inject(HttpClient);
  private readonly base = 'http://localhost:8080/api/media';

  upload(file: File): Observable<HttpEvent<UploadResponse>> {
    const formData = new FormData();
    formData.append('file', file);
    const req = new HttpRequest('POST', `${this.base}/upload`, formData, {
      reportProgress: true,
    });
    return this.http.request<UploadResponse>(req);
  }

  presignedUrl(key: string, expiresInMinutes = 60): Observable<PresignedUrlResponse> {
    return this.http.get<PresignedUrlResponse>(`${this.base}/presigned`, {
      params: { key, expiresInMinutes: expiresInMinutes.toString() },
    });
  }
}