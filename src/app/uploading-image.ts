import { AngularFireUploadTask } from "@angular/fire/storage";

export interface UploadingImage {
    upload: AngularFireUploadTask;
    path: string;
}
