import { HttpErrorResponse } from '@angular/common/http';

// SPRINT 1: convierte un error HTTP en un texto claro para mostrar en el modal.
// El back (class-validator) puede devolver "message" como string o como array de strings.
export function mensajeError(err: HttpErrorResponse): string {
  // status 0 = el navegador no pudo comunicarse con el servidor
  if (err.status === 0) {
    return 'No se pudo conectar con el servidor. Intentá de nuevo en unos segundos.';
  }
  const mensaje = err.error?.message;
  if (Array.isArray(mensaje)) return mensaje.join('\n');
  return mensaje ?? 'Ocurrió un error inesperado. Intentá nuevamente.';
}