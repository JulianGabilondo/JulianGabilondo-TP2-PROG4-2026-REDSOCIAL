import { Component, input, output } from '@angular/core';

// Datos que necesita el modal. Si "datos" es null, el modal no se muestra.
export interface ModalDatos {
  titulo: string;
  mensaje: string;
  tipo: 'exito' | 'error' | 'info';
  // SPRINT 2: si es true, muestra los botones "Cancelar" y "Confirmar" (para eliminar)
  confirmar?: boolean;
}

// Modal reutilizable. El enunciado prohíbe alert(), se usa este componente.
@Component({
  selector: 'app-modal',
  standalone: true,
  templateUrl: './modal.component.html',
})
export class ModalComponent {
  datos = input<ModalDatos | null>(null);
  cerrar = output<void>(); // el usuario cierra o cancela
  aceptar = output<void>(); // SPRINT 2: el usuario confirma (solo en modo confirmación)
}