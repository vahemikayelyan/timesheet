import { Component, ViewChild } from '@angular/core';
import { FilesService, SheetRow } from '../files/files.service';
import { CommonModule } from '@angular/common';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';

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
  selectedStaff: string = this.all;
  selectedDiscipline: string = this.all;
  accordionDataSource: { staff: string; rows: SheetRow[] }[] = [];
  tableDataSource = new MatTableDataSource<SheetRow>();
  @ViewChild(MatPaginator) paginator?: MatPaginator;
  @ViewChild(MatSort) sort?: MatSort;

  constructor(private filesService: FilesService) {}

  ngOnInit() {
    this.filesService.getExcelSheets().subscribe((response) => {
      response.forEach((excelSheet) => {
        if (!this.displayedColumns.length) {
          this.displayedColumns = Object.keys(excelSheet.rows[0]);
        }
        this.rowData.push(...excelSheet.rows);
      });

      this.tableDataSource.data = this.rowData;

      this.rowData.forEach((row) => {
        const staffData = this.accordionDataSource.find(
          (item) => item.staff === row.Staff
        );

        if (staffData) {
          staffData.rows.push(row);
        } else {
          this.accordionDataSource.push({ staff: row.Staff, rows: [row] });
        }

        if (!this.disciplines.includes(row.Discipline)) {
          this.disciplines.push(row.Discipline);
        }
      });
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
        this.selectedStaff === this.all
          ? true
          : row.Staff === this.selectedStaff;
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
}
