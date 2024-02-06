import { OnInit } from '@angular/core';
import { Component } from '@angular/core';
import { HelperService } from '../shared/helpers/helper.service';
import { SessionService } from '../shared/security/session.service';
import { LayoutService } from './service/app.layout.service';

@Component({
    selector: 'app-menu',
    templateUrl: './app.menu.component.html'
})
export class AppMenuComponent implements OnInit {

    model: any[] = [];

    constructor(public layoutService: LayoutService, private sessionService: SessionService,
        private helperService:HelperService) { }

    ngOnInit() {
        // obetner el menu de sesion
        const menus =this.sessionService.getSessionMenu();
        this.model = this.helperService.getGroupedList(menus);
    }

}
