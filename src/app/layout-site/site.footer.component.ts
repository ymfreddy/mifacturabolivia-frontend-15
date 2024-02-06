import { Component } from '@angular/core';
import { environment } from 'src/environments/environment';
import { LayoutService } from "./service/site.layout.service";

@Component({
    selector: 'site-footer',
    templateUrl: './site.footer.component.html'
})
export class SiteFooterComponent {
    version: string= environment.version;
    plataforma: string= environment.plataforma;
    site: string= environment.app;
    autor: string= environment.autor;
    date = new Date();
    constructor(public layoutService: LayoutService) { }
}
