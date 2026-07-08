import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AvisoPrivacidadContenido } from '../aviso-privacidad-contenido/aviso-privacidad-contenido';

@Component({
  selector: 'app-modal-aviso-privacidad',
  standalone: true,
  imports: [CommonModule, AvisoPrivacidadContenido],
  templateUrl: './aviso-privacidad.html',
})
export class ModalAvisoPrivacidad {
  @Input() visible = false;
  @Input() mostrarBotonAceptar = true;

  @Output() cerrar = new EventEmitter<void>();
  @Output() aceptar = new EventEmitter<void>();

  onCerrar(): void {
    this.cerrar.emit();
  }

  onAceptar(): void {
    this.aceptar.emit();
  }
}
