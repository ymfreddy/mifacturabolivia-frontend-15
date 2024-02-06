import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import {
    FormBuilder,
    FormGroup,
    Validators,
} from '@angular/forms';
import { AutoComplete } from 'primeng/autocomplete';
import {
    DialogService,
    DynamicDialogConfig,
    DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { TipoParametrica } from 'src/app/shared/enums/tipo-parametrica.model';
import { InformationService } from 'src/app/shared/helpers/information.service';
import { Parametrica } from 'src/app/shared/models/parametrica.model';
import { SessionService } from 'src/app/shared/security/session.service';
import { ParametricasService } from 'src/app/shared/services/parametricas.service';
import { GeolocalizacionComponent } from '../../../../components/geolocalizacion/geolocalizacion.component';
import { BusquedaZona, InteresadoDireccion } from '../../../../shared/models/interesado.model';
import { InteresadosService } from '../../../../shared/services/interesados.service';

@Component({
  selector: 'app-formulario-direccion',
  templateUrl: './formulario-direccion.component.html',
  styleUrls: ['./formulario-direccion.component.scss']
})
export class FormularioDireccionComponent implements OnInit {
    @ViewChild('zona') elmC?: AutoComplete;
    @ViewChild('direccion') elmD?: ElementRef;
    @ViewChild(GeolocalizacionComponent) child!:GeolocalizacionComponent;
    item?: InteresadoDireccion;
    itemForm!: FormGroup;
    closeClicked = false;
    listaPuesto: Parametrica[] = [];
    listaTurno: Parametrica[] = [];
    listaHorario: Parametrica[] = [];
    listaDias: Parametrica[] = [];
    listaZonasFiltradas: string[] = [];
  constructor(        private fb: FormBuilder,
    public config: DynamicDialogConfig,
    private dialogRef: DynamicDialogRef,
    private informationService: InformationService,
    private parametricasService: ParametricasService,
    public dialogService: DialogService,
    private interesadosService:InteresadosService
    ) { }

    ngOnInit(): void {
        this.parametricasService.getParametricasByTipo(TipoParametrica.TIPO_PUESTO_TRABAJO).subscribe((data) => {
            this.listaPuesto = data as unknown as Parametrica[];
        });
        this.parametricasService.getParametricasByTipo(TipoParametrica.TURNOS).subscribe((data) => {
            this.listaTurno = data as unknown as Parametrica[];
        });
        this.parametricasService.getParametricasByTipo(TipoParametrica.DIAS_SEMANA).subscribe((data) => {
            data.sort((a, b) => { return a.id >= b.id ? 1 : -1});
            this.listaDias = data as unknown as Parametrica[];
        });
        this.parametricasService.getParametricasByTipo(TipoParametrica.HORARIOS).subscribe((data) => {
            data.sort((a, b) => { return a.nombre >= b.nombre ? 1 : -1});
            this.listaHorario = data as unknown as Parametrica[];
        });

        this.item = this.config.data;
        this.itemForm = this.fb.group({
            id: [this.item?.id],
            idInteresado: [this.item?.idInteresado],
            zona: [ {zona:this.item?.zona}, Validators.required],
            direccion: [this.item?.direccion, Validators.required],
            puestoTrabajo: [this.item?.puestoTrabajo, Validators.required],
            tipoPuestoTrabajo: [this.item?.tipoPuestoTrabajo, Validators.required],
            turnos: [this.item?.turnos, Validators.required],
            dias: [this.item?.dias? this.item?.dias.split(","):null,  Validators.required],
            horarios: [this.item?.horarios? this.item?.horarios.split(","):null, Validators.required],
            latitud: [this.item?.latitud],
            longitud: [this.item?.longitud],
        });
    }

    ngAfterViewInit() {
        setTimeout(() => {
            this.elmC?.focusInput();
            if (this.item?.latitud && this.item?.longitud){
                this.child.marcarPunto(this.item?.latitud, this.item?.longitud, this.item?.direccion, true, true);
            }
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

            const dias:[] = this.itemForm.controls['dias'].value;
            const horarios:[] = this.itemForm.controls['horarios'].value;

            const zona = this.itemForm.controls['zona'].value.zona??this.itemForm.controls['zona'].value;
            const direccion: InteresadoDireccion = {
                id: this.itemForm.controls['id'].value,
                idInteresado: this.itemForm.controls['idInteresado'].value,
                zona: zona.toUpperCase(),
                direccion: this.itemForm.controls['direccion'].value,
                turnos: this.itemForm.controls['turnos'].value,
                tipoPuestoTrabajo: this.itemForm.controls['tipoPuestoTrabajo'].value,
                puestoTrabajo: this.itemForm.controls['puestoTrabajo'].value,
                dias: dias.length==0?'':dias.join(','),
                horarios: horarios.length==0?'':horarios.join(','),
                latitud: this.itemForm.controls['latitud'].value,
                longitud: this.itemForm.controls['longitud'].value,
            };

           this.dialogRef.close(direccion);
        }
    }

    public onClose(): void {
        this.closeClicked = true;
    }

    public onSave(): void {
        this.closeClicked = false;
    }

    getPuntoSeleccionado(e:any){
        this.itemForm.patchValue({ latitud: e.lat() });
        this.itemForm.patchValue({ longitud: e.lng() });
    }

    filtrarZonas(event: any) {
        //in a real application, make a request to a remote url with the query and return filtered results, for demo we filter at client side
        let query = event.query;
        this.buscarZona(query);
    }

    buscarZona(termino: string) {
        const criteriosBusqueda: BusquedaZona = {
            termino: termino.trim(),
            cantidadRegistros: 10,
        };

        this.interesadosService.getZones(criteriosBusqueda).subscribe({
            next: (res) => {
                if (res.content.length == 0) {
                    this.listaZonasFiltradas = [];
                    return;
                }
                const newdata = res.content.map((x:any) => {
                    return { zona: x };
                  });

                this.listaZonasFiltradas = newdata;
            },
            error: (err) => {
                this.informationService.showError(err.error.message);
            },
        });
    }

    seleccionarZona(event: any) {
        console.log(this.elmD?.nativeElement);
        this.elmD?.nativeElement.focus();
    }
}
