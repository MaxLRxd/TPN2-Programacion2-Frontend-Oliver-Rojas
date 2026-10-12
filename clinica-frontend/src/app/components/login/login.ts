import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  form: FormGroup = this.fb.group({
    dni: ['', Validators.required],
    password: ['', Validators.required],
  });
  error = '';

  onSubmit() {
    if (this.form.invalid) return;
    this.error = '';
    this.auth.login(this.form.value).subscribe({
      next: () => {
        this.router.navigate(['/']);
      },
      error: (e) => {
        this.error = e.error?.mensaje || 'Error al iniciar sesión';
      },
    });
  }
}

