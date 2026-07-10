import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import Swal from 'sweetalert2';
import { AuthService } from '../../core/services/auth.service';
import { ModalAvisoPrivacidad } from '../../shared/aviso-privacidad/aviso-privacidad';
import { edadMinimaValidator } from '../../core/validators/edad-minima.validator';

// Exige que la primera letra sea mayúscula; el resto puede incluir letras y espacios
// (permite nombres compuestos como "Juan Carlos" o ciudades como "Ciudad de México")
// Cada palabra (separada por espacios) debe iniciar con mayúscula
const CADA_PALABRA_CON_MAYUSCULA = /^[A-ZÀ-Ý][a-zA-ZÀ-ÿñÑ]*(\s[A-ZÀ-Ý][a-zA-ZÀ-ÿñÑ]*)*$/;
const TELEFONO_10_DIGITOS = /^[0-9]{10}$/;
const PASSWORD_SEGURA = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/;

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
  readonly mostrarPassword = signal(false);

  readonly opcionesGenero = [
    { value: 'masculino', label: 'Masculino' },
    { value: 'femenino', label: 'Femenino' },
    { value: 'otro', label: 'Otro' },
    { value: 'prefiero_no_decir', label: 'Prefiero no decir' },
  ];

  readonly form = this.fb.group({
    nombres: [
      '',
      [Validators.required, Validators.minLength(2), Validators.maxLength(100), Validators.pattern(CADA_PALABRA_CON_MAYUSCULA)],
    ],
    apellidos: [
      '',
      [Validators.required, Validators.minLength(2), Validators.maxLength(100), Validators.pattern(CADA_PALABRA_CON_MAYUSCULA)],
    ],
    correo: ['', [Validators.required, Validators.email, Validators.maxLength(255)]],
    fecha_nacimiento: ['', [Validators.required, edadMinimaValidator(13)]],
    password: [
      '',
      [Validators.required, Validators.minLength(8), Validators.maxLength(72), Validators.pattern(PASSWORD_SEGURA)],
    ],
    genero: [''],
    telefono: ['', [Validators.pattern(TELEFONO_10_DIGITOS)]],
    ciudad_residencia: ['', [Validators.minLength(2), Validators.maxLength(100), Validators.pattern(CADA_PALABRA_CON_MAYUSCULA)]],
    aceptaAviso: [false, [Validators.requiredTrue]],
  });

  get nombres() { return this.form.controls.nombres; }
  get apellidos() { return this.form.controls.apellidos; }
  get correo() { return this.form.controls.correo; }
  get fecha_nacimiento() { return this.form.controls.fecha_nacimiento; }
  get password() { return this.form.controls.password; }
  get telefono() { return this.form.controls.telefono; }
  get ciudad_residencia() { return this.form.controls.ciudad_residencia; }
  get aceptaAviso() { return this.form.controls.aceptaAviso; }

  get passwordTieneLongitud(): boolean {
    const valor = this.password.value || '';
    return valor.length >= 8 && valor.length <= 72;
  }

  get passwordTieneMayuscula(): boolean {
    return /[A-Z]/.test(this.password.value || '');
  }

  get passwordTieneMinuscula(): boolean {
    return /[a-z]/.test(this.password.value || '');
  }

  get passwordTieneNumero(): boolean {
    return /\d/.test(this.password.value || '');
  }

  toggleMostrarPassword(): void {
    this.mostrarPassword.update((valor) => !valor);
  }

  // Bloquea en tiempo real cualquier carácter que no sea dígito, y limita a 10
  soloNumeros(event: Event): void {
    const input = event.target as HTMLInputElement;
    const limpio = input.value.replace(/\D/g, '').slice(0, 10);
    if (input.value !== limpio) {
      this.form.controls.telefono.setValue(limpio, { emitEvent: false });
    }
  }

  // Capitaliza automáticamente la primera letra de CADA palabra mientras el usuario escribe
  // (nombres compuestos, segundo apellido, ciudades con varias palabras)
  capitalizarPrimeraLetra(controlName: 'nombres' | 'apellidos' | 'ciudad_residencia', event: Event): void {
    const input = event.target as HTMLInputElement;
    const posicionCursor = input.selectionStart;
    const valor = input.value;

    const capitalizado = valor
      .split(' ')
      .map((palabra) => (palabra.length > 0 ? palabra.charAt(0).toUpperCase() + palabra.slice(1) : palabra))
      .join(' ');

    if (capitalizado !== valor) {
      this.form.controls[controlName].setValue(capitalizado, { emitEvent: false });
      // Restaura la posición del cursor para que no salte al final del texto
      queueMicrotask(() => input.setSelectionRange(posicionCursor, posicionCursor));
    }
  }

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
