import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-solicitar',
  templateUrl: './solicitar.component.html',
  styleUrls: ['./solicitar.component.scss']
})
export class SolicitarComponent implements OnInit {
  usuario: any = null;
  ofertaTurnos: any[] = [];
  ofertaFiltrada: any[] = [];
  misTurnos: any[] = [];

  constructor(private router: Router) {}

  ngOnInit() {
    const rawUser = localStorage.getItem('usuarioActual');
    if (!rawUser) {
      this.router.navigate(['/auth']);
      return;
    }

    this.usuario = JSON.parse(rawUser);
    this.cargarTurnos();
  }

  cargarTurnos() {
    const data = localStorage.getItem('ofertaTurnos');
    this.ofertaTurnos = data ? JSON.parse(data) : [];
    this.ofertaFiltrada = this.ofertaTurnos.filter(t => t.estado === 'disponible');
    this.misTurnos = this.ofertaTurnos.filter(t => t.paciente === this.usuario.nombre);
  }

  reservarTurno(index: number) {
    const turno = this.ofertaFiltrada[index];
    turno.estado = 'reservado';
    turno.paciente = this.usuario.nombre;

    const iGlobal = this.ofertaTurnos.findIndex(t =>
      t.fecha === turno.fecha && t.hora === turno.hora && t.especialidad === turno.especialidad
    );

    this.ofertaTurnos[iGlobal] = turno;
    localStorage.setItem('ofertaTurnos', JSON.stringify(this.ofertaTurnos));

    alert('✅ Turno reservado con éxito.');
    this.cargarTurnos();
  }

  cancelarTurno(index: number) {
    const turno = this.misTurnos[index];
    turno.estado = 'disponible';
    turno.paciente = null;

    const iGlobal = this.ofertaTurnos.findIndex(t =>
      t.fecha === turno.fecha && t.hora === turno.hora && t.especialidad === turno.especialidad
    );

    this.ofertaTurnos[iGlobal] = turno;
    localStorage.setItem('ofertaTurnos', JSON.stringify(this.ofertaTurnos));

    alert('❌ Turno cancelado.');
    this.cargarTurnos();
  }

  volver() {
    this.router.navigate(['/home']);
  }
}
