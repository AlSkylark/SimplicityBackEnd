import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MainComponent } from './main/main.component';
import { LoadingComponent } from './loading/loading.component';
import { StatusComponent } from './status/status.component';
import { LogsComponent } from './logs/logs.component';
import { ArchiveComponent } from './archive/archive.component';
import { UpdatesComponent } from './updates/updates.component';
import { LoginComponent } from './login/login.component';
import { AuthGuard } from './auth.guard';
import { E404Component } from './e404/e404.component';
import { PageComponent } from './page/page.component';
import { UploadComponent } from './upload/upload.component';


export const routingComponents = 
  [
    MainComponent, 
    LoadingComponent,
    StatusComponent,
    LogsComponent,
    ArchiveComponent,
    UpdatesComponent,
    LoginComponent,
    E404Component,
    PageComponent
  ];

const routes: Routes = [
  {
  path:'', component: routingComponents[0], canActivate:[AuthGuard],
  children:
    [
      {path:'status', component: routingComponents[2]},
      {path:'updates', component: routingComponents[5]},
      {path:'updates/:page', component: routingComponents[8]},
      {path:'archive', component: routingComponents[4]},
      {path:'logs', component: routingComponents[3]},
    ]
  },
  {path:'login', component: routingComponents[6]},
  {path: 'test', component: UploadComponent},
  {path:'**', component: routingComponents[7]}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
