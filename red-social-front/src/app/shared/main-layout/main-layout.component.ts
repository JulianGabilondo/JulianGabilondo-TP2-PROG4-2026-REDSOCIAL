import { Component, OnInit, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { SessionService } from '../../core/session.service';
import { ModalComponent } from '../modal/modal.component';

// Contenedor con la barra de navegación para las pantallas internas
@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, ModalComponent],
  templateUrl: './main-layout.component.html',
})
export class MainLayoutComponent implements OnInit {
  auth = inject(AuthService);
  session = inject(SessionService);

  // SPRINT 3: al entrar a las pantallas internas se programa el aviso de sesión (a los 10 minutos)
  ngOnInit() {
    this.session.iniciar();
  }

  salir() {
    this.session.cerrarSesion();
  }
}