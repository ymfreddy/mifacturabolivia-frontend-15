import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InformationService } from 'src/app/shared/helpers/information.service';
import { VentaFacturaResumen } from 'src/app/shared/models/venta.model';
import { FacturasService } from 'src/app/shared/services/facturas.service';
import { HelperService } from 'src/app/shared/helpers/helper.service';

@Component({
  selector: 'app-revertir-factura',
  templateUrl: './revertir-factura.component.html',
  styleUrls: ['./revertir-factura.component.scss']
})
export class RevertirFacturaComponent implements OnInit {
    item?: VentaFacturaResumen;
    itemForm!: FormGroup;
    closeClicked = false;
    submited = false;

    constructor(
        private fb: FormBuilder,
        public config: DynamicDialogConfig,
        private dialogRef: DynamicDialogRef,
        private informationService: InformationService,
        private facturasService: FacturasService,
        private helperService :HelperService
    ) {}

    ngOnInit(): void {
        // cargar data
        this.item = this.config.data;
        this.itemForm = this.fb.group({
            codigoAsociacion: [this.item?.codigoAsociacion],
            cuf: [this.item?.cuf]
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
            const revertir: any = {
                codigoAsociacion: this.itemForm.controls['codigoAsociacion'].value,
                cuf: this.itemForm.controls['cuf'].value,
            };
            this.submited = true;
            this.facturasService.sendFacturaRevertida(revertir).subscribe({
                next: (res) => {
                   this.informationService.showSuccess(res.message +"\n"+this.helperService.jsonToString(res.content));
                   this.dialogRef.close(revertir);
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
