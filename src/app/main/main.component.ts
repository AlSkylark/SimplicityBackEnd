import { Component, OnInit } from '@angular/core';
import { MenuItems } from '../menuitems';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {
  public toggle: boolean;
  public items: MenuItems[] = 
  [
    new MenuItems('Status','grid_view', 'status'),
    new MenuItems('Updates','perm_media', 'updates'),
    new MenuItems('Archive', 'folder', 'archive'),
    new MenuItems('Logs', 'menu_book', 'logs')
  ];
  
  constructor(public auth: AuthService,private router: Router, private route: ActivatedRoute) { }

  ngOnInit(): void {
  }

  navigateTo(link: string){
    this.router.navigate([link]);
  }

}
