import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ConfirmationService } from 'primeng/api';
import { AuthService } from '../shared/security/auth.service';
import { SessionService } from '../shared/security/session.service';
import { LayoutService } from './service/site.layout.service';
import { DialogService } from 'primeng/dynamicdialog';
import { SessionUsuario } from '../shared/models/session-usuario.model';
import { InformationService } from '../shared/helpers/information.service';
import { adm } from 'src/app/shared/constants/adm';
import { SelectorSucursalComponent } from '../components/selector-sucursal/selector-sucursal.component';
import { VentaDetalle } from '../shared/models/venta.model';
import { HelperService } from '../shared/helpers/helper.service';


@Component({
    selector: 'site-topbar',
    templateUrl: './site.topbar.component.html',
    providers: [DialogService],
    // styles: [
    //     `
    //         .p-badge-no-gutter {
    //             padding: 0;
    //             border-radius: 50%;
    //             display: block !important;
    //             position: absolute;
    //             top: 3px;
    //             left: 20px;
    //         }
    //     `,
    // ],
})
export class SiteTopBarComponent {
    usuario!: SessionUsuario;

    constructor(
        public layoutService: LayoutService,
        private confirmationService: ConfirmationService,
        private authService: AuthService,
        private sessionService: SessionService,
        public dialogService: DialogService,
        private informationService: InformationService,
        private router: Router,
        private helperService: HelperService,
    ) {}

    ngOnInit(): void {
        if (this.sessionService.getSessionUserData()) {
            this.usuario = this.sessionService.getSessionUserData();
        }

        // verificar punto de venta
        if (this.usuario.idSucursal == 0 || this.usuario.idPuntoVenta == 0) {
            // verificar si solo tiene una sucursal en ese caso se carga la sucursal t el primer punto de venta
            this.cambiarPuntoVenta(this.sessionService.getSessionUserData().idTipoUsuario===adm.TIPO_USUARIO_SUPERADMIN);
        }

    }

    cambiarPuntoVenta(closeable: boolean): void {
        const ref = this.dialogService.open(SelectorSucursalComponent, {
            header: 'Seleccionar Sucursal',
            width: '350px',
            data: {},
            closable: closeable,
        });
        ref.onClose.subscribe((res) => {
            this.usuario = this.sessionService.getSessionUserData();
        });
    }

    confirmarCierreSession(): void {
        this.confirmationService.confirm({
            message: 'Esta seguro de salir de la aplicación?',
            header: 'Confirmación',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.authService.logout();
            },
        });
    }

    obtenerCantidadItems(){
        if (!this.sessionService.getRegistroVenta()) {
            return '0';
        }
        const detalle: VentaDetalle[] = this.sessionService.getRegistroVenta().detalle;
        if (!detalle || detalle.length===0) {
            return '0';
        }

        if (detalle) {
            const sum = detalle
                .map((t) => t.cantidad)
                .reduce((acc, value) => acc + value, 0);
                //console.log(sum);
            return sum.toString();
        }

        return '0';

    }

    verCarritoCompras() {
        this.router.navigate(['/site/compra-en-linea-por-pasos']);
    }

    onRowSelect(event: any) {
        this.informationService.showInfo(event.data.nombre);
    }

    ngOnDestroy(): void {
        this.dialogService.dialogComponentRefMap.forEach((dialog) => {
            dialog.destroy();
        });
    }
}

