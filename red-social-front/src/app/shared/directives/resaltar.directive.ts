import { Directive, ElementRef, inject, input } from '@angular/core';

// SPRINT 4: directiva propia 3/3. Resalta el elemento con un color de fondo cuando el mouse pasa por encima.
@Directive({
  selector: '[appResaltar]',
  standalone: true,
  host: {
    '(mouseenter)': 'resaltar(true)',
    '(mouseleave)': 'resaltar(false)',
  },
})
export class ResaltarDirective {
  appResaltar = input('');
  private elemento = inject<ElementRef<HTMLElement>>(ElementRef);

  resaltar(activo: boolean) {
    const color = this.appResaltar() || '#eef2ff';
    this.elemento.nativeElement.style.backgroundColor = activo ? color : '';
  }
}