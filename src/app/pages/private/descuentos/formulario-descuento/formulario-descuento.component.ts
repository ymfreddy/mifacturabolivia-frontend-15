import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { TipoParametrica } from 'src/app/shared/enums/tipo-parametrica.model';
import { InformationService } from 'src/app/shared/helpers/information.service';
import { Descuento } from 'src/app/shared/models/descuento.model';
import { Parametrica } from 'src/app/shared/models/parametrica.model';
import { SessionService } from 'src/app/shared/security/session.service';
import { DescuentosService } from 'src/app/shared/services/descuentos.service';
import { ParametricasService } from 'src/app/shared/services/parametricas.service';
import { Router } from '@angular/router';
import { DescuentoDetalle } from 'src/app/shared/models/descuento.model';
import { Sucursal } from 'src/app/shared/models/sucursal.model';
import { SucursalesService } from 'src/app/shared/services/sucursales.service';
import { Producto } from 'src/app/shared/models/producto.model';
import { ProductosService } from 'src/app/shared/services/productos.service';
import { spv } from 'src/app/shared/constants/spv';
import { BusquedaProducto } from '../../../../shared/models/busqueda-producto.model';
import { Table } from 'primeng/table';

@Component({
    selector: 'app-formulario-descuento',
    templateUrl: './formulario-descuento.component.html',
    styleUrls: ['./formulario-descuento.component.scss'],
})
export class FormularioDescuentoComponent implements OnInit {
    item?: Descuento;
    itemForm!: FormGroup;
    backClicked = false;
    submited = false;
    verProductos = false;

    listaProductos: Producto[] = [];
    listaProductosSeleccionados: Producto[] = [];

    listaSucursales: Sucursal[] = [];
    detalle: DescuentoDetalle[] = [];
    detalleEliminado: number[] = [];
    listaDescuentos: Parametrica[] = [];
    blockSpace: RegExp = /[^\s]/;
    constructor(
        private fb: FormBuilder,
        private informationService: InformationService,
        private descuentoservice: DescuentosService,
        private sessionService: SessionService,
        private parametricasService: ParametricasService,
        public dialogService: DialogService,
        private router: Router,
        private sucursalesService: SucursalesService,
        private productoService: ProductosService
    ) {}

    ngOnInit(): void {
        if (this.sessionService.getRegistroDescuento() != null) {
            this.item = this.sessionService.getRegistroDescuento();
        }

        const criteriosBusqueda: BusquedaProducto = {
            idEmpresa: this.sessionService.getSessionEmpresaId(),
        };

        this.productoService.get(criteriosBusqueda).subscribe({
            next: (res) => {
                this.listaProductos = res.content;
            },
            error: (err) => {
                this.informationService.showError(err.error.message);
            },
        });

        this.parametricasService
            .getParametricasByTipo(TipoParametrica.TIPO_DESCUENTO)
            .subscribe((data) => {
                this.listaDescuentos = data as unknown as Parametrica[];
                this.listaDescuentos = this.listaDescuentos.filter(x=>x.id!==spv.TIPO_DESCUENTO_TOTAL);
            });

        this.sucursalesService
            .getByIdEmpresa(this.sessionService.getSessionEmpresaId())
            .subscribe({
                next: (res) => {
                    this.listaSucursales = res.content;
                },
                error: (err) => {
                    this.informationService.showError(err.error.message);
                },
            });

        this.itemForm = this.fb.group({
            id: [this.item?.id],
            idEmpresa: [this.item?.idEmpresa],
            idSucursal: [this.item?.idSucursal, Validators.required],
            nombre: [this.item?.nombre ?? '', Validators.required],
            activo: [this.item?.activo ?? true],
            idTipoDescuento: [this.item?.idTipoDescuento, Validators.required],
            descuentoEstablecido: [
                this.item?.descuentoEstablecido,
                [Validators.required],
            ],
        });

        this.detalle = this.item?.detalle ?? [];
    }

    public onSubmit(): void {
        if (this.backClicked) {
            this.router.navigate(['/adm/descuentos']);
        } else if (!this.submited) {
            return;
        } else {
            if (!this.itemForm.valid) {
                this.informationService.showWarning('Verifique los datos');
                this.submited = false;
                return;
            }

            if (this.detalle.length == 0) {
                this.informationService.showWarning(
                    'Debe agregar al menos un producto'
                );
                this.submited = false;
                return;
            }

            // obtener valores combo
            const idTipoDescuento =
                this.itemForm.controls['idTipoDescuento'].value;
            const tipoDescuento = this.listaDescuentos.find(
                (x) => x.id === idTipoDescuento
            )?.nombre;

            const descuento: Descuento = {
                ...this.item,
                id: this.itemForm.controls['id'].value,
                idEmpresa:
                    this.itemForm.controls['idEmpresa'].value ??
                    this.sessionService.getSessionEmpresaId(),
                idTipoDescuento:
                    this.itemForm.controls['idTipoDescuento'].value,
                idSucursal: this.itemForm.controls['idSucursal'].value,
                tipoDescuento: tipoDescuento ?? '',
                nombre: this.itemForm.controls['nombre'].value.trim(),
                activo: this.itemForm.controls['activo'].value,
                descuentoEstablecido:
                    this.itemForm.controls['descuentoEstablecido'].value,
                detalle: this.detalle,
                itemsEliminados:
                    this.detalleEliminado.length == 0
                        ? null
                        : this.detalleEliminado,
            };

            if (descuento.id > 0) {
                this.descuentoservice.edit(descuento).subscribe({
                    next: (res) => {
                        this.informationService.showSuccess(res.message);
                        this.router.navigate(['/adm/descuentos']);
                    },
                    error: (err) => {
                        this.informationService.showError(err.error.message);
                        this.submited = false;
                    },
                });
            } else {
                this.descuentoservice.add(descuento).subscribe({
                    next: (res) => {
                        descuento.id = res.content;
                        this.informationService.showSuccess(res.message);
                        this.router.navigate(['/adm/descuentos']);
                    },
                    error: (err) => {
                        this.informationService.showError(err.error.message);
                        this.submited = false;
                    },
                });
            }
        }
    }

    public prevPage() {
        this.backClicked = true;
    }

    public onSave(): void {
        this.backClicked = false;
        this.submited = true;
    }

    public deleteItem(item: any) {
        this.detalle = this.detalle.filter(
            (x) => x.idProducto != item.idProducto
        );
        // verificar si tiene id
        if (item.id) {
            this.detalleEliminado.push(item.id);
        }
    }

    public dialogoProductosAbrir(): void {
        this.verProductos = true;
        this.listaProductosSeleccionados = [];
    }

    public dialogoProductosCerrar(): void {
        this.verProductos = false;
        this.listaProductosSeleccionados.forEach((element) => {
            const item = this.detalle.find(
                (x) => x.codigoProducto == element.codigoProducto
            );
            if (!item) {
                const prod: DescuentoDetalle = {
                    idProducto: element.id,
                    codigoProducto: element.codigoProducto,
                    producto: element.nombre,
                    categoria: element.categoria,
                };
                this.detalle.push(prod);
            }
        });
    }

    ngOnDestroy(): void {
        this.dialogService.dialogComponentRefMap.forEach((dialog) => {
            dialog.destroy();
        });
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal(
            (event.target as HTMLInputElement).value,
            'contains'
        );
    }
}
