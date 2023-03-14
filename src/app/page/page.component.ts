import { Component, OnInit } from '@angular/core';
import { AngularFireStorageReference, AngularFireUploadTask } from '@angular/fire/storage';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { DatabaseService } from '../database.service';
import { ImageToResize } from '../image-to-resize';
import { Update } from '../update';
import { UploadComponent } from '../upload/upload.component';
import { UploadingImage } from '../uploading-image';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-page',
  templateUrl: './page.component.html',
  styleUrls: ['./page.component.scss']
})
export class PageComponent implements OnInit {

  public pageTitle: string;
  public pageForm: FormGroup;
  public pageNumber: string;
  public lastPage: number;
  public page: Update = new Update();


  //image
  public isUploading: boolean = false;
  public progress: Observable<number>;
  public imgUrl: AngularFireStorageReference;
  public imgLoading: boolean = true;

  //thumbnail
  public isThumbUploading: boolean = false;
  public thumbprogress: Observable<number>;
  public thumbUrl: AngularFireStorageReference;
  public thumbLoading: boolean = true;

  //chapters
  public chapterList: Observable<any[]>;
  public selected: string;

  //if id needs editing
  public idIcon: string = 'edit';

  //if the route is /add

  constructor(private route: ActivatedRoute,
    private router: Router,
    private db: DatabaseService,
    private dialog: MatDialog,
    private popUp: MatSnackBar,
    private fb: FormBuilder) {

    this.chapterList = this.db.getChapters();

    this.db.getLast().subscribe(v => {
      this.lastPage = v[0].id;
    })

    this.route.params.subscribe((page: Params) => {

      this.pageNumber = page['page'];

      this.pageForm = this.fb.group({
        alt: '',
        caption: '',
        chapter: 'none',
        id: { value: '', disabled: true },
        imgurl: { value: '', disabled: true },
        thumbnail: { value: '', disabled: true }
      });



      if (this.pageNumber == 'add') {

        this.pageTitle = 'Add Page';
        this.db.getLast().pipe(take(1)).subscribe(v => {

          this.page.id = v[0].id + 1;
          this.pageForm.controls['id'].setValue(this.page.id);

          //we create a new empty entry and subscribe to it
          // const pageGot$ = this.db.newPage(this.page.id);

          // pageGot$.pipe(take(1)).subscribe(p => {
          //   this.setForm(p);
          // })

          // pageGot$.subscribe(p => this.page = p);

        });

      } else {
        this.pageTitle = 'Page ' + this.pageNumber;

        const pageGot$ = this.db.getPage(+this.pageNumber);

        pageGot$.subscribe(p => {
          this.page = p;
          this.setForm(p);
        }); //loads data to page

      }
    });
  }


  setForm(p: Update) {
    this.pageForm.controls['id'].setValue(p.id == undefined ? '' : p.id);
    this.pageForm.controls['alt'].setValue(p.alt == undefined ? '' : p.alt);
    this.pageForm.controls['caption'].setValue(p.caption == undefined ? '' : p.caption);
    this.pageForm.controls['chapter'].setValue(p.chapter == undefined ? 'none' : p.chapter);
    this.pageForm.controls['imgurl'].setValue(p.imgurl == undefined ? '' : p.imgurl);
    this.pageForm.controls['thumbnail'].setValue(p.thumbnail == undefined ? '' : p.thumbnail);
  }

  ngOnInit(): void {
  }

  enableId() {
    this.pageForm.controls['id'].disabled ? this.pageForm.controls['id'].enable() : this.pageForm.controls['id'].disable();
    if (this.idIcon == 'edit') this.idIcon = 'edit_off';
    else this.idIcon = 'edit';
  }

  //#region upload Images code
  /**
   * This function is the core function governing how Images and Thumbnails are updated to the database.
   * In essence, it opens an Angular Material dialog component, where the user chooses the image to send,
   * then, on closing that dialog the database and ResizeAPI logic executes.
   * 
   * @param {string} type The origin of the click, the Image Upload button or the Thumbnail one.
   */
  openUpload(type: string) {

    //open the dialog, we pass the type for use within the dialog.
    const dialogRef = this.dialog.open(UploadComponent, {
      width: '30%',
      minWidth: '350px',
      data: {
        button: type
      }
    })

    //this is mostly to stop it from doing dumb stuff if the user closes by clicking outside the backdrop.
    dialogRef.backdropClick().subscribe(() => dialogRef.close({}));

    /**
     * The main code to execute, first it checks if the file sent by the dialog (@param result) undefined.
     * Then we check the type sent by the original click on the corresponding button. 
     * If it's a lone thumbnail it sends the image to the ResizeAPI and then puts the resulting blob into the 
     * firebase database.
     * If it's an image and thumbnail is checked, it does the same but also sending the non-resized to the database.
     * If thumbnail is unchecked, it skips the thumbnail request.
     */
    dialogRef.afterClosed().subscribe((result) => {
      if (result.file != undefined) {
        //the object to send to the ResizeAPI
        const thumb: ImageToResize = {
          FileName: `${this.page.id}`,
          File: result.file
          //Size: 250 to be implemented in the future if a case appears where I need to get different thumbnail sizes
        }

        //I'm writing the function now to be called within the if statements
        const thumbnailAction = () => {

          this.db.deleteImage(this.page.id, 'thumbnail').finally(() =>
            this.isThumbUploading = true
          );
          //we POST to the ResizeAPI asking for a thumbnail back.
          this.db.getThumbnail(thumb).subscribe(val => {
            const upload: UploadingImage = this.db.uploadThumbnailToBucket(val);

            this.thumbUrl = this.db.getImageUrl(upload.path);

            this.thumbprogress = upload.upload.percentageChanges();
            this.thumbprogress.toPromise().finally(() => {
              this.isThumbUploading = false;
              this.thumbUrl.getDownloadURL().subscribe(v => {
                this.pageForm.controls['thumbnail'].setValue(v);
                //this.db.uploadThumbnailToDatabase(this.page.id, v);
              })
            })
          })
        }

        if (type == 'Thumbnail') {

          thumbnailAction();

        } else {
          //same as the thumbnail process but skipping the ResizeAPI request

          this.db.deleteImage(this.page.id, 'imgurl').finally(() =>
            this.isUploading = true
          );
          const upload: UploadingImage = this.db.uploadImageToBucket(this.page.id, result.file);

          //Important! If the checkbox for thumbnail is true we execute the code to get a thumbnail! 
          if (result.check = true) thumbnailAction();

          this.imgUrl = this.db.getImageUrl(upload.path);

          this.progress = upload.upload.percentageChanges();
          this.progress.toPromise().finally(() => {

            this.isUploading = false;

            this.imgUrl.getDownloadURL().subscribe(v =>
              this.pageForm.controls['imgurl'].setValue(v)
            );
            //this.db.uploadImageToDatabase(this.page.idl, v));

          });

        }
      }
    })
  }
  //#endregion

  updatePage() {

    const update: Update = this.pageForm.getRawValue();
    this.db.updateDatabase(this.page.id, update).finally(() => {
      const config: MatSnackBarConfig = { duration: 1000, panelClass: 'center' };
      this.popUp.open("✔️ Saved!", undefined, config);
    }).catch(() => {
      const config: MatSnackBarConfig = { duration: 1000, panelClass: 'center' };
      this.popUp.open("⚠️ Something went wrong!", undefined, config);
    })

  }

  goTo(left: boolean) {
    if (left) {
      if (this.pageNumber == "add") {
        this.router.navigate(['updates', +this.lastPage]);
      } else {
        this.router.navigate(['updates', +this.pageNumber - 1]);
      }
    }
    else this.router.navigate(['updates', +this.pageNumber + 1]);
  }
}
