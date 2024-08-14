import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { SnackbarService } from '../service/snackbar.service';
import { UserService } from '../service/user.service';
import { GlobalConstants } from '../shared/global-constants';
import { SignupComponent } from '../signup/signup.component';
import { jwtDecode } from 'jwt-decode';

interface JwtPayload {
  role: string;
}

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  hide = true;
  passwordVisible = false;
  loginForm!: FormGroup;
  responseMessage: any;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private userService: UserService,
    private snackBarService: SnackbarService,
    public dialogRef: MatDialogRef<LoginComponent>,
    private ngxService: NgxUiLoaderService,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.loginForm = this.formBuilder.group({
      email: [null, [Validators.required, Validators.pattern(GlobalConstants.emailRegex)]],
      password: [null, [Validators.required]]
    });
  }

  handleSubmit() {
    if (this.loginForm.invalid) {
      this.snackBarService.openSnackBar("Formulário inválido", GlobalConstants.error);
      return;
    }

    this.ngxService.start();
    let formData = this.loginForm.value;
    let data = {
      email: formData.email,
      password: formData.password
    };

    this.userService.login(data).subscribe({
      next: (response: any) => {
        this.ngxService.stop();
        this.dialogRef.close();
        localStorage.setItem('token', response.token);
        this.snackBarService.openSuccessSnackBar("Login bem-sucedido!");
        const decodedToken = jwtDecode<JwtPayload>(response.token);
        const role = decodedToken.role;

        if (role === 'admin') {
          this.router.navigate(['/admin/adminDashboard']);
        } else if (role === 'user') {
          this.router.navigate(['/user/userDashboard']);
        }
      },
      error: (error) => {
        this.ngxService.stop();
        this.responseMessage = error.error?.message || GlobalConstants.genericError;
        this.snackBarService.openSnackBar(this.responseMessage, GlobalConstants.error);
      }
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

  openSignupDialog(): void {
    const dialogRef = this.dialog.open(SignupComponent, {
      width: '400px'
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }


  onClose(): void {
    this.dialogRef.close();
  }
}
