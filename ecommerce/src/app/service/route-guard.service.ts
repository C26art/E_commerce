import { Injectable } from '@angular/core';
import { Router, ActivatedRouteSnapshot } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { GlobalConstants } from '../shared/global-constants';
import { AuthService } from './auth.service';
import { SnackbarService } from './snackbar.service';

@Injectable({
  providedIn: 'root'
})
export class RouteGuardService {

  constructor(
    private auth: AuthService,
    private router: Router,
    private snackBarService: SnackbarService
  ) { }

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const expectedRoleArray = route.data['expectedRole'];

    const token: any = localStorage.getItem('token');
    let tokenPayLoad: any;

    try {
      tokenPayLoad = jwtDecode(token);
    } catch (err) {
      localStorage.clear();
      this.router.navigate(['/']);
      return false;
    }

    const expectedRole = expectedRoleArray.find((role: string) => role === tokenPayLoad.role);

    if (tokenPayLoad.role === 'user' || tokenPayLoad.role === 'admin') {
      if (this.auth.isAuthenticated() && tokenPayLoad.role === expectedRole) {
        return true;
      }
      this.snackBarService.openSnackBar(GlobalConstants.unauthorized, GlobalConstants.error);
      this.router.navigate(['/ecommerce/dashboard']);
      return false;
    } else {
      this.router.navigate(['/']);
      localStorage.clear();
      return false;
    }
  }
}
