import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AutoComplete } from 'primeng/autocomplete';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { TipoParametrica } from 'src/app/shared/enums/tipo-parametrica.model';
import { InformationService } from 'src/app/shared/helpers/information.service';
import { BusquedaMedico } from 'src/app/shared/models/busqueda-medico.model';
import { Detalle } from 'src/app/shared/models/factura-recepcion.model';
import { Medico } from 'src/app/shared/models/medico.model';
import { Parametrica } from 'src/app/shared/models/parametrica.model';
import { SessionService } from 'src/app/shared/security/session.service';
import { MedicosService } from 'src/app/shared/services/medicos.service';
import { ParametricasService } from 'src/app/shared/services/parametricas.service';

@Component({
  selector: 'app-datos-factura-hospital',
  templateUrl: './datos-factura-hospital.component.html',
  styleUrls: ['./datos-factura-hospital.component.scss']
})
export class DatosFacturaHospitalComponent implements OnInit {
    @ViewChild('medico') elmC?: AutoComplete;
    item!: Detalle;
    itemForm!: FormGroup;
    closeClicked = false;
    submited = false;
    listaEspecialidades: Parametrica[] = [];
    listaMedicosFiltrados: Medico[] = [];
    constructor(
        private fb: FormBuilder,
        public config: DynamicDialogConfig,
        private dialogRef: DynamicDialogRef,
        private informationService: InformationService,
        private parametricasService: ParametricasService,
        private sessionService: SessionService,
        private medicoService: MedicosService,
    ) {}

    ngOnInit(): void {

        this.parametricasService
        .getParametricasByTipo(TipoParametrica.TIPO_ESPECIALIDAD_MEDICO)
        .subscribe((data) => {
            this.listaEspecialidades = data as unknown as Parametrica[];
        });
        // cargar data
        let temporalMedico: any;
        this.item = this.config.data;
        if (this.item.nitDocumentoMedico){
            temporalMedico = {
                nitDocumento: this.item?.nitDocumentoMedico,
                especialidad: this.item?.especialidadMedico,
                matricula: this.item?.nroMatriculaMedico,
                nombre: this.item?.nombreApellidoMedico,
            };
        }

        this.itemForm = this.fb.group({
            medico: [ temporalMedico, Validators.required],
            especialidad: [this.item.especialidad],
            especialidadDetalle: [this.item.especialidadDetalle],
            nroQuirofanoSalaOperaciones: [this.item.nroQuirofanoSalaOperaciones, Validators.required],
            nitDocumentoMedico: [this.item.nitDocumentoMedico, Validators.required],
            especialidadMedico: [this.item.especialidadMedico],
            nombreApellidoMedico: [this.item.nombreApellidoMedico],
            nroMatriculaMedico: [this.item.nroMatriculaMedico],
            nroFacturaMedico: [this.item.nroFacturaMedico],
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
            const respuesta : Detalle = {
                ...this.item,
                especialidad:  this.itemForm.controls['especialidad'].value,
                especialidadDetalle:  this.itemForm.controls['especialidadDetalle'].value,
                nroQuirofanoSalaOperaciones:  this.itemForm.controls['nroQuirofanoSalaOperaciones'].value,
                especialidadMedico:  this.itemForm.controls['especialidadMedico'].value,
                nombreApellidoMedico:  this.itemForm.controls['nombreApellidoMedico'].value,
                nitDocumentoMedico:  this.itemForm.controls['nitDocumentoMedico'].value,
                nroMatriculaMedico:  this.itemForm.controls['nroMatriculaMedico'].value,
                nroFacturaMedico: this.itemForm.controls['nroFacturaMedico'].value,
            }

            this.dialogRef.close(respuesta);
        }
    }


    public onClose(): void {
        this.closeClicked = true;
    }

    public onSave(): void {
        this.closeClicked = false;
    }

    filtrarMedico(event: any) {
        //in a real application, make a request to a remote url with the query and return filtered results, for demo we filter at client side
        let query = event.query;
        this.buscarMedico(query);
    }

    buscarMedico(termino: string) {
        const criteriosBusqueda: BusquedaMedico = {
            idEmpresa: this.sessionService.getSessionEmpresaId(),
            termino: termino.trim(),
            cantidadRegistros: 10,
            resumen: true,
        };

        this.medicoService.get(criteriosBusqueda).subscribe({
            next: (res) => {
                if (res.content.length == 0) {
                    this.listaMedicosFiltrados = [];
                    return;
                }
                this.listaMedicosFiltrados = res.content;
            },
            error: (err) => {
                this.informationService.showError(err.error.message);
            },
        });
    }

    seleccionarMedico(event: any) {
        this.itemForm.patchValue({ medico: event });
        this.itemForm.patchValue({ especialidadMedico: event?.especialidad });
        this.itemForm.patchValue({ nitDocumentoMedico: event?.nitDocumento });
        this.itemForm.patchValue({ nombreApellidoMedico: event?.nombre });
        this.itemForm.patchValue({ nroMatriculaMedico: event?.matricula });
        //this.elmP?.focusInput();
    }

    limpiarMedico() {
        this.itemForm.patchValue({ medico: null });
        this.itemForm.patchValue({ especialidadMedico: '' });
        this.itemForm.patchValue({ nitDocumentoMedico: '' });
        this.itemForm.patchValue({ nombreApellidoMedico: '' });
        this.itemForm.patchValue({ nroMatriculaMedico: '' });
        this.elmC?.focusInput();
    }
}
