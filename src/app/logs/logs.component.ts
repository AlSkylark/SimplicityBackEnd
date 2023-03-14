import { formatDate } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { DatabaseService } from '../database.service';
import { Log } from '../log';

@Component({
  selector: 'app-logs',
  templateUrl: './logs.component.html',
  styleUrls: ['./logs.component.scss']
})
export class LogsComponent implements OnInit {
  
  public logForm: FormGroup;
  public logs: Observable<Log>;
  public editsVisible: Map<number,boolean> = new Map();

  constructor(private db: DatabaseService,
              private fb: FormBuilder) { 
                this.logForm = this.fb.group({
                  id: '',
                  dateid: '',
                  date: '',
                  text: ''
                });
                this.logs = this.db.getLogs();
                this.logs.subscribe((val)=>{
                    this.editsVisible.set(val.id,false);

                })
              }

  ngOnInit(): void {
  }

  setForm(el){
    this.logForm.controls["id"].setValue(el.id == undefined ? '' : el.id);
    this.logForm.controls["dateid"].setValue(el.dateid == undefined ? '' : el.dateid);
    this.logForm.controls["date"].setValue(el.date == undefined ? '' : el.date);
    this.logForm.controls["text"].setValue(el.text == undefined ? '' : el.text);
  }

  openEdit(log: Log){
    let b: boolean = this.editsVisible.get(log.id);
    this.editsVisible.forEach((v,k)=>{this.editsVisible.set(k,false)})
    this.editsVisible.set(log.id, !b);
    this.setForm(log);
  }
  
  saveLog(){
    const log: Log = this.logForm.value;
    this.db.updateLogs(log);
  }


}
