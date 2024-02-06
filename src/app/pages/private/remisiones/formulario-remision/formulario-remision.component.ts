import { DatePipe } from '@angular/common';
import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Table } from 'primeng/table';
import { spv } from 'src/app/shared/constants/spv';
import { InformationService } from 'src/app/shared/helpers/information.service';
import { Producto } from 'src/app/shared/models/producto.model';
import {
    Remision,
    RemisionDetalle,
} from 'src/app/shared/models/remision.model';
import { Sucursal } from 'src/app/shared/models/sucursal.model';
import { SessionService } from 'src/app/shared/security/session.service';
import { ProductosService } from 'src/app/shared/services/productos.service';
import { RemisionesService } from 'src/app/shared/services/remisiones.service';
import { SucursalesService } from 'src/app/shared/services/sucursales.service';
import { UtilidadesService } from 'src/app/shared/services/utilidades.service';
import { VentasService } from 'src/app/shared/services/ventas.service';
import { ClientesService } from '../../../../shared/services/clientes.service';
import { delay } from 'rxjs';
import { BusquedaCliente } from 'src/app/shared/models/busqueda-cliente.model';
import { Cliente } from 'src/app/shared/models/cliente.model';
import { AutoComplete } from 'primeng/autocomplete';
import { FilesService } from 'src/app/shared/helpers/files.service';
import { BusquedaProducto } from 'src/app/shared/models/busqueda-producto.model';

@Component({
    selector: 'app-formulario-remision',
    templateUrl: './formulario-remision.component.html',
    styleUrls: ['./formulario-remision.component.scss'],
})
export class FormularioRemisionComponent implements OnInit {
    @ViewChild('cliente') elmC?: AutoComplete;
    @ViewChild('direccion') elmDir!: ElementRef;
    @ViewChild('codigoVenta') elmCV!: ElementRef;

    item?: Remision;
    itemForm!: FormGroup;
    closeClicked = false;
    submited = false;
    verProductos = false;
    listaSucursales: Sucursal[] = [];
    detalle: RemisionDetalle[] = [];
    detalleEliminado: number[] = [];

    listaProductos: Producto[] = [];
    listaProductosSeleccionados: Producto[] = [];
    listaClientesFiltrados: Cliente[] = [];

    constructor(
        private fb: FormBuilder,
        public config: DynamicDialogConfig,
        private dialogRef: DynamicDialogRef,
        private informationService: InformationService,
        private remisionesservice: RemisionesService,
        private sessionService: SessionService,
        private sucursalService: SucursalesService,
        private clienteService: ClientesService,
        private ventasService: VentasService,
        private datepipe: DatePipe,
        private productoService: ProductosService,
        private utilidadesService: UtilidadesService,
        private fileService:FilesService
    ) {}

    ngOnInit(): void {

        this.sucursalService
            .getByIdEmpresa(this.sessionService.getSessionEmpresaId())
            .subscribe({
                next: (res) => {
                    this.listaSucursales = res.content;
                },
                error: (err) => {
                    this.informationService.showError(err.error.message);
                },
            });

        // cargar data
        let temporalCliente: any;
        this.item = this.config.data;
        if (this.item){
            temporalCliente = {
                id: this.item?.idCliente,
                codigoCliente: this.item?.codigoCliente,
                direccion: this.item?.direccion,
                nombre: this.item?.nombreCliente,
            };
        }
        this.itemForm = this.fb.group({
            id: [this.item?.id],
            nit:[this.item?.nit],
            correlativo: [{ value: this.item?.correlativo, disabled: true }],
            fecha: [
                this.datepipe.transform(
                    this.item?.fecha ?? new Date(),
                    'dd/MM/yyyy'
                ) ?? '',
            ],
            cliente: [temporalCliente, Validators.required],
            idCliente: [this.item?.idCliente],
            codigoCliente: [this.item?.codigoCliente ],
            nombreCliente: [this.item?.nombreCliente ],
            direccion: [this.item?.direccion, Validators.required],
            idSucursal: [
                this.item?.idSucursal ??
                    this.sessionService.getSessionUserData().idSucursal,
                Validators.required,
            ],
            observacion: [this.item?.observacion],
            codigoVenta: [''],
            //number: ['', [Validators.required, Validators.pattern("^[0-9]*$")]]
        });

        if (this.item?.id) {
            this.remisionesservice.getDetail(this.item?.id).subscribe({
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

    ngAfterViewInit(): void {
        setTimeout(() => {
            this.elmC?.focusInput();
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
            if (this.detalle.length == 0) {
                this.informationService.showWarning(
                    'Debe agregar al menos un item para la remisión'
                );
                return;
            }

            const existeCantidadNegativa = this.detalle.filter(
                (x) => x.cantidad <= 0
            );

            if (existeCantidadNegativa.length>0) {
                this.informationService.showWarning(
                    'En el detalle no debe existir cantidad menor o igual a 0'
                );
                return;
            }

            const existeCodigoProductoInvalido = this.detalle.filter(
                (x) => !x.codigoProducto
            );

            if (existeCodigoProductoInvalido.length>0) {
                this.informationService.showWarning(
                    'En el detalle no debe existir código producto sin valor'
                );
                return;
            }

            const existeProductoInvalido = this.detalle.filter(
                (x) => !x.producto
            );

            if (existeProductoInvalido.length>0) {
                this.informationService.showWarning(
                    'En el detalle no debe existir producto sin valor'
                );
                return;
            }

            const remision: Remision = {
                ...this.item,
                id: this.itemForm.controls['id'].value,
                idSucursal: this.itemForm.controls['idSucursal'].value,
                idCliente: this.itemForm.controls['idCliente'].value,
                codigoCliente: this.itemForm.controls['codigoCliente'].value,
                nombreCliente: this.itemForm.controls['nombreCliente'].value,
                direccion: this.itemForm.controls['direccion'].value.trim(),
                observacion: this.itemForm.controls['observacion'].value,
                detalle: this.detalle,
                itemsEliminados:
                    this.detalleEliminado.length == 0
                        ? null
                        : this.detalleEliminado,
            };

            this.submited = true;
            if (remision.id > 0) {
                this.remisionesservice.edit(remision).subscribe({
                    next: (res) => {
                        this.informationService.showSuccess(res.message);
                        this.dialogRef.close(remision);
                    },
                    error: (err) => {
                        this.informationService.showError(err.error.message);
                        this.submited = false;
                    },
                });
            } else {
                this.remisionesservice.add(remision).subscribe({
                    next: (res) => {
                        remision.id = res.content;
                        this.printRemision(res.content.id, res.content.correlativo);
                        this.informationService.showSuccess(res.message);
                        this.dialogRef.close(remision);
                    },
                    error: (err) => {
                        this.informationService.showError(err.error.message);
                        this.submited = false;
                    },
                });
            }
        }
    }

    public buscarVenta(): void {
        if (!this.itemForm.controls['codigoVenta'].value) {
            this.informationService.showInfo(
                'Debe ingresar un Código de Venta'
            );
            return;
        }

        const correlativo = this.itemForm.controls['codigoVenta'].value;
        this.ventasService
            .getDetailByCorrelativo(correlativo, this.sessionService.getSessionEmpresaId())
            .subscribe({
                next: (res) => {
                    res.content.forEach((element: any) => {
                        const existeItem = this.detalle.find(
                            (x) =>
                                x.codigoProducto === element.codigoProducto &&
                                x.correlativoVenta == correlativo
                        );
                        if (!existeItem) {
                            const item: RemisionDetalle = {
                                id: 0,
                                idRemision: this.item?.id,
                                correlativoVenta: correlativo,
                                codigo: element.codigo,
                                codigoProducto: element.codigoProducto,
                                producto: element?.producto,
                                cantidad: element?.cantidad,
                            };
                            this.detalle.push(item);
                        }
                    });

                    this.itemForm.patchValue({ codigoVenta: '' });
                    this.elmCV.nativeElement.focus();
                },
                error: (err) => {
                    this.informationService.showWarning(err.error.message);
                },
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

    public dialogoProductosAbrir(): void {
        this.verProductos = true;
        if (this.listaProductos.length==0) {
            const criteriosBusqueda: BusquedaProducto = {
                idEmpresa: this.sessionService.getSessionEmpresaId(),
                idsTipoProducto: spv.TIPO_PRODUCTO_PRODUCTO.toString(),
            };

            this.productoService.get(criteriosBusqueda).subscribe({
                next: (res) => {
                    this.listaProductos = res.content;
                },
                error: (err) => {
                    this.informationService.showError(err.error.message);
                },
            });
        }

        this.listaProductosSeleccionados = [];
    }

    public dialogoProductosCerrar(): void {
        this.verProductos = false;
        this.listaProductosSeleccionados.forEach((element) => {
            const existeItem = this.detalle.find(
                (x) =>
                    x.codigoProducto === element.codigoProducto &&
                    x.correlativoVenta == ''
            );
            if (!existeItem) {
                const item: RemisionDetalle = {
                    id: 0,
                    idRemision: this.item?.id,
                    correlativoVenta: '',
                    codigo: '',
                    codigoProducto: element.codigoProducto,
                    producto: element?.nombre,
                    cantidad: 1,
                };
                this.detalle.push(item);
            }
        });
    }

    printRemision(id: number, correlativo: string) {
        const fileName = `remision-${
            correlativo
        }.pdf`;
        this.utilidadesService
            .getRemision(id)
            .pipe(delay(1000))
            .subscribe((blob: Blob): void => {
                this.fileService.printFile(blob, fileName, false);
            });
    }

    // CLIENTE
    filtrarCliente(event: any) {
        //in a real application, make a request to a remote url with the query and return filtered results, for demo we filter at client side
        let query = event.query;
        this.buscarCliente(query);
    }

    buscarCliente(termino: string) {
        const criteriosBusqueda: BusquedaCliente = {
            idEmpresa: this.sessionService.getSessionEmpresaId(),
            termino: termino.trim(),
            cantidadRegistros: 10,
            resumen: true,
        };

        this.clienteService.get(criteriosBusqueda).subscribe({
            next: (res) => {
                if (res.content.length == 0) {
                    this.listaClientesFiltrados = [];
                    return;
                }
                this.listaClientesFiltrados = res.content;
            },
            error: (err) => {
                this.informationService.showError(err.error.message);
            },
        });
    }

    seleccionarCliente(event: any) {
        this.itemForm.patchValue({ cliente: event });
        this.itemForm.patchValue({ idCliente: event?.id });
        this.itemForm.patchValue({ codigoCliente: event?.codigoCliente });
        this.itemForm.patchValue({ nombreCliente: event?.nombre });
        this.itemForm.patchValue({ direccion: event?.direccion });
        this.elmDir.nativeElement.focus();
    }

    limpiarCliente() {
        this.itemForm.patchValue({ cliente: null });
        this.itemForm.patchValue({ idCliente: '' });
        this.itemForm.patchValue({ codigoCliente: '' });
        this.itemForm.patchValue({ nombreCliente: '' });
        this.itemForm.patchValue({ direccion: '' });
        this.elmC?.focusInput();
    }
}
