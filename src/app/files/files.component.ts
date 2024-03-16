import { Component, ElementRef, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-files',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatListModule, MatButtonModule],
  templateUrl: './files.component.html',
  styleUrl: './files.component.css',
})
export class FilesComponent {
  @ViewChild('fileInput') fileInput?: ElementRef;
  selectedFiles: File[] = [];
  uploadedFiles: string[] = [];

  constructor(private http: HttpClient) {
    this.getFiles();
  }

  onFileSelected(event: any): void {
    this.selectedFiles = event.target.files;
  }

  onUpload(): void {
    if (this.selectedFiles.length) {
      const formData = new FormData();

      for (const file of this.selectedFiles) {
        formData.append('files', file);
      }

      this.http.post('http://localhost:3000/upload', formData).subscribe(() => {
        this.selectedFiles = [];
        this.resetFileInput();
        this.getFiles();
      });
    } else {
      alert('Please select a file.');
    }
  }

  resetFileInput(): void {
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
      this.selectedFiles = [];
    }
  }

  getFiles() {
    this.http.get('http://localhost:3000/files').subscribe((response: any) => {
      console.log(response);
      this.uploadedFiles = response.files;
    });
  }
}
