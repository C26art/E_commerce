import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FlexLayoutModule } from '@angular/flex-layout';

import { RouterModule } from '@angular/router';
import { MaterialModule } from '../../material-component/material.module';
import { UserDashboardComponent } from './user-dashboard.component';




@NgModule({

  imports: [
    CommonModule,
    MaterialModule,
    FlexLayoutModule,
    RouterModule.forChild([
      { path: '', component: UserDashboardComponent }
    ])
  ]
})
export class UserDashboardModule { }
