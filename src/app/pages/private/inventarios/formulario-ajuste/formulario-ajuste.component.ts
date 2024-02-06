import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
    DialogService,
    DynamicDialogConfig,
    DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { InputNumber } from 'primeng/inputnumber';
import { spv } from 'src/app/shared/constants/spv';
import { InformationService } from 'src/app/shared/helpers/information.service';
import { HistorialProducto } from 'src/app/shared/models/historial-producto.model';
import { ProductoInventario, SaldoProducto } from 'src/app/shared/models/producto.model';
import { SessionService } from 'src/app/shared/security/session.service';
import { HistorialProductosService } from 'src/app/shared/services/historial-producto.service';
import { ConfirmationService } from 'primeng/api';

@Component({
    selector: 'app-formulario-ajuste',
    templateUrl: './formulario-ajuste.component.html',
    styleUrls: ['./formulario-ajuste.component.scss'],
    providers: [DialogService],
})
export class FormularioAjusteComponent implements OnInit {
    @ViewChild('cantidad') myInputField!: InputNumber;

    itemProducto!: ProductoInventario;
    item!: HistorialProducto;
    listaStock!: SaldoProducto[];
    itemForm!: FormGroup;
    closeClicked = false;
    submited = false;
    etiquetaPrecio: string = 'Precio Entrada';
    constructor(
        private fb: FormBuilder,
        public config: DynamicDialogConfig,
        private dialogRef: DynamicDialogRef,
        private informationService: InformationService,
        private historialProductoService: HistorialProductosService,
        private sessionService: SessionService,
        private confirmationService: ConfirmationService
    ) {}

    ngAfterViewInit(): void {
        setTimeout(() => {
            this.myInputField.input.nativeElement.focus();
        }, 500);
    }

    ngOnInit(): void {
        this.itemProducto = this.config.data;
        this.listaStock = this.itemProducto.saldos!;
        this.itemForm = this.fb.group({
            id: [this.item?.id],
            codigoStock: [this.itemProducto.saldos![0].codigoStock],
            codigoProducto: [this.item?.codigoProducto],
            producto: [this.item?.producto],
            saldo: [this.item?.saldo],
            precioCompra: [this.item?.precioCompra],
            precioVenta: [this.item?.precioVenta],
            precioVendido: [0],
            cantidad: [0, Validators.required],
            aumentar: [true],
            descripcion: ['', Validators.required],
        });

        this.canbioStock(this.itemProducto.saldos![0].codigoStock!, this.itemProducto?.id);
    }

    public onSubmit(): void {
        if (this.closeClicked) {
            this.dialogRef.close(null);
        } else {
            if (!this.itemForm.valid) {
                this.informationService.showWarning('Verifique los datos');
                return;
            }

            if (this.itemForm.value.cantidad <= 0) {
                this.informationService.showWarning(
                    'La cantidad no puede ser menor o igual a 0'
                );
                return;
            }

            if (this.getNuevoSaldo() < 0) {
                this.informationService.showWarning(
                    'El nuevo saldo no puede ser menor a 0'
                );
                return;
            }

            if (this.itemForm.value.precioCompra <= 0) {
                this.informationService.showWarning(
                    'El precio de compra/entrada no puede ser menor o igual a 0'
                );
                return;
            }

            if (this.itemForm.value.precioVenta<= 0) {
                this.informationService.showWarning(
                    'El precio para la venta no puede ser menor o igual a 0'
                );
                return;
            }

            const tipo = this.itemForm.controls['aumentar'].value ? spv.TIPO_HISTORIAL_ENTRADA_AJUSTE: spv.TIPO_HISTORIAL_SALIDA_AJUSTE;

            if (tipo === spv.TIPO_HISTORIAL_ENTRADA_AJUSTE && this.itemForm.value.precioVendido!==0) {
                this.informationService.showWarning(
                    'El precio vendido/salida debe ser 0'
                );
                return;
            }


            if (tipo === spv.TIPO_HISTORIAL_SALIDA_AJUSTE && this.itemForm.value.precioVendido< 0) {
                this.informationService.showWarning(
                    'El precio vendido/salida no puede ser menor a 0'
                );
                return;
            }

            this.confirmationService.confirm({
                message: 'Esta seguro de realizar el ajuste al producto '+this.itemProducto.nombre+' ?',
                header: 'Confirmación',
                icon: 'pi pi-exclamation-triangle',
                accept: () => {
                    this.submited = true;
                    const ajuste: HistorialProducto = {
                        ...this.item,
                        codigoStock: this.itemForm.controls['codigoStock'].value,
                        entrada: this.itemForm.controls['aumentar'].value
                            ? this.itemForm.controls['cantidad'].value
                            : null,
                        salida: !this.itemForm.controls['aumentar'].value
                            ? this.itemForm.controls['cantidad'].value
                            : null,
                        saldo: this.getNuevoSaldo(),
                        idTipoHistorial: tipo,
                        precioCompra: this.itemForm.controls['precioCompra'].value,
                        precioVenta: this.itemForm.controls['precioVenta'].value,
                        precioVendido: this.itemForm.controls['precioVendido'].value,
                        descripcion: this.itemForm.controls['descripcion'].value,
                    };

                    this.historialProductoService.fix(ajuste).subscribe({
                        next: (res) => {
                            this.informationService.showSuccess(res.message);
                            this.dialogRef.close(ajuste);
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

    keyInput(event: any, keyc: string) {
        this.itemForm.patchValue({ [keyc]: event.value });
    }

    getNuevoSaldo() {
        let nuevo = this.itemForm.value.aumentar
            ? this.itemForm.value.saldo + this.itemForm.value.cantidad
            : this.itemForm.value.saldo - this.itemForm.value.cantidad;
        return !isNaN(nuevo) ? nuevo : 0;
    }

    handleChange(e: any) {
        this.etiquetaPrecio = e.checked ? 'Precio Entrada' : 'Precio Salida';
        /*if (e.checked){
            this.itemForm.controls['precioVendido'].disable();
            this.itemForm.patchValue({ precioVendido: 0 });
        }else{
            this.itemForm.controls['precioVendido'].enable();
        }*/
    }

    public onClose(): void {
        this.closeClicked = true;
    }

    public onSave(): void {
        this.closeClicked = false;
    }

    canbioStockEvento(event: any) {
        this.canbioStock(event.value, this.item.idProducto);
    }

    canbioStock(codigoStock: string, idProducto: number) {
        const busqueda: any = {
            idEmpresa: this.sessionService.getSessionEmpresaId(),
            idSucursal: this.itemProducto.idSucursal,
            idProducto: idProducto,
            soloSaldos: true,
            codigoStock: codigoStock,
        };
        this.historialProductoService.getHistory(busqueda).subscribe({
            next: (res) => {
                this.item = res.content[0];
                this.itemForm.patchValue({ id: this.item.id });
                //this.itemForm.patchValue({ codigoStock: 0 });
                this.itemForm.patchValue({ codigoProducto: this.item.codigoProducto });
                this.itemForm.patchValue({ producto: this.item.producto });
                this.itemForm.patchValue({ saldo: this.item.saldo });
                this.itemForm.patchValue({ precioCompra: this.item.precioCompra });
                this.itemForm.patchValue({ precioVenta: this.item.precioVenta });
                //this.itemForm.patchValue({ precioVendido: 0 });
                //this.itemForm.patchValue({ cantidad: 0 });
                //this.itemForm.patchValue({ aumentar: 0 });
            },
            error: (err) => {
                this.informationService.showError(err.error.message);
            },
        });
    }
}
