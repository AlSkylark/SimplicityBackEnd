import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { DatabaseService } from '../database.service';

@Component({
  selector: 'app-updates',
  templateUrl: './updates.component.html',
  styleUrls: ['./updates.component.scss']
})
export class UpdatesComponent implements OnInit {

  public chpsVisible: Map<string, boolean> = new Map();
  public pagesVisible: Map<number, boolean> = new Map();
  public chapters: Observable<any>;

  constructor(private db: DatabaseService, private router: Router) { 
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

  pagesClick(page: number){
    this.router.navigate(['updates', page])
  }

}
