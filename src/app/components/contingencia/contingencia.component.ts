import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { HelperService } from 'src/app/shared/helpers/helper.service';
import { InformationService } from 'src/app/shared/helpers/information.service';
import { FacturasService } from 'src/app/shared/services/facturas.service';
import { Asociacion } from 'src/app/shared/models/session-usuario.model';
import { SessionService } from 'src/app/shared/security/session.service';
import { sfe } from 'src/app/shared/constants/sfe';
import { DatePipe } from '@angular/common';
import { ParametricaSfe } from 'src/app/shared/models/parametrica-sfe.model';
import { ParametricasSfeService } from 'src/app/shared/services/parametricas-sfe.service';

@Component({
  selector: 'app-contingencia',
  templateUrl: './contingencia.component.html',
  styleUrls: ['./contingencia.component.scss']
})
export class ContingenciaComponent implements OnInit {
    itemForm!: FormGroup;
    closeClicked = false;
    submited = false;
    listaAsociacion: Asociacion[] = [];
    listaTipoEvento: ParametricaSfe[] = [];

    constructor(
        private fb: FormBuilder,
        public config: DynamicDialogConfig,
        private dialogRef: DynamicDialogRef,
        private informationService: InformationService,
        private parametricasSfeService: ParametricasSfeService,
        private sessionService: SessionService,
        private facturasService: FacturasService,
        private datepipe: DatePipe,
    ) {}

    ngOnInit(): void {
        this.listaAsociacion = this.sessionService.getSessionAsociaciones();
        this.parametricasSfeService.getTipoEvento().subscribe((data) => {
            const aux = data as unknown as ParametricaSfe[];
            this.listaTipoEvento = aux.filter(x=>x.codigo===5 || x.codigo===6 || x.codigo===7);
        });

        // cargar data
        this.itemForm = this.fb.group({
            codigoAsociacion: ['', Validators.required],
            cafc: ['', Validators.required],
            fechaInicio: [new Date(), Validators.required],
            fechaFin: [new Date(), Validators.required],
            codigoMotivoEvento: [null, Validators.required],
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
            const evento: any = {
                codigoAsociacion: this.itemForm.controls['codigoAsociacion'].value,
                cafc: this.itemForm.controls['cafc'].value.trim(),
                fechaInicio: this.datepipe.transform(
                    this.itemForm.controls['fechaInicio'].value,
                    'dd/MM/yyyy HH:mm'
                ) ,
                fechaFin: this.datepipe.transform(
                    this.itemForm.controls['fechaFin'].value,
                    'dd/MM/yyyy HH:mm'
                ) ,
                sucursal: this.sessionService.getSessionUserData().numeroSucursal,
                puntoVenta: this.sessionService.getSessionUserData().numeroPuntoVenta,
                codigoMotivoEvento : this.itemForm.controls['codigoMotivoEvento'].value
            };

            this.submited = true;
            this.facturasService.sendEventoContigencia(evento).subscribe({
                next: (res) => {
                   this.informationService.showSuccess(res.message);
                   this.dialogRef.close(evento);
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
}
