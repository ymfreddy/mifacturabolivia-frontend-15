import { Component, OnInit } from '@angular/core';
import { adm } from 'src/app/shared/constants/adm';
import { SessionUsuario } from 'src/app/shared/models/session-usuario.model';
import { SessionService } from 'src/app/shared/security/session.service';
import { InformationService } from '../../shared/helpers/information.service';

@Component({
    selector: 'app-gps',
    templateUrl: './gps.component.html',
    styleUrls: ['./gps.component.scss'],
})
export class GpsComponent implements OnInit {
    usuario!: SessionUsuario;
    constructor(
        private sessionService: SessionService,
        private informationService: InformationService
    ) {}

    ngOnInit(): void {
        if (this.sessionService.getSessionUserData()) {
            this.usuario = this.sessionService.getSessionUserData();
        }
    }

    activar(): void {
        const estado = !this.sessionService.getGps();
        this.sessionService.setGps(estado);
        if (estado) {
            this.informationService.showInfo('Gps iniciado');
        } else {
            this.informationService.showInfo('Gps detenido');
        }
    }

    estiloActivo(): boolean {
        return this.sessionService.getGps();
    }

    verOpcion(): Boolean {
        return this.usuario.idTipoUsuario == adm.TIPO_USUARIO_ASESOR;
    }

}
