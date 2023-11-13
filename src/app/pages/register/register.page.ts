
import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { ToastController } from '@ionic/angular';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/compat/firestore';

import {
  FormGroup,
  FormControl,
  Validators,
  FormBuilder,
  AbstractControl,
  ValidationErrors
} from '@angular/forms';

import { matchpass } from './matchpass';
 import { UsersService } from 'src/app/services/users.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {

  formularioRegistro: FormGroup;
  errores: string[] = [];

  constructor(private user: UsersService,
              private alertController: AlertController,
              private toastController: ToastController,
              
              private fb:FormBuilder) {
                this.formularioRegistro = this.fb.group({
                  'nombre' : new FormControl("", 
                  [Validators.required, 
                    Validators.minLength(3), 
                    Validators.pattern('^[a-zA-Z\\s]*$')
                  ] 
                  ),
                  'correo' : new FormControl("", 
                  [Validators.required,
                    Validators.email,
                    /* correoExistenteValidator(this.registroService), */
                    RegisterPage.noEspaciosValidator, 
                  ],
                  ),
                  'password' : new FormControl("", [Validators.required,
                     Validators.minLength(6), RegisterPage.noEspaciosValidator,
                     Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])[a-zA-Z0-9]+$')]),
                  'confirmPass' : new FormControl("", Validators.required),
                  
            },{
              validators: matchpass
            });
};

static noEspaciosValidator(control: any) {
  if (control.value && /\s/.test(control.value)) {
    return { noEspacios: true }; // Retorna un error si encuentra espacios en blanco
  }
  return null; // Retorna nulo si no se encontraron espacios en blanco
}

get correo(){
  return this.formularioRegistro.get('correo');
}
get nombre(){
  return this.formularioRegistro.get('nombre');
}
get password(){
  return this.formularioRegistro.get('password');
}
get confirmPass(){
  return this.formularioRegistro.get('password');
}




  onSubmit() {
    console.log("bbbbb");
    this.user.registerUser(this.formularioRegistro.value)
    
    
    /* if (this.formularioRegistro.valid) {
      const data = this.formularioRegistro.value;
      console.log(data);
      this.user.createDocument(data);
    } */
  }




  async showToast(msg: string){
    const toast = await this.toastController.create({
      message: msg,
      duration: 2000
    });
    toast.present();
  }
  ngOnInit() {
  }

  
}
