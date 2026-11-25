import { Pipe, PipeTransform } from '@angular/core';

// SPRINT 4: pipe propia 3/3. Recorta un texto largo y le agrega "…" al final.
@Pipe({ name: 'recortar', standalone: true })
export class RecortarPipe implements PipeTransform {
  transform(texto: string | null | undefined, maximo = 30, sufijo = '…'): string {
    if (!texto) return '';
    return texto.length <= maximo ? texto : texto.slice(0, maximo).trimEnd() + sufijo;
  }
}