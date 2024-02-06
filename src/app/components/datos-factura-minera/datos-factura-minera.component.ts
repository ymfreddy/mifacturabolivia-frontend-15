import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AutoComplete } from 'primeng/autocomplete';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { TipoParametrica } from 'src/app/shared/enums/tipo-parametrica.model';
import { InformationService } from 'src/app/shared/helpers/information.service';
import { BusquedaMedico } from 'src/app/shared/models/busqueda-medico.model';
import { Detalle, DetalleDatoEspecifico } from 'src/app/shared/models/factura-recepcion.model';
import { Medico } from 'src/app/shared/models/medico.model';
import { ParametricaSfe } from 'src/app/shared/models/parametrica-sfe.model';
import { Parametrica } from 'src/app/shared/models/parametrica.model';
import { SessionService } from 'src/app/shared/security/session.service';
import { MedicosService } from 'src/app/shared/services/medicos.service';
import { ParametricasSfeService } from 'src/app/shared/services/parametricas-sfe.service';
import { ParametricasService } from 'src/app/shared/services/parametricas.service';

@Component({
  selector: 'app-datos-factura-minera',
  templateUrl: './datos-factura-minera.component.html',
  styleUrls: ['./datos-factura-minera.component.scss']
})
export class DatosFacturaMineraComponent implements OnInit {
    @ViewChild('medico') elmC?: AutoComplete;
    item!: Detalle;
    itemForm!: FormGroup;
    closeClicked = false;
    submited = false;
    listaMedidas: ParametricaSfe[] = [];
    listaMedicosFiltrados: Medico[] = [];
    constructor(
        private fb: FormBuilder,
        public config: DynamicDialogConfig,
        private dialogRef: DynamicDialogRef,
        private informationService: InformationService,
        private parametricasSfeService: ParametricasSfeService,
        private sessionService: SessionService,
        private medicoService: MedicosService,
    ) {}

    ngOnInit(): void {

        this.parametricasSfeService
        .getTipoUnidad()
        .subscribe((data) => {
            this.listaMedidas = data as unknown as ParametricaSfe[];
        });
        // cargar data
        let temporalMedidaExtraccion: any;
        this.item = this.config.data;

        this.itemForm = this.fb.group({
            codigoNandina: [this.item.datosEspecificos?.codigoNandina, Validators.required],
            descripcionLeyes: [this.item.datosEspecificos?.descripcionLeyes, Validators.required],
            cantidadExtraccion: [this.item.datosEspecificos?.cantidadExtraccion, Validators.required],
            unidadMedidaExtraccion: [this.item.datosEspecificos?.unidadMedidaExtraccion, Validators.required],
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

            const detalleExtra: DetalleDatoEspecifico = {
                codigoNandina:this.itemForm.controls['codigoNandina'].value,
                descripcionLeyes:this.itemForm.controls['descripcionLeyes'].value,
                cantidadExtraccion:this.itemForm.controls['cantidadExtraccion'].value,
                unidadMedidaExtraccion:this.itemForm.controls['unidadMedidaExtraccion'].value,
            }
            const respuesta : Detalle = {
                ...this.item,
               datosEspecificos : detalleExtra
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
}
