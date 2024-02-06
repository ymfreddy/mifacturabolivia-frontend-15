import { Component } from '@angular/core';
import { environment } from 'src/environments/environment';
import { LayoutService } from "./service/app.layout.service";

@Component({
    selector: 'app-footer',
    templateUrl: './app.footer.component.html'
})
export class AppFooterComponent {
    version: string= environment.version;
    plataforma: string= environment.plataforma;
    app: string= environment.app;
    autor: string= environment.autor;
    date = new Date();
    constructor(public layoutService: LayoutService) { }
}
