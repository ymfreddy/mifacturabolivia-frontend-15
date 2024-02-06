import { Component, OnInit } from '@angular/core';
import {
    Traspaso,
    TraspasoDetalle,
} from 'src/app/shared/models/traspaso.model';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { InformationService } from 'src/app/shared/helpers/information.service';
import {
    DialogService,
    DynamicDialogConfig,
    DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { TraspasosService } from 'src/app/shared/services/traspasos.service';
import { Sucursal } from 'src/app/shared/models/sucursal.model';
import { DatePipe } from '@angular/common';
import { HistorialProductosService } from 'src/app/shared/services/historial-producto.service';
import { HistorialProducto } from 'src/app/shared/models/historial-producto.model';
import { ConfirmationService } from 'primeng/api';
import { SessionService } from 'src/app/shared/security/session.service';
import { Table } from 'primeng/table';

@Component({
    selector: 'app-formulario-traspaso',
    templateUrl: './formulario-traspaso.component.html',
    styleUrls: ['./formulario-traspaso.component.scss'],
    providers: [DialogService],
})
export class FormularioTraspasoComponent implements OnInit {
    item?: Traspaso;
    itemForm!: FormGroup;
    closeClicked = false;
    submited = false;
    verProductos = false;

    listaSucursales: Sucursal[] = [];
    listaProductos: HistorialProducto[] = [];
    listaProductosSeleccionados: HistorialProducto[] = [];

    detalle: TraspasoDetalle[] = [];
    detalleEliminado: number[] = [];
    sucursalOrigen = 'SUCURSAL ORIGEN';

    constructor(
        private fb: FormBuilder,
        public config: DynamicDialogConfig,
        private dialogRef: DynamicDialogRef,
        private informationService: InformationService,
        private traspasoService: TraspasosService,
        private historialProductoService: HistorialProductosService,
        public dialogService: DialogService,
        private datepipe: DatePipe,
        private confirmationService: ConfirmationService,
        private sessionService: SessionService
    ) {}

    ngOnInit(): void {
        this.listaSucursales = this.config.data.listaSucursales;
        this.item = this.config.data.data;
        this.itemForm = this.fb.group({
            id: [ this.item?.id ?? 0],
            correlativo: [this.item?.correlativo ],
            idSucursalOrigen: [
                { value: this.item?.idSucursalOrigen, disabled: this.item?.id },
                Validators.required,
            ],
            idSucursalDestino: [
                {
                    value: this.item?.idSucursalDestino,
                    disabled: this.item?.id,
                },
                Validators.required,
            ],
            fechaSolicitud: [
                {
                    value:
                        this.datepipe.transform(
                            this.item?.fechaSolicitud ?? new Date(),
                            'dd/MM/yyyy'
                        ) ?? '',
                    disabled: this.item?.id,
                },
            ],
            descripcion: [
                { value: this.item?.descripcion, disabled: this.item?.id },
                Validators.required,
            ],
        });

        // cargar detalle

        if (this.item?.id) {
            this.traspasoService.getDetail(this.item?.id).subscribe({
                next: (res) => {
                    this.detalle = res.content;
                },
                error: (err) => {
                    this.informationService.showError(err.error.message);
                },
            });
        } else {
            this.detalle = [];
        }
    }

    keyInput(event: any, keyc: string) {
        this.itemForm.patchValue({ [keyc]: event.value });
    }

    public dialogoProductosAbrir(): void {
        // verificar si eligio una sucursal origen
        if (!this.itemForm.value.idSucursalOrigen) {
            this.informationService.showWarning(
                'Debe seleccionar una sucursal origen'
            );
            return;
        }

        this.sucursalOrigen =
            this.listaSucursales.find(
                (x) => x.id == this.itemForm.value.idSucursalOrigen
            )?.direccion ?? '';
        this.verProductos = true;
        this.listaProductosSeleccionados = [];
        const busqueda: any = {
            idEmpresa: this.sessionService.getSessionEmpresaId(),
            idSucursal: this.itemForm.value.idSucursalOrigen,
            soloSaldos: true
        };
        this.historialProductoService.getHistory(busqueda).subscribe({
            next: (res) => {
                this.listaProductos = res.content;
            },
            error: (err) => {
                this.informationService.showError(err.error.message);
            },
        });

    }

    public dialogoProductosCerrar(): void {
        this.verProductos = false;
        this.listaProductosSeleccionados.forEach((element) => {
            const item = this.detalle.find(
                (x) => x.codigoProducto == element.codigoProducto
            );
            if (!item) {
                const prod: TraspasoDetalle = {
                    codigoStock: element.codigoStock,
                    precioCompra: element.precioCompra,
                    precioVenta: element.precioVenta,
                    idProducto: element.idProducto,
                    codigoProducto: element.codigoProducto,
                    producto: element.producto,
                    saldo: element.saldo,
                    cantidad: 1,
                };
                this.detalle.push(prod);
            }
        });
    }

    deleteItem(item: any) {
        this.detalle = this.detalle.filter(
            (x) => x.codigoProducto != item.codigoProducto
        );
        // verificar si tiene id
        if (item.id) {
            this.detalleEliminado.push(item.id);
        }
    }

    public onSubmit(): void {
        if (this.closeClicked) {
            this.dialogRef.close(null);
        } else {
            if (!this.item?.id && !this.itemForm.valid) {
                this.informationService.showWarning('Verifique los datos');
                return;
            }
            if (this.detalle.length == 0) {
                this.informationService.showWarning(
                    'Debe agregar al menos un producto para el traspaso'
                );
                return;
            }

            const traspaso: Traspaso = {
                ...this.item,
                id: this.itemForm.controls['id'].value,
                idSucursalOrigen:
                    this.itemForm.controls['idSucursalOrigen'].value,
                idSucursalDestino:
                    this.itemForm.controls['idSucursalDestino'].value,
                descripcion: this.itemForm.controls['descripcion'].value,
                detalle: this.detalle,
                itemsEliminados:
                    this.detalleEliminado.length == 0
                        ? null
                        : this.detalleEliminado,
            };


            if (traspaso.id > 0) {
                this.confirmationService.confirm({
                    message: 'Esta seguro de finalizar el traspaso?',
                    header: 'Confirmación',
                    icon: 'pi pi-exclamation-triangle',
                    accept: () => {
                        this.submited = true;
                        this.traspasoService.finalizar(traspaso).subscribe({
                            next: (res) => {
                                this.informationService.showSuccess( res.message
                                );
                                this.dialogRef.close(traspaso);
                            },
                            error: (err) => {
                                this.informationService.showError(
                                    err.error.message
                                    );
                                this.submited = false;
                            },
                        });
                    },
                });
            } else {
                this.submited = true;
                this.traspasoService.add(traspaso).subscribe({
                    next: (res) => {
                        this.informationService.showSuccess(res.message);
                        this.dialogRef.close(traspaso);
                    },
                    error: (err) => {
                        this.informationService.showError(err.error.message);
                        this.submited = false;
                    },
                });
            }
        }
    }

    canbioSucursal(event: any) {
        this.detalle = [];
    }

    public onClose(): void {
        this.closeClicked = true;
    }

    public onSave(): void {
        this.closeClicked = false;
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal(
            (event.target as HTMLInputElement).value,
            'contains'
        );
    }
}
