import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import Swal from 'sweetalert2';
import { AuthService } from '../../core/services/auth.service';
import { ModalAvisoPrivacidad } from '../../shared/aviso-privacidad/aviso-privacidad';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, ModalAvisoPrivacidad],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  readonly cargando = signal(false);
  readonly mostrarModalAviso = signal(false);
  readonly mostrarPassword = signal(false);

  readonly form = this.fb.group({
    correo: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  get correo() { return this.form.controls.correo; }
  get password() { return this.form.controls.password; }

  abrirModalAviso(event: Event): void {
    event.preventDefault();
    this.mostrarModalAviso.set(true);
  }

  cerrarModalAviso(): void {
    this.mostrarModalAviso.set(false);
  }

  toggleMostrarPassword(): void {
    this.mostrarPassword.update((valor) => !valor);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.cargando.set(true);

    const { correo, password } = this.form.getRawValue();

    this.authService.login({ correo: correo!, password: password! }).subscribe({
      next: (res) => {
        this.cargando.set(false);
        Swal.fire({
          icon: 'success',
          title: '¡Bienvenido de vuelta!',
          text: 'Iniciaste sesión correctamente.',
          confirmButtonColor: '#6366f1',
          background: '#18181b',
          color: '#fff',
          timer: 1500,
          showConfirmButton: false,
        }).then(() => {
          if (res.rol === 'admin' || res.rol === 'moderador') {
            this.router.navigate(['/admin']);
          } else {
            this.router.navigate(['/']);
          }
        });
      },
      error: (err) => {
        this.cargando.set(false);
        Swal.fire({
          icon: 'error',
          title: 'No se pudo iniciar sesión',
          text: err?.error?.message || 'Correo o contraseña incorrectos.',
          confirmButtonColor: '#6366f1',
          background: '#18181b',
          color: '#fff',
        });
      },
    });
  }
}
