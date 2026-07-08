import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import Swal from 'sweetalert2';
import { AuthService } from '../../core/services/auth.service';
import { ModalAvisoPrivacidad } from '../../shared/aviso-privacidad/aviso-privacidad';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, ModalAvisoPrivacidad],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  readonly cargando = signal(false);
  readonly mostrarModalAviso = signal(false);

  readonly opcionesGenero = [
    { value: 'masculino', label: 'Masculino' },
    { value: 'femenino', label: 'Femenino' },
    { value: 'otro', label: 'Otro' },
    { value: 'prefiero_no_decir', label: 'Prefiero no decir' },
  ];

  readonly form = this.fb.group({
    nombres: ['', [Validators.required, Validators.minLength(2)]],
    apellidos: ['', [Validators.required, Validators.minLength(2)]],
    correo: ['', [Validators.required, Validators.email]],
    fecha_nacimiento: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    genero: [''],
    telefono: [''],
    ciudad_residencia: [''],
    aceptaAviso: [false, [Validators.requiredTrue]],
  });

  readonly mostrarPassword = signal(false);

  toggleMostrarPassword(): void {
    this.mostrarPassword.update((valor) => !valor);
  }

  get nombres() { return this.form.controls.nombres; }
  get apellidos() { return this.form.controls.apellidos; }
  get correo() { return this.form.controls.correo; }
  get fecha_nacimiento() { return this.form.controls.fecha_nacimiento; }
  get password() { return this.form.controls.password; }
  get aceptaAviso() { return this.form.controls.aceptaAviso; }

  abrirModalAviso(event: Event): void {
    event.preventDefault();
    this.mostrarModalAviso.set(true);
  }

  cerrarModalAviso(): void {
    this.mostrarModalAviso.set(false);
  }

  aceptarDesdeModal(): void {
    this.form.controls.aceptaAviso.setValue(true);
    this.mostrarModalAviso.set(false);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.cargando.set(true);

    const payload = this.form.getRawValue();

    this.authService
      .registrar({
        nombres: payload.nombres!,
        apellidos: payload.apellidos!,
        correo: payload.correo!,
        fecha_nacimiento: payload.fecha_nacimiento!,
        password: payload.password!,
        ...(payload.genero && { genero: payload.genero }),
        ...(payload.telefono && { telefono: payload.telefono }),
        ...(payload.ciudad_residencia && { ciudad_residencia: payload.ciudad_residencia }),
      })
      .subscribe({
        next: () => {
          this.cargando.set(false);
          Swal.fire({
            icon: 'success',
            title: '¡Cuenta creada!',
            text: 'Tu cuenta se registró correctamente. Ahora inicia sesión.',
            confirmButtonColor: '#6366f1',
            background: '#18181b',
            color: '#fff',
          }).then(() => {
            this.router.navigate(['/login']);
          });
        },
        error: (err) => {
          this.cargando.set(false);
          Swal.fire({
            icon: 'error',
            title: 'No se pudo registrar',
            text: err?.error?.message || 'Ocurrió un error. Intenta de nuevo.',
            confirmButtonColor: '#6366f1',
            background: '#18181b',
            color: '#fff',
          });
        },
      });
  }
}
