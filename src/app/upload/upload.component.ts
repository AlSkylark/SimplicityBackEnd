import { Inject } from '@angular/core';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.scss']
})
export class UploadComponent implements OnInit {

  @ViewChild('file') FileDialog: ElementRef;
  public thumbCheck: boolean = true;
  public imgPath: string;
  public imgFile: File;
  public dialogData: {file: File, check: boolean};

  constructor(@Inject(MAT_DIALOG_DATA) public data: {button: string}) { }

  ngOnInit(): void {
  }

  openDialog(){
    const e: HTMLElement = this.FileDialog.nativeElement;
    e.click();
  }

  checkChange(){
    this.thumbCheck ? this.thumbCheck = false : this.thumbCheck = true;
    if (this.imgFile) this.dialogData.check = this.thumbCheck;
  }

  copyPath(e: Event){
    const target = e.target as HTMLInputElement;
    const files = target.files as FileList;
    this.imgPath = files.item(0).name;
    this.imgFile = files.item(0);
    this.dialogData= {file: this.imgFile, check: this.thumbCheck}
  }
}
