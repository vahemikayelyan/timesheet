import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FilesService {
  private baseUrl = 'http://localhost:3000/api';
  private FILES_API = this.baseUrl + '/files';

  constructor(private http: HttpClient) {}

  uploadFiles(formData: FormData): Observable<any> {
    return this.http.post(this.FILES_API, formData);
  }

  getFiles(): Observable<any> {
    return this.http.get(this.FILES_API);
  }

  deleteFiles(files: string[]): Observable<any> {
    return this.http.delete(this.FILES_API, { body: { files } });
  }

  getExcelSheets(): Observable<DashboardResponse> {
    return this.http.get<DashboardResponse>(`${this.baseUrl}/read-excel`);
  }
}

export interface DashboardResponse {
  data: ExcellSheet[];
  employees: Employee[];
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
  weekNo?: number;
}

export interface Employee {
  NAME?: string;
  LOGIN_INITIALS?: string;
  ACCESS_LEVEL?: string;
  DISCIPLINE?: string;
  PHONE?: string;
  LICENSE?: string;
  EMAIL?: string;
  logs: SheetRow[];
  errors?: string[];
  firstLog?: string;
  lastLog?: string;
}
