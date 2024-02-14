import { HelperService } from '../helpers/helper.service';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Venta } from '../models/venta.model';


@Injectable({
    providedIn: 'root',
})
export class UtilidadesService {
    httpOptions: any;

    constructor(
        private httpClient: HttpClient,
        public helperService: HelperService
    ) {
        this.httpOptions = {
            responseType: 'blob' as 'json',
        };
    }

    sendResetPasswordEmail(idUsuario: number): Observable<any> {
        const apiUrl = `${environment.api.util}/utilidades/enviar-email/reseteos-claves/${idUsuario}`;
        return this.httpClient.post<any>(apiUrl, null);
    }

    sendFacturaEmail(idFactura: number): Observable<any> {
        const request = { idFactura:idFactura };
        const queryString = this.helperService.jsonToQueryStringSinfiltro(request);
        const apiUrl = `${environment.api.util}/utilidades/enviar-email?${queryString}`;
        return this.httpClient.get<any>(apiUrl);
    }

    sendCotizacionWhatsapp(idCotizacion: number, celular: string|undefined): Observable<any> {
        const request = { idCotizacion:idCotizacion, celular: celular };
        const queryString = this.helperService.jsonToQueryStringSinfiltro(request);
        const apiUrl = `${environment.api.util}/utilidades/enviar-cotizacion-whatsapp?${queryString}`;
        return this.httpClient.get<any>(apiUrl);
    }

    sendFacturaWhatsapp(idFactura: number, celular: string|undefined): Observable<any> {
        const request = { idFactura:idFactura, celular: celular };
        const queryString = this.helperService.jsonToQueryStringSinfiltro(request);
        const apiUrl = `${environment.api.util}/utilidades/enviar-factura-whatsapp?${queryString}`;
        return this.httpClient.get<any>(apiUrl);
    }

    getQrWhatsapp(): Observable<any> {
        const apiUrl = `${environment.api.util}/utilidades/qr-whatsapp`;
        return this.httpClient.get<any>(apiUrl);
    }

    getFactura(idFactura: number): Observable<any> {
        const apiUrl = `${environment.api.util}/utilidades/pdfs/${idFactura}`;
        return this.httpClient.get<any>(apiUrl, this.httpOptions);
    }

    getReporteVentas(criteriosSearch: any): Observable<any> {
        const queryString = this.helperService.jsonToQueryStringSinfiltro(criteriosSearch);
        const apiUrl = `${environment.api.util}/utilidades/pdfs/ventas?${queryString}`;
        return this.httpClient.get<any>(apiUrl, this.httpOptions);
    }

    getCuentaVenta(idVenta: number): Observable<any> {
        const apiUrl = `${environment.api.util}/utilidades/pdfs/ventas/cuentas/${idVenta}`;
        return this.httpClient.get<any>(apiUrl, this.httpOptions);
    }

    getComandaVenta(idVenta: number): Observable<any> {
        const apiUrl = `${environment.api.util}/utilidades/pdfs/ventas/comandas/${idVenta}`;
        return this.httpClient.get<any>(apiUrl, this.httpOptions);
    }

    getComandaVentaGuardar(solicitudImpresion: any): Observable<any> {
        const apiUrl = `${environment.api.util}/utilidades/pdfs/ventas/comandas`;
        return this.httpClient.post<any>(apiUrl, this.httpOptions, solicitudImpresion);
    }

    getCotizacion(idCotizacion: number): Observable<any> {
        const apiUrl = `${environment.api.util}/utilidades/pdfs/cotizaciones/${idCotizacion}`;
        return this.httpClient.get<any>(apiUrl, this.httpOptions);
    }

    getReciboVenta(idVenta: number): Observable<any> {
        const apiUrl = `${environment.api.util}/utilidades/pdfs/ventas/recibos/${idVenta}`;
        return this.httpClient.get<any>(apiUrl, this.httpOptions);
    }

    getReciboPago(idPago: number): Observable<any> {
        const apiUrl = `${environment.api.util}/utilidades/pdfs/ventas/pagos/${idPago}`;
        return this.httpClient.get<any>(apiUrl, this.httpOptions);
    }

    getRemision(idRemision: number): Observable<any> {
        const apiUrl = `${environment.api.util}/utilidades/pdfs/ventas/remisiones/${idRemision}`;
        return this.httpClient.get<any>(apiUrl, this.httpOptions);
    }

    getReporteFacturas(criteriosSearch: any): Observable<any> {
        const queryString = this.helperService.jsonToQueryStringSinfiltro(criteriosSearch);
        const apiUrl = `${environment.api.util}/utilidades/pdfs/facturas?${queryString}`;
        return this.httpClient.get<any>(apiUrl, this.httpOptions);
    }

    getReporteFacturasMetodosPago(criteriosSearch: any): Observable<any> {
        const queryString = this.helperService.jsonToQueryStringSinfiltro(criteriosSearch);
        const apiUrl = `${environment.api.util}/utilidades/pdfs/facturas/metodos-pago?${queryString}`;
        return this.httpClient.get<any>(apiUrl, this.httpOptions);
    }

    getReporteProductosMasVendidos(criteriosSearch: any): Observable<any> {
        const queryString = this.helperService.jsonToQueryStringSinfiltro(criteriosSearch);
        const apiUrl = `${environment.api.util}/utilidades/pdfs/productos-mas-vendidos?${queryString}`;
        return this.httpClient.get<any>(apiUrl, this.httpOptions);
    }

    getProductoHistorial(criteriosSearch: any): Observable<any> {
        const queryString = this.helperService.jsonToQueryStringSinfiltro(criteriosSearch);
        const apiUrl = `${environment.api.util}/utilidades/pdfs/productos/historial?${queryString}`;
        return this.httpClient.get<any>(apiUrl, this.httpOptions);
    }

    getImpresoras(): Observable<any> {
        const apiUrl = `${environment.api.util}/utilidades/impresoras`;
        return this.httpClient.get<any>(apiUrl);
    }

    getImpresionComanda(idVenta: number): Observable<any> {
        const apiUrl = `${environment.api.util}/utilidades/impresiones/comandas/${idVenta}`;
        return this.httpClient.get<any>(apiUrl);
    }

    getImpresionCuenta(idVenta: number): Observable<any> {
        const apiUrl = `${environment.api.util}/utilidades/impresiones/cuentas/${idVenta}`;
        return this.httpClient.get<any>(apiUrl);
    }

    sendNotificationPushGlobal(titulo: string, mensaje: string): Observable<any> {
        const request = {
            titulo: titulo,
            mensaje: mensaje
        };
        const apiUrl = `${environment.api.util}/notificaciones/envios-todos`;
        return this.httpClient.post<any>(apiUrl, request);
      }

      sendNotificationPushUsers(idsUsuarios:string, titulo: string, mensaje: string): Observable<any> {
        const request = {
            idsUsuarios: idsUsuarios,
            titulo: titulo,
            mensaje: mensaje
        };
        const apiUrl = `${environment.api.util}/notificaciones/envios-usuario`;
        return this.httpClient.post<any>(apiUrl, request);
      }

      getReporteCompra(idCompra: number): Observable<any> {
        const apiUrl = `${environment.api.util}/utilidades/pdfs/compras/${idCompra}`;
        return this.httpClient.get<any>(apiUrl, this.httpOptions);
    }

    getReporteSolicitudCompra(idCompra: number): Observable<any> {
        const apiUrl = `${environment.api.util}/utilidades/pdfs/compras/solicitudes/${idCompra}`;
        return this.httpClient.get<any>(apiUrl, this.httpOptions);
    }

    getReporteFacturasEstudiantes(criteriosSearch: any): Observable<any> {
        const queryString = this.helperService.jsonToQueryStringSinfiltro(criteriosSearch);
        const apiUrl = `${environment.api.util}/utilidades/pdfs/facturas/estudiantes?${queryString}`;
        return this.httpClient.get<any>(apiUrl, this.httpOptions);
    }
}
