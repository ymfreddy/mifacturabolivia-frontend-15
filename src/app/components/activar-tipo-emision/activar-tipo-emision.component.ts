import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { sfe } from 'src/app/shared/constants/sfe';
import { HelperService } from 'src/app/shared/helpers/helper.service';
import { InformationService } from 'src/app/shared/helpers/information.service';
import { ParametricaSfe } from 'src/app/shared/models/parametrica-sfe.model';
import { FacturasService } from 'src/app/shared/services/facturas.service';
import { ParametricasSfeService } from 'src/app/shared/services/parametricas-sfe.service';
import { DatosFacturacion } from '../../shared/models/datos-facturacion.model';

@Component({
    selector: 'app-activar-tipo-emision',
    templateUrl: './activar-tipo-emision.component.html',
    styleUrls: ['./activar-tipo-emision.component.scss'],
})
export class ActivarTipoEmisionComponent implements OnInit {
    item?: DatosFacturacion;
    itemForm!: FormGroup;
    closeClicked = false;
    submited = false;
    listaTipo: ParametricaSfe[] = [];
    listaTipoEvento: ParametricaSfe[] = [];

    constructor(
        private fb: FormBuilder,
        public config: DynamicDialogConfig,
        private dialogRef: DynamicDialogRef,
        private informationService: InformationService,
        private parametricasSfeService: ParametricasSfeService,
        private facturasService: FacturasService,
        private helperService: HelperService
    ) {}

    ngOnInit(): void {
        this.parametricasSfeService.getTipoEmision().subscribe((data) => {
            this.listaTipo = data as unknown as ParametricaSfe[];
        });

        this.parametricasSfeService.getTipoEvento().subscribe((data) => {
            const aux = data as unknown as ParametricaSfe[];
            this.listaTipoEvento = aux.filter(x=>x.codigo===1 || x.codigo===2);
        });

        // cargar data
        this.item = this.config.data;
        this.itemForm = this.fb.group({
            codigoTipoEmision: ['', Validators.required],
            codigoMotivoEvento: [{ value: null, disabled: true }],
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
                this.itemForm.controls['codigoTipoEmision'].value ===
                    sfe.CODIGO_TIPO_EMISION_OFFLINE &&
                !this.itemForm.controls['codigoMotivoEvento'].value
            ) {
                this.informationService.showWarning(
                    'Debe seleccionar un tipo de evento'
                );
                return;
            }


            if (this.item){
                // individual

            const activar: any = {
                codigoAsociacion: this.item?.codigoAsociacion,
                sucursal: this.item?.sucursal,
                puntoVenta: this.item?.puntoVenta,
                codigoTipoEmision:
                    this.itemForm.controls['codigoTipoEmision'].value,
                codigoMotivoEvento:
                    this.itemForm.controls['codigoMotivoEvento'].value,
            };
            this.submited = true;
            this.facturasService.activarTipoEmision(activar).subscribe({
                next: (res) => {
                    this.informationService.showSuccess(
                        res.message + '\n' + this.helperService.jsonToString(res.content)
                    );
                    const respuesta = {
                        codigoTipoEmision :res.content.codigoTipoEmision,
                        tipoEmision: res.content.tipoEmision
                    }
                    this.dialogRef.close(respuesta);
                    this.submited = false;
                },
                error: (err) => {
                    this.informationService.showError(
                        err.error.message +
                            '\n' +
                            this.helperService.jsonToString(err.error.content)
                    );
                    this.submited = false;
                },
            });
            }
            else{
                // global
                const activar: any = {
                    codigoTipoEmision:
                        this.itemForm.controls['codigoTipoEmision'].value,
                    codigoMotivoEvento:
                        this.itemForm.controls['codigoMotivoEvento'].value,
                };
                this.submited = true;
                this.facturasService.activarTipoEmisionGlobal(activar).subscribe({
                    next: (res) => {
                        this.informationService.showSuccess(res.message);
                        this.dialogRef.close(res);
                        this.submited = false;
                    },
                    error: (err) => {
                        this.informationService.showError(
                            err.error.message +
                                '\n' +
                                this.helperService.jsonToString(err.error.content)
                        );
                        this.submited = false;
                    },
                });
            }

        }
    }

    canbioTipoEmision(event: any) {
        if (!event.value) {
            this.itemForm.controls['codigoMotivoEvento'].disable();
            this.itemForm.patchValue({ codigoMotivoEvento: null });
            this.itemForm.updateValueAndValidity();
            return;
        }
        if (event.value === sfe.CODIGO_TIPO_EMISION_OFFLINE) {
            this.itemForm.controls['codigoMotivoEvento'].enable();
        } else {
            this.itemForm.controls['codigoMotivoEvento'].disable();
            this.itemForm.patchValue({ codigoMotivoEvento: null });
        }
        this.itemForm.updateValueAndValidity();
    }

    public onClose(): void {
        this.closeClicked = true;
    }

    public onSave(): void {
        this.closeClicked = false;
    }
}
