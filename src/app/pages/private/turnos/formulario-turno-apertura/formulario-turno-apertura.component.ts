import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DynamicDialogRef, DialogService } from 'primeng/dynamicdialog';

import { TurnoApertura } from 'src/app/shared/models/turno-apertura.model';
import { SessionService } from 'src/app/shared/security/session.service';
import { InformationService } from 'src/app/shared/helpers/information.service';
import { TurnosService } from 'src/app/shared/services/turnos.service';
import { InputNumber } from 'primeng/inputnumber';

@Component({
    selector: 'app-formulario-turno-apertura',
    templateUrl: './formulario-turno-apertura.component.html',
    styleUrls: ['./formulario-turno-apertura.component.scss'],
    providers: [DialogService],
})
export class FormularioTurnoAperturaComponent implements OnInit {
    @ViewChild('base') myInputField!: InputNumber;

    itemForm!: FormGroup;
    closeClicked = false;
    submited = false;
    constructor(
        private fb: FormBuilder,
        private dialogRef: DynamicDialogRef,
        private turnosService: TurnosService,
        private sessionService: SessionService,
        private informationService: InformationService
    ) {}

    ngOnInit(): void {
        this.itemForm = this.fb.group({
            base: [0, Validators.required],
        });
    }

    ngAfterViewInit(): void {
        setTimeout(() => {
            this.myInputField.input.nativeElement.focus();
        }, 500);
    }

    public onSubmit(): void {
        if (this.closeClicked) {
            this.dialogRef.close(null);
        } else {
            if (!this.itemForm.valid) {
                this.informationService.showWarning('Verifique los datos');
                return;
            }

            const usuarioSession = this.sessionService.getSessionUserData();

            const turno: TurnoApertura = {
                idSucursal: usuarioSession.idSucursal,
                idPuntoVenta: usuarioSession.idPuntoVenta,
                base: this.itemForm.controls['base'].value,
                usuario: usuarioSession.username,
            };

            this.submited = true;
            this.turnosService.open(turno).subscribe({
                next: (res) => {
                    this.informationService.showSuccess(res.message);
                    this.sessionService.setTurno(res.content);
                    this.dialogRef.close(turno);
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
