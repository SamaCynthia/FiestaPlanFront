import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function edadMinimaValidator(edadMinima: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;

    const hoy = new Date();
    const nacimiento = new Date(control.value);

    if (nacimiento > hoy) {
      return { fechaFutura: true };
    }

    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const diferenciaMes = hoy.getMonth() - nacimiento.getMonth();
    if (diferenciaMes < 0 || (diferenciaMes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }

    return edad < edadMinima ? { edadMinima: true } : null;
  };
}
