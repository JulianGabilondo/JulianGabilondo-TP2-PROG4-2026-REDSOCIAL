import { Pipe, PipeTransform } from '@angular/core';

// SPRINT 4: pipe propia 2/3. Calcula la edad a partir de la fecha de nacimiento
@Pipe({ name: 'edad', standalone: true })
export class EdadPipe implements PipeTransform {
  transform(fechaNacimiento: string | Date | null | undefined): string {
    if (!fechaNacimiento) return '';
    const nacimiento = new Date(fechaNacimiento);
    if (isNaN(nacimiento.getTime())) return '';

    const hoy = new Date();
    // La fecha se guarda a las 00:00 UTC, por eso se leen sus componentes en UTC
    let edad = hoy.getFullYear() - nacimiento.getUTCFullYear();
    const todaviaNoCumplio =
      hoy.getMonth() < nacimiento.getUTCMonth() ||
      (hoy.getMonth() === nacimiento.getUTCMonth() && hoy.getDate() < nacimiento.getUTCDate());
    if (todaviaNoCumplio) edad--;

    return `${edad} ${edad === 1 ? 'año' : 'años'}`;
  }
}