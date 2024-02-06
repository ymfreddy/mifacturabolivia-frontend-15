import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InformationService } from 'src/app/shared/helpers/information.service';
import { FacturasService } from 'src/app/shared/services/facturas.service';
import { Asociacion} from 'src/app/shared/models/session-usuario.model';
import { SessionService } from 'src/app/shared/security/session.service';
import { Paquete } from 'src/app/shared/models/paquete.model';

@Component({
    selector: 'app-envio-contingencia',
    templateUrl: './envio-contingencia.component.html',
    styleUrls: ['./envio-contingencia.component.scss'],
})
export class EnvioContingenciaComponent implements OnInit {
    itemForm!: FormGroup;
    closeClicked = false;
    submited = false;
    listaAsociacion: Asociacion[] = [];
    listaPaquete: Paquete[] = [];

    constructor(
        private fb: FormBuilder,
        public config: DynamicDialogConfig,
        private dialogRef: DynamicDialogRef,
        private informationService: InformationService,
        private sessionService: SessionService,
        private facturasService: FacturasService,
    ) {}

    ngOnInit(): void {
        this.listaAsociacion = this.sessionService.getSessionAsociaciones();


        // cargar data
        this.itemForm = this.fb.group({
            codigoAsociacion: [null, Validators.required],
        });
    }

    public onSubmit(): void {
        if (this.closeClicked) {
            this.dialogRef.close(null);
        } else {
            if (!this.itemForm.valid) {
                this.informationService.showWarning('Verifique los datos');
                return;
            }

            if (this.listaPaquete.length==0) {
                this.informationService.showWarning('No existe paquetes para el envio');
                return;
            }

            const paquete: any = {
                codigoAsociacion:
                    this.itemForm.controls['codigoAsociacion'].value,
                sucursal:
                    this.sessionService.getSessionUserData().numeroSucursal,
                puntoVenta:
                    this.sessionService.getSessionUserData().numeroPuntoVenta,
            };

            this.submited = true;
            this.facturasService.sendPaqueteContigencia(paquete).subscribe({
                next: (res) => {
                    this.informationService.showSuccess(res.message);
                    this.dialogRef.close(paquete);
                    this.submited = false;
                },
                error: (err) => {
                    this.informationService.showError(err.error.message);
                    this.submited = false;
                },
            });
        }
    }

    public onClose(): void {
        this.closeClicked = true;
    }

    public onSave(): void {
        this.closeClicked = false;
    }

    cambioSector(event: any) {
        if (!event.value) {
            this.listaPaquete = [];
            return;
        }

        const busqueda = {
            codigoAsociacion: event.value,
            sucursal: this.sessionService.getSessionUserData().numeroSucursal,
            puntoVenta: this.sessionService.getSessionUserData().numeroPuntoVenta,
        };
        this.facturasService.getPaquetesContigencia(busqueda)
            .subscribe({
                next: (res) => {
                    this.listaPaquete = res.content;
                },
                error: (err) => {
                    this.informationService.showError(err.error.message);
                },
            });
    }


}
