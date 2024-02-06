import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InformationService } from 'src/app/shared/helpers/information.service';
import { Venta } from 'src/app/shared/models/venta.model';
import { SessionService } from 'src/app/shared/security/session.service';
import { FacturasService } from 'src/app/shared/services/facturas.service';
import { HelperService } from 'src/app/shared/helpers/helper.service';
import { Asociacion } from 'src/app/shared/models/session-usuario.model';
import { VentasService } from 'src/app/shared/services/ventas.service';
import { FacturaRecepcion } from 'src/app/shared/models/factura-recepcion.model';

@Component({
    selector: 'app-emitir-factura',
    templateUrl: './emitir-factura.component.html',
    styleUrls: ['./emitir-factura.component.scss'],
})
export class EmitirFacturaComponent implements OnInit {
    item!: Venta;
    itemForm!: FormGroup;
    closeClicked = false;
    submited = false;
    listaAsociacion: Asociacion[] = [];

    constructor(
        private fb: FormBuilder,
        public config: DynamicDialogConfig,
        private dialogRef: DynamicDialogRef,
        private sessionService: SessionService,
        private informationService: InformationService,
        private facturasService: FacturasService,
        private helperService: HelperService,
        private ventasService: VentasService
    ) {}

    ngOnInit(): void {
        this.listaAsociacion = this.sessionService.getSessionAsociaciones();
        // cargar data
        this.item = this.config.data;
        this.itemForm = this.fb.group({
            codigoAsociacion: [
                null,
                Validators.required,
            ],
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

            this.submited = true;
            this.ventasService.getDataFacturacion(this.item.id).subscribe({
                next: (res1) => {
                    // mandar a facturacion
                    const factura: FacturaRecepcion = {
                        ...res1.content,
                        codigoAsociacion:
                            this.itemForm.controls['codigoAsociacion'].value,
                        sucursal:
                            this.sessionService.getSessionUserData()
                                .numeroSucursal,
                        puntoVenta:
                            this.sessionService.getSessionUserData()
                                .numeroPuntoVenta,
                    };
                    // enviar factura
                    this.facturasService
                        .sendFactura(factura)
                        .subscribe({
                            next: (res2) => {
                                this.informationService.showSuccess( res2.message +'\n' + this.helperService.jsonToString(res2.content));
                                this.dialogRef.close(factura);
                                this.submited = false;
                            },
                            error: (err2) => {
                                this.informationService.showError(err2.error.message +"\n"+this.helperService.jsonToString(err2.error.content));
                                this.submited = false;
                                if (err2.error.content && err2.error.content.idFactura){
                                    this.dialogRef.close(factura);
                                }
                            },
                        });
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
}
