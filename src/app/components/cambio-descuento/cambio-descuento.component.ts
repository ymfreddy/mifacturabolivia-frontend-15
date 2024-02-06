import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { spv } from 'src/app/shared/constants/spv';
import { TipoParametrica } from 'src/app/shared/enums/tipo-parametrica.model';
import { InformationService } from 'src/app/shared/helpers/information.service';
import { CambioDescuento } from 'src/app/shared/models/descuento.model';
import { Parametrica } from 'src/app/shared/models/parametrica.model';
import { ParametricasService } from 'src/app/shared/services/parametricas.service';

@Component({
    selector: 'app-cambio-descuento',
    templateUrl: './cambio-descuento.component.html',
    styleUrls: ['./cambio-descuento.component.scss'],
})
export class CambioDescuentoComponent implements OnInit {
    item?: CambioDescuento;
    itemForm!: FormGroup;
    closeClicked = false;
    submited = false;
    listaTipoDescuento: Parametrica[] = [];
    constructor(
        private fb: FormBuilder,
        public config: DynamicDialogConfig,
        private dialogRef: DynamicDialogRef,
        private informationService: InformationService,
        private parametricasService: ParametricasService,
    ) {}

    ngOnInit(): void {
        this.parametricasService
            .getParametricasByTipo(TipoParametrica.TIPO_DESCUENTO)
            .subscribe((data) => {
                this.listaTipoDescuento = data as unknown as Parametrica[];
            });

        this.item = this.config.data;
        this.itemForm = this.fb.group({
            idTipoDescuento: [this.item?.idTipoDescuento, Validators.required],
            descuentoEstablecido: [this.item?.idTipoDescuento!==spv.TIPO_DESCUENTO_TOTAL ? this.item?.descuentoEstablecido : this.item?.descuento, [Validators.required],],
            descuento: [this.item?.descuento],
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

            if (
                this.itemForm.controls['idTipoDescuento'].value ===
                    spv.TIPO_DESCUENTO_PORCENTAJE && (
                this.itemForm.controls['descuentoEstablecido'].value>=100 ||
                this.itemForm.controls['descuentoEstablecido'].value<=0
                )
            ) {
                this.informationService.showWarning(
                    'El descuento por porcentaje debe ser mayor a 0 y menor a 100'
                );
                return;
            }

            if (
                this.itemForm.controls['idTipoDescuento'].value ===
                    spv.TIPO_DESCUENTO_MONTO &&
                this.itemForm.controls['descuentoEstablecido'].value<=0
                )
            {
                this.informationService.showWarning(
                    'El descuento por monto debe ser mayor a 0'
                );
                return;
            }

            if (
                this.itemForm.controls['idTipoDescuento'].value ===
                    spv.TIPO_DESCUENTO_TOTAL &&
                this.itemForm.controls['descuentoEstablecido'].value<0
                )
            {
                this.informationService.showWarning(
                    'El descuento total debe ser mayor o igual a 0'
                );
                return;
            }

            const descuentoNuevo: CambioDescuento = {
                ... this.item!,
                idTipoDescuento: this.itemForm.controls['idTipoDescuento'].value,
                descuentoEstablecido: this.itemForm.controls['idTipoDescuento'].value ===
                spv.TIPO_DESCUENTO_TOTAL ? 0 : this.itemForm.controls['descuentoEstablecido'].value,
                descuento : this.itemForm.controls['descuentoEstablecido'].value
            };

            this.dialogRef.close(descuentoNuevo);
        }
    }

    public onClose(): void {
        this.closeClicked = true;
    }

    public onSave(): void {
        this.closeClicked = false;
    }
}
