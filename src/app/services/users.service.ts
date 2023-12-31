import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/compat/firestore';
import { Auth,createUserWithEmailAndPassword, getAuth, signInWithEmailAndPassword , signOut, updateEmail} from '@angular/fire/auth';

import { Router } from '@angular/router';

import { AngularFireAuth } from '@angular/fire/compat/auth';
import { sendEmailVerification, sendPasswordResetEmail, updateCurrentUser, updateProfile, verifyBeforeUpdateEmail } from 'firebase/auth';
import { BehaviorSubject, Observable, switchMap, take } from 'rxjs';
import { AlertController } from '@ionic/angular';

interface DocumentoAsistencia {
  sala: string;
  seccion: string;
  ramo: string;
  asistentes?: string[];
}

interface Ramos {
  id: string;
  data: {sala: string, seccion: string, nombre: string }; // Un objeto con claves de tipo string y valores de cualquier tipo
}


@Injectable({
  providedIn: 'root'
})

export class UsersService {

  usuarioActual$: Observable<any> = new Observable;


  ramos: Ramos[] = [];
  constructor(private fire: AngularFirestore,
              private auth: Auth,
              private router: Router,
              private afAuth: AngularFireAuth,
              private alertController: AlertController) 
    { 
      
      this.usuarioActual$ = this.afAuth.authState;

    }


getCollection(){
  //Subscribe mantiene la conexion a la coleccion:
  this.fire.collection('Estudiante').valueChanges().subscribe( (res) => 
  { 
    console.log(res);
  });
}


registerUser(json: any, tipo: string){    
// CREA PROFILE 
createUserWithEmailAndPassword(this.auth, json.correo, json.password)
    .then(userCredential => {
      const user  = userCredential.user;
      console.log('Usuario creado: ' , user.uid);
      updateEmail(user , json.email).then(() => {
        console.log("Hecho 1")
      }).catch((error) => {
      
      });
      updateProfile(user , {
        displayName: json.nombre, 
        photoURL: "abc"
      }).then(() => {
        console.log("Hecho 2")
      }).catch((error) => {
      
      });
    
      // CREA FIRESTORE
      this.fire.collection(tipo).doc(user.uid).set({
        correo: json.correo,
        nombre: json.nombre,
      }) 
      .then(() => {
        console.log('Usuario registrado con éxito y datos adicionales almacenados.');
        this.router.navigate(['/']);
      })
      .catch(error => {
        console.error('Error al almacenar datos adicionales:', error);
      });

    })
    .catch(error => {
      console.error('Error al registrar usuario:', error);
    });
}

login(json:any){
  return signInWithEmailAndPassword(this.auth, json.correo, json.password)
  .then(() => {
    console.log('Logeado con exito');
    this.router.navigate(['/inicio']);
    
    this.afAuth.authState.subscribe((user:any) => {
      this.presentAlert("Hola, de nuevo " + user.displayName, "-------");
    })
  })

  .catch(error => {
    console.error('Error al logear: ', error);
    this.presentAlert("DATOS INVALIDOS", "INVALIDOS O INEXISTENTES");

  });
}

login_profesor(json:any){
  return signInWithEmailAndPassword(this.auth, json.correo, json.password)
  .then(() => {
    console.log('Logeado con exito');
    this.router.navigate(['/qr']);

  })
  .catch(error => {
    console.error('Error al logear: ', error);
  });
}

logout(){
  signOut(this.auth).then(() => {
    this.router.navigate(['']);
    this.presentAlert("Saliendo de la aplicación", "Volviendo al login");
})

}

verificarNuevoCorreo() {
  this.afAuth.authState.subscribe((user:any) => {
  if (user) {
    // Enviar el correo de verificación al nuevo correo electrónico
    user
      .sendEmailVerification()
      .then(() => {
        console.log('Correo de verificación enviado al nuevo correo electrónico.');
      })
      .catch((error: any) => {
        console.error('Error al enviar el correo de verificación:', error);
      });
    }
  })
}


actualizarEstudiante(json: any){
//Obtiene los datos actuales 
this.afAuth.authState.subscribe((user:any) => {
// ACtualiza FIRESTORE
  console.log(user);
  
  this.fire.collection('Estudiante').doc(user.uid).set({
  correo: json.correo,
  nombre: json.nombre,
  }) 
    .then(() => {
      console.log('Usuario registrado con éxito y datos adicionales almacenados.');
          verifyBeforeUpdateEmail(user, json.correo).then(() => {
              console.log("wena")
              this.presentAlert("Correo enviado", "Se actualizaran los datos al verificar el nuevo correo")
              this.logout();
            }).catch((error) => {
              console.log(error)
              console.log("wena'nt")
            });
    })

    updateProfile(user , {
      displayName: json.nombre, 
      photoURL: "abc"
    }).then(() => {
      console.log("Hecho 2")
    }).catch((error) => {
    });
  })
    this.router.navigate(['/']); 
  }

actualizarPass(json: any){
  const auth = getAuth();
  sendPasswordResetEmail(auth, json)
    .then(() => {
      console.log(json);
      // Password reset email sent!
      // ..
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.log(error);
    });
}

private horarioSubject = new BehaviorSubject<any>(null);
horario$: Observable<any> = this.horarioSubject.asObservable();

getRamos(){
  this.fire.collection('Profesor').doc('6biO0bY6CVeBrSNdP6k5mSMElSq1').get().subscribe((docSnapshot: any) => {
    // Accede directamente al objeto de documento
    const horario = docSnapshot.data().horario;
    console.log(horario);
    
    this.horarioSubject.next(horario);
  });
}




asistencia(datos:any, nombre:string){

  const asistenciaHoy: DocumentoAsistencia = {
    sala: datos.sala,
    seccion: datos.seccion,
    ramo: datos.nombre,
    asistentes: [nombre],
  };
  
  const fechaHoy: Date = new Date();
  const fechaFormateada: string = fechaHoy.toISOString().split('T')[0];  // Formato YYYY-MM-DD
  
  console.log(fechaFormateada)

  const documentoRef = this.fire.collection('Asistencia').doc(fechaFormateada + ' ' + datos.seccion);
 
    // Utiliza switchMap para manejar la lógica de actualización basada en si el documento existe o no
    
    return documentoRef.valueChanges().pipe(
      take(1),
      switchMap(documentData => {
        const typedDocumentData = documentData as { asistentes?: string[] };

        if (typedDocumentData && typedDocumentData.asistentes) {
          
          console.log('El documento ya existe. No se necesita crear.');

          console.log(documentData)

          const arrayExistente = typedDocumentData.asistentes || [];
          arrayExistente.push(nombre);  // Agrega el nuevo elemento al array
          return documentoRef.update({ asistentes: arrayExistente }).then(() => arrayExistente);


        } else {
          console.log('El documento no existe, créalo con el array inicial');
          //Crea el array:
          return documentoRef.set(asistenciaHoy).then(() => asistenciaHoy);
          
        
        }
      })
    ).subscribe(
      (asistenciaGuardada) => {
        console.log('Operación completada con éxito', asistenciaGuardada);
      },
      error => {
        console.error('Error en la operación:', error);
      }
    );

}
async presentAlert(header:string, msg: string) {
  const alert = await this.alertController.create({
    header: header,
    message: msg,
    buttons: ['OK']
  });

  await alert.present();
}

}

