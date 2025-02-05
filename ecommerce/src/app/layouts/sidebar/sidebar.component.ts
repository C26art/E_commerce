import { MediaMatcher } from '@angular/cdk/layout';
import { ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import { jwtDecode } from 'jwt-decode';
import { MenuItems } from '../../shared/menu-items';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnDestroy {
  mobileQuery: MediaQueryList;
  userRole: any;
  token: any = localStorage.getItem('token');
  tokenPayLoad: any;

  private _mobileQueryListener: () => void;

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private media: MediaMatcher,
    public menuItems: MenuItems
  ) {
    this.tokenPayLoad = jwtDecode(this.token);
    this.userRole = this.tokenPayLoad?.role;
    this.mobileQuery = this.media.matchMedia('(min-width: 768px)');
    this._mobileQueryListener = () => this.changeDetectorRef.detectChanges();
    this.mobileQuery.addEventListener('change', this._mobileQueryListener);
  }

  ngOnDestroy(): void {
    this.mobileQuery.removeEventListener('change', this._mobileQueryListener);
  }
}
