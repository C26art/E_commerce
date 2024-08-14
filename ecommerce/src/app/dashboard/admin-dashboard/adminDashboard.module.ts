import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FlexLayoutModule } from '@angular/flex-layout';
import { RouterModule } from '@angular/router';
import { MaterialModule } from '../../material-component/material.module';
import { AdminDashboardComponent } from './admin-dashboard.component';





@NgModule({

  imports: [
    CommonModule,
    MaterialModule,
    FlexLayoutModule,
    RouterModule.forChild([
      { path: '', component: AdminDashboardComponent }
    ])
  ]
})
export class AdminDashboardModule { }
