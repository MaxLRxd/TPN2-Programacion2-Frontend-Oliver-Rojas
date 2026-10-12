import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';
import { CoberturaService } from '../../services/cobertura';
import { Cobertura } from '../../models/cobertura';

@Component({
  selector: 'app-registro',
  imports: [ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule],
  templateUrl: './registro.html',
  styleUrl: './registro.css',
})
export class Registro implements OnInit {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private coberturaService = inject(CoberturaService);
  private router = inject(Router);

  form: FormGroup = this.fb.group({
    nombre: ['', Validators.required],
    apellido: ['', Validators.required],
    dni: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
    fechaNacimiento: ['', Validators.required],
    coberturaId: ['', Validators.required],
  });

  coberturas: Cobertura[] = [];
  error = '';
  success = '';

  ngOnInit(): void {
    this.coberturaService.obtenerCoberturas().subscribe({
      next: (c) => (this.coberturas = c),
      error: () => (this.error = 'No se pudieron cargar las coberturas'),
    });
  }

  onSubmit() {
    if (this.form.invalid) return;
    this.error = '';
    this.success = '';
    this.auth.registro(this.form.value).subscribe({
      next: () => {
        this.success = 'Registro exitoso. Redirigiendo al login...';
        setTimeout(() => this.router.navigate(['/login']), 1000);
      },
      error: (e) => {
        this.error = e.error?.mensaje || 'Error en el registro';
      },
    });
  }
}

