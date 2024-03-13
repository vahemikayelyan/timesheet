import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent {
  constructor(private http: HttpClient) {}

  testApi(): void {
    this.http.get('/test').subscribe((response) => {
      //console.log(response);
    });
  }
}
