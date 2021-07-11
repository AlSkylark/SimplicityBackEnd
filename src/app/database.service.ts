import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { AngularFireStorage, AngularFireUploadTask } from '@angular/fire/storage';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { ImageToResize } from './image-to-resize';
import { ResizedImage } from './resized-image';
import { Update } from './update';
import { UploadingImage } from './uploading-image';

/**
 * The service in charge of querying data to the Firebase database.
 */
@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  
  constructor(private db: AngularFireDatabase, private storage: AngularFireStorage, private httpRequest: HttpClient, private auth: AuthService) { }



  /**
   * Returns the number of items in the database within provided argument.
   * @param {string} request The type of item to count.
   * @returns {Observable<number>}
   */
  public getNumbers(request: string): Observable<number>
  {
    return this.db.list(request).valueChanges().pipe(
      map(val =>
      {
        let i: number = 0;
        val.forEach(() => i++)
        return i;
      })
    );
  }

  /**
  * Returns a list of chapters which contain the chapter name
  * and the length/number of pages.
  * @returns {Observable<any>}
  */
  public getChapters(): Observable<any>
  {
    return this.db.list('/chapters').valueChanges();
  }

  /**
  * Returns whichever page you pass in the argument. 
  * @param {number} page The page to return.
  * @returns {Observable<Update[]>} 
  */
  getPage(page: number): Observable<Update[]>
  {
    return this.db.list<Update>('/updates', ref => ref.orderByChild('id').equalTo(page)).valueChanges();
  };

  /**
  * Returns the last page uploaded to the database.
  * @returns {Observable<Update[]>} 
  */
  getLast(): Observable<Update[]>
  {
    return this.db.list('/updates', ref => ref.orderByChild('id').limitToLast(1)).valueChanges();
  }

  /**
   * Uploads an image file (in .png) to the Storage/Bucket section of Firebase.
   * @param {File} file An image file in .png format.
   * @returns {UploadingImage} A task to monitor upload progress.
   */
  uploadImageToBucket(page:number, file: File): UploadingImage{
    const storagePath = 'updates/' + page + '.PNG';
    const uploading: UploadingImage = {path: storagePath, upload: this.storage.upload(storagePath, file)}
    return uploading;
  }
  getImageUrl(path: string) {
    return this.storage.ref(path);
  }

  uploadImageToDatabase(page:number, url: string){
    const itemsRef = this.db.list('updates');
    itemsRef.update('update' + page, {imgurl: url});
  }

  getThumbnail(file: ImageToResize): Observable<ResizedImage>{

    //send image to resizer API
    const apiUrl: string = 'https://resizeapi.azurewebsites.net/resize';
    // const apiUrl: string = 'https://localhost:5001/resize'

    const headers: HttpHeaders = new HttpHeaders({"x-auth": this.auth.credentials})

    let formData = new FormData();
    formData.append("File", file.File);
    formData.append("FileName", file.FileName);

    return this.httpRequest.post<ResizedImage>(apiUrl, formData,{headers: headers}); 
    
  }

  uploadThumbnailToBucket(image: ResizedImage): UploadingImage {
    const storagePath = 'thumbnails/' + image.fileName;
    const storageRef = this.storage.ref(storagePath)
    const uploading: UploadingImage = {path: storagePath, upload: storageRef.put( this.base64ToBlob(image.fileBlob,'image/png') )}
    return uploading;
  }

  uploadThumbnailToDatabase(page:number, url: string){
    const itemsRef = this.db.list('updates');
    itemsRef.update('update' + page, {thumbnail: url});
  }

  base64ToBlob(base64, mime) 
  {
    mime = mime || '';
    var sliceSize = 1024;
    var byteChars = window.atob(base64);
    var byteArrays = [];

    for (var offset = 0, len = byteChars.length; offset < len; offset += sliceSize)
    {
      var slice = byteChars.slice(offset, offset + sliceSize);

      var byteNumbers = new Array(slice.length);
      for (var i = 0; i < slice.length; i++)
      {
        byteNumbers[i] = slice.charCodeAt(i);
      }

      var byteArray = new Uint8Array(byteNumbers);

      byteArrays.push(byteArray);
    }

    return new Blob(byteArrays, { type: mime });
  }

}
