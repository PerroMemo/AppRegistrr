import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { NavController } from '@ionic/angular';
import { RegisterPage } from 'src/app/pages/register/register.page';

import{
  FormControl,
  Validators,
  FormBuilder,
  FormGroup
} from '@angular/forms';

import { UsersService } from 'src/app/services/users.service';



@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})

export class LoginPage  {

  usuarios!: any;
  formularioLogin : FormGroup;

  constructor( 
    private alterController: AlertController,
    private user: UsersService,
    private navController: NavController,
    private fb: FormBuilder) { 
      this.formularioLogin = this.fb.group({
        'correo' : new FormControl("",[Validators.required,
          Validators.email, 
          RegisterPage.noEspaciosValidator]),

        'password' : new FormControl("", Validators.required),
      })
};

get correo(){
  return this.formularioLogin.get('correo');
}

get password(){
  return this.formularioLogin.get('password');
}

 
onSubmit(){
  this.user.login(this.formularioLogin.value);
}

}