import { Component, OnDestroy, OnInit } from '@angular/core';
import { InformationService } from 'src/app/shared/helpers/information.service';
import { Table } from 'primeng/table';
import { VentaFacturaResumen, Venta } from 'src/app/shared/models/venta.model';
import { VentasService } from 'src/app/shared/services/ventas.service';
import { SessionService } from 'src/app/shared/security/session.service';
import { DialogService } from 'primeng/dynamicdialog';
import { delay, Subject } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Parametrica } from 'src/app/shared/models/parametrica.model';
import { ParametricasService } from 'src/app/shared/services/parametricas.service';
import { Sucursal } from 'src/app/shared/models/sucursal.model';
import { SucursalesService } from 'src/app/shared/services/sucursales.service';
import { ConfirmationService, MenuItem } from 'primeng/api';
import { Router } from '@angular/router';
import { BusquedaVenta, BusquedaVentaCliente } from 'src/app/shared/models/busqueda-venta.model';
import { DatePipe } from '@angular/common';
import { spv } from 'src/app/shared/constants/spv';
import { UtilidadesService } from 'src/app/shared/services/utilidades.service';
import { sfe } from 'src/app/shared/constants/sfe';
import { HelperService } from '../../../../shared/helpers/helper.service';
import { FilesService } from 'src/app/shared/helpers/files.service';
import { Usuario } from 'src/app/shared/models/usuario.model';
import { UsuariosService } from 'src/app/shared/services/usuarios.service';
import { ESPIPE } from 'constants';


@Component({
  selector: 'app-lista-compras-en-linea',
  templateUrl: './lista-compras-en-linea.component.html',
  styleUrls: ['./lista-compras-en-linea.component.scss']
})
export class ListaComprasEnLineaComponent implements OnInit, OnDestroy {

    onDestroy$: Subject<boolean> = new Subject();
    criteriosBusquedaForm!: FormGroup;
    busquedaMemoria?: BusquedaVenta;

    items!: Venta[];
    listaEstadosVenta: Parametrica[] = [];
    listaTiposVenta: Parametrica[] = [];
    listaSucursales: Sucursal[] = [];
    listaUsuarios: Usuario[] = [];
    itemDialog!: boolean;
    blockedPanel: boolean = false;

    ventaSeleccionada!: Venta;
    itemsMenuFactura!: MenuItem[];
    itemsMenuVenta!: MenuItem[];
    constructor(
        private fb: FormBuilder,
        private ventasService: VentasService,
        private sessionService: SessionService,
        private informationService: InformationService,
        private dialogService: DialogService,
        private parametricasService: ParametricasService,
        private sucursalesService: SucursalesService,
        private confirmationService: ConfirmationService,
        private router: Router,
        private datepipe: DatePipe,
        private utilidadesService: UtilidadesService,
        private helperService: HelperService,
        private fileService:FilesService,
        private usuarioService: UsuariosService,
    ) {}

    ngOnInit(): void {
        if (!this.sessionService.verifyUrl(this.router.url)) {
            this.router.navigate(['/auth/access']);
        }

        this.itemsMenuFactura = [
            {
                label: 'Opciones Factura',
                items: [
                    {
                        label: 'Descargar',
                        icon: 'pi pi-cloud-download',
                        command: () => {
                            this.opcionFacturaDescargar(false);
                        },
                    }
                ],
            },
        ];

        this.loadData();
    }

    loadData(): void {
        this.blockedPanel = true;
        //const fechaInicio = new Date();
        //const fechaFin =  new Date();

        const criterios: BusquedaVentaCliente = {
            idEmpresa: this.sessionService.getSessionUserData().idEmpresa,
            //idSucursal: this.sessionService.getSessionUserData().idSucursal,
            usuario: this.sessionService.getSessionUserData().username,
            idsEstadosVenta: spv.ESTADO_VENTA_CREDITO_POR_PAGAR+","+spv.ESTADO_VENTA_CREDITO_PAGADO
            //fechaInicio: this.datepipe.transform(fechaInicio, 'dd/MM/yyyy') ?? '',
            //fechaFin: this.datepipe.transform(fechaFin, 'dd/MM/yyyy') ?? '',
        };

        this.ventasService.get(criterios)
        .subscribe({
            next: (res) => {
                this.sessionService.setBusquedaVenta(criterios);
                this.items = res.content;
                console.log(this.items);
                this.blockedPanel = false;
            },
            error: (err) => {
                this.informationService.showError(err.error.message);
                this.blockedPanel = false;
            },
        });
    }

    newItem() {
        const existePedido = this.items.filter((x) => x.idEstadoVenta == spv.ESTADO_VENTA_PEDIDO);
        console.log(existePedido);
        if(existePedido.length>0){
            this.informationService.showWarning('Existe un pedido activo');
            return;
        }

        this.sessionService.setRegistroVenta(null);
        this.router.navigate(['/site/compra-en-linea-por-pasos']);
    }

    esNullableFactura(factura: VentaFacturaResumen) {
        return factura && factura.codigoEstado == sfe.ESTADO_FACTURA_VALIDADO;
    }

    editItem(item: Venta) {
        this.ventasService.getDetail(item.id).subscribe({
            next: (res) => {
                item.detalle = res.content;
                this.sessionService.setRegistroVenta(item);
                this.router.navigate(['/site/compra-en-linea-por-pasos']);
            },
            error: (err) => {
                this.informationService.showError(err.error.message);
            },
        });
    }

    deleteItem(item: Venta) {
        this.confirmationService.confirm({
            message: 'Esta seguro de eliminar la venta ' + item.correlativo + ' ?',
            header: 'Confirmación',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.ventasService.delete(item).subscribe({
                    next: (res) => {
                        this.items = this.items.filter((x) => x.id !== item.id);
                        this.informationService.showSuccess(res.message);
                    },
                    error: (err) => {
                        this.informationService.showError(err.error.message);
                    },
                });
            },
        });
    }

    tieneFactura(factura: VentaFacturaResumen) {
        if (!factura) return false;
        return factura.codigoEstado==908 || factura.codigoEstado==905;
    }

    obtenerMetodoPago(codigoMetodoPago:number){
        if (codigoMetodoPago==sfe.CODIGO_TIPO_PAGO_ONLINE)
            return 'PAGO QR';
        else if (codigoMetodoPago==sfe.CODIGO_TIPO_PAGO_DEPOSITO_EN_CUENTA)
            return 'DEPOSITO';
        else if (codigoMetodoPago==sfe.CODIGO_TIPO_PAGO_POSTERIOR)
            return 'PAGO EN TIENDA';
        else
            return '-';
    }

   onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal(
            (event.target as HTMLInputElement).value,
            'contains'
        );
    }

    getEstadoFactura(factura: VentaFacturaResumen) {
        return factura ? factura.estado : 'NO EMITIDO';
    }

    getClaseFactura(factura: VentaFacturaResumen) {
        if (!factura) return 'mr-2 ';
        if (factura.codigoEstado == sfe.ESTADO_FACTURA_ANULADO) return 'mr-2 factura-anulada';
        if (factura.codigoEstado == sfe.ESTADO_FACTURA_VALIDADO) return 'mr-2 factura-emitida';
        return 'mr-2 ';
    }

    descargarFactura(item: Venta) {
        if (!item.factura) {
            this.informationService.showWarning('No existe factura');
            return;
        }

        this.blockedPanel = true;
        const fileName = `factura-${
            item.factura!.cuf
        }.pdf`;
        this.utilidadesService
            .getFactura(item.factura!.id)
            .pipe(delay(1000))
            .subscribe((blob: Blob): void => {
                this.fileService.printFile(blob, fileName, false);
                this.blockedPanel = false;
            });
    }


    ngOnDestroy(): void {
        this.onDestroy$.next(true);
        this.dialogService.dialogComponentRefMap.forEach((dialog) => {
            dialog.destroy();
        });
    }

    opcionesFactura(menu: any, event: any, item: Venta) {
        this.ventaSeleccionada = item;
        menu.toggle(event);
    }

    opcionFacturaDescargar(imprimir:boolean) {
        if (!this.ventaSeleccionada?.factura) {
            this.informationService.showWarning('No existe factura');
            return;
        }

        this.blockedPanel = true;
        const fileName = `factura-${
            this.ventaSeleccionada.factura!.cuf
        }.pdf`;
        this.utilidadesService
            .getFactura(this.ventaSeleccionada.factura!.id)
            .pipe(delay(1000))
            .subscribe((blob: Blob): void => {
                this.fileService.printFile(blob, fileName, imprimir);
                this.blockedPanel = false;
            });
    }
}
