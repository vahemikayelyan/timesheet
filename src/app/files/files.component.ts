import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatListModule, MatListOption } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { FilesService } from './files.service';

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

  constructor(private filesService: FilesService) {}

  ngOnInit() {
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

      this.filesService.uploadFiles(formData).subscribe(() => {
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
    this.filesService.getFiles().subscribe((response: any) => {
      this.uploadedFiles = response.files;
    });
  }

  deleteFiles(selectedFiles: MatListOption[]) {
    const files = selectedFiles?.map((f) => f.value);
    this.filesService.deleteFiles(files).subscribe((response) => {
      this.getFiles();
    });
  }
}
