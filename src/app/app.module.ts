import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthComponent } from './auth/auth.component';
import { HomeComponent } from './home/home.component';
import { SolicitarComponent } from './turnos/solicitar/solicitar.component';

<<<<<<< HEAD

// nuevo es la importacion de firebase
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { provideStorage, getStorage } from '@angular/fire/storage';

import { environment } from '../environments/environment';

=======
>>>>>>> origin/main
@NgModule({
  declarations: [
    AppComponent,
    AuthComponent,
    HomeComponent,
    SolicitarComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
<<<<<<< HEAD
    FormsModule,
  ],
  providers: [
    // nuevo, es la inicialización de Firebase y de los servicios
    provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    provideStorage(() => getStorage()),
  ],
=======
    FormsModule
  ],
  providers: [],
>>>>>>> origin/main
  bootstrap: [AppComponent]
})
export class AppModule { }

