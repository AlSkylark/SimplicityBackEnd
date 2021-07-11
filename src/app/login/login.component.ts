import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  test: Observable<any>
  constructor(private router: Router, private route: ActivatedRoute, public auth: AuthService,) { }

  ngOnInit(): void {}

  logIn(){
    this.auth.login();
  }
  getOut(){
    this.auth.logout();
    window.location.href='https://www.google.com';
  }

}
