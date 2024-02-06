import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
    DialogService,
    DynamicDialogConfig,
    DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { TipoParametrica } from 'src/app/shared/enums/tipo-parametrica.model';
import { InformationService } from 'src/app/shared/helpers/information.service';
import { Estudiante } from 'src/app/shared/models/estudiante.model';
import { Parametrica } from 'src/app/shared/models/parametrica.model';
import { EstudiantesService } from 'src/app/shared/services/estudiantes.service';
import { ParametricasService } from 'src/app/shared/services/parametricas.service';

@Component({
    selector: 'app-formulario-estudiante',
    templateUrl: './formulario-estudiante.component.html',
    styleUrls: ['./formulario-estudiante.component.scss'],
    providers: [DialogService],
})
export class FormularioEstudianteComponent implements OnInit {
    item?: Estudiante;
    itemForm!: FormGroup;
    closeClicked = false;
    submited = false;
    idEmpresa!:number;

    listaTurnos: Parametrica[] = [];
    listaGrados: Parametrica[] = [];
    constructor(
        private fb: FormBuilder,
        public config: DynamicDialogConfig,
        private dialogRef: DynamicDialogRef,
        private informationService: InformationService,
        private estudianteservice: EstudiantesService,
        private parametricasService: ParametricasService,
    ) {}

    ngOnInit(): void {
        this.idEmpresa = this.config.data.idEmpresa;
        this.item = this.config.data.item;

        this.parametricasService
            .getParametricasByTipo(TipoParametrica.TURNO_ESTUDIANTE)
            .subscribe((data) => {
                this.listaTurnos = data as unknown as Parametrica[];
            });
        this.parametricasService
            .getParametricasByTipo(TipoParametrica.GRADO_ESTUDIANTE)
            .subscribe((data) => {
                this.listaGrados = data as unknown as Parametrica[];
            });

        this.itemForm = this.fb.group({
            id: [this.item?.id],
            codigoEstudiante: [this.item?.codigoEstudiante, Validators.required],
            numeroDocumento: [this.item?.numeroDocumento],
            nombres: [this.item?.nombres, Validators.required],
            apellidoPaterno: [this.item?.apellidoPaterno],
            apellidoMaterno: [this.item?.apellidoMaterno],
            idEmpresa: [this.item?.idEmpresa],
            curso: [this.item?.curso, Validators.required],
            idTurno: [this.item?.idTurno, Validators.required],
            idGrado: [this.item?.idGrado, Validators.required],
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

            const idGrado =
                this.itemForm.controls['idGrado'].value;
            const grado = this.listaGrados.find(
                (x) => x.id === idGrado
            )?.descripcion;

            const idTurno =
                this.itemForm.controls['idTurno'].value;
            const turno = this.listaTurnos.find(
                (x) => x.id === idTurno
            )?.descripcion;

            const estudiante: Estudiante = {
                id: this.itemForm.controls['id'].value,
                idEmpresa:
                    this.itemForm.controls['idEmpresa'].value ??
                    this.idEmpresa,
                codigoEstudiante: this.itemForm.controls['codigoEstudiante'].value,
                numeroDocumento: this.itemForm.controls['numeroDocumento'].value,
                nombres: this.itemForm.controls['nombres'].value,
                apellidoPaterno: this.itemForm.controls['apellidoPaterno'].value,
                apellidoMaterno: this.itemForm.controls['apellidoMaterno'].value,
                nombreCompleto: this.itemForm.controls['nombres'].value+' '+(this.itemForm.controls['apellidoPaterno'].value??'')+' '+(this.itemForm.controls['apellidoMaterno'].value??''),
                curso: this.itemForm.controls['curso'].value,
                idGrado: idGrado,
                grado: grado,
                idTurno: idTurno,
                turno: turno
            };

            this.submited = true;
            // modificar estudiante 0
            if (estudiante.id > 0) {
                this.estudianteservice.edit(estudiante).subscribe({
                    next: (res) => {
                        this.informationService.showSuccess(res.message);
                        this.dialogRef.close(estudiante);
                    },
                    error: (err) => {
                        this.informationService.showError(err.error.message);
                        this.submited = false;
                    },
                });
            } else {
                this.estudianteservice.add(estudiante).subscribe({
                    next: (res) => {
                        estudiante.id = res.content;
                        this.informationService.showSuccess(res.message);
                        this.dialogRef.close(estudiante);
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
}
