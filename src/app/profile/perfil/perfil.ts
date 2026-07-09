import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import Swal from 'sweetalert2';
import { PerfilUsuario, UsersService } from '../../core/services/users.service';
import { buildDiffPayload } from '../../core/utils/build-diff-payload';
import { Navbar } from '../../shared/navbar/navbar';

// Whitelist estricta: únicamente estos campos pueden editarse desde este formulario.
// nombres y apellidos quedan deliberadamente fuera: son de solo lectura.
const CAMPOS_EDITABLES = ['foto_perfil_url', 'telefono', 'ciudad_residencia'] as const;

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, Navbar],
  templateUrl: './perfil.html',
  styleUrl: './perfil.css'
})
export class Perfil implements OnInit {
  private fb = inject(FormBuilder);
  private usersService = inject(UsersService);

  readonly cargando = signal(true);
  readonly guardando = signal(false);
  readonly perfilActual = signal<PerfilUsuario | null>(null);
  readonly mostrarPassword = signal(false);

  private snapshotOriginal: Record<string, string> = {};

  readonly form = this.fb.group({
    foto_perfil_url: ['', [Validators.maxLength(255), Validators.pattern(/^https?:\/\/.+$/i)]],
    telefono: ['', [Validators.maxLength(15), Validators.pattern(/^[0-9+() -]*$/)]],
    ciudad_residencia: ['', [Validators.maxLength(100), Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s,.-]*$/)]],
    passwordNueva: ['', [Validators.minLength(8)]],
    passwordConfirmar: [''],
  }, { validators: this.passwordsCoinciden });

  private passwordsCoinciden(group: any) {
    const nueva = group.get('passwordNueva')?.value;
    const confirmar = group.get('passwordConfirmar')?.value;
    if (!nueva && !confirmar) return null; // ninguna se está cambiando, ok
    if (nueva !== confirmar) return { passwordsNoCoinciden: true };
    return null;
  }

  ngOnInit(): void {
    this.cargarPerfil();
  }

  cargarPerfil(): void {
    this.cargando.set(true);
    this.usersService.obtenerPerfil().subscribe({
      next: (perfil) => {
        this.perfilActual.set(perfil);

        const valores = {
          foto_perfil_url: perfil.foto_perfil_url ?? '',
          telefono: perfil.telefono ?? '',
          ciudad_residencia: perfil.ciudad_residencia ?? '',
        };

        this.form.patchValue(valores);
        this.form.patchValue({ passwordNueva: '', passwordConfirmar: '' });
        this.snapshotOriginal = { ...valores };
        this.cargando.set(false);
      },
      error: () => {
        this.cargando.set(false);
        Swal.fire({
          icon: 'error',
          title: 'No se pudo cargar tu perfil',
          text: 'Inicia sesión nuevamente.',
          confirmButtonColor: '#6366f1',
          background: '#18181b',
          color: '#fff',
        });
      },
    });
  }

  get foto_perfil_url() { return this.form.controls.foto_perfil_url; }
  get telefono() { return this.form.controls.telefono; }
  get ciudad_residencia() { return this.form.controls.ciudad_residencia; }
  get passwordNueva() { return this.form.controls.passwordNueva; }
  get passwordConfirmar() { return this.form.controls.passwordConfirmar; }

  toggleMostrarPassword(): void {
    this.mostrarPassword.update((v) => !v);
  }

  get hayCambios(): boolean {
    const actual = this.form.getRawValue();
    const cambioEnCamposNormales = CAMPOS_EDITABLES.some(
      (campo) => (this.snapshotOriginal[campo] ?? '') !== (actual[campo] ?? ''),
    );
    const cambioDePassword = !!actual.passwordNueva;
    return cambioEnCamposNormales || cambioDePassword;
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (!this.hayCambios) {
      Swal.fire({
        icon: 'info',
        title: 'Sin cambios',
        text: 'No modificaste ningún dato.',
        confirmButtonColor: '#6366f1',
        background: '#18181b',
        color: '#fff',
      });
      return;
    }

    const actual = this.form.getRawValue() as Record<string, string>;

    // Diff estricto de los campos normales (whitelist)
    const payload = buildDiffPayload(
      this.snapshotOriginal,
      actual,
      [...CAMPOS_EDITABLES],
    );

    // La contraseña se maneja aparte: no tiene "valor original" comparable
    // (nunca se lee del backend en texto plano), así que se agrega solo si el usuario escribió una nueva
    if (actual['passwordNueva']) {
      payload['password'] = actual['passwordNueva'];
    }

    this.guardando.set(true);

    this.usersService.actualizarPerfil(payload).subscribe({
      next: () => {
        this.guardando.set(false);
        Swal.fire({
          icon: 'success',
          title: 'Perfil actualizado',
          text: 'Tus datos se guardaron correctamente.',
          confirmButtonColor: '#6366f1',
          background: '#18181b',
          color: '#fff',
          timer: 1500,
          showConfirmButton: false,
        });
        this.cargarPerfil();
      },
      error: (err) => {
        this.guardando.set(false);
        Swal.fire({
          icon: 'error',
          title: 'No se pudo actualizar',
          text: err?.error?.message || 'Ocurrió un error. Intenta de nuevo.',
          confirmButtonColor: '#6366f1',
          background: '#18181b',
          color: '#fff',
        });
      },
    });
  }
}
