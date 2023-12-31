import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { User } from 'firebase/auth';
import { UsersService } from 'src/app/services/users.service';


@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.page.html',
  styleUrls: ['./inicio.page.scss'],
})
export class InicioPage {
  

  edadEstudiante = 20;
  carreraEstudiante = 'Ingeniería Informática';
 

  user: User | null = null;  // Inicializa una variable para el usuario actual

  constructor(private userService: UsersService, private afAuth: AngularFireAuth) {
    this.afAuth.authState.subscribe((user:any) => {
      this.user = user;
    
      console.log(user);

    });
  }
  logout(){
    this.userService.logout();
  }


}
