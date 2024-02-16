import { Component, OnInit } from '@angular/core';
import {
    Turno,
    TurnoCierre,
    TurnoDetalle,
} from 'src/app/shared/models/turno.model';
import { FormGroup, FormBuilder } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InformationService } from 'src/app/shared/helpers/information.service';
import { TurnosService } from 'src/app/shared/services/turnos.service';
import { PagosService } from 'src/app/shared/services/pagos.service';
import { ConfirmationService } from 'primeng/api';
import { SessionService } from 'src/app/shared/security/session.service';

@Component({
    selector: 'app-formulario-turno-cierre',
    templateUrl: './formulario-turno-cierre.component.html',
    styleUrls: ['./formulario-turno-cierre.component.scss'],
})
export class FormularioTurnoCierreComponent implements OnInit {
    item!: Turno;
    itemForm!: FormGroup;
    closeClicked = false;
    submited = false;

    items: TurnoDetalle[] = [];
    constructor(
        private fb: FormBuilder,
        public config: DynamicDialogConfig,
        private dialogRef: DynamicDialogRef,
        private informationService: InformationService,
        private pagoService: PagosService,
        private turnoService: TurnosService,
        private confirmationService: ConfirmationService,
        private sessionService: SessionService
    ) {}

    ngOnInit(): void {
        this.item = this.config.data;
        this.pagoService.getResumenByIdTurno(this.item.id).subscribe({
            next: (res) => {
                const resumenPagos = res.content;
                resumenPagos.forEach((element: any) => {
                    const detalle: TurnoDetalle = {
                        idTurno: element.idTurno,
                        codigoTipoPago: element.codigoTipoPago,
                        tipoPago: element.tipoPago,
                        montoTotalCaja: element.importe,
                        montoTotalActual: 0,
                        montoTotalDiferencia: element.importe,
                    };
                    this.items.push(detalle);
                });
            },
            error: (err) => {
                this.informationService.showError(err.error.message);
            },
        });

        this.itemForm = this.fb.group({
            base: [this.item.base],
            observaciones: [this.item.observaciones],
        });
    }

    calcularFilas() {
        this.items.forEach(row => {
        if (!row.montoTotalActual) {
            row.montoTotalActual = 0;
        }
        const diferencia = row.montoTotalCaja - row.montoTotalActual;
        row.montoTotalActual = row.montoTotalActual;
        row.montoTotalDiferencia = diferencia;
      });
    }

    getTotalCaja(): number {
        if (this.items) {
            return this.items
                .map((t) => t.montoTotalCaja)
                .reduce((acc, value) => acc + parseFloat(value.toString()), 0);
        }

        return 0;
    }

    getTotalActual(): number {
        if (this.items) {
            return this.items
                .map((t) => t.montoTotalActual)
                .reduce((acc, value) => acc + parseFloat(value.toString()), 0);
        }

        return 0;
    }

    getTotalDiferencia(): number {
        if (this.items) {
            return this.items
                .map((t) => t.montoTotalDiferencia)
                .reduce((acc, value) => acc + parseFloat(value.toString()), 0);
        }
        return 0;
    }

    public onSubmit(): void {
        if (this.closeClicked) {
            this.dialogRef.close(null);
        } else {
            if (!this.itemForm.valid) {
                this.informationService.showWarning('Verifique los datos');
                return;
            }

            const turnoCierre: TurnoCierre = {
                id: this.item.id,
                montoTotalCaja: this.getTotalCaja(),
                montoTotalActual: this.getTotalActual(),
                montoTotalDiferencia: this.getTotalDiferencia(),
                observaciones: this.itemForm.controls['observaciones'].value,
                detalle: this.items,
            };

            this.confirmationService.confirm({
                message: 'Esta seguro de realizar el cierre de turno?',
                header: 'Confirmación',
                icon: 'pi pi-exclamation-triangle',
                accept: () => {
                    this.submited = true;
                    this.turnoService.close(turnoCierre).subscribe({
                        next: (res) => {
                            this.informationService.showSuccess(res.message);
                            if (
                                turnoCierre.id == this.sessionService.getTurno()
                            ) {
                                this.sessionService.setTurno(0);
                            }

                            this.dialogRef.close(turnoCierre);
                            this.submited = false;
                        },
                        error: (err) => {
                            this.informationService.showError(
                                err.error.message
                            );
                        },
                    });
                },
            });
        }
    }

    onEditComplete(event: any) {
        this.calcularFilas();
    }

    public onClose(): void {
        this.closeClicked = true;
    }

    public onSave(): void {
        this.closeClicked = false;
    }
}
