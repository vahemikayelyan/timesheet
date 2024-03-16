import { Component } from '@angular/core';
import { FilesService } from '../files/files.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent {
  constructor(private filesService: FilesService) {}

  ngOnInit() {
    this.filesService.getExcelSheets().subscribe((response) => {
      console.log(response);
    });
  }
}
