import { Injectable } from '@angular/core';
import * as firebase from 'firebase';
import { AngularFirestore } from 'angularfire2/firestore';
import { Imagen } from './interfaces/imagen.interface';
import { FileItem } from '../models/file-items';

@Injectable({
  providedIn: 'root'
})
export class CargaImagenesService {

private CARPETA_IMAGENES = 'img';

  constructor(private db: AngularFirestore) { }

  cargarImagenesFirebase(imagenes: FileItem[]) {
    
    const storageRef = firebase.storage().ref();

    for (const item of imagenes) {
      item.estaSubiendo = true;
      
      if (item.progreso >= 100) {
        continue;
      }
 
      const refImagen = storageRef.child(`${this.CARPETA_IMAGENES}/${item.nombreArchivo}`);
      const uploadTask: firebase.storage.UploadTask = refImagen.put(item.archivo);

      uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED,
            (snapshot: firebase.storage.UploadTaskSnapshot) => item.progreso = (snapshot.bytesTransferred / snapshot.totalBytes) * 100,
            (error) => console.log('Error al subir imagenes', error),
            () => {
                refImagen.getDownloadURL().then(
                    (urlImagen) => {
                      console.log('Imagen cargada correctamente');
                      item.url = urlImagen;
                      item.estaSubiendo = false;
                      this.guardarImagen({
                        nombre: item.nombreArchivo,
                        url: item.url
                      });
                    }
                );
            }
      );
    }
  }

  private guardarImagen(imagen: Imagen) {
    this.db.collection(`/${this.CARPETA_IMAGENES}`)
            .add(imagen);
  }
}
