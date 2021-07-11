import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { DatabaseService } from '../database.service';

@Component({
  selector: 'app-status',
  templateUrl: './status.component.html',
  styleUrls: ['./status.component.scss']
})
export class StatusComponent implements OnInit {

  public date = new Date().toDateString();
  public updates: Observable<number>;
  public logs: Observable<number>;
  public chapters: Observable<number>;

  constructor(private dbService: DatabaseService) {
    this.updates = this.dbService.getNumbers('updates');
    this.logs = this.dbService.getNumbers('logs');
    this.chapters = this.dbService.getNumbers('chapters');
   }

  ngOnInit(): void {
  }



}
