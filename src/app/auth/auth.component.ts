import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent {
  loginEmail = '';
  loginPass = '';
  regEmail = '';
  regPass = '';
  nombre = '';

  constructor(private router: Router) {}

  login() {
    const users = JSON.parse(localStorage.getItem('usuarios') || '[]');
    const u = users.find((x: any) => x.email === this.loginEmail && x.password === this.loginPass);
    if (!u) return alert('Credenciales inválidas');
    localStorage.setItem('usuarioActual', JSON.stringify(u));
    this.router.navigate(['/home']);
  }

  registrar() {
    if (!this.nombre || !this.regEmail || !this.regPass) return alert('Completar todo');
    const users = JSON.parse(localStorage.getItem('usuarios') || '[]');
    if (users.find((x: any) => x.email === this.regEmail)) return alert('Ya existe');
    const rol = users.length === 0 ? 'admin' : 'paciente';
    users.push({ nombre: this.nombre, email: this.regEmail, password: this.regPass, rol });
    localStorage.setItem('usuarios', JSON.stringify(users));
    alert('Registrado');
  }
}
