import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InformationService } from 'src/app/shared/helpers/information.service';
import { ParametricaSfe } from 'src/app/shared/models/parametrica-sfe.model';
import { VentaFacturaResumen } from 'src/app/shared/models/venta.model';
import { ParametricasSfeService } from 'src/app/shared/services/parametricas-sfe.service';
import { FacturasService } from 'src/app/shared/services/facturas.service';
import { HelperService } from 'src/app/shared/helpers/helper.service';

@Component({
    selector: 'app-anular-factura',
    templateUrl: './anular-factura.component.html',
    styleUrls: ['./anular-factura.component.scss'],
})
export class AnularFacturaComponent implements OnInit {
    item?: VentaFacturaResumen;
    itemForm!: FormGroup;
    closeClicked = false;
    submited = false;
    listaMotivos: ParametricaSfe[] = [];

    constructor(
        private fb: FormBuilder,
        public config: DynamicDialogConfig,
        private dialogRef: DynamicDialogRef,
        private informationService: InformationService,
        private parametricasSfeService: ParametricasSfeService,
        private facturasService: FacturasService,
        private helperService :HelperService
    ) {}

    ngOnInit(): void {
        this.parametricasSfeService.getMotivoAnulacion().subscribe((data) => {
            this.listaMotivos = data as unknown as ParametricaSfe[];
        });

        // cargar data
        this.item = this.config.data;
        this.itemForm = this.fb.group({
            codigoAsociacion: [this.item?.codigoAsociacion],
            cuf: [this.item?.cuf],
            codigoMotivo: ['', Validators.required],
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
            const anular: any = {
                codigoAsociacion: this.itemForm.controls['codigoAsociacion'].value,
                cuf: this.itemForm.controls['cuf'].value,
                codigoMotivo: this.itemForm.controls['codigoMotivo'].value,
            };
            this.submited = true;
            this.facturasService.sendFacturaAnulada(anular).subscribe({
                next: (res) => {
                   this.informationService.showSuccess(res.message +"\n"+this.helperService.jsonToString(res.content));
                   this.dialogRef.close(anular);
                   this.submited = false;
                },
                error: (err) => {
                    this.informationService.showError(err.error.message +"\n"+this.helperService.jsonToString(err.error.content));
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
