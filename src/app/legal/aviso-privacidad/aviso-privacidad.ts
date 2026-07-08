import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AvisoPrivacidadContenido } from '../../shared/aviso-privacidad-contenido/aviso-privacidad-contenido';

@Component({
  selector: 'app-aviso-privacidad',
  standalone: true,
  imports: [CommonModule, RouterLink, AvisoPrivacidadContenido],
  templateUrl: './aviso-privacidad.html'
})
export class AvisoPrivacidad {}
