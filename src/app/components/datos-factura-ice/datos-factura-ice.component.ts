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
  selector: 'app-datos-factura-ice',
  templateUrl: './datos-factura-ice.component.html',
  styleUrls: ['./datos-factura-ice.component.scss']
})
export class DatosFacturaIceComponent implements OnInit {
    @ViewChild('medico') elmC?: AutoComplete;
    item!: Detalle;
    itemForm!: FormGroup;
    closeClicked = false;
    submited = false;
    listaMarcaIce: Parametrica[] = [];
    constructor(
        private fb: FormBuilder,
        public config: DynamicDialogConfig,
        private dialogRef: DynamicDialogRef,
        private informationService: InformationService,
    ) {}

    ngOnInit(): void {
        this.listaMarcaIce = [
            {id: 1, nombre: 'CON ICE'},
            {id: 2, nombre: 'SIN ICE'}
        ];
        this.item = this.config.data;

        this.itemForm = this.fb.group({
            marcaIce: [this.item.marcaIce, Validators.required],
            alicuotaIva: [this.item.alicuotaIva],
            precioNetoVentaIce: [this.item.precioNetoVentaIce],
            alicuotaEspecifica: [this.item.alicuotaEspecifica],
            alicuotaPorcentual: [this.item.alicuotaPorcentual],
            montoIceEspecifico: [this.item.montoIceEspecifico],
            montoIcePorcentual: [this.item.montoIcePorcentual],
            cantidadIce: [this.item.cantidadIce],
        });
    }

    keyInput(event: any, keyc: string) {
        this.itemForm.patchValue({ [keyc]: event.value });
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
                marcaIce:  this.itemForm.controls['marcaIce'].value,
                cantidadIce: this.itemForm.controls['marcaIce'].value==2 ? 0 : this.itemForm.controls['cantidadIce'].value,
                alicuotaEspecifica:  this.itemForm.controls['marcaIce'].value==2 ? 0 : this.itemForm.controls['alicuotaEspecifica'].value,
                alicuotaPorcentual:  this.itemForm.controls['marcaIce'].value==2 ? 0 : this.itemForm.controls['alicuotaPorcentual'].value,
                alicuotaIva:  this.itemForm.controls['alicuotaIva'].value,
                precioNetoVentaIce:  this.itemForm.controls['precioNetoVentaIce'].value,
                montoIceEspecifico:  this.itemForm.controls['montoIceEspecifico'].value,
                montoIcePorcentual:  this.itemForm.controls['montoIcePorcentual'].value,
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
