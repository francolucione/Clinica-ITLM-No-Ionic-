import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
<<<<<<< HEAD
import { getFirestore, collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
=======
>>>>>>> origin/main

@Component({
  selector: 'app-solicitar',
  templateUrl: './solicitar.component.html',
  styleUrls: ['./solicitar.component.scss']
})
export class SolicitarComponent implements OnInit {
  usuario: any = null;
<<<<<<< HEAD
  turnos: any[] = [];
  filtrados: any[] = [];
  especialidades: string[] = [];
  misTurnos: any[] = []; 

  constructor(private router: Router) {}

  async ngOnInit() {
    const auth = getAuth();
    const db = getFirestore();

    onAuthStateChanged(auth, async (user) => {
      if (!user) {
        this.router.navigate(['/auth']);
        return;
      }

      // Obtener usuario actual desde Firestore
      const usuariosSnap = await getDocs(collection(db, 'usuarios'));
      const allUsers = usuariosSnap.docs.map((d) => d.data());
      this.usuario = allUsers.find((u) => u['email'] === user.email);

      // cargar turnos
      const turnosSnap = await getDocs(collection(db, 'turnos'));
      this.turnos = turnosSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

      // Filtrar solo disponibles
      this.filtrados = this.turnos.filter((t) => t.estado === 'disponible');

      // turnos reservados por paciente(individual desde la fierbase)
      this.misTurnos = this.turnos.filter((t) => t.paciente === this.usuario?.nombre);

      // Especialidades únicas
      this.especialidades = Array.from(new Set(this.turnos.map((t) => t.especialidad)));
    });
  }

    // Filtrar por especialidad
  filtrarPorEspecialidad(event: Event) {
    const select = event.target as HTMLSelectElement | null;
    const valor = select?.value || 'todos';

    if (valor === 'todos') {
      this.filtrados = this.turnos.filter((t) => t.estado === 'disponible');
    } else {
      this.filtrados = this.turnos.filter(
        (t) => t.especialidad === valor && t.estado === 'disponible'
      );
    }
  }

  // Reservar turno
  async reservarTurno(index: number) {
    const db = getFirestore();
    const turno = this.filtrados[index];

    if (!confirm(`¿Confirmar turno de ${turno.fecha} a las ${turno.hora} (${turno.especialidad})?`))
      return;

    try {
      const turnoRef = doc(db, 'turnos', turno.id);
      await updateDoc(turnoRef, {
        estado: 'reservado',
        paciente: this.usuario.nombre
      });

      // Actualizar local
      this.turnos = this.turnos.map((t) =>
        t.id === turno.id ? { ...t, estado: 'reservado', paciente: this.usuario.nombre } : t
      );
      this.filtrados = this.turnos.filter((t) => t.estado === 'disponible');
      this.misTurnos = this.turnos.filter((t) => t.paciente === this.usuario.nombre);

      alert('✅ Turno reservado correctamente');
    } catch (error: any) {
      console.error(error);
      alert('❌ Error al reservar el turno: ' + error.message);
    }
  }

  // Cancelar turno
  async cancelarTurno(index: number) {
    const db = getFirestore();
    const t = this.misTurnos[index];

    if (!confirm(`¿Cancelar turno del ${t.fecha} a las ${t.hora}?`)) return;

    try {
      const turnoRef = doc(db, 'turnos', t.id);
      await updateDoc(turnoRef, { estado: 'disponible', paciente: null });

      // Actualizar local
      this.misTurnos.splice(index, 1);
      this.turnos = this.turnos.map((x) =>
        x.id === t.id ? { ...x, estado: 'disponible', paciente: null } : x
      );
      this.filtrados = this.turnos.filter((x) => x.estado === 'disponible');

      alert('🟢 Turno cancelado correctamente');
    } catch (error: any) {
      console.error(error);
      alert('❌ Error al cancelar turno: ' + error.message);
    }
=======
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
>>>>>>> origin/main
  }

  volver() {
    this.router.navigate(['/home']);
  }
}
