import { Injectable } from '@angular/core';
import { HttpClient, HttpRequest, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FilesService {
  private baseUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  upload(file: File): Observable<HttpEvent<any>> {
    const formData: FormData = new FormData();

    formData.append('file', file);

    const req = new HttpRequest('POST', `${this.baseUrl}/upload`, formData, {
      responseType: 'json',
    });

    return this.http.request(req);
  }

  getFiles(): Observable<any> {
    return this.http.get(`${this.baseUrl}/files`);
  }

  getExcelSheets(): Observable<ExcellSheet[]> {
    return this.http.get<ExcellSheet[]>(`${this.baseUrl}/read-excel`);
  }
}

export interface ExcellSheet {
  name: string;
  rows: SheetRow[];
}

export interface SheetRow {
  Module: string;
  Date: string;
  Time: string;
  Duration: string;
  Staff: string;
  Discipline: string;
  Type: string;
  Level: string;
  Status: string;
}
