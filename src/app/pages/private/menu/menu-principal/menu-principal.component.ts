import { Component, OnInit } from '@angular/core';
import { HelperService } from 'src/app/shared/helpers/helper.service';
import { MenuOpcion } from 'src/app/shared/models/menu-opcion';
import { SessionService } from 'src/app/shared/security/session.service';

@Component({
  selector: 'app-menu-principal',
  templateUrl: './menu-principal.component.html',
  styleUrls: ['./menu-principal.component.scss']
})
export class MenuPrincipalComponent implements OnInit {

  menu :MenuOpcion[]=[];
  grupos: any[] = [];
  constructor(private sessionService: SessionService,
    private helperService:HelperService) {
  }

  ngOnInit(): void {
    this.menu = this.sessionService.getSessionMenu();
    this.menu = this.menu.filter(x=>x.id!=-1);
    this.grupos = this.helperService.getGroupedList(this.menu);
    console.log(this.grupos);
  }

}
