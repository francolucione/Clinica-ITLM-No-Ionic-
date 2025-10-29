import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  usuario: any = null;
  usuarios: any[] = [];
  turnos: any[] = [];
  misTurnos: any[] = [];

  constructor(private router: Router) {}

  ngOnInit() {
    // 🔹 Verificar sesión activa
    const raw = localStorage.getItem('usuarioActual');
    if (raw) {
      this.usuario = JSON.parse(raw);
    } else {
      this.router.navigate(['/auth']);
      return;
    }

    // 🔹 Cargar usuarios
    const all = localStorage.getItem('usuarios');
    this.usuarios = all ? JSON.parse(all) : [];

    // 🔹 Cargar turnos
    const data = localStorage.getItem('ofertaTurnos');
    this.turnos = data ? JSON.parse(data) : [];

    // 🔹 Si es paciente, cargar sus turnos reservados
    if (this.usuario?.rol === 'paciente') {
      this.misTurnos = this.turnos.filter(t => t.paciente === this.usuario.nombre);
    }
  }

  // 🔹 Cerrar sesión
  logout() {
    localStorage.removeItem('usuarioActual');
    this.router.navigate(['/auth']);
  }

  // 🔹 Administración de usuarios
  cambiarRol(index: number) {
    const order = ['paciente', 'medico', 'admin'];
    const u = this.usuarios[index];
    const nextIdx = (order.indexOf(u.rol) + 1) % order.length;
    const nextRol = order[nextIdx];

    if (u.rol === 'admin' && nextRol !== 'admin' && this.usuarios.filter(x => x.rol === 'admin').length === 1) {
      alert('Debe quedar al menos un administrador.');
      return;
    }

    u.rol = nextRol;
    this.usuarios[index] = u;
    localStorage.setItem('usuarios', JSON.stringify(this.usuarios));

    const curr = JSON.parse(localStorage.getItem('usuarioActual') || 'null');
    if (curr && curr.email === u.email) {
      localStorage.setItem('usuarioActual', JSON.stringify(u));
      this.usuario = u;
    }
  }

  eliminarUsuario(index: number) {
    const u = this.usuarios[index];
    if (confirm(`¿Seguro que querés eliminar a ${u.nombre}?`)) {
      this.usuarios.splice(index, 1);
      localStorage.setItem('usuarios', JSON.stringify(this.usuarios));
      alert(`${u.nombre} eliminado correctamente`);
    }
  }

  // 🔹 Administración de turnos
  generarTurnos() {
    const especialidades = ['Clínica Médica', 'Pediatría', 'Cardiología'];
    const turnos: any[] = [];

    const hoy = new Date();
    for (let i = 0; i < 14; i++) {
      const dia = new Date();
      dia.setDate(hoy.getDate() + i);
      const diaSemana = dia.getDay();
      if (diaSemana !== 0 && diaSemana !== 6) {
        for (let hora = 9; hora <= 17; hora++) {
          especialidades.forEach((esp) => {
            turnos.push({
              fecha: dia.toISOString().split('T')[0],
              hora: `${hora}:00`,
              especialidad: esp,
              estado: 'disponible',
              paciente: null
            });
          });
        }
      }
    }

    localStorage.setItem('ofertaTurnos', JSON.stringify(turnos));
    alert('✅ Turnos generados correctamente');
    this.turnos = turnos;
  }

  editarCampo(index: number, campo: string) {
    const t = this.turnos[index];
    let nuevoValor;

    switch (campo) {
      case 'fecha': nuevoValor = prompt('Nueva fecha (YYYY-MM-DD):', t.fecha); break;
      case 'hora': nuevoValor = prompt('Nueva hora (HH:MM):', t.hora); break;
      case 'especialidad': nuevoValor = prompt('Nueva especialidad:', t.especialidad); break;
      case 'estado': nuevoValor = prompt('Nuevo estado (disponible / reservado / cancelado):', t.estado); break;
    }

    if (nuevoValor) {
      t[campo] = nuevoValor;
      this.turnos[index] = t;
      localStorage.setItem('ofertaTurnos', JSON.stringify(this.turnos));
      alert(`✅ ${campo} del turno actualizada`);
    }
  }

  eliminarTurno(index: number) {
    const t = this.turnos[index];
    if (confirm(`¿Seguro que querés eliminar el turno de ${t.fecha} a las ${t.hora}?`)) {
      this.turnos.splice(index, 1);
      localStorage.setItem('ofertaTurnos', JSON.stringify(this.turnos));
    }
  }

  eliminarTodosTurnos() {
    if (confirm('¿Eliminar TODOS los turnos?')) {
      this.turnos = [];
      localStorage.removeItem('ofertaTurnos');
      alert('🗑️ Todos los turnos eliminados');
    }
  }

  // 🔹 Cancelar turno (PACIENTE)
  cancelarTurno(index: number) {
    const t = this.misTurnos[index];
    if (!confirm(`¿Cancelar turno del ${t.fecha} a las ${t.hora}?`)) return;

    // actualizar en la oferta general
    const todos = JSON.parse(localStorage.getItem('ofertaTurnos') || '[]');
    const i = todos.findIndex((x: any) =>
      x.fecha === t.fecha &&
      x.hora === t.hora &&
      x.especialidad === t.especialidad
    );

    if (i !== -1) {
      todos[i].estado = 'disponible';
      todos[i].paciente = null;
    }

    localStorage.setItem('ofertaTurnos', JSON.stringify(todos));
    this.misTurnos.splice(index, 1);
    alert('Turno cancelado correctamente');
  }

  irASolicitar() {
    this.router.navigate(['/turnos/solicitar']);
  }
}
