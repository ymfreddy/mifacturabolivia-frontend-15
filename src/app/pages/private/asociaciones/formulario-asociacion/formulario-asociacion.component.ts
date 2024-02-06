import { Component, OnInit } from '@angular/core';
import {
    FormBuilder,
    FormGroup,
    Validators,
} from '@angular/forms';
import {
    DialogService,
    DynamicDialogConfig,
    DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { TipoParametrica } from 'src/app/shared/enums/tipo-parametrica.model';
import { InformationService } from 'src/app/shared/helpers/information.service';
import { Asociacion } from 'src/app/shared/models/asociacion.model';
import { Empresa } from 'src/app/shared/models/empresa.model';
import { Parametrica } from 'src/app/shared/models/parametrica.model';
import { Sistema } from 'src/app/shared/models/sistema.model';
import { AsociacionesService } from 'src/app/shared/services/asociaciones.service';
import { EmpresasService } from 'src/app/shared/services/empresas.service';
import { ParametricasService } from 'src/app/shared/services/parametricas.service';
import { SistemasService } from 'src/app/shared/services/sistemas.service';

@Component({
    selector: 'app-formulario-asociacion',
    templateUrl: './formulario-asociacion.component.html',
    styleUrls: ['./formulario-asociacion.component.scss'],
    providers: [DialogService],
})
export class FormularioAsociacionComponent implements OnInit {
    item?: Asociacion;
    itemForm!: FormGroup;
    closeClicked = false;
    submited = false;
    listaEmpresas: Empresa[] = [];
    listaSistemas: Sistema[] = [];
    listaEstados: Parametrica[] = [];
    listaModalidades: Parametrica[] = [];
    listaAmbientes: Parametrica[] = [];
    constructor(
        private fb: FormBuilder,
        public config: DynamicDialogConfig,
        private dialogRef: DynamicDialogRef,
        private informationService: InformationService,
        private asociacioneservice: AsociacionesService,
        private empresasService: EmpresasService,
        private sistemasService: SistemasService,
        private parametricasService: ParametricasService,
    ) {}

    ngOnInit(): void {
        this.empresasService
        .get()
        .subscribe({
            next: (res) => {
                this.listaEmpresas = res.content;
            },
            error: (err) => {
                this.informationService.showError(err.error.message);
            },
        });

        this.sistemasService
        .get().subscribe({
            next: (res) => {
                this.listaSistemas = res.content;
            },
            error: (err) => {
                this.informationService.showError(err.error.message);
            },
        });

        this.parametricasService
        .getParametricasByTipo(TipoParametrica.ESTADO_ASOCIACION)
        .subscribe((data) => {
            this.listaEstados= data as unknown as Parametrica[];
        });

        this.parametricasService
        .getParametricasByTipo(TipoParametrica.TIPO_MODALIDAD)
        .subscribe((data) => {
            this.listaModalidades= data as unknown as Parametrica[];
        });

        this.parametricasService
        .getParametricasByTipo(TipoParametrica.TIPO_AMBIENTE)
        .subscribe((data) => {
            this.listaAmbientes= data as unknown as Parametrica[];
        });

        this.item = this.config.data;
        this.itemForm = this.fb.group({
            id: [this.item?.id],
            codigoAsociacion: [this.item?.codigoAsociacion],
            idSistema: [ this.item?.idSistema, Validators.required],
            idEmpresa: [this.item?.idEmpresa, Validators.required ],
            publicKey: [this.item?.publicKey],
            privateKey: [this.item?.privateKey],
            idEstadoAsociacion: [this.item?.idEstadoAsociacion , Validators.required],
            ambiente: [this.item?.ambiente, Validators.required ],
            modalidad: [this.item?.modalidad, Validators.required ],
            token: [this.item?.token],
            conexionAutomatica: [this.item?.conexionAutomatica ?? false],
        });
    }

    public onSubmit(): void {
        if (this.closeClicked) {
            this.dialogRef.close(null);
        } else {
            if (!this.itemForm.valid) {
                console.log(this.itemForm);
                this.informationService.showWarning('Verifique los datos');
                return;
            }
            const asociacion: Asociacion = {
                ... this.item,
                id: this.itemForm.controls['id'].value,
                idEmpresa: this.itemForm.controls['idEmpresa'].value ,
                codigoAsociacion: this.itemForm.controls['codigoAsociacion'].value,
                idSistema: this.itemForm.controls['idSistema'].value,
                publicKey: this.itemForm.controls['publicKey'].value,
                privateKey: this.itemForm.controls['privateKey'].value,
                idEstadoAsociacion: this.itemForm.controls['idEstadoAsociacion'].value,
                ambiente: this.itemForm.controls['ambiente'].value,
                modalidad: this.itemForm.controls['modalidad'].value,
                token: this.itemForm.controls['token'].value,
                conexionAutomatica: this.itemForm.controls['conexionAutomatica'].value,
            };

            this.submited = true;
            if (asociacion.id > 0) {
                this.asociacioneservice.edit(asociacion).subscribe({
                    next: (res) => {
                        this.informationService.showSuccess(res.message);
                        this.dialogRef.close(asociacion);
                    },
                    error: (err) => {
                        this.informationService.showError(err.error.message);
                        this.submited = false;
                    },
                });
            } else {
                this.asociacioneservice.add(asociacion).subscribe({
                    next: (res) => {
                        asociacion.id = res.content;
                        this.informationService.showSuccess(res.message);
                        this.dialogRef.close(asociacion);
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
