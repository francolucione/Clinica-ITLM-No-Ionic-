import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
<<<<<<< HEAD
import { getAuth, signOut, onAuthStateChanged } from 'firebase/auth';
import { environment} from '../../environments/environment';
import { Firestore, collection, getDocs, deleteDoc, doc, getFirestore, getDoc, setDoc, updateDoc, addDoc} from '@angular/fire/firestore';

// creo la interface de turno para la coleccion de firebase
interface Turno {
  id?: string;
  fecha: string;
  hora: string;
  especialidad: string;
  estado: string;
  paciente?: string | null;
}
=======
>>>>>>> origin/main

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  usuario: any = null;
  usuarios: any[] = [];
<<<<<<< HEAD
  turnos: Turno[] = [];
  misTurnos: Turno[] = [];
  fechaSeleccionada: string | null = null;

constructor(private firestore: Firestore, private router: Router) {}

  async ngOnInit() {
    const auth = getAuth();
    const db = getFirestore();

    onAuthStateChanged(auth, async (user) => {
      if (!user) {
        this.router.navigate(['/auth']);
        return;
      }

      // Obtener usuario actual desde Firestore
      const userRef = doc(db, 'usuarios', user.uid);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) {
        alert('No se encontró tu usuario en la base de datos.');
        signOut(auth);
        this.router.navigate(['/auth']);
        return;
      }

      this.usuario = userSnap.data();

      // Cargar todos los usuarios
      const usuariosSnap = await getDocs(collection(db, 'usuarios'));
      this.usuarios = usuariosSnap.docs.map((d) => d.data());

      // Cargar todos los turnos
      const turnosSnap = await getDocs(collection(db, 'turnos'));
      this.turnos = turnosSnap.docs.map((d) => ({ id: d.id, ...d.data() })) as Turno[];

      // Si es paciente, cargar sus turnos reservados
      if (this.usuario?.rol === 'paciente') {
        this.misTurnos = this.turnos.filter((t) => t.paciente === this.usuario.nombre);
      }
    });
  }

  // Cerrar sesión
  async logout() {
    const auth = getAuth();
    await signOut(auth);
    this.router.navigate(['/auth']);
  }

  // Administración de usuarios
async cambiarRol(index: number) {
  const order = ['paciente', 'medico', 'admin'];
  const u = this.usuarios[index];

  // 🧩 Validar que exista el usuario
  if (!u) {
    console.error('⚠️ Usuario no encontrado en el índice:', index);
    alert('Error: Usuario no encontrado.');
    return;
  }

  // 🧩 Validar que tenga rol (si no, asignar paciente)
  if (!u.rol || !order.includes(u.rol)) {
    console.warn('⚠️ Usuario sin rol válido, asignando "paciente":', u);
    u.rol = 'paciente';
  }

  // 🔹 Calcular el siguiente rol en el orden
  const currentRol = u.rol || 'paciente';
  const currentIdx = order.indexOf(currentRol);

  if (currentIdx === -1) {
    console.error('❌ Rol desconocido:', currentRol, 'en usuario:', u);
    alert('Rol desconocido, no se puede cambiar.');
    return;
  }

  const nextIdx = (currentIdx + 1) % order.length;
  const nextRol = order[nextIdx];

  // ⚠️ Evitar eliminar el último admin
  if (
    currentRol === 'admin' &&
    nextRol !== 'admin' &&
    this.usuarios.filter(x => x.rol === 'admin').length === 1
  ) {
    alert('Debe quedar al menos un administrador.');
    return;
  }

  // 🔁 Actualizar en memoria
  u.rol = nextRol;
  this.usuarios[index] = u;

  try {
    const userRef = doc(this.firestore, 'usuarios', u.uid);
    await updateDoc(userRef, { rol: nextRol });

    // 🔄 Si el usuario logueado es el mismo, actualizar localStorage
    if (this.usuario?.uid === u.uid) {
      this.usuario.rol = nextRol;
      localStorage.setItem('usuarioActual', JSON.stringify(this.usuario));
    }

    console.log(`✅ Rol de ${u.email} cambiado a "${nextRol}"`);
    alert(`Rol cambiado a "${nextRol}"`);
  } catch (error) {
    console.error('❌ Error al cambiar rol:', error);
    alert('Error al cambiar rol. Revisá la consola.');
  }
}

  // GENERAR TURNOS (6 por día, 14 días, lunes a viernes)
async generarTurnos() {
  const horarios = ["09:00", "10:30", "12:00", "13:30", "15:00", "16:30"];
  const especialidades = ["Clínica", "Pediatría", "Dermatología"];
  const turnos: any[] = [];

  const hoy = new Date();

  for (let d = 0; d < 14; d++) {
    const fecha = new Date(hoy);
    fecha.setDate(hoy.getDate() + d);
    const fechaStr = fecha.toISOString().split("T")[0];
    const especialidadDelDia = especialidades[d % especialidades.length];

    for (const hora of horarios) {
      turnos.push({
        fecha: fechaStr,
        hora,
        especialidad: especialidadDelDia,
        estado: "disponible",
      });
    }
  }

  this.turnos = turnos;
  console.log("✅ Turnos generados:", this.turnos);

  // Guardar turnos en Firebase
  const turnosRef = collection(this.firestore, 'turnos');

  try {
    for (const turno of this.turnos) {
      await addDoc(turnosRef, turno);
    }
    console.log("✅ Turnos guardados en Firestore");
  } catch (error) {
    console.error("❌ Error al guardar los turnos:", error);
  }
}


  obtenerFechasUnicas(): string[] {
    const fechas = this.turnos.map((t) => t.fecha);
    return [...new Set(fechas)].sort(
      (a, b) => new Date(a).getTime() - new Date(b).getTime()
    );
  }

  obtenerTurnosPorFecha(fecha: string): Turno[] {
    return this.turnos
      .filter((t) => t.fecha === fecha)
      .sort((a, b) => a.hora.localeCompare(b.hora));
  }

  toggleFecha(fecha: string) {
    this.fechaSeleccionada = this.fechaSeleccionada === fecha ? null : fecha;
  }

  async editarCampo(index: number, campo: keyof Turno) {
    const db = getFirestore();
    const t = this.turnos[index];
    let nuevoValor: string | null = null;

    switch (campo) {
      case 'fecha':
        nuevoValor = prompt('Nueva fecha (YYYY-MM-DD):', t.fecha);
        break;
      case 'hora':
        nuevoValor = prompt('Nueva hora (HH:MM):', t.hora);
        break;
      case 'especialidad':
        nuevoValor = prompt('Nueva especialidad:', t.especialidad);
        break;
      case 'estado':
        nuevoValor = prompt(
          'Nuevo estado (disponible / reservado / cancelado):',
          t.estado
        );
        break;
    }

    if (nuevoValor) {
      t[campo] = nuevoValor as any;
      this.turnos[index] = t;
      const turnoRef = doc(db, 'turnos', t.id!);
      await updateDoc(turnoRef, { [campo]: nuevoValor });
      alert(`✅ ${campo} del turno actualizado`);
    }
  }

  async eliminarTurno(index: number) {
    const db = getFirestore();
    const t = this.turnos[index];
    if (confirm(`¿Seguro que querés eliminar el turno de ${t.fecha} a las ${t.hora}?`)) {
      this.turnos.splice(index, 1);
      const turnoRef = doc(db, 'turnos', t.id!);
      await deleteDoc(turnoRef);
      alert('Turno eliminado');
    }
  }

  async eliminarTodosTurnos() {
    const db = getFirestore();
    if (confirm('¿Eliminar TODOS los turnos?')) {
      const turnosSnap = await getDocs(collection(db, 'turnos'));
      for (const d of turnosSnap.docs) {
        await deleteDoc(d.ref);
      }
      this.turnos = [];
=======
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
>>>>>>> origin/main
      alert('🗑️ Todos los turnos eliminados');
    }
  }

<<<<<<< HEAD
  async cancelarTurno(index: number) {
    const db = getFirestore();
    const t = this.misTurnos[index];

    if (!confirm(`¿Cancelar turno del ${t.fecha} a las ${t.hora}?`)) return;

    const turnoRef = doc(db, 'turnos', t.id!);
    await updateDoc(turnoRef, { estado: 'disponible', paciente: null });

=======
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
>>>>>>> origin/main
    this.misTurnos.splice(index, 1);
    alert('Turno cancelado correctamente');
  }

  irASolicitar() {
    this.router.navigate(['/turnos/solicitar']);
  }
}
