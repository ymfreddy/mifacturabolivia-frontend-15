import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ConfirmationService } from 'primeng/api';
import { AuthService } from '../shared/security/auth.service';
import { SessionService } from '../shared/security/session.service';
import { LayoutService } from './service/app.layout.service';
import { DialogService } from 'primeng/dynamicdialog';
import { selectorPuntoVentaComponent } from '../components/selector-punto-venta/selector-punto-venta.component';
import { SessionUsuario } from '../shared/models/session-usuario.model';
import { spv } from '../shared/constants/spv';
import { Turno } from '../shared/models/turno.model';
import { TurnosService } from '../shared/services/turnos.service';
import { InformationService } from '../shared/helpers/information.service';
import { CambioPasswordComponent } from '../components/cambio-password/cambio-password.component';
import { FormularioTurnoCierreComponent } from '../pages/private/turnos/formulario-turno-cierre/formulario-turno-cierre.component';
import { FormularioTurnoAperturaComponent } from '../pages/private/turnos/formulario-turno-apertura/formulario-turno-apertura.component';
import { FacturasService } from 'src/app/shared/services/facturas.service';
import { Subscription, timer } from 'rxjs';
import { map } from 'rxjs/operators';
import { adm } from 'src/app/shared/constants/adm';
import { PushService } from '../shared/services/push.service';
import { NotificacionesClienteService } from '../shared/services/notificaciones-cliente.service';
import { VerNotificacionesComponent } from '../components/ver-notificaciones/ver-notificaciones.component';

@Component({
    selector: 'app-topbar',
    templateUrl: './app.topbar.component.html',
    providers: [DialogService],
})
export class AppTopBarComponent {
    usuario!: SessionUsuario;
    timerSubscription!: Subscription;

    listaNotificacionesCliente: any[]=[];
    //notificacionSeleccionada?: Notificacion;

    constructor(
        public layoutService: LayoutService,
        private confirmationService: ConfirmationService,
        private authService: AuthService,
        private sessionService: SessionService,
        public dialogService: DialogService,
        private turnoService: TurnosService,
        private informationService: InformationService,
        private facturaService: FacturasService,
        private notificacionesClienteService: NotificacionesClienteService,
        private pushService: PushService
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

        if (this.usuario.cambiarClave) {
            this.cambiarPasword();
        }

        this.pushService.listen();

        this.notificacionesClienteService.getAll().subscribe((data)=>{
            if (data && data.length>0)
                this.informationService.showInfo("Tiene "+data.length+" notificación(es)");
            this.listaNotificacionesCliente = data;
        });
    }

    obtenerNumeroNotificaciones(){
        return this.listaNotificacionesCliente.length.toString();
    }

    verNotificaciones(){
        if(this.listaNotificacionesCliente.length==0){
            this.informationService.showInfo("No existe Notificaciones");
            return;
        }

        const ref = this.dialogService.open(VerNotificacionesComponent, {
            header: 'Notificaciones',
            width: '90%',
            data: this.listaNotificacionesCliente,
        });
        ref.onClose.subscribe((res) => { });
    }

    cambiarPuntoVenta(closeable: boolean): void {
        const ref = this.dialogService.open(selectorPuntoVentaComponent, {
            header: 'Seleccionar Punto de Venta',
            width: '350px',
            data: {},
            closable: closeable,
        });
        ref.onClose.subscribe((res) => {
            this.usuario = this.sessionService.getSessionUserData();
        });
    }

    cambiarPasword(): void {
        const ref = this.dialogService.open(CambioPasswordComponent, {
            header: 'Cambiar Password',
            width: '350px',
            data: {},
            closable: true,
        });
    }

    confirmarCierreSession(): void {
        this.confirmationService.confirm({
            message: 'Esta seguro de salir de la aplicación ?',
            header: 'Confirmación',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.authService.logout();
            },
        });
    }

    abrirTurno(): void {
        const ref = this.dialogService.open(FormularioTurnoAperturaComponent, {
            header: 'Abrir Turno',
            width: '350px',
            data: {},
        });
    }

    cerrarTurno(): void {
        // verificar si existe turno
        if (this.sessionService.getTurno() == 0) {
            this.informationService.showWarning('No exise un turno abierto');
            return;
        }

        this.turnoService.getById(this.sessionService.getTurno()).subscribe({
            next: (res) => {
                const itemTurno: Turno = res.content;
                if (itemTurno.idEstadoTurno == spv.ESTADO_TURNO_CERRADO) {
                    this.informationService.showWarning(
                        'El turno ya se encuentra cerrado!'
                    );
                    return;
                }
                this.dialogService.open(FormularioTurnoCierreComponent, {
                    header: 'Cerrar Turno',
                    width: '550px',
                    data: itemTurno,
                });
            },
            error: (err) => {
                this.informationService.showError(err.error.message);
            },
        });
    }

    onRowSelect(event: any) {
        this.informationService.showInfo(event.data.nombre);
    }

    verOpcionTurno():Boolean{
        return this.usuario.idTipoUsuario!=adm.TIPO_USUARIO_FACTURACION && this.usuario.idTipoUsuario!=adm.TIPO_USUARIO_ASESOR;
    }

    ngOnDestroy(): void {
        if (this.timerSubscription) {
            this.timerSubscription.unsubscribe();
        }

        this.dialogService.dialogComponentRefMap.forEach((dialog) => {
            dialog.destroy();
        });
    }
}

