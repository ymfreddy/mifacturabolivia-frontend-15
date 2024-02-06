import { NgModule } from '@angular/core';
import { DatePipe, DecimalPipe, HashLocationStrategy, LocationStrategy, PathLocationStrategy } from '@angular/common';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { AppLayoutModule } from './layout/app.layout.module';
import { NotfoundComponent } from './pages/public/notfound/notfound.component';
import { AuthInterceptor } from './shared/security/auth.interceptor';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { PrimeNgModule } from './shared/prime-ng.module';
import { ConfirmationService } from 'primeng/api';
import { ListaCategoriasComponent } from './pages/private/categorias/lista-categorias/lista-categorias.component';
import { FormularioCategoriaComponent } from './pages/private/categorias/formulario-categoria/formulario-categoria.component';
import { FormularioProveedorComponent } from './pages/private/proveedores/formulario-proveedor/formulario-proveedor.component';
import { ListaProveedoresComponent } from './pages/private/proveedores/lista-proveedores/lista-proveedores.component';
import { ListaClientesComponent } from './pages/private/clientes/lista-clientes/lista-clientes.component';
import { FormularioClienteComponent } from './pages/private/clientes/formulario-cliente/formulario-cliente.component';
import { FormularioProductoComponent } from './pages/private/productos/formulario-producto/formulario-producto.component';
import { ListaProductosComponent } from './pages/private/productos/lista-productos/lista-productos.component';
import { FormularioUsuarioComponent } from './pages/private/usuarios/formulario-usuario/formulario-usuario.component';
import { ListaUsuariosComponent } from './pages/private/usuarios/lista-usuarios/lista-usuarios.component';
import { BloqueoComponent } from './components/bloqueo/bloqueo.component';
import { FormularioSucursalComponent } from './pages/private/sucursales/formulario-sucursal/formulario-sucursal.component';
import { ListaSucursalesComponent } from './pages/private/sucursales/lista-sucursales/lista-sucursales.component';
import { ListaTurnosComponent } from './pages/private/turnos/lista-turnos/lista-turnos.component';
import { FormularioTurnoCierreComponent } from './pages/private/turnos/formulario-turno-cierre/formulario-turno-cierre.component';
import { FormularioTurnoAperturaComponent } from './pages/private/turnos/formulario-turno-apertura/formulario-turno-apertura.component';
import { ListaEmpresasComponent } from './pages/private/empresas/lista-empresas/lista-empresas.component';
import { ListaAsociacionesComponent } from './pages/private/asociaciones/lista-asociaciones/lista-asociaciones.component';
import { ListaComprasComponent } from './pages/private/compras/lista-compras/lista-compras.component';
import { ListaVentasComponent } from './pages/private/ventas/lista-ventas/lista-ventas.component';
import { ListaFacturasComponent } from './pages/private/facturas/lista-facturas/lista-facturas.component';
import { FormularioAsociacionComponent } from './pages/private/asociaciones/formulario-asociacion/formulario-asociacion.component';
import { FormularioEmpresaComponent } from './pages/private/empresas/formulario-empresa/formulario-empresa.component';
import { selectorPuntoVentaComponent } from './components/selector-punto-venta/selector-punto-venta.component';
import { DialogService } from 'primeng/dynamicdialog';
import { VentaPorPasosComponent } from './pages/private/ventas/steps/venta-por-pasos/venta-por-pasos.component';
import { RecibirComponent } from './pages/private/compras/steps/recibir/recibir.component';
import { SolicitarComponent } from './pages/private/compras/steps/solicitar/solicitar.component';
import { CompraPorPasosComponent } from './pages/private/compras/steps/compra-por-pasos/compra-por-pasos.component';
import { ListaInventariosComponent } from './pages/private/inventarios/lista-inventarios/lista-inventarios.component';
import { FormularioAjusteComponent } from './pages/private/inventarios/formulario-ajuste/formulario-ajuste.component';
import { ListaTraspasosComponent } from './pages/private/traspasos/lista-traspasos/lista-traspasos.component';
import { FormularioTraspasoComponent } from './pages/private/traspasos/formulario-traspaso/formulario-traspaso.component';
import { CambioPasswordComponent } from './components/cambio-password/cambio-password.component';
import { AnularFacturaComponent } from './components/anular-factura/anular-factura.component';
import { EmitirFacturaComponent } from './components/emitir-factura/emitir-factura.component';
import { FormatoDecimalPipe } from './shared/pipes/formato-decimal.pipe';
import { FormatoDecimalIcePipe } from './shared/pipes/formato-decimal-ice.pipe';
import { FormatoFechaHoraPipe } from './shared/pipes/formato-fecha-hora.pipe';
import { ContingenciaComponent } from './components/contingencia/contingencia.component';
import { EnvioContingenciaComponent } from './components/envio-contingencia/envio-contingencia.component';
import { ActivarTipoEmisionComponent } from './components/activar-tipo-emision/activar-tipo-emision.component';
import { ListaPuntosComponent } from './pages/private/puntos/lista-puntos/lista-puntos.component';
import { FormularioPuntoComponent } from './pages/private/puntos/formulario-punto/formulario-punto.component';
import { FormularioRemisionComponent } from './pages/private/remisiones/formulario-remision/formulario-remision.component';
import { ListaRemisionesComponent } from './pages/private/remisiones/lista-remisiones/lista-remisiones.component';
import { FacturaPorPasosComponent } from './pages/private/facturas/steps/factura-por-pasos/factura-por-pasos.component';
import { FacturaPasoUnoComponent } from './pages/private/facturas/steps/factura-paso-uno/factura-paso-uno.component';
import { FacturaPasoDosComponent } from './pages/private/facturas/steps/factura-paso-dos/factura-paso-dos.component';
import { VentaPasoUnoComponent } from './pages/private/ventas/steps/venta-paso-uno/venta-paso-uno.component';
import { VentaPasoDosComponent } from './pages/private/ventas/steps/venta-paso-dos/venta-paso-dos.component';
import { WhatsappFacturaComponent } from './components/whatsapp-factura/whatsapp-factura.component';
import { ListaVentasCreditoComponent } from './pages/private/ventas-credito/lista-ventas-credito/lista-ventas-credito.component';
import { FormularioVentasCreditoPagoComponent } from './pages/private/ventas-credito/formulario-ventas-credito-pago/formulario-ventas-credito-pago.component';
import { GeolocalizacionComponent } from './components/geolocalizacion/geolocalizacion.component';
import { ListaVisitasComponent } from './pages/private/visitas/lista-visitas/lista-visitas.component';
import { AngularFireModule } from '@angular/fire/compat';
import { environment } from '../environments/environment';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { PosicionActualComponent } from './pages/private/visitas/posicion-actual/posicion-actual.component';
import { ListaInteresadosComponent } from './pages/private/interesados/lista-interesados/lista-interesados.component';
import { SeguimientoMapaComponent } from './components/seguimiento-mapa/seguimiento-mapa.component';
import { UpperCaseInputDirective } from './shared/directives/upper-case-input.directive';
import { AllowNumbersOnlyDirective } from './shared/directives/allow-numbers-only.directive';
import { AsignacionComponent } from './pages/private/visitas/asignacion/asignacion.component';
import { CancelarVisitaComponent } from './components/cancelar-visita/cancelar-visita.component';
import { DetalleVisitaComponent } from './components/detalle-visita/detalle-visita.component';
import { FormularioDireccionComponent } from './pages/private/interesados/formulario-direccion/formulario-direccion.component';
import { GestionInteresadoComponent } from './pages/private/interesados/gestion-interesado/gestion-interesado.component';
import { DatosFacturaHospitalComponent } from './components/datos-factura-hospital/datos-factura-hospital.component';
import { PuntoTipoEmisionComponent } from './components/punto-tipo-emision/punto-tipo-emision.component';
import { ListaMedicosComponent } from './pages/private/medicos/lista-medicos/lista-medicos.component';
import { FormularioMedicoComponent } from './pages/private/medicos/formulario-medico/formulario-medico.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { ListaDescuentosComponent } from './pages/private/descuentos/lista-descuentos/lista-descuentos.component';
import { FormularioDescuentoComponent } from './pages/private/descuentos/formulario-descuento/formulario-descuento.component';
import { DescuentoDetalleComponent } from './components/descuento-detalle/descuento-detalle.component';
import { CambioDescuentoComponent } from './components/cambio-descuento/cambio-descuento.component';
import { HistorialProductoDetalleComponent } from './components/historial-producto-detalle/historial-producto-detalle.component';
import { ReporteProductoHistorialComponent } from './components/reporte-producto-historial/reporte-producto-historial.component';
import { FacturaErrorComponent } from './components/factura-error/factura-error.component';
import { ReportesComponent } from './pages/private/reportes/reportes.component';
import { FacturaPasoDosSeguroComponent } from './pages/private/facturas/steps/factura-paso-dos-seguro/factura-paso-dos-seguro.component';
import { DatosFacturaHotelComponent } from './components/datos-factura-hotel/datos-factura-hotel.component';
import { FacturaPasoDosTurismoComponent } from './pages/private/facturas/steps/factura-paso-dos-turismo/factura-paso-dos-turismo.component';
import { initializeApp } from 'firebase/app';
import { ListaNotificacionesComponent } from './pages/private/notificaciones/lista-notificaciones/lista-notificaciones.component';
import { FormularioNotificacionComponent } from './pages/private/notificaciones/formulario-notificacion/formulario-notificacion.component';
import { VerNotificacionesComponent } from './components/ver-notificaciones/ver-notificaciones.component';
import { MenuPrincipalComponent } from './pages/private/menu/menu-principal/menu-principal.component';
import { PosComponent } from './pages/private/pos/pos/pos.component';
import { PosPasoUnoComponent } from './pages/private/pos/steps/pos-paso-uno/pos-paso-uno.component';
import { PosPasoDosComponent } from './pages/private/pos/steps/pos-paso-dos/pos-paso-dos.component';
import { PosPorPasosComponent } from './pages/private/pos/steps/pos-por-pasos/pos-por-pasos.component';
import { AtencionComponent } from './pages/private/atenciones/atencion/atencion.component';
import { PagoQrComponent } from './components/pago-qr/pago-qr.component';
import { SiteLayoutModule } from './layout-site/site.layout.module';
import { SelectorSucursalComponent } from './components/selector-sucursal/selector-sucursal.component';
import { ListaComprasEnLineaComponent } from './pages/private-site/compra-en-linea/lista-compras-en-linea/lista-compras-en-linea.component';
import { CompraEnLineaPasoUnoComponent } from './pages/private-site/compra-en-linea/steps/compra-en-linea-paso-uno/compra-en-linea-paso-uno.component';
import { CompraEnLineaPasoDosComponent } from './pages/private-site/compra-en-linea/steps/compra-en-linea-paso-dos/compra-en-linea-paso-dos.component';
import { CompraEnLineaPorPasosComponent } from './pages/private-site/compra-en-linea/steps/compra-en-linea-por-pasos/compra-en-linea-por-pasos.component';
import { ListaMesasComponent } from './pages/private/mesas/lista-mesas/lista-mesas.component';
import { FormularioMesaComponent } from './pages/private/mesas/formulario-mesa/formulario-mesa.component';
import { VentaDetalleComponent } from './components/venta-detalle/venta-detalle.component';
import { FacturaPasoDosTasaCeroComponent } from './pages/private/facturas/steps/factura-paso-dos-tasa-cero/factura-paso-dos-tasa-cero.component';
import { DatosFacturaIceComponent } from './components/datos-factura-ice/datos-factura-ice.component';
import { FacturaIcePasoUnoComponent } from './pages/private/facturas/steps-ice/factura-ice-paso-uno/factura-ice-paso-uno.component';
import { FacturaIcePorPasosComponent } from './pages/private/facturas/steps-ice/factura-ice-por-pasos/factura-ice-por-pasos.component';
import { FacturaIcePasoDosComponent } from './pages/private/facturas/steps-ice/factura-ice-paso-dos/factura-ice-paso-dos.component';
import { EnviarWhatsappComponent } from './components/enviar-whatsapp/enviar-whatsapp.component';
import { ListaCotizacionesComponent } from './pages/private/cotizaciones/lista-cotizaciones/lista-cotizaciones.component';
import { FormularioCotizacionComponent } from './pages/private/cotizaciones/formulario-cotizacion/formulario-cotizacion.component';
import { EnviarCotizacionWhatsappComponent } from './components/enviar-cotizacion-whatsapp/enviar-cotizacion-whatsapp.component';
import { FacturaMineraPorPasosComponent } from './pages/private/facturas/steps-minera/factura-minera-por-pasos/factura-minera-por-pasos.component';
import { FacturaMineraPasoUnoComponent } from './pages/private/facturas/steps-minera/factura-minera-paso-uno/factura-minera-paso-uno.component';
import { FacturaMineraPasoDosComponent } from './pages/private/facturas/steps-minera/factura-minera-paso-dos/factura-minera-paso-dos.component';
import { DatosFacturaMineraComponent } from './components/datos-factura-minera/datos-factura-minera.component';
import { RevertirFacturaComponent } from './components/revertir-factura/revertir-factura.component';
import { ListaEstudiantesComponent } from './pages/private/estudiantes/lista-estudiantes/lista-estudiantes.component';
import { FormularioEstudianteComponent } from './pages/private/estudiantes/formulario-estudiante/formulario-estudiante.component';
import { FormularioProductoIceComponent } from './pages/private/productos/formulario-producto-ice/formulario-producto-ice.component';


initializeApp(environment.firebase);

@NgModule({
    declarations: [
        AppComponent, NotfoundComponent, ListaCategoriasComponent, FormularioCategoriaComponent, FormularioProveedorComponent, ListaProveedoresComponent, ListaClientesComponent, FormularioClienteComponent, FormularioProductoComponent, ListaProductosComponent, ListaUsuariosComponent, FormularioUsuarioComponent, BloqueoComponent, ListaSucursalesComponent, FormularioSucursalComponent, ListaTurnosComponent, FormularioTurnoCierreComponent, FormularioTurnoAperturaComponent, ListaEmpresasComponent, ListaAsociacionesComponent, ListaComprasComponent, ListaVentasComponent, ListaFacturasComponent, FormularioAsociacionComponent, FormularioEmpresaComponent, selectorPuntoVentaComponent, VentaPorPasosComponent, RecibirComponent, SolicitarComponent, CompraPorPasosComponent, ListaInventariosComponent, FormularioAjusteComponent, ListaTraspasosComponent, FormularioTraspasoComponent, CambioPasswordComponent,
        AnularFacturaComponent, EmitirFacturaComponent,
        FormatoDecimalPipe, FormatoDecimalIcePipe,FormatoFechaHoraPipe, ContingenciaComponent, EnvioContingenciaComponent, ActivarTipoEmisionComponent, ListaPuntosComponent, FormularioPuntoComponent, FormularioRemisionComponent, ListaRemisionesComponent, FacturaPorPasosComponent, FacturaPasoUnoComponent, FacturaPasoDosComponent, VentaPasoUnoComponent, VentaPasoDosComponent, WhatsappFacturaComponent, ListaVentasCreditoComponent, FormularioVentasCreditoPagoComponent, GeolocalizacionComponent, ListaVisitasComponent, PosicionActualComponent, ListaInteresadosComponent,  SeguimientoMapaComponent,
        UpperCaseInputDirective, AllowNumbersOnlyDirective, AsignacionComponent, CancelarVisitaComponent, DetalleVisitaComponent, FormularioDireccionComponent, GestionInteresadoComponent, DatosFacturaHospitalComponent, PuntoTipoEmisionComponent, ListaMedicosComponent, FormularioMedicoComponent, ListaDescuentosComponent, FormularioDescuentoComponent, DescuentoDetalleComponent, CambioDescuentoComponent, HistorialProductoDetalleComponent, ReporteProductoHistorialComponent, FacturaErrorComponent, ReportesComponent, FacturaPasoDosSeguroComponent, DatosFacturaHotelComponent, FacturaPasoDosTurismoComponent, ListaNotificacionesComponent, FormularioNotificacionComponent, VerNotificacionesComponent, MenuPrincipalComponent, PosComponent, PosPasoUnoComponent, PosPasoDosComponent, PosPorPasosComponent, AtencionComponent, PagoQrComponent, SelectorSucursalComponent, ListaComprasEnLineaComponent, CompraEnLineaPasoUnoComponent, CompraEnLineaPasoDosComponent, CompraEnLineaPorPasosComponent, ListaMesasComponent, FormularioMesaComponent, VentaDetalleComponent, FacturaPasoDosTasaCeroComponent, DatosFacturaIceComponent, FacturaIcePasoUnoComponent, FacturaIcePorPasosComponent, FacturaIcePasoDosComponent, EnviarWhatsappComponent, ListaCotizacionesComponent, FormularioCotizacionComponent, EnviarCotizacionWhatsappComponent, FacturaMineraPorPasosComponent, FacturaMineraPasoUnoComponent, FacturaMineraPasoDosComponent, DatosFacturaMineraComponent, RevertirFacturaComponent, ListaEstudiantesComponent, FormularioEstudianteComponent, FormularioProductoIceComponent
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        AppLayoutModule,
        SiteLayoutModule,
        FormsModule,
        HttpClientModule,
        ReactiveFormsModule,
        PrimeNgModule,
        AngularFireModule.initializeApp(environment.firebase),
        AngularFirestoreModule,
        ServiceWorkerModule.register('ngsw-worker.js', {
          enabled: environment.production,
          // Register the ServiceWorker as soon as the application is stable
          // or after 30 seconds (whichever comes first).
          registrationStrategy: 'registerWhenStable:30000'
        })
    ],
    exports:[
        FormularioCategoriaComponent
    ],
    providers: [
        { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
        //{ provide: LocationStrategy, useClass: HashLocationStrategy },
        { provide: LocationStrategy, useClass: PathLocationStrategy },
        ConfirmationService,
        DatePipe,
        DialogService,
        DecimalPipe,
        FormatoDecimalPipe,
        FormatoDecimalIcePipe,
        FormatoFechaHoraPipe
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
