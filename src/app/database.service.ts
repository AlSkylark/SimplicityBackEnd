import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { AngularFireStorage, AngularFireUploadTask } from '@angular/fire/storage';
import { from, Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { ImageToResize } from './image-to-resize';
import { Log } from './log';
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

  async updateDatabase(page: number, update: Update) {
    const itemsRef = this.db.list('updates');
    // console.log(update); return false;
    if (this.validateUpdate(update))
      return await itemsRef.update(('update' + page).replace(".", ","), update);
    throw new Error("Testing");

  }

  private validateUpdate(update: Update) {
    if (update.imgurl.length === 0 || update.chapter.length === 0)
      return false;
    return true;
  }

  //#region Page stuff
  public getAllUpdates() {
    return this.db.list('updates', ref => ref.orderByChild('id')).valueChanges();
  }

  /**
   * Returns the number of items in the database within provided argument.
   * @param {string} request The type of item to count.
   * @returns {Observable<number>}
   */
  public getNumbers(request: string): Observable<number> {
    return this.db.list(request).valueChanges().pipe(
      map(val => {
        let i: number = 0;
        val.forEach(() => i++)
        return i;
      })
    );
  }

  /**
  * Returns whichever page you pass in the argument. 
  * @param {number} page The page to return.
  * @returns {Observable<Update[]>} 
  */
  getPage(page: number): Observable<Update> {
    return this.db.object<Update>(('/updates/update' + page).replace(".", ",")).valueChanges();
  };

  /**
   * Creates a blank new page to be filled.
   * @param {number} id The id to create the new page with. 
   * @returns 
   */
  newPage(id: number): Observable<Update> {
    return from(this.db.list<Update>('updates').update('update' + id, new Update(id)).finally())
      .pipe(
        switchMap(() => this.getPage(id)));
  }

  /**
  * Returns the last page uploaded to the database.
  * @returns {Observable<Update[]>} 
  */
  getLast(): Observable<Update[]> {
    return this.db.list<Update>('/updates', ref => ref.orderByChild('id').limitToLast(1)).valueChanges();
  }
  //#endregion

  //#region Image stuff
  /**
   * Deletes the imgurl or thumbnail depending on the type sent.
   * @param {number} page The page to delete the Image from.
   * @param {string} type The type of image to delete. Thumbnail or Imgurl? 
   * @returns {Promise<void>} Returns a void promise.
   */
  async deleteImage(page: number, type: string) {
    return await this.db.object('updates/update' + page + '/' + type).remove();
  }

  /**
   * Uploads an image file (in .png) to the Storage/Bucket section of Firebase.
   * @param {File} file An image file in .png format.
   * @returns {UploadingImage} A task to monitor upload progress.
   */
  uploadImageToBucket(page: number, file: File): UploadingImage {
    const storagePath = 'updates/' + page + '.PNG';
    const uploading: UploadingImage = { path: storagePath, upload: this.storage.upload(storagePath, file) }
    return uploading;
  }

  getImageUrl(path: string) {
    return this.storage.ref(path);
  }

  uploadImageToDatabase(page: number, url: string) {
    const itemsRef = this.db.list('updates');
    itemsRef.update('update' + page, { imgurl: url });
  }

  getThumbnail(file: ImageToResize): Observable<ResizedImage> {

    //send image to resizer API
    const apiUrl: string = 'https://resizeapi.azurewebsites.net/resize';
    // const apiUrl: string = 'https://localhost:5001/resize'

    const headers: HttpHeaders = new HttpHeaders({ "x-auth": this.auth.credentials })

    let formData = new FormData();
    formData.append("File", file.File);
    formData.append("FileName", file.FileName);

    return this.httpRequest.post<ResizedImage>(apiUrl, formData, { headers: headers });

  }

  uploadThumbnailToBucket(image: ResizedImage): UploadingImage {
    const storagePath = 'thumbnails/' + image.fileName;
    const storageRef = this.storage.ref(storagePath)
    const uploading: UploadingImage = { path: storagePath, upload: storageRef.put(this.base64ToBlob(image.fileBlob, 'image/png')) }
    return uploading;
  }

  uploadThumbnailToDatabase(page: number, url: string) {
    const itemsRef = this.db.list('updates');
    itemsRef.update('update' + page, { thumbnail: url });
  }


  base64ToBlob(base64, mime) {
    mime = mime || '';
    var sliceSize = 1024;
    var byteChars = window.atob(base64);
    var byteArrays = [];

    for (var offset = 0, len = byteChars.length; offset < len; offset += sliceSize) {
      var slice = byteChars.slice(offset, offset + sliceSize);

      var byteNumbers = new Array(slice.length);
      for (var i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }

      var byteArray = new Uint8Array(byteNumbers);

      byteArrays.push(byteArray);
    }

    return new Blob(byteArrays, { type: mime });
  }
  //#endregion

  //#region Archive
  /**
  * Returns a list of chapters which contain the chapter name
  * and the length/number of pages.
  * @returns {Observable<any>}
  */
  public getChapters(): Observable<any[]> {
    return this.db.list('chapters').valueChanges();
  }

  increaseChapterNo(index: number, clength: number) {
    this.db.object('chapters/chapter' + index).update({ length: clength + 1 });
  }

  decreaseChapterNo(index: number, clength: number) {
    this.db.object('chapters/chapter' + index).update({ length: clength - 1 });
  }
  //#endregion Archive

  //#region Logs
  public getLogs(): Observable<any> {
    return this.db.list('logs').valueChanges();
  }

  async updateLogs(log: Log) {
    const logsRef = this.db.list('logs');
    return await logsRef.update('log' + log.id, log);
  }
  //#endregion

}
