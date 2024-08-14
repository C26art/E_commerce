import { AfterViewInit, Component } from '@angular/core';
import { GlobalConstants } from '../shared/global-constants';
import { DashboardService } from '../service/dashboard.service';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { SnackbarService } from '../service/snackbar.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements AfterViewInit {
  responseMessage: any;
  data: any;

  ngAfterViewInit() { }

  constructor(
    private dashBoardService: DashboardService,
    private ngxService: NgxUiLoaderService,
    private snackBarService: SnackbarService
  ) {
    this.ngxService.start();
    this.dashBoardData();
  }

  dashBoardData() {
    this.dashBoardService.getDetails().subscribe({
      next: (response: any) => {
        this.ngxService.stop();
        this.data = response;
      },
      error: (error: any) => {
        this.ngxService.stop();
        console.log(error);
        if (error.error?.message) {
          this.responseMessage = error.error?.message;
        } else {
          this.responseMessage = GlobalConstants.genericError;
        }
        this.snackBarService.openSnackBar(this.responseMessage, GlobalConstants.error);
      }
    });
  }
}
