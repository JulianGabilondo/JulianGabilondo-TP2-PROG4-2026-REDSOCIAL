import { Directive, ElementRef, OnDestroy, OnInit, Renderer2, inject, input, numberAttribute } from '@angular/core';
import { NgControl } from '@angular/forms';
import { Subscription } from 'rxjs';

// SPRINT 4: directiva propia 2/3. Agrega debajo de un input o textarea un contador de caracteres
// ("12/100") que se pone rojo si se supera el máximo.
@Directive({ selector: '[appLimiteCaracteres]', standalone: true })
export class LimiteCaracteresDirective implements OnInit, OnDestroy {
  appLimiteCaracteres = input.required({ transform: numberAttribute });

  private elemento = inject<ElementRef<HTMLInputElement | HTMLTextAreaElement>>(ElementRef);
  private renderer = inject(Renderer2);
  private control = inject(NgControl, { optional: true, self: true });

  private contador?: HTMLElement;
  private suscripcion?: Subscription;
  private quitarEscucha?: () => void;

  ngOnInit() {
    const host = this.elemento.nativeElement;

    // Crea el contador justo después del campo
    this.contador = this.renderer.createElement('small');
    this.renderer.addClass(this.contador, 'contador-caracteres');
    this.renderer.insertBefore(host.parentNode, this.contador, host.nextSibling);
    this.actualizar();

    // Se actualiza al escribir y también cuando el formulario cambia el valor por código (reset)
    this.quitarEscucha = this.renderer.listen(host, 'input', () => this.actualizar());
    this.suscripcion = this.control?.valueChanges?.subscribe(() => this.actualizar());
  }

  ngOnDestroy() {
    this.quitarEscucha?.();
    this.suscripcion?.unsubscribe();
    this.contador?.remove();
  }

  private actualizar() {
    if (!this.contador) return;
    const largo = this.elemento.nativeElement.value.length;
    const maximo = this.appLimiteCaracteres();

    this.contador.textContent = `${largo}/${maximo}`;
    if (largo > maximo) {
      this.renderer.addClass(this.contador, 'excedido');
    } else {
      this.renderer.removeClass(this.contador, 'excedido');
    }
  }
}