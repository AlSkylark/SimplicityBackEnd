import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule, routingComponents } from './app-routing.module';
import { AppComponent } from './app.component';


//material
import { MaterialModule } from './material/material.module';

//firebase imports
import { AngularFireModule } from '@angular/fire';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { AngularFireDatabaseModule } from '@angular/fire/database';
import { AngularFireStorageModule } from '@angular/fire/storage';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

//security
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { DatabaseService } from './database.service';

import { RepeatDirective } from './repeat.directive';
import { UploadComponent } from './upload/upload.component';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';





export const firebaseConfig = {
  apiKey: "AIzaSyAk0YRHZ1UKRiyTm6TAeoYqR-_hgAVa1YU",
  authDomain: "simplicitywebapp.firebaseapp.com",
  databaseURL: "https://simplicitywebapp-default-rtdb.firebaseio.com",
  projectId: "simplicitywebapp",
  storageBucket: "simplicitywebapp.appspot.com",
  messagingSenderId: "325175642532",
  appId: "1:325175642532:web:e0750c355bcad04549d931",
  measurementId: "G-ZV0181BWFX"
};

@NgModule({
  declarations: [
    AppComponent,
    routingComponents,
    RepeatDirective,
    UploadComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    AngularFireAuthModule,
    AngularFireDatabaseModule,
    AngularFireStorageModule,
    AngularFireModule.initializeApp(firebaseConfig),
    BrowserAnimationsModule,
    MaterialModule,
    HttpClientModule,
    ReactiveFormsModule
  ],
  providers: [
    AuthService,
    AuthGuard,
    DatabaseService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
