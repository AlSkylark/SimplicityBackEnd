import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { AngularFireAuth } from '@angular/fire/auth';
import firebase from 'firebase/app';
import { AngularFireDatabase } from '@angular/fire/database';
import { Observable, of } from 'rxjs';
import{ map, switchMap } from 'rxjs/operators'


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  public auth$: Observable<boolean>;
  public logged: Observable<boolean>;
  public credentials;

  constructor(public auth: AngularFireAuth, private db: AngularFireDatabase, private router: Router) {

    this.logged = this.auth.authState.pipe(
      map(authState => !!authState)
    )

  }

  public checkAdmin(): Observable<boolean>{
    return this.auth$ = this.auth.authState.pipe(
      switchMap(user => {
        if(user) return this.db.list(user.uid).valueChanges();
        this.logout();
        return of(false);
      }),
      map(isAdmin => {
        if (!isAdmin[0]) this.logout();
        this.auth.authState.subscribe(u => this.credentials = u.uid);
        return !!isAdmin[0];
      })
    );

  }

  public login(){

     this.auth.signInWithPopup(new firebase.auth.GoogleAuthProvider()).finally(() => this.router.navigate(['']));
     
  }

  public logout(){
     this.auth.signOut();
    return this.router.navigate(['login']);
  }

}
