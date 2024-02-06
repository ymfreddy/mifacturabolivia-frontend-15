import { Component, OnInit } from '@angular/core';
import { InformationService } from 'src/app/shared/helpers/information.service';
import { AsociacionesService } from 'src/app/shared/services/asociaciones.service';
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { DatosFacturacion } from 'src/app/shared/models/datos-facturacion.model';
import { ActivarTipoEmisionComponent } from 'src/app/components/activar-tipo-emision/activar-tipo-emision.component';
import { SessionService } from '../../shared/security/session.service';
import { sfe } from 'src/app/shared/constants/sfe';

@Component({
    selector: 'app-punto-tipo-emision',
    templateUrl: './punto-tipo-emision.component.html',
    styleUrls: ['./punto-tipo-emision.component.scss'],
})
export class PuntoTipoEmisionComponent implements OnInit {
    listaDatosFacturacion: DatosFacturacion[] = [];
    itemDialog!: boolean;
    blockedPanel: boolean = false;

    constructor(
        public config: DynamicDialogConfig,
        private dialogRef: DynamicDialogRef,
        private asociacionesService: AsociacionesService,
        private informationService: InformationService,
        public dialogService: DialogService,
        private sessionService: SessionService,
    ) {}

    ngOnInit(): void {
        this.loadDataFacturacion();
    }

    loadDataFacturacion(): void {
        this.listaDatosFacturacion = [];
        const listaAsociacion = this.sessionService.getSessionAsociaciones();

        const solicitud = {
            sucursal: this.sessionService.getSessionUserData().numeroSucursal,
            puntoVenta: this.sessionService.getSessionUserData().numeroPuntoVenta,
            nit: this.sessionService.getSessionUserData().empresaNit
        };
        this.asociacionesService.getDatosFacturacion(solicitud).subscribe({
            next: (res) => {
                res.content.forEach((element:any) => {
                    const existe = listaAsociacion.find(x=>x.codigoAsociacion===element.codigoAsociacion);
                    if (existe){
                        this.listaDatosFacturacion.push(element);
                    }
                });
            },
            error: (err) => {
                this.informationService.showError(err.error.message);
            },
        });
    }

    changeModalidad(item: DatosFacturacion) {
        const ref = this.dialogService.open(ActivarTipoEmisionComponent, {
            header: 'Cambiar Tipo Emisión',
            width: '400px',
            data: item,
        });
        ref.onClose.subscribe((res) => {
            if (res) {
                this.loadDataFacturacion();
            }
        });
    }

    onClose(){
        this.dialogRef.close(null);
    }

    ngOnDestroy(): void {
        this.dialogService.dialogComponentRefMap.forEach((dialog) => {
            dialog.destroy();
        });
    }
}
