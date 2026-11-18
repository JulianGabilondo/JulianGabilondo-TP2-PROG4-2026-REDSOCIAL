import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ModalDatos } from '../shared/modal/modal.component';
import { AuthService } from './auth.service';

const MINUTO = 60 * 1000;

// SPRINT 3: controla el tiempo de la sesión.
// El token vence a los 15 minutos. A los 10 minutos (quedan 5) se muestra un modal que pregunta
// si se quiere extender la sesión; si se acepta, se refresca el token.
// El momento del aviso se calcula con el vencimiento ("exp") del propio token: así funciona
// igual si se inicia sesión o si se recarga la página con la sesión ya iniciada.
@Injectable({ providedIn: 'root' })
export class SessionService {
  private auth = inject(AuthService);
  private router = inject(Router);

  // Modal que se muestra en el layout principal (aviso, o confirmación de sesión extendida)
  aviso = signal<ModalDatos | null>(null);

  private temporizadorAviso?: ReturnType<typeof setTimeout>;
  private temporizadorVencimiento?: ReturnType<typeof setTimeout>;
  private venceEn = 0; // momento exacto (ms) en que vence el token

  // Programa el aviso y el vencimiento según el token guardado
  iniciar(): void {
    this.detener();

    const token = localStorage.getItem('token');
    const exp = token ? this.leerVencimiento(token) : null;
    if (exp === null) return;

    this.venceEn = exp;
    const restante = exp - Date.now();
    if (restante <= 0) {
      this.cerrarSesion();
      return;
    }

    // Aviso 5 minutos antes de vencer (si ya falta menos, se avisa enseguida)
    this.temporizadorAviso = setTimeout(() => this.mostrarAviso(), Math.max(restante - 5 * MINUTO, 0));
    // Si no se extiende, al vencer el token se vuelve al login
    this.temporizadorVencimiento = setTimeout(() => this.cerrarSesion(), restante);
  }

  // El usuario aceptó extender la sesión: se refresca el token y se reinician los tiempos
  extender(): void {
    this.aviso.set(null);
    this.auth.refrescar().subscribe({
      next: () => {
        this.iniciar();
        this.aviso.set({
          titulo: 'Sesión extendida',
          mensaje: 'Tu sesión se renovó por 15 minutos más.',
          tipo: 'exito',
        });
      },
      error: () => this.cerrarSesion(),
    });
  }

  descartarAviso(): void {
    this.aviso.set(null);
  }

  // Cierra la sesión y vuelve al login (botón Salir, token vencido o error 401)
  cerrarSesion(): void {
    this.detener();
    this.aviso.set(null);
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  private mostrarAviso(): void {
    const minutos = Math.max(1, Math.ceil((this.venceEn - Date.now()) / MINUTO));
    this.aviso.set({
      titulo: 'Tu sesión está por vencer',
      mensaje: `Quedan ${minutos} ${minutos === 1 ? 'minuto' : 'minutos'} de sesión. ¿Querés extenderla?`,
      tipo: 'info',
      confirmar: true,
    });
  }

  private detener(): void {
    clearTimeout(this.temporizadorAviso);
    clearTimeout(this.temporizadorVencimiento);
  }

  // Lee el campo "exp" (en segundos) de la payload del JWT y lo pasa a milisegundos
  private leerVencimiento(token: string): number | null {
    try {
      const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(atob(base64));
      return typeof payload.exp === 'number' ? payload.exp * 1000 : null;
    } catch {
      return null;
    }
  }
}