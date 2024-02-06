import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { AppLayoutComponent } from "./layout/app.layout.component";
import { NotfoundComponent } from './pages/public/notfound/notfound.component';
import { AuthGuard } from './shared/security/auth.guard';
import { ListaCategoriasComponent } from './pages/private/categorias/lista-categorias/lista-categorias.component';
import { ListaProveedoresComponent } from './pages/private/proveedores/lista-proveedores/lista-proveedores.component';
import { ListaClientesComponent } from './pages/private/clientes/lista-clientes/lista-clientes.component';
import { ListaProductosComponent } from './pages/private/productos/lista-productos/lista-productos.component';
import { ListaUsuariosComponent } from './pages/private/usuarios/lista-usuarios/lista-usuarios.component';
import { ListaSucursalesComponent } from './pages/private/sucursales/lista-sucursales/lista-sucursales.component';
import { ListaTurnosComponent } from './pages/private/turnos/lista-turnos/lista-turnos.component';
import { ListaEmpresasComponent } from './pages/private/empresas/lista-empresas/lista-empresas.component';
import { ListaAsociacionesComponent } from './pages/private/asociaciones/lista-asociaciones/lista-asociaciones.component';
import { ListaComprasComponent } from './pages/private/compras/lista-compras/lista-compras.component';
import { ListaVentasComponent } from './pages/private/ventas/lista-ventas/lista-ventas.component';
import { ListaFacturasComponent } from './pages/private/facturas/lista-facturas/lista-facturas.component';
import { VentaPorPasosComponent } from './pages/private/ventas/steps/venta-por-pasos/venta-por-pasos.component';
import { CompraPorPasosComponent } from './pages/private/compras/steps/compra-por-pasos/compra-por-pasos.component';
import { SolicitarComponent } from './pages/private/compras/steps/solicitar/solicitar.component';
import { RecibirComponent } from './pages/private/compras/steps/recibir/recibir.component';
import { ListaInventariosComponent } from './pages/private/inventarios/lista-inventarios/lista-inventarios.component';
import { ListaTraspasosComponent } from './pages/private/traspasos/lista-traspasos/lista-traspasos.component';
import { ListaPuntosComponent } from './pages/private/puntos/lista-puntos/lista-puntos.component';
import { ListaRemisionesComponent } from './pages/private/remisiones/lista-remisiones/lista-remisiones.component';
import { FacturaPorPasosComponent } from './pages/private/facturas/steps/factura-por-pasos/factura-por-pasos.component';
import { FacturaPasoDosComponent } from './pages/private/facturas/steps/factura-paso-dos/factura-paso-dos.component';
import { FacturaPasoUnoComponent } from './pages/private/facturas/steps/factura-paso-uno/factura-paso-uno.component';
import { VentaPasoDosComponent } from './pages/private/ventas/steps/venta-paso-dos/venta-paso-dos.component';
import { VentaPasoUnoComponent } from './pages/private/ventas/steps/venta-paso-uno/venta-paso-uno.component';
import { ListaVentasCreditoComponent } from './pages/private/ventas-credito/lista-ventas-credito/lista-ventas-credito.component';
import { ListaVisitasComponent } from './pages/private/visitas/lista-visitas/lista-visitas.component';
import { PosicionActualComponent } from './pages/private/visitas/posicion-actual/posicion-actual.component';
import { ListaInteresadosComponent } from './pages/private/interesados/lista-interesados/lista-interesados.component';
import { AsignacionComponent } from './pages/private/visitas/asignacion/asignacion.component';
import { GestionInteresadoComponent } from './pages/private/interesados/gestion-interesado/gestion-interesado.component';
import { ListaMedicosComponent } from './pages/private/medicos/lista-medicos/lista-medicos.component';
import { ListaDescuentosComponent } from './pages/private/descuentos/lista-descuentos/lista-descuentos.component';
import { FormularioDescuentoComponent } from './pages/private/descuentos/formulario-descuento/formulario-descuento.component';
import { ReportesComponent } from './pages/private/reportes/reportes.component';
import { FacturaPasoDosSeguroComponent } from './pages/private/facturas/steps/factura-paso-dos-seguro/factura-paso-dos-seguro.component';
import { FacturaPasoDosTurismoComponent } from './pages/private/facturas/steps/factura-paso-dos-turismo/factura-paso-dos-turismo.component';
import { ListaNotificacionesComponent } from './pages/private/notificaciones/lista-notificaciones/lista-notificaciones.component';
import { MenuPrincipalComponent } from './pages/private/menu/menu-principal/menu-principal.component';
import { PosPorPasosComponent } from './pages/private/pos/steps/pos-por-pasos/pos-por-pasos.component';
import { PosPasoUnoComponent } from './pages/private/pos/steps/pos-paso-uno/pos-paso-uno.component';
import { PosPasoDosComponent } from './pages/private/pos/steps/pos-paso-dos/pos-paso-dos.component';
import { AtencionComponent } from './pages/private/atenciones/atencion/atencion.component';
import { SiteLayoutComponent } from './layout-site/site.layout.component';
import { CompraEnLineaPasoUnoComponent } from './pages/private-site/compra-en-linea/steps/compra-en-linea-paso-uno/compra-en-linea-paso-uno.component';
import { CompraEnLineaPasoDosComponent } from './pages/private-site/compra-en-linea/steps/compra-en-linea-paso-dos/compra-en-linea-paso-dos.component';
import { ListaComprasEnLineaComponent } from './pages/private-site/compra-en-linea/lista-compras-en-linea/lista-compras-en-linea.component';
import { CompraEnLineaPorPasosComponent } from './pages/private-site/compra-en-linea/steps/compra-en-linea-por-pasos/compra-en-linea-por-pasos.component';
import { ListaMesasComponent } from './pages/private/mesas/lista-mesas/lista-mesas.component';
import { FacturaPasoDosTasaCeroComponent } from './pages/private/facturas/steps/factura-paso-dos-tasa-cero/factura-paso-dos-tasa-cero.component';
import { FacturaIcePasoDosComponent } from './pages/private/facturas/steps-ice/factura-ice-paso-dos/factura-ice-paso-dos.component';
import { FacturaIcePasoUnoComponent } from './pages/private/facturas/steps-ice/factura-ice-paso-uno/factura-ice-paso-uno.component';
import { FacturaIcePorPasosComponent } from './pages/private/facturas/steps-ice/factura-ice-por-pasos/factura-ice-por-pasos.component';
import { ListaCotizacionesComponent } from './pages/private/cotizaciones/lista-cotizaciones/lista-cotizaciones.component';
import { FacturaMineraPasoDosComponent } from './pages/private/facturas/steps-minera/factura-minera-paso-dos/factura-minera-paso-dos.component';
import { FacturaMineraPasoUnoComponent } from './pages/private/facturas/steps-minera/factura-minera-paso-uno/factura-minera-paso-uno.component';
import { FacturaMineraPorPasosComponent } from './pages/private/facturas/steps-minera/factura-minera-por-pasos/factura-minera-por-pasos.component';
import { ListaEstudiantesComponent } from './pages/private/estudiantes/lista-estudiantes/lista-estudiantes.component';

@NgModule({
    imports: [
        RouterModule.forRoot([
            // private adm
            {
                path: 'adm', component: AppLayoutComponent, canActivate: [AuthGuard],
                children: [
                    { path: '', loadChildren: () => import('./pages/private/dashboard/dashboard.module').then(m => m.DashboardModule) },
                    { path: 'categorias', component: ListaCategoriasComponent },
                    { path: 'proveedores', component: ListaProveedoresComponent },
                    { path: 'clientes', component: ListaClientesComponent },
                    { path: 'productos', component: ListaProductosComponent },
                    { path: 'usuarios', component: ListaUsuariosComponent },
                    { path: 'sucursales', component: ListaSucursalesComponent },
                    { path: 'puntos', component: ListaPuntosComponent },
                    { path: 'turnos', component: ListaTurnosComponent },
                    { path: 'empresas', component: ListaEmpresasComponent },
                    { path: 'asociaciones', component: ListaAsociacionesComponent },
                    { path: 'compras', component: ListaComprasComponent },
                    { path: 'ventas', component: ListaVentasComponent },
                    { path: 'remisiones', component: ListaRemisionesComponent },
                    { path: 'pagos-credito', component: ListaVentasCreditoComponent },
                    { path: 'facturas', component: ListaFacturasComponent },
                    { path: 'inventarios', component: ListaInventariosComponent },
                    { path: 'traspasos', component: ListaTraspasosComponent },
                    { path: 'visitas', component: ListaVisitasComponent },
                    { path: 'asignacion-visita', component: AsignacionComponent },
                    { path: 'posicion', component: PosicionActualComponent },
                    { path: 'medicos', component: ListaMedicosComponent },
                    { path: 'estudiantes', component: ListaEstudiantesComponent },
                    { path: 'interesados', component: ListaInteresadosComponent },
                    { path: 'descuentos', component: ListaDescuentosComponent },
                    { path: 'formulario-descuento', component: FormularioDescuentoComponent },
                    { path: 'gestion-interesado', component: GestionInteresadoComponent },
                    { path: 'reportes', component: ReportesComponent },
                    { path: 'notificaciones', component: ListaNotificacionesComponent },
                    { path: 'menu-principal', component: MenuPrincipalComponent },
                    { path: 'atencion', component: AtencionComponent },
                    { path: 'mesas', component: ListaMesasComponent },
                    { path: 'cotizaciones', component: ListaCotizacionesComponent },
                    { path: 'pos-por-pasos', component: PosPorPasosComponent,
                        children: [
                            { path: '', redirectTo: 'pos-paso-uno', pathMatch: 'full'},
                            { path: 'pos-paso-uno', component: PosPasoUnoComponent },
                            { path: 'pos-paso-dos', component: PosPasoDosComponent },
                        ]
                    },
                    { path: 'factura-por-pasos', component: FacturaPorPasosComponent,
                        children: [
                            { path: '', redirectTo: 'factura-paso-uno', pathMatch: 'full'},
                            { path: 'factura-paso-uno', component: FacturaPasoUnoComponent },
                            { path: 'factura-paso-dos', component: FacturaPasoDosComponent },
                            { path: 'factura-paso-dos-seguro', component: FacturaPasoDosSeguroComponent },
                            { path: 'factura-paso-dos-turismo', component: FacturaPasoDosTurismoComponent },
                            { path: 'factura-paso-dos-tasa-cero', component: FacturaPasoDosTasaCeroComponent },
                        ]
                    },
                    { path: 'factura-ice-por-pasos', component: FacturaIcePorPasosComponent,
                        children: [
                            { path: '', redirectTo: 'factura-ice-paso-uno', pathMatch: 'full'},
                            { path: 'factura-ice-paso-uno', component: FacturaIcePasoUnoComponent },
                            { path: 'factura-ice-paso-dos', component: FacturaIcePasoDosComponent },
                        ]
                    },
                    { path: 'factura-minera-por-pasos', component: FacturaMineraPorPasosComponent,
                        children: [
                            { path: '', redirectTo: 'factura-minera-paso-uno', pathMatch: 'full'},
                            { path: 'factura-minera-paso-uno', component: FacturaMineraPasoUnoComponent },
                            { path: 'factura-minera-paso-dos', component: FacturaMineraPasoDosComponent },
                        ]
                    },
                    { path: 'venta-por-pasos', component: VentaPorPasosComponent,
                        children: [
                            { path: '', redirectTo: 'venta-paso-uno', pathMatch: 'full'},
                            { path: 'venta-paso-uno', component: VentaPasoUnoComponent },
                            { path: 'venta-paso-dos', component: VentaPasoDosComponent },
                        ]
                    },
                    { path: 'compra-por-pasos', component: CompraPorPasosComponent,
                    children: [
                        { path: '', redirectTo: 'solicitar', pathMatch: 'full'},
                        { path: 'solicitar', component: SolicitarComponent },
                        { path: 'recibir', component: RecibirComponent },
                    ]
                }
                ]
            },
            // private
            {
                path: 'site', component: SiteLayoutComponent, canActivate: [AuthGuard],
                children: [
                    { path: 'compras-en-linea', component: ListaComprasEnLineaComponent },
                    { path: 'compra-en-linea-por-pasos', component: CompraEnLineaPorPasosComponent,
                        children: [
                            { path: '', redirectTo: 'compra-en-linea-paso-uno', pathMatch: 'full'},
                            { path: 'compra-en-linea-paso-uno', component: CompraEnLineaPasoUnoComponent },
                            { path: 'compra-en-linea-paso-dos', component: CompraEnLineaPasoDosComponent },
                        ]
                    },
                ]
            },
           // public
           { path: '', loadChildren: () => import('./pages/public/landing/landing.module').then(m => m.LandingModule)},
           { path: 'auth', loadChildren: () => import('./pages/public/auth/auth.module').then(m => m.AuthModule) },
           { path: 'pages/notfound', component: NotfoundComponent },
           { path: '**', redirectTo: 'pages/notfound' },

        ], { scrollPositionRestoration: 'enabled', anchorScrolling: 'enabled' })
    ],
    exports: [RouterModule]
})
export class AppRoutingModule {
}
