import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { adm } from 'src/app/shared/constants/adm';
import { TipoParametrica } from 'src/app/shared/enums/tipo-parametrica.model';
import { InformationService } from 'src/app/shared/helpers/information.service';
import { BusquedaUsuario } from 'src/app/shared/models/busqueda-usuario.model';
import {
    Interesado,
    InteresadoDireccion,
} from 'src/app/shared/models/interesado.model';
import { Parametrica } from 'src/app/shared/models/parametrica.model';
import { Usuario } from 'src/app/shared/models/usuario.model';
import { SessionService } from 'src/app/shared/security/session.service';
import { InteresadosService } from 'src/app/shared/services/interesados.service';
import { ParametricasService } from 'src/app/shared/services/parametricas.service';
import { UsuariosService } from 'src/app/shared/services/usuarios.service';
import { Router } from '@angular/router';
import { FormularioDireccionComponent } from '../formulario-direccion/formulario-direccion.component';

@Component({
    selector: 'app-gestion-interesado',
    templateUrl: './gestion-interesado.component.html',
    styleUrls: ['./gestion-interesado.component.scss'],
})
export class GestionInteresadoComponent implements OnInit {
    item?: Interesado;
    itemForm!: FormGroup;
    backClicked = false;
    submited = false;
    direcciones: InteresadoDireccion[] = [];
    direccionesEliminado: number[] = [];
    listaEspecialidades: Parametrica[] = [];
    listaUsuarios: Usuario[] = [];
    blockSpace: RegExp = /[^\s]/;
    constructor(
        private fb: FormBuilder,
        private informationService: InformationService,
        private interesadoservice: InteresadosService,
        private sessionService: SessionService,
        private usuarioService: UsuariosService,
        private parametricasService: ParametricasService,
        public dialogService: DialogService,
        private router: Router
    ) {}

    ngOnInit(): void {
        if (this.sessionService.getRegistroInteresado() != null) {
            this.item = this.sessionService.getRegistroInteresado();
            console.log(this.sessionService.getRegistroInteresado());
        }


        this.parametricasService
            .getParametricasByTipo(TipoParametrica.TIPO_ESPECIALIDAD_MEDICO)
            .subscribe((data) => {
                this.listaEspecialidades = data as unknown as Parametrica[];
            });
        const busqueda: BusquedaUsuario = {
            idEmpresa: this.sessionService.getSessionEmpresaId(),
            resumen: true,
            idTipoUsuario: adm.TIPO_USUARIO_ASESOR,
        };
        this.usuarioService.get(busqueda).subscribe({
            next: (res) => {
                this.listaUsuarios = res.content;
            },
            error: (err) => {
                this.informationService.showError(err.error.message);
            },
        });

        this.itemForm = this.fb.group({
            id: [this.item?.id],
            idEmpresa: [this.item?.idEmpresa],
            idUsuario: [this.item?.idUsuario],
            numeroDocumento: [
                this.item?.numeroDocumento,
                [Validators.required],
            ],
            idEspecialidad: [this.item?.idEspecialidad, Validators.required],
            nombre: [this.item?.nombre ?? '', Validators.required],
            telefono: [this.item?.telefono],
        });

        this.direcciones = this.item?.direcciones ?? [];
    }

    public onSubmit(): void {
        if (this.backClicked) {
            this.router.navigate(['/adm/interesados']);
        } else if (!this.submited) {
            return;
        } else {
            if (!this.itemForm.valid) {
                this.informationService.showWarning('Verifique los datos');
                this.submited = false;
                return;
            }

            if (this.direcciones.length == 0) {
                this.informationService.showWarning(
                    'Debe agregar al menos una dirección'
                );
                this.submited = false;
                return;
            }

            // obtener valores combo
            const idEspecialidad =
                this.itemForm.controls['idEspecialidad'].value;
            const especialidad = this.listaEspecialidades.find(
                (x) => x.id === idEspecialidad
            )?.nombre;

            const interesado: Interesado = {
                ...this.item,
                id: this.itemForm.controls['id'].value,
                idEmpresa:
                    this.itemForm.controls['idEmpresa'].value ??
                    this.sessionService.getSessionEmpresaId(),
                numeroDocumento:
                    this.itemForm.controls['numeroDocumento'].value,
                idEspecialidad: this.itemForm.controls['idEspecialidad'].value,
                especialidad: especialidad ?? '',
                nombre: this.itemForm.controls['nombre'].value.trim(),
                telefono: this.itemForm.controls['telefono'].value,
                idUsuario: this.itemForm.controls['idUsuario'].value,
                direcciones: this.direcciones,
                itemsEliminados:
                    this.direccionesEliminado.length == 0
                        ? null
                        : this.direccionesEliminado,
            };

            if (interesado.id > 0) {
                this.interesadoservice.edit(interesado).subscribe({
                    next: (res) => {
                        this.informationService.showSuccess(res.message);
                        this.router.navigate(['/adm/interesados']);
                    },
                    error: (err) => {
                        this.informationService.showError(err.error.message);
                        this.submited = false;
                    },
                });
            } else {
                this.interesadoservice.add(interesado).subscribe({
                    next: (res) => {
                        console.log(interesado);
                        console.log(res);
                        interesado.id = res.content;
                        this.informationService.showSuccess(res.message);
                        this.router.navigate(['/adm/interesados']);
                    },
                    error: (err) => {
                        this.informationService.showError(err.error.message);
                        this.submited = false;
                    },
                });
            }
        }
    }

    public prevPage() {
        this.backClicked = true;
    }

    public onSave(): void {
        this.backClicked = false;
        this.submited = true;
    }

    public deleteItem(item: any) {
        this.direcciones = this.direcciones.filter(
            (x) => x.direccion != item.direccion
        );
        // verificar si tiene id
        if (item.id) {
            this.direccionesEliminado.push(item.id);
        }
    }

    public addItem() {
        const ref = this.dialogService.open(FormularioDireccionComponent, {
            header: 'Nuevo',
            width: '95%',
            data: {},
        });
        ref.onClose.subscribe((res) => {
            if (res) {
                console.log(res);
                console.log(this.direcciones);
                this.direcciones.push(res);
            }
        });
    }

    public editItem(item: any) {
        const ref = this.dialogService.open(FormularioDireccionComponent, {
            header: 'Actualizar',
            width: '95%',
            data: item,
        });
        ref.onClose.subscribe((res) => {
            if (res) {
                let objIndex = this.direcciones.findIndex(
                    (obj) => obj.direccion == res.direccion
                );
                this.direcciones[objIndex] = res;
            }
        });
    }

    ngOnDestroy(): void {
        this.dialogService.dialogComponentRefMap.forEach((dialog) => {
            dialog.destroy();
        });
    }
}
