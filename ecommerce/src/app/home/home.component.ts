import { Component, OnInit } from '@angular/core';
import { LoginComponent } from '../login/login.component';
import { MatDialog } from '@angular/material/dialog';
import { SignupComponent } from '../signup/signup.component';
import { Router } from '@angular/router';
import { UserService } from '../service/user.service';
import { ForgotPasswordComponent } from '../forgot-password/forgot-password.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  constructor(public dialog: MatDialog, private router: Router,
    private userService: UserService,) { }

    ngOnInit(): void {
      this.userService.checkToken().subscribe({
        next: (response: any) => {
          if (response && response.role) {
            const role = response.role;
            if (role === 'admin') {
              this.router.navigate(['/admin/adminDashboard']);
            } else if (role === 'user') {
              this.router.navigate(['/user/userDashboard']);
            }
          } else {
            console.log('Resposta de verificação de token não contém role:', response);
          }
        },
        error: (error: any) => {
          console.log('Erro ao verificar token:', error);
        }
      });
    }

  openSignupDialog(): void {
    const dialogRef = this.dialog.open(SignupComponent, {
      width: '400px'
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }

  openLoginDialog(): void {
    const dialogRef = this.dialog.open(LoginComponent, {
      width: '400px'
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }

  openForgotPasswordDialog(): void {
    const dialogRef = this.dialog.open(ForgotPasswordComponent, {
      width: '400px'
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }
}
