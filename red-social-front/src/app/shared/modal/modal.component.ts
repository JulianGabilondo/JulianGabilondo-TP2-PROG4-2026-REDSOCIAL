import { Component, input, output } from '@angular/core';

// Datos que necesita el modal. Si "datos" es null, el modal no se muestra.
export interface ModalDatos {
  titulo: string;
  mensaje: string;
  tipo: 'exito' | 'error' | 'info';
}

// SPRINT 1: modal reutilizable. El enunciado prohíbe alert(), se usa este componente.
@Component({
  selector: 'app-modal',
  standalone: true,
  templateUrl: './modal.component.html',
})
export class ModalComponent {
  datos = input<ModalDatos | null>(null);
  cerrar = output<void>(); // avisa al padre cuando el usuario cierra el modal
}