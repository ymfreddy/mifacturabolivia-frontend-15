import { Component, OnInit, ViewChild, ElementRef, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InformationService } from 'src/app/shared/helpers/information.service';
import { Detalle, DetalleHuesped } from 'src/app/shared/models/factura-recepcion.model';
import { ParametricaSfe } from 'src/app/shared/models/parametrica-sfe.model';
import { ParametricasSfeService } from '../../shared/services/parametricas-sfe.service';
import { sfe } from 'src/app/shared/constants/sfe';

@Component({
  selector: 'app-datos-factura-hotel',
  templateUrl: './datos-factura-hotel.component.html',
  styleUrls: ['./datos-factura-hotel.component.scss']
})
export class DatosFacturaHotelComponent implements OnInit {
    @ViewChild('documento') elmD?: ElementRef;
    item!: Detalle;
    itemForm!: FormGroup;
    closeClicked = false;
    submited = false;
    listaPais: ParametricaSfe[] = [];
    listaHuespedes: DetalleHuesped[]=[];
    blockSpace: RegExp = /[^\s]/;
    constructor(
        private fb: FormBuilder,
        public config: DynamicDialogConfig,
        private dialogRef: DynamicDialogRef,
        private informationService: InformationService,
        private parametricasSfeService: ParametricasSfeService,
    ) {}

    ngOnInit(): void {

        this.parametricasSfeService.getTipoPais().subscribe((data) => {
            this.listaPais = data as unknown as ParametricaSfe[];
        });

        this.item = this.config.data;
        this.listaHuespedes = this.item?.detalleHuespedes??[];
        this.itemForm = this.fb.group({
            codigoPais: [sfe.CODIGO_PAIS_BOLIVIA],
            documentoIdentificacion: [null],
            nombreHuesped: [null],
        });
    }

    public onSubmit(): void {
        if (this.closeClicked) {
            this.dialogRef.close(null);
        } else {
            if (!this.listaHuespedes || this.listaHuespedes.length==0) {
                this.informationService.showWarning('Debe agregar al menos la información de un huesped');
                return;
            }

            this.item.detalleHuespedes = this.listaHuespedes;
            this.dialogRef.close(this.item);
        }
    }

    public adicionarHuesped(){
        if (!this.itemForm.controls['codigoPais'].value || !this.itemForm.controls['documentoIdentificacion'].value || !this.itemForm.controls['nombreHuesped'].value){
            this.informationService.showWarning(
                'Debe ingresar todos los datos del huesped'
            );
            return;
        }

        const nuevo : DetalleHuesped = {
            codigoPais:  this.itemForm.controls['codigoPais'].value,
            pais:  this.descripcionPais(this.itemForm.controls['codigoPais'].value)!,
            documentoIdentificacion:  this.itemForm.controls['documentoIdentificacion'].value.trim().toUpperCase(),
            nombreHuesped:  this.itemForm.controls['nombreHuesped'].value.trim().toUpperCase(),
        }

        const existeHuesped = this.listaHuespedes.find(
            (x) => x.documentoIdentificacion === nuevo.documentoIdentificacion
        );

        if (existeHuesped) {
            this.informationService.showWarning(
                'El N° Documento huesped ya está adicionado'
            );
            return;
        }

        this.listaHuespedes.push(nuevo);
        this.itemForm.patchValue({ codigoPais: sfe.CODIGO_PAIS_BOLIVIA });
        this.itemForm.patchValue({ pais: 'BOLIVIA (ESTADO PLURINACIONAL DE)' });
        this.itemForm.patchValue({ documentoIdentificacion: null });
        this.itemForm.patchValue({ nombreHuesped: null });
        this.elmD?.nativeElement.focus();
    }

    public descripcionPais(codigoPais: number) {
        return this.listaPais.find((x) => x.codigo == codigoPais)?.descripcion;
    }

    public deleteHuesped(item: DetalleHuesped) {
        this.listaHuespedes = this.listaHuespedes.filter(
            (x) => x.documentoIdentificacion != item.documentoIdentificacion
        );
    }

    public onClose(): void {
        this.closeClicked = true;
    }

    public onSave(): void {
        this.closeClicked = false;
    }
}
