import { Component, ViewChild } from '@angular/core';
import { FilesService, SheetRow } from '../files/files.service';
import { CommonModule } from '@angular/common';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatExpansionModule } from '@angular/material/expansion';

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
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent {
  panelOpenState?: boolean;
  rowData: SheetRow[] = [];
  displayedColumns: string[] = [];
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
}
