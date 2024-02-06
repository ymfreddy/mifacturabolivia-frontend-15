import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InformationService } from 'src/app/shared/helpers/information.service';
import { FacturasService } from 'src/app/shared/services/facturas.service';
import { HelperService } from 'src/app/shared/helpers/helper.service';
import { ClientesService } from 'src/app/shared/services/clientes.service';
import { FacturaResumen } from 'src/app/shared/models/factura-resumen.model';
import { UtilidadesService } from 'src/app/shared/services/utilidades.service';

@Component({
  selector: 'app-enviar-whatsapp',
  templateUrl: './enviar-whatsapp.component.html',
  styleUrls: ['./enviar-whatsapp.component.scss']
})
export class EnviarWhatsappComponent implements OnInit {
    item?: FacturaResumen;
    itemForm!: FormGroup;
    closeClicked = false;
    submited = false;

    constructor(
        private fb: FormBuilder,
        public config: DynamicDialogConfig,
        private dialogRef: DynamicDialogRef,
        private informationService: InformationService,
        private clienteService: ClientesService,
        private facturasService: FacturasService,
        private helperService :HelperService,
        private utilidadesService: UtilidadesService,
    ) {}

    ngOnInit(): void {
        // cargar data
        this.item = this.config.data;
        this.itemForm = this.fb.group({
            telefono: [null, Validators.required]
        });


        this.clienteService.getTelefonoByNitAndCodigoCliente(this.item?.nitEmisor!, this.item?.codigoCliente!).subscribe({
            next: (res) => {
               var celular = res.content;
               this.itemForm.patchValue({ telefono: celular });
               this.itemForm.updateValueAndValidity();
            },
            error: (err) => {},
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
            var telefono = this.itemForm.controls['telefono'].value;
            if (telefono.length<8) {
                this.informationService.showWarning('Número Inválido');
                return;
            }

            if (telefono<50000000) {
                this.informationService.showWarning('Número Inválido');
                return;
            }

            this.submited = true;
            this.utilidadesService.sendFacturaWhatsapp(this.item?.id!, this.itemForm.controls['telefono'].value).subscribe(
                (res) => {
                    this.informationService.showSuccess(res.message);
                    this.dialogRef.close();
                    this.submited = false;
                },
                (err) => {
                    console.log(err);
                    this.informationService.showError(err.error.message+ "\n"+this.helperService.jsonToString(err.error.content));
                    this.submited = false;
                }
            );
        }
    }


    public onClose(): void {
        this.closeClicked = true;
    }

    public onSave(): void {
        this.closeClicked = false;
    }
}
