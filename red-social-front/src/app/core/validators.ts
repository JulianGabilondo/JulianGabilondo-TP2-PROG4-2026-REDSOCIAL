import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

// SPRINT 1: la contraseña necesita al menos una mayúscula y un número.
// (El mínimo de 8 caracteres se valida con Validators.minLength en cada formulario.)
export const passwordStrength: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const valor: string = control.value ?? '';
  if (!valor) return null; // si está vacío, de eso se encarga Validators.required

  const errores: ValidationErrors = {};
  if (!/[A-Z]/.test(valor)) errores['sinMayuscula'] = true;
  if (!/[0-9]/.test(valor)) errores['sinNumero'] = true;
  return Object.keys(errores).length ? errores : null;
};

// SPRINT 1: se aplica sobre el FormGroup para comprobar que dos campos coincidan
// (contraseña y repetir contraseña). Marca el error "noCoinciden" en el grupo.
export function camposIguales(campo: string, repetir: string): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const a = group.get(campo)?.value;
    const b = group.get(repetir)?.value;
    return a === b ? null : { noCoinciden: true };
  };
}

// SPRINT 1: la fecha de nacimiento no puede ser futura
export const fechaNoFutura: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  if (!control.value) return null;
  return new Date(control.value) > new Date() ? { fechaFutura: true } : null;
};