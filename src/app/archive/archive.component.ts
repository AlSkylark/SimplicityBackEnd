import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { DatabaseService } from '../database.service';

@Component({
  selector: 'app-archive',
  templateUrl: './archive.component.html',
  styleUrls: ['./archive.component.scss']
})
export class ArchiveComponent implements OnInit {

  public pagesVisible: boolean = false;
  public chpsVisible: Map<string, boolean> = new Map();
  public chapters: Observable<any>;

  constructor(private db: DatabaseService) {
    this.chapters = this.db.getChapters();
    this.chapters.subscribe((val: Array<any>[]) =>{
      val.forEach(el => {
        this.chpsVisible.set(el['name'], false);  
      });
    })
   }

  ngOnInit(): void {
  }

  chapterClick(name: string){
    this.chpsVisible.get(name) ? this.chpsVisible.set(name, false) : this.chpsVisible.set(name, true);
    // this.pagesVisible ? this.pagesVisible = false : this.pagesVisible = true;
  }


}
