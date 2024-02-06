import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { SessionService } from 'src/app/shared/security/session.service';
import { InteresadosService } from 'src/app/shared/services/interesados.service';
import { InformationService } from 'src/app/shared/helpers/information.service';
import { DialogService } from 'primeng/dynamicdialog';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { adm } from 'src/app/shared/constants/adm';
import {
    InteresadoDireccion,
} from 'src/app/shared/models/interesado.model';
import { AutoComplete } from 'primeng/autocomplete';
import { Usuario } from 'src/app/shared/models/usuario.model';
import { BusquedaUsuario } from 'src/app/shared/models/busqueda-usuario.model';
import { UsuariosService } from 'src/app/shared/services/usuarios.service';
import { VisitaRegistro } from 'src/app/shared/models/visita.model';
import { VisitasService } from 'src/app/shared/services/visitas.service';
import { BusquedaPaginada } from 'src/app/shared/models/busqueda-paginada.model';
import { BusquedaSugerenciaAsignacion } from '../../../../shared/models/interesado.model';
import { ConfirmationService } from 'primeng/api';

@Component({
    selector: 'app-asignacion',
    templateUrl: './asignacion.component.html',
    styleUrls: ['./asignacion.component.scss'],
})
export class AsignacionComponent implements OnInit {
    @ViewChild('direccion') elmI?: AutoComplete;
    minDate = new Date();
    itemForm!: FormGroup;
    backClicked = false;
    submited = false;
    detalle: InteresadoDireccion[] = [];

    listaUsuarios: Usuario[] = [];
    listaDireccionAutocompletar: InteresadoDireccion[] = [];

    listaSugerencia: InteresadoDireccion[] = [];
    listaSugerenciaSeleccionada: InteresadoDireccion[] = [];
    listaZonas: any[] = [];

    interesadoDireccion: any;
    zona: any;
    fecha: any;
    idUsuario: any;

    constructor(
        private fb: FormBuilder,
        private informationService: InformationService,
        private sessionService: SessionService,
        public dialogService: DialogService,
        private router: Router,
        private datepipe: DatePipe,
        private usuarioService: UsuariosService,
        private interesadoService: InteresadosService,
        private visitaService: VisitasService,
        private interesadosService: InteresadosService,
        private confirmationService: ConfirmationService,
    ) {}

    ngOnInit(): void {
        // usuarios
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

        // zonas
        this.interesadosService.getZones({}).subscribe({
            next: (res) => {
                const newdata = res.content.map((x: any) => {
                    return { id: x, nombre: x };
                });

                this.listaZonas = newdata;
            },
            error: (err) => {
                this.informationService.showError(err.error.message);
            },
        });

        const esAsesor =
            this.sessionService.getSessionUserData().idTipoUsuario ==
            adm.TIPO_USUARIO_ASESOR;
        this.itemForm = this.fb.group({
            idUsuarioAsignacion: [
                {
                    value: esAsesor
                        ? this.sessionService.getSessionUserData().id
                        : null,
                    disabled: esAsesor,
                },
            ],
            fechaAsignacion: [
                new Date(),
                Validators.required,
            ],
            asignacionGlobal :[false]
        });

        this.idUsuario = esAsesor
            ? this.sessionService.getSessionUserData().id
            : null;
        this.fecha = this.datepipe.transform(new Date(), 'dd/MM/yyyy');
    }

    ngAfterViewInit(): void {
        setTimeout(() => {
            this.elmI?.focusInput();
        }, 500);
    }

    keyInput(event: any, keyc: string) {
        this.itemForm.patchValue({ [keyc]: event.value });
    }

    public onSubmit(): void {
        if (this.backClicked) {
            this.router.navigate(['/adm/visitas']);
        } else {
            if (!this.itemForm.valid) {
                this.informationService.showWarning('Verifique los datos');
                return;
            }
            if (this.detalle.length == 0) {
                this.informationService.showWarning(
                    'Debe agregar al menos una dirección para realizar la asignación'
                );
                return;
            }

            const asignacionGlobal = this.itemForm.controls['asignacionGlobal'].value;
            const usuarioGlobal = this.itemForm.controls['idUsuarioAsignacion'].value;
            if (!asignacionGlobal){
                console.log(this.detalle);
                const existeVacios = this.detalle.filter(x=>!x.idUsuario);
                console.log(existeVacios);
                if (existeVacios.length>0){
                    this.informationService.showWarning(
                        'Existen direcciones que no tienen usuarios asignados'
                    );
                    return;
                }
                // verificar si el usuario es asesor
                const esAsesor = this.sessionService.getSessionUserData().idTipoUsuario ==  adm.TIPO_USUARIO_ASESOR;
                if (esAsesor){
                    const existeDiferentesAsesor = this.detalle.filter(x=>x.idUsuario!==this.sessionService.getSessionUserData().id);
                    if (existeDiferentesAsesor.length>0){
                        this.informationService.showWarning(
                            'Usted no puede realizar asignaciones individuales, cambie a la asignacion global'
                        );
                        return;
                    }
                }
            }
            else if(!usuarioGlobal){
                    this.informationService.showWarning(
                        'Para la asignacion global debe seleccionar un usuario'
                    );
                    return;
                }

           let listaAsignacion = this.detalle.map((x: any) => {return { idInteresadoDireccion: x.id , idUsuario: (asignacionGlobal ? usuarioGlobal : x.idUsuario)}; });

           const fechaAsignacion = this.itemForm.controls['fechaAsignacion'].value as Date;
           console.log(fechaAsignacion);
           const asignacion: VisitaRegistro = {
                idEmpresa: this.sessionService.getSessionUserData().idEmpresa,
                fecha: this.datepipe.transform(fechaAsignacion, 'dd/MM/yyyy')!,
                listaAsignacion : listaAsignacion,
            };

            const mensaje = 'Está seguro de asignar '+ listaAsignacion.length +' direccion(es) ' + (asignacionGlobal ? ' al usuario '+ this.listaUsuarios.find(x=>x.id===usuarioGlobal)?.nombreCompleto: ' a su(s) correpondiente(s) usuario(s)?') ;
            this.confirmationService.confirm({
                message: mensaje,
                header: 'Confirmación',
                icon: 'pi pi-exclamation-triangle',
                accept: () => {
                    this.submited = true;
                    this.visitaService.add(asignacion).subscribe({
                        next: (res) => {
                            this.informationService.showSuccess(res.message);
                            this.router.navigate(['/adm/visitas']);
                            this.submited = false;
                        },
                        error: (err) => {
                            this.informationService.showError(err.error.message);
                            this.submited = false;
                        },
                    });
                },
            });
        }
    }

    public prevPage() {
        this.backClicked = true;
    }

    public onSave(): void {
        this.backClicked = false;
    }

    // interesado
    addItem(direccion: InteresadoDireccion) {
        const existeDireccion = this.detalle.find((x) => x.id === direccion.id);
        if (existeDireccion) {
            this.informationService.showWarning(
                'La direcci+on del médico ya está adicionado'
            );
            this.itemForm.patchValue({ direccion: null });
            return;
        }

        const item: InteresadoDireccion = {
            ...direccion,
        };

        this.detalle.push(item);
        this.itemForm.patchValue({ direccion: null });
        this.elmI?.focusInput();
    }

    deleteItem(item: any) {
        this.detalle = this.detalle.filter((x) => x.id != item.id);
    }

    deleteAllItem() {
        this.detalle = [];
    }

    filtrarDireccion(event: any) {
        //in a real application, make a request to a remote url with the query and return filtered results, for demo we filter at client side
        let query = event.query;
        this.buscarDireccion(query);
    }

    seleccionarDireccion(event: any) {
        this.addItem(event);
    }

    buscarDireccion(termino: string) {
        const criteriosBusqueda: BusquedaPaginada = {
            idEmpresa: this.sessionService.getSessionEmpresaId(),
            filtro: termino.trim(),
            cantidadItems: 5,
            pagina: 1,
        };

        this.interesadoService.getAddressPaged(criteriosBusqueda).subscribe({
            next: (res) => {
                if (res.content.items.length == 0) {
                    this.listaDireccionAutocompletar = [];
                    return;
                }
                this.listaDireccionAutocompletar = res.content.items;
            },
            error: (err) => {
                this.informationService.showError(err.error.message);
            },
        });
    }

    limpiarSugerencia() {
        this.listaSugerencia = [];
        this.listaSugerenciaSeleccionada = [];
    }

    verSugerencia() {
        const criteriosBusqueda: BusquedaSugerenciaAsignacion = {
            idUsuario: this.idUsuario,
            idEmpresa: this.sessionService.getSessionUserData().idEmpresa,
            fecha: this.fecha,
            zona: this.zona,
        };

        this.interesadoService.getSuggestions(criteriosBusqueda).subscribe({
            next: (res) => {
                console.log(res);
                this.listaSugerencia = res.content;
            },
            error: (err) => {
                this.informationService.showError(err.error.message);
            },
        });
    }

    adicionarSeleccion(){
        this.listaSugerenciaSeleccionada.forEach(element => {
            const existeDireccion = this.detalle.find((x) => x.id === element.id);
            if (!existeDireccion){
                this.detalle.push(element);
            }
        });
    }
}
