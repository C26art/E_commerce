import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { FullComponent } from './layouts/full.component';
import { RouteGuardService } from './service/route-guard.service';


const routes: Routes = [
  { path: '', component: HomeComponent },
  {
    path: 'admin',
    component: FullComponent,
    children: [
      {
        path: '',
        redirectTo: '/ecommerce/adminDashboard',
        pathMatch: 'full',
      },
      {
        path: 'adminDashboard',
        loadChildren: () => import('./dashboard/admin-dashboard/adminDashboard.module').then(m => m.AdminDashboardModule),
        canActivate: [RouteGuardService],
        data: {
          expectedRole: ['admin']
        }
      }
    ]
  },
  {
    path: 'user',
    children: [
      {
        path: 'userDashboard',
        loadChildren: () => import('./dashboard/user-dashboard/userDashboard.module').then(m => m.UserDashboardModule),
        canActivate: [RouteGuardService],
        data: {
          expectedRole: ['user']
        }
      }
    ]
  },
  {
    path: 'ecommerce',
    component: FullComponent,
    children: [
      {
        path: '',
        redirectTo: '/ecommerce/dashboard',
        pathMatch: 'full',
      },
      {
        path: '',
        loadChildren:
          () => import('./material-component/material.module').then(m => m.MaterialModule),
          canActivate:[RouteGuardService],
          data:{
            expectedRole: ['admin', 'user']
          }
      },
      {
        path: 'dashboard',
        loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardModule),
        canActivate:[RouteGuardService],
          data:{
            expectedRole: ['admin', 'user']
          }
      }
    ]
  },
  { path: '**', component: HomeComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
