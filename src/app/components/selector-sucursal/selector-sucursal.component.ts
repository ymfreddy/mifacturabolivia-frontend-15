import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
    DialogService,
    DynamicDialogConfig,
    DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { InformationService } from 'src/app/shared/helpers/information.service';
import { SessionService } from 'src/app/shared/security/session.service';
import { Sucursal, PuntoVentaResumen } from 'src/app/shared/models/sucursal.model';
import { SucursalesService } from 'src/app/shared/services/sucursales.service';
import { SessionUsuario } from '../../shared/models/session-usuario.model';
import { adm } from 'src/app/shared/constants/adm';

@Component({
  selector: 'app-selector-sucursal',
  templateUrl: './selector-sucursal.component.html',
  styleUrls: ['./selector-sucursal.component.scss']
})
export class SelectorSucursalComponent implements OnInit {
    item!: SessionUsuario;
    itemForm!: FormGroup;
    listaSucursales: Sucursal[] = [];
    listaPuntoVenta: PuntoVentaResumen[] = [];

    constructor(
        private fb: FormBuilder,
        public config: DynamicDialogConfig,
        private dialogRef: DynamicDialogRef,
        private informationService: InformationService,
        private sucursalesService: SucursalesService,
        private sessionService: SessionService
    ) {}

    ngOnInit(): void {
        this.item = this.sessionService.getSessionUserData();
        this.itemForm = this.fb.group({
            idSucursal: [this.item.idSucursal, Validators.required],
            idPuntoVenta: [null, Validators.required],
        });
        // cargar parametricas
            this.sucursalesService
            .getByIdEmpresa(this.sessionService.getSessionEmpresaId())
            .subscribe({
                next: (res) => {
                    this.listaSucursales = res.content;
                    if (this.item.idSucursal > 0) {
                        this.listaSucursales = this.listaSucursales.filter((x) => x.id == this.item.idSucursal);
                        this.listaPuntoVenta=this.listaSucursales[0].puntosVenta;
                        // verificar si es la unica sucursal y el unico pto venta
                        if (this.listaSucursales.length==1){
                            this.itemForm.patchValue({ idSucursal: this.listaSucursales[0].id });
                            this.itemForm.patchValue({ idPuntoVenta: this.listaPuntoVenta[0].id });
                            this.establecerPunto();
                        }
                    }
                },
                error: (err) => {
                    this.informationService.showError(err.error.message);
                },
            });

    }

    public onSubmit(): void {
        if (!this.itemForm.valid) {
            this.informationService.showWarning('Verifique los datos');
            return;
        }

        this.establecerPunto();
    }

    canbioSucursal(event: any) {
        this.listaPuntoVenta = [];
        this.itemForm.controls['idPuntoVenta'].setValue(null);
        if (event.value) {
            this.listaPuntoVenta =
                this.listaSucursales.find((x) => x.id === event.value)
                    ?.puntosVenta || [];
            this.itemForm.controls['idPuntoVenta'].setValue(this.listaPuntoVenta[0].id);
        }
    }

    establecerPunto():void{
        const idSucursal = this.itemForm.controls['idSucursal'].value;
        const idPuntoVenta = this.itemForm.controls['idPuntoVenta'].value;
        // obtener valores combo
        const sucursal = this.listaSucursales.find(
            (x) => x.id === idSucursal
        )?.numero;
        const puntoVenta = this.listaPuntoVenta.find(
            (x) => x.id === idPuntoVenta
        )?.numeroPuntoVenta;

        this.item.idSucursal = idSucursal;
        this.item.idPuntoVenta = idPuntoVenta;
        this.item.numeroSucursal = sucursal;
        this.item.numeroPuntoVenta = puntoVenta;
        this.sessionService.setSessionUserData(this.item);
        //this.informationService.showSuccess('Punto de Venta establecido');
        this.dialogRef.close(null);
    }
}
