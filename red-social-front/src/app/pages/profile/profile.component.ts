import { DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';

// SPRINT 1: pantalla Mi Perfil con los datos del usuario logueado.
@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [DatePipe, RouterLink],
  templateUrl: './profile.component.html',
})
export class ProfileComponent {
  auth = inject(AuthService);
}