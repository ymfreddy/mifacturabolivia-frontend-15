import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
    DialogService,
    DynamicDialogConfig,
    DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { sfe } from 'src/app/shared/constants/sfe';
import { TipoParametrica } from 'src/app/shared/enums/tipo-parametrica.model';
import { InformationService } from 'src/app/shared/helpers/information.service';
import { Medico } from 'src/app/shared/models/medico.model';
import { ParametricaSfe } from 'src/app/shared/models/parametrica-sfe.model';
import { Parametrica } from 'src/app/shared/models/parametrica.model';
import { SessionService } from 'src/app/shared/security/session.service';
import { FacturasService } from 'src/app/shared/services/facturas.service';
import { MedicosService } from 'src/app/shared/services/medicos.service';
import { ParametricasSfeService } from 'src/app/shared/services/parametricas-sfe.service';
import { ParametricasService } from 'src/app/shared/services/parametricas.service';

@Component({
    selector: 'app-formulario-medico',
    templateUrl: './formulario-medico.component.html',
    styleUrls: ['./formulario-medico.component.scss'],
    providers: [DialogService],
})
export class FormularioMedicoComponent implements OnInit {
    item?: Medico;
    itemForm!: FormGroup;
    closeClicked = false;
    submited = false;
    idEmpresa!:number;
    listaEspecialidades: Parametrica[] = [];
    constructor(
        private fb: FormBuilder,
        public config: DynamicDialogConfig,
        private dialogRef: DynamicDialogRef,
        private informationService: InformationService,
        private medicoservice: MedicosService,
        private sessionService: SessionService,
        private parametricasService: ParametricasService,
        private facturaService: FacturasService
    ) {}

    ngOnInit(): void {
        this.parametricasService
            .getParametricasByTipo(TipoParametrica.TIPO_ESPECIALIDAD_MEDICO)
            .subscribe((data) => {
                this.listaEspecialidades = data as unknown as Parametrica[];
            });

        this.idEmpresa = this.config.data.idEmpresa;
        this.item = this.config.data.item;

        this.itemForm = this.fb.group({
            id: [this.item?.id],
            idEspecialidad: [this.item?.idEspecialidad, Validators.required],
            nitDocumento: [this.item?.nitDocumento, [Validators.required]],
            nombre: [this.item?.nombre, Validators.required],
            matricula: [this.item?.matricula],
            idEmpresa: [this.item?.idEmpresa],
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
            // obtener valores combo
            const idEspecialidad =
                this.itemForm.controls['idEspecialidad'].value;
            const especialidad = this.listaEspecialidades.find(
                (x) => x.id === idEspecialidad
            )?.descripcion!;

            const medico: Medico = {
                id: this.itemForm.controls['id'].value,
                idEmpresa:
                    this.itemForm.controls['idEmpresa'].value ??
                    this.idEmpresa,
                nitDocumento: this.itemForm.controls['nitDocumento'].value,
                idEspecialidad: idEspecialidad,
                especialidad: especialidad,
                nombre: this.itemForm.controls['nombre'].value.trim(),
                matricula: this.itemForm.controls['matricula'].value,
            };

            this.submited = true;
            // modificar medico 0
            if (medico.id > 0) {
                this.medicoservice.edit(medico).subscribe({
                    next: (res) => {
                        this.informationService.showSuccess(res.message);
                        this.dialogRef.close(medico);
                    },
                    error: (err) => {
                        this.informationService.showError(err.error.message);
                        this.submited = false;
                    },
                });
            } else {
                this.medicoservice.add(medico).subscribe({
                    next: (res) => {
                        medico.id = res.content;
                        this.informationService.showSuccess(res.message);
                        this.dialogRef.close(medico);
                    },
                    error: (err) => {
                        this.informationService.showError(err.error.message);
                        this.submited = false;
                    },
                });
            }
        }
    }

    public onClose(): void {
        this.closeClicked = true;
    }

    public onSave(): void {
        this.closeClicked = false;
    }

    public verificarNit() {
        if (!this.itemForm.controls['nitDocumento'].value) {
            this.informationService.showWarning(
                'Debe ingresar un número de nit'
            );
            return;
        }
        const solicitud = {
            codigoAsociacion:
                this.sessionService.getSessionAsociaciones()[0]
                    .codigoAsociacion,
            sucursal: this.sessionService.getSessionUserData().numeroSucursal,
            puntoVenta: this.sessionService.getSessionUserData().numeroPuntoVenta,
            nitParaVerificar: this.itemForm.controls['nitDocumento'].value,
        };
        this.submited = true;
        this.facturaService.verifyNit(solicitud).subscribe({
            next: (res) => {
                this.informationService.showSuccess(res.message);
                this.submited = false;
            },
            error: (err) => {
                this.informationService.showError(err.error.message);
                this.submited = false;
            },
        });
    }
}
