import { Component, ViewChild } from '@angular/core';
import { Employee, FilesService, SheetRow } from '../files/files.service';
import { CommonModule } from '@angular/common';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatListModule } from '@angular/material/list';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatTabsModule,
    MatExpansionModule,
    MatSortModule,
    MatInputModule,
    MatSelectModule,
    MatFormFieldModule,
    MatListModule,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent {
  all: string = 'all';
  panelOpenState?: boolean;
  rowData: SheetRow[] = [];
  disciplines: string[] = [];
  displayedColumns: string[] = [];
  selectedEmployee: string = this.all;
  selectedDiscipline: string = this.all;
  employeesDataSource: Employee[] = [];
  tableDataSource = new MatTableDataSource<SheetRow>();
  @ViewChild(MatPaginator) paginator?: MatPaginator;
  @ViewChild(MatSort) sort?: MatSort;

  constructor(private filesService: FilesService) {}

  ngOnInit() {
    this.filesService.getExcelSheets().subscribe((response) => {
      response.data.forEach((excelSheet) => {
        if (!this.displayedColumns.length) {
          this.displayedColumns = Object.keys(excelSheet.rows[0]);
        }
        this.rowData.push(...excelSheet.rows);
      });

      this.tableDataSource.data = this.rowData;
      this.setEmployeeLogs(response.employees);
    });
  }

  ngAfterViewInit() {
    if (this.paginator) {
      this.tableDataSource.paginator = this.paginator;
    }
    if (this.sort) {
      this.tableDataSource.sort = this.sort;
    }
  }

  handleFilterChange(filter?: string) {
    if (filter === 'staff' && this.selectedDiscipline !== this.all) {
      this.selectedDiscipline = this.all;
    }

    this.tableDataSource.data = this.rowData.filter((row) => {
      const isStaffTrue: boolean =
        this.selectedEmployee === this.all
          ? true
          : row.Staff === this.selectedEmployee;
      const isDisciplineTrue: boolean =
        this.selectedDiscipline === this.all
          ? true
          : row.Discipline === this.selectedDiscipline;

      return isStaffTrue && isDisciplineTrue;
    });

    if (filter === 'staff') {
      this.setDisciplines();
    }
  }

  setDisciplines() {
    this.disciplines = [];
    this.tableDataSource.data.forEach((row) => {
      if (!this.disciplines.includes(row.Discipline)) {
        this.disciplines.push(row.Discipline);
      }
    });
  }

  setEmployeeLogs(employees: Employee[]) {
    this.rowData.forEach((row) => {
      const employeeData = this.employeesDataSource.find(
        (e) => e.LOGIN_INITIALS === row.Staff
      );

      row.weekNo = this.getWeekNumber(row.Date);

      if (employeeData) {
        employeeData.logs.push(row);
      } else {
        const employee = employees.find((e) => e.LOGIN_INITIALS === row.Staff);
        this.employeesDataSource.push({
          ...employee,
          LOGIN_INITIALS: row.Staff,
          logs: [row],
        });
      }

      if (!this.disciplines.includes(row.Discipline)) {
        this.disciplines.push(row.Discipline);
      }
    });

    this.checkEmployeeLogs();
  }

  checkEmployeeLogs() {
    this.employeesDataSource.forEach((employee) => {
      const discipline = (employee.DISCIPLINE || '').toUpperCase();
      this.sortLogsByDate(employee.logs);

      employee.errors = [];
      employee.logs.forEach((log, i) => {
        const duration = log.Duration.split(':');
        const hours = Number(duration[0]);
        const minutes = Number(duration[1]);

        if (discipline && discipline === 'LVN') {
          if (!hours && minutes < 45) {
            employee.errors?.push(
              `A ${minutes} minutes log was detected on ${log.Date}.`
            );
          }

          if (i > 0) {
            const preWeekNo = Number(employee.logs[i - 1].weekNo);
            const weekNo = Number(log.weekNo);

            if (weekNo - preWeekNo > 1) {
              for (let i = preWeekNo + 1; i < weekNo; i++) {
                employee.errors?.push(`There is no log for week ${i}`);
              }
            }
          }
        }

        if (i === 0) {
          employee.firstLog = log.Date;
        } else if (i === employee.logs.length - 1) {
          employee.lastLog = log.Date;
        }
      });
    });
  }

  sortLogsByDate(logs?: SheetRow[]): void {
    logs?.sort((a, b) => {
      const dateA: Date = new Date(a.Date);
      const dateB: Date = new Date(b.Date);

      // Descending order comparison
      return dateA.getTime() - dateB.getTime();
    });
  }

  getWeekNumber(dateString: string): number {
    let d = new Date(dateString);
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil(
      ((d.valueOf() - yearStart.valueOf()) / 86400000 + 1) / 7
    );

    return weekNo;
  }
}
